// SchoolWallet Backend - Express.js Server
// File: backend/server.js

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security Middleware
app.use(helmet());

// CORS Configuration
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',').map(origin => origin.trim()).filter(Boolean) || [
    'http://localhost:3000',
    'http://localhost:8000',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:8000'
];

app.use(cors({
    origin: (origin, callback) => {
        // Allow server-to-server, curl/Postman, and file:// usage in dev (no Origin header)
        if (!origin) {
            return callback(null, true);
        }

        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        }

        return callback(new Error('Not allowed by CORS'));
    },
    credentials: true
}));

// Body Parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate Limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10 // Stricter limit for auth endpoints
});

app.use('/api/v1/', limiter);
app.use('/api/v1/auth/', authLimiter);

// Health Check (does not require DB connection)
app.get('/api/v1/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Request Password Reset (does not require DB dependency to respond)
app.post('/api/v1/auth/reset-password', (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({
            success: false,
            error: 'INVALID_REQUEST',
            message: 'Email is required'
        });
    }

    return res.json({
        success: true,
        message: 'If an account with that email exists, reset instructions have been sent.'
    });
});

// Database Connection Pool
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'schoolwallet',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Middleware for database connection
app.use(async (req, res, next) => {
    try {
        req.db = await pool.getConnection();

        // Always release connection to avoid exhausting the pool.
        const releaseConnection = () => {
            if (req.db) {
                req.db.release();
                req.db = null;
            }
        };
        res.on('finish', releaseConnection);
        res.on('close', releaseConnection);

        next();
    } catch (error) {
        console.error('Database connection error:', error);
        res.status(500).json({
            success: false,
            error: 'DATABASE_ERROR',
            message: 'Failed to connect to database'
        });
    }
});

// Authentication Middleware
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({
            success: false,
            error: 'UNAUTHORIZED',
            message: 'Token is required'
        });
    }

    jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, user) => {
        if (err) {
            return res.status(403).json({
                success: false,
                error: 'FORBIDDEN',
                message: 'Invalid or expired token'
            });
        }
        req.user = user;
        next();
    });
};

// ========== AUTHENTICATION ROUTES ==========

// Login
app.post('/api/v1/auth/login', async (req, res) => {
    const { userId, password, role } = req.body;

    try {
        if (!userId || !password || !role) {
            return res.status(400).json({
                success: false,
                error: 'INVALID_REQUEST',
                message: 'Missing required fields'
            });
        }

        // Get user from database
        const [users] = await req.db.query(
            'SELECT * FROM users WHERE user_id = ? AND role = ?',
            [userId, role]
        );

        if (users.length === 0) {
            return res.status(401).json({
                success: false,
                error: 'INVALID_CREDENTIALS',
                message: 'Invalid user ID or role'
            });
        }

        const user = users[0];

        // Verify password
        const passwordMatch = await bcrypt.compare(password, user.password_hash);
        if (!passwordMatch) {
            // Log failed attempt
            await req.db.query(
                'INSERT INTO security_logs (log_id, event_type, description, ip_address) VALUES (?, ?, ?, ?)',
                [`LOG-${Date.now()}`, 'login_failed', `Failed login attempt for ${userId}`, req.ip]
            );
            
            return res.status(401).json({
                success: false,
                error: 'INVALID_CREDENTIALS',
                message: 'Invalid password'
            });
        }

        // Update last login
        await req.db.query(
            'UPDATE users SET last_login = NOW() WHERE user_id = ?',
            [userId]
        );

        // Generate JWT token
        const token = jwt.sign(
            { id: user.user_id, role: user.role, email: user.email },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '1h' }
        );

        // Log successful login
        await req.db.query(
            'INSERT INTO security_logs (log_id, user_id, event_type, ip_address) VALUES (?, ?, ?, ?)',
            [`LOG-${Date.now()}`, userId, 'login_success', req.ip]
        );

        res.json({
            success: true,
            token: token,
            user: {
                id: user.user_id,
                name: user.full_name,
                role: user.role,
                email: user.email
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            error: 'SERVER_ERROR',
            message: 'Login failed'
        });
    }
});

// Verify Admission Number (for student signup)
app.post('/api/v1/students/verify-admission', async (req, res) => {
    const { admissionNumber } = req.body;

    try {
        if (!admissionNumber) {
            return res.status(400).json({
                success: false,
                error: 'INVALID_REQUEST',
                message: 'Admission number is required'
            });
        }

        const [records] = await req.db.query(
            `SELECT admission_number, student_name, class_form, status, is_claimed
             FROM admission_registry
             WHERE admission_number = ?`,
            [admissionNumber]
        );

        if (records.length === 0 || records[0].status !== 'active') {
            return res.status(404).json({
                success: false,
                valid: false,
                message: 'Admission number not found'
            });
        }

        if (records[0].is_claimed) {
            return res.status(409).json({
                success: false,
                valid: false,
                message: 'Admission number already linked to an account'
            });
        }

        return res.json({
            success: true,
            valid: true,
            student: {
                classForm: records[0].class_form
            }
        });
    } catch (error) {
        console.error('Admission verification error:', error);
        return res.status(500).json({
            success: false,
            error: 'SERVER_ERROR',
            message: 'Failed to verify admission number'
        });
    }
});

// Verify Student ID (for parent linkage)
app.post('/api/v1/students/verify-student-id', async (req, res) => {
    const { studentID } = req.body;

    try {
        if (!studentID) {
            return res.status(400).json({
                success: false,
                error: 'INVALID_REQUEST',
                message: 'Student ID is required'
            });
        }

        // Try to find by student number or user ID
        const [studentRecords] = await req.db.query(
            `SELECT sp.student_id, sp.student_number, sp.class_form, sp.enrollment_date
             FROM student_profiles sp
             WHERE sp.student_number = ? OR sp.student_id = ?`,
            [studentID, studentID]
        );

        if (studentRecords.length === 0) {
            return res.status(404).json({
                success: false,
                valid: false,
                message: 'Student ID not found'
            });
        }

        const student = studentRecords[0];
        return res.json({
            success: true,
            valid: true,
            student: {
                studentId: student.student_id,
                studentNumber: student.student_number,
                classForm: student.class_form
            }
        });
    } catch (error) {
        console.error('Student verification error:', error);
        return res.status(500).json({
            success: false,
            error: 'SERVER_ERROR',
            message: 'Failed to verify student ID'
        });
    }
});

// Signup
app.post('/api/v1/auth/signup', async (req, res) => {
    const { role, fullName, email, phone, password, studentID, class: studentClass, linkedStudent, relationship } = req.body;

    try {
        if (!role || !fullName || !email || !phone || !password) {
            return res.status(400).json({
                success: false,
                error: 'INVALID_REQUEST',
                message: 'Missing required fields'
            });
        }

        if (role === 'student' && (!studentID || !studentClass)) {
            return res.status(400).json({
                success: false,
                error: 'INVALID_REQUEST',
                message: 'Student admission number and class are required'
            });
        }

        // Check if email already exists
        const [existingUsers] = await req.db.query(
            'SELECT user_id FROM users WHERE email = ?',
            [email]
        );

        if (existingUsers.length > 0) {
            return res.status(400).json({
                success: false,
                error: 'INVALID_REQUEST',
                message: 'Email already exists'
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Generate user ID
        const userId = `${role.substring(0, 3).toUpperCase()}${Math.floor(Math.random() * 10000)}`;

        if (role === 'student') {
            const [admissionRecords] = await req.db.query(
                `SELECT admission_number, class_form, is_claimed, status
                 FROM admission_registry
                 WHERE admission_number = ?`,
                [studentID]
            );

            if (admissionRecords.length === 0 || admissionRecords[0].status !== 'active') {
                return res.status(400).json({
                    success: false,
                    error: 'INVALID_ADMISSION',
                    message: 'Invalid admission number'
                });
            }

            if (admissionRecords[0].is_claimed) {
                return res.status(409).json({
                    success: false,
                    error: 'ADMISSION_ALREADY_USED',
                    message: 'This admission number is already linked to an account'
                });
            }

            if (admissionRecords[0].class_form !== studentClass) {
                return res.status(400).json({
                    success: false,
                    error: 'CLASS_MISMATCH',
                    message: 'Class does not match school records'
                });
            }
        }

        // Create user
        await req.db.query(
            'INSERT INTO users (user_id, role, full_name, email, phone, password_hash, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [userId, role, fullName, email, phone, hashedPassword, 'active']
        );

        // Create wallet
        const walletId = `WAL${userId}`;
        await req.db.query(
            'INSERT INTO wallets (wallet_id, user_id, balance, status) VALUES (?, ?, ?, ?)',
            [walletId, userId, 0, 'active']
        );

        // If student, create student profile
        if (role === 'student' && studentID && studentClass) {
            await req.db.query(
                'INSERT INTO student_profiles (student_id, class_form, student_number, enrollment_date) VALUES (?, ?, ?, ?)',
                [userId, studentClass, studentID, new Date()]
            );

            await req.db.query(
                'UPDATE admission_registry SET is_claimed = TRUE, claimed_user_id = ? WHERE admission_number = ?',
                [userId, studentID]
            );
        }

        // If parent, link to student
        if (role === 'parent' && linkedStudent && relationship) {
            let studentUserId = linkedStudent;
            const [studentByAdmission] = await req.db.query(
                'SELECT student_id FROM student_profiles WHERE student_number = ?',
                [linkedStudent]
            );

            if (studentByAdmission.length > 0) {
                studentUserId = studentByAdmission[0].student_id;
            }

            const [studentUserRows] = await req.db.query(
                'SELECT user_id FROM users WHERE user_id = ? AND role = ?',
                [studentUserId, 'student']
            );

            if (studentUserRows.length === 0) {
                return res.status(404).json({
                    success: false,
                    error: 'STUDENT_NOT_FOUND',
                    message: 'Linked student admission number/ID not found'
                });
            }

            await req.db.query(
                'INSERT INTO parent_student_links (parent_id, student_id, relationship) VALUES (?, ?, ?)',
                [userId, studentUserId, relationship]
            );
        }

        res.status(201).json({
            success: true,
            message: 'Account created successfully',
            userId: userId
        });

    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({
            success: false,
            error: 'SERVER_ERROR',
            message: 'Failed to create account'
        });
    }
});

// ========== WALLET ROUTES ==========

// Get Wallet Balance
app.get('/api/v1/wallet/balance', authenticateToken, async (req, res) => {
    try {
        const [wallets] = await req.db.query(
            'SELECT * FROM wallets WHERE user_id = ?',
            [req.user.id]
        );

        if (wallets.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'NOT_FOUND',
                message: 'Wallet not found'
            });
        }

        const wallet = wallets[0];

        res.json({
            success: true,
            walletId: wallet.wallet_id,
            userId: wallet.user_id,
            balance: wallet.balance,
            currency: wallet.currency,
            status: wallet.status,
            lastUpdated: wallet.updated_at
        });

    } catch (error) {
        console.error('Get balance error:', error);
        res.status(500).json({
            success: false,
            error: 'SERVER_ERROR',
            message: 'Failed to retrieve wallet balance'
        });
    }
});

// ========== TRANSACTION ROUTES ==========

// Get Transaction History
app.get('/api/v1/transactions', authenticateToken, async (req, res) => {
    try {
        const { limit = 20, offset = 0, type, startDate, endDate } = req.query;

        // Get wallet ID
        const [wallets] = await req.db.query(
            'SELECT wallet_id FROM wallets WHERE user_id = ?',
            [req.user.id]
        );

        if (wallets.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'NOT_FOUND',
                message: 'Wallet not found'
            });
        }

        let query = 'SELECT * FROM transactions WHERE wallet_id = ?';
        const params = [wallets[0].wallet_id];

        if (type) {
            query += ' AND transaction_type = ?';
            params.push(type);
        }

        if (startDate) {
            query += ' AND created_at >= ?';
            params.push(startDate);
        }

        if (endDate) {
            query += ' AND created_at <= ?';
            params.push(endDate);
        }

        query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
        params.push(parseInt(limit), parseInt(offset));

        const [transactions] = await req.db.query(query, params);

        res.json({
            success: true,
            total: transactions.length,
            transactions: transactions.map(tx => ({
                transactionId: tx.transaction_id,
                type: tx.transaction_type,
                amount: tx.amount,
                description: tx.description,
                status: tx.status,
                timestamp: tx.created_at
            }))
        });

    } catch (error) {
        console.error('Get transactions error:', error);
        res.status(500).json({
            success: false,
            error: 'SERVER_ERROR',
            message: 'Failed to retrieve transactions'
        });
    }
});

// ========== WITHDRAWAL ROUTES ==========

// Request Withdrawal
app.post('/api/v1/withdrawals/request', authenticateToken, async (req, res) => {
    const { amount, method, reason } = req.body;

    try {
        if (!amount || !method) {
            return res.status(400).json({
                success: false,
                error: 'INVALID_REQUEST',
                message: 'Missing required fields'
            });
        }

        // Check user role (only students can request withdrawals)
        if (req.user.role !== 'student') {
            return res.status(403).json({
                success: false,
                error: 'FORBIDDEN',
                message: 'Only students can request withdrawals'
            });
        }

        // Check balance
        const [wallets] = await req.db.query(
            'SELECT balance FROM wallets WHERE user_id = ?',
            [req.user.id]
        );

        if (wallets.length === 0 || wallets[0].balance < amount) {
            return res.status(400).json({
                success: false,
                error: 'INSUFFICIENT_BALANCE',
                message: 'Insufficient balance for withdrawal'
            });
        }

        // Get next batch
        const [batches] = await req.db.query(
            'SELECT batch_id FROM withdrawal_batches WHERE batch_date > CURDATE() AND status != "cancelled" ORDER BY batch_date, batch_time LIMIT 1'
        );

        const batchId = batches.length > 0 ? batches[0].batch_id : null;

        // Create withdrawal request
        const requestId = `WD-${Date.now()}`;
        await req.db.query(
            'INSERT INTO withdrawal_requests (request_id, student_id, amount, withdrawal_method, reason, batch_id, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [requestId, req.user.id, amount, method, reason, batchId, 'pending']
        );

        // Log audit
        await req.db.query(
            'INSERT INTO audit_logs (log_id, user_id, action, entity_type, entity_id) VALUES (?, ?, ?, ?, ?)',
            [`LOG-${Date.now()}`, req.user.id, 'WITHDRAWAL_REQUEST', 'withdrawal', requestId]
        );

        res.json({
            success: true,
            requestId: requestId,
            status: 'pending',
            amount: amount,
            scheduledBatch: batchId,
            message: 'Withdrawal request submitted successfully'
        });

    } catch (error) {
        console.error('Withdrawal request error:', error);
        res.status(500).json({
            success: false,
            error: 'SERVER_ERROR',
            message: 'Failed to process withdrawal request'
        });
    }
});

// ========== DEPOSIT ROUTES ==========

// Initiate Deposit
app.post('/api/v1/deposits/initiate', authenticateToken, async (req, res) => {
    const { studentId, amount, paymentMethod, note } = req.body;

    try {
        if (!studentId || !amount || !paymentMethod) {
            return res.status(400).json({
                success: false,
                error: 'INVALID_REQUEST',
                message: 'Missing required fields'
            });
        }

        // Verify parent has link to student (if parent)
        if (req.user.role === 'parent') {
            const [links] = await req.db.query(
                'SELECT * FROM parent_student_links WHERE parent_id = ? AND student_id = ?',
                [req.user.id, studentId]
            );

            if (links.length === 0) {
                return res.status(403).json({
                    success: false,
                    error: 'FORBIDDEN',
                    message: 'You do not have permission to deposit to this student'
                });
            }
        }

        const depositId = `DEP-${Date.now()}`;

        // Create deposit record
        await req.db.query(
            'INSERT INTO deposits (deposit_id, parent_id, student_id, amount, payment_method, note, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [depositId, req.user.id, studentId, amount, paymentMethod, note, 'pending']
        );

        res.json({
            success: true,
            depositId: depositId,
            status: 'pending',
            amount: amount,
            paymentUrl: `https://payment-gateway.com/pay/${depositId}`
        });

    } catch (error) {
        console.error('Deposit error:', error);
        res.status(500).json({
            success: false,
            error: 'SERVER_ERROR',
            message: 'Failed to initiate deposit'
        });
    }
});

// ========== M-PESA PAYMENT ROUTES ==========

// Initiate M-Pesa Payment
app.post('/api/v1/payments/mpesa', authenticateToken, async (req, res) => {
    const { phone, amount, pin } = req.body;

    try {
        // Validate inputs
        if (!phone || !amount || !pin) {
            return res.status(400).json({
                success: false,
                error: 'INVALID_REQUEST',
                message: 'Phone, amount, and PIN are required'
            });
        }

        // Validate phone format (must start with 254)
        if (!phone.toString().startsWith('254') || phone.toString().length < 10) {
            return res.status(400).json({
                success: false,
                error: 'INVALID_PHONE',
                message: 'Invalid phone number. Must start with 254'
            });
        }

        // Validate PIN (4 digits)
        if (pin.toString().length !== 4 || isNaN(pin)) {
            return res.status(400).json({
                success: false,
                error: 'INVALID_PIN',
                message: 'PIN must be 4 digits'
            });
        }

        // Validate amount
        if (amount <= 0 || amount > 1000000) {
            return res.status(400).json({
                success: false,
                error: 'INVALID_AMOUNT',
                message: 'Amount must be between KSh 1 and KSh 1,000,000'
            });
        }

        // Generate transaction ID
        const transactionId = `MPESA-${Date.now()}`;

        // In production, this would integrate with Safaricom M-Pesa API
        // For now, we'll simulate a successful transaction
        
        // Simulate PIN verification (in production, this would be real M-Pesa API)
        const pinVerified = true; // Mock verification
        
        if (!pinVerified) {
            return res.status(401).json({
                success: false,
                error: 'PIN_INCORRECT',
                message: 'Incorrect M-Pesa PIN'
            });
        }

        // Record transaction in database
        await req.db.query(
            'INSERT INTO mpesa_transactions (transaction_id, user_id, phone, amount, status, created_at) VALUES (?, ?, ?, ?, ?, NOW())',
            [transactionId, req.user.id, phone, amount, 'completed']
        );

        // Try to add funds to parent's wallet for student deposits (if linked to student)
        // This is for tracking M-Pesa deposits
        await req.db.query(
            'INSERT INTO audit_logs (log_id, user_id, action, entity_type, entity_id, description) VALUES (?, ?, ?, ?, ?, ?)',
            [`LOG-${Date.now()}`, req.user.id, 'MPESA_PAYMENT', 'payment', transactionId, `M-Pesa payment of KSh ${amount} from ${phone}`]
        );

        // Log security event
        await req.db.query(
            'INSERT INTO security_logs (log_id, user_id, event_type, description, ip_address) VALUES (?, ?, ?, ?, ?)',
            [`SEC-${Date.now()}`, req.user.id, 'mpesa_transaction', `M-Pesa transaction ${transactionId}`, req.ip]
        );

        res.json({
            success: true,
            transactionId: transactionId,
            status: 'completed',
            amount: amount,
            phone: phone,
            timestamp: new Date().toISOString(),
            message: 'M-Pesa payment processed successfully'
        });

    } catch (error) {
        console.error('M-Pesa payment error:', error);
        res.status(500).json({
            success: false,
            error: 'SERVER_ERROR',
            message: 'Failed to process M-Pesa payment'
        });
    }
});

// ========== ADMIN ROUTES ==========

// Schedule Withdrawal Batch
app.post('/api/v1/admin/batches', authenticateToken, async (req, res) => {
    const { batchDate, batchTime, maxAmount, autoApprove } = req.body;

    try {
        // Check if admin
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                error: 'FORBIDDEN',
                message: 'Only admins can schedule batches'
            });
        }

        if (!batchDate || !batchTime) {
            return res.status(400).json({
                success: false,
                error: 'INVALID_REQUEST',
                message: 'Missing required fields'
            });
        }

        const batchId = `BATCH-${Date.now()}`;

        await req.db.query(
            'INSERT INTO withdrawal_batches (batch_id, batch_date, batch_time, max_amount, auto_approve, created_by, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [batchId, batchDate, batchTime, maxAmount || null, autoApprove || false, req.user.id, 'scheduled']
        );

        // Log audit
        await req.db.query(
            'INSERT INTO audit_logs (log_id, user_id, action, entity_type, entity_id) VALUES (?, ?, ?, ?, ?)',
            [`LOG-${Date.now()}`, req.user.id, 'BATCH_SCHEDULED', 'batch', batchId]
        );

        res.json({
            success: true,
            batchId: batchId,
            status: 'scheduled',
            scheduledDate: `${batchDate}T${batchTime}:00Z`
        });

    } catch (error) {
        console.error('Schedule batch error:', error);
        res.status(500).json({
            success: false,
            error: 'SERVER_ERROR',
            message: 'Failed to schedule batch'
        });
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({
        success: false,
        error: 'SERVER_ERROR',
        message: 'An unexpected error occurred'
    });
});

// Start server only when file is run directly
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`SchoolWallet Server running on port ${PORT}`);
        console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });
}

module.exports = app;
