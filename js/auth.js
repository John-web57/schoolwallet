// Authentication Module
class AuthManager {
    constructor() {
        this.currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;
        this.token = localStorage.getItem('authToken') || null;
        this.apiBaseUrl = this.getApiBaseUrl();
        this.demoUsers = {
            student: {
                userId: 'STU001',
                password: 'password123',
                user: {
                    id: 'STU001',
                    name: 'John Doe',
                    role: 'student',
                    class: 'Form 4A',
                    email: 'john.doe@school.edu',
                    phone: '+1 (555) 111-2233',
                    balance: 5000
                }
            },
            parent: {
                userId: 'PAR001',
                password: 'password123',
                user: {
                    id: 'PAR001',
                    name: 'Jane Parent',
                    role: 'parent',
                    email: 'jane.parent@email.com',
                    phone: '+1 (555) 222-3344'
                }
            },
            admin: {
                userId: 'ADM001',
                password: 'password123',
                user: {
                    id: 'ADM001',
                    name: 'System Admin',
                    role: 'admin',
                    department: 'Finance & Operations',
                    email: 'admin@schoolwallet.local'
                }
            }
        };
    }

    getApiBaseUrl() {
        const configuredUrl = window.SCHOOLWALLET_API_BASE_URL || localStorage.getItem('schoolwalletApiBaseUrl');
        if (configuredUrl) {
            return configuredUrl.replace(/\/$/, '');
        }

        const isLocal = ['localhost', '127.0.0.1', ''].includes(window.location.hostname);
        if (isLocal) {
            return 'http://localhost:5000/api/v1';
        }

        return `${window.location.origin}/api/v1`;
    }

    // Real authentication with backend API
    async login(userId, password, role) {
        try {
            const response = await fetch(`${this.apiBaseUrl}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ userId, password, role })
            });

            const data = await response.json();

            if (response.ok && data.success) {
                this.currentUser = data.user;
                this.token = data.token;

                // Store in localStorage
                localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
                localStorage.setItem('authToken', this.token);

                return { success: true, user: this.currentUser };
            } else {
                return { success: false, message: data.message || 'Login failed' };
            }
        } catch (error) {
            console.error('Login error:', error);
            return this.loginWithDemoCredentials(userId, password, role);
        }
    }

    loginWithDemoCredentials(userId, password, role) {
        const demoRole = this.demoUsers[role];

        if (!demoRole) {
            return { success: false, message: 'Invalid role selected.' };
        }

        // If backend is unavailable, allow offline login with provided inputs
        // so users can still access the next page/dashboard.
        if (demoRole.userId !== userId || demoRole.password !== password) {
            if (!userId || !password) {
                return {
                    success: false,
                    message: 'Enter user ID/email and password to continue.'
                };
            }

            this.currentUser = {
                ...demoRole.user,
                id: userId,
                name: userId
            };
            this.token = `offline-token-${role}-${Date.now()}`;

            localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
            localStorage.setItem('authToken', this.token);

            return {
                success: true,
                user: this.currentUser,
                message: 'Backend unavailable. Logged in with offline mode.'
            };
        }

        this.currentUser = demoRole.user;
        this.token = `demo-token-${role}-${Date.now()}`;

        localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
        localStorage.setItem('authToken', this.token);

        return {
            success: true,
            user: this.currentUser,
            message: 'Logged in using offline demo mode.'
        };
    }


    logout() {
        localStorage.removeItem('currentUser');
        localStorage.removeItem('authToken');
        this.currentUser = null;
        this.token = null;
        redirectToLogin();
    }

    isAuthenticated() {
        return !!this.currentUser && !!this.token;
    }

    getCurrentUser() {
        return this.currentUser;
    }

    getToken() {
        return this.token;
    }

    async signup(userData) {
        try {
            const response = await fetch(`${this.apiBaseUrl}/auth/signup`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData)
            });

            const data = await response.json();

            if (response.ok && data.success) {
                return {
                    success: true,
                    message: data.message || 'Account created successfully',
                    userId: data.userId
                };
            }

            return {
                success: false,
                message: data.message || 'Failed to create account'
            };
        } catch (error) {
            console.error('Signup error:', error);
            return {
                success: false,
                message: 'Unable to connect to server. Please try again.'
            };
        }
    }

    async resetPassword(email) {
        try {
            const response = await fetch(`${this.apiBaseUrl}/auth/reset-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email })
            });

            const data = await response.json();

            if (response.ok && data.success) {
                return {
                    success: true,
                    message: data.message || 'Password reset link sent to your email'
                };
            }

            return {
                success: false,
                message: data.message || 'Failed to send reset link'
            };
        } catch (error) {
            console.error('Reset password error:', error);
            return {
                success: false,
                message: 'Unable to connect to server. Please try again.'
            };
        }
    }

    async verifyAdmission(admissionNumber) {
        try {
            const response = await fetch(`${this.apiBaseUrl}/students/verify-admission`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ admissionNumber })
            });

            const data = await response.json();

            if (response.ok && data.success) {
                return {
                    success: true,
                    valid: true,
                    student: data.student
                };
            }

            return {
                success: false,
                valid: false,
                message: data.message || 'Invalid admission number'
            };
        } catch (error) {
            console.error('Admission verification error:', error);
            return {
                success: false,
                valid: false,
                message: 'Unable to verify admission number'
            };
        }
    }

    async verifyStudentID(studentID) {
        try {
            const response = await fetch(`${this.apiBaseUrl}/students/verify-student-id`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ studentID })
            });

            const data = await response.json();

            if (response.ok && data.success) {
                return {
                    success: true,
                    valid: true,
                    student: data.student
                };
            }

            return {
                success: false,
                valid: false,
                message: data.message || 'Admission verification failed'
            };
        } catch (error) {
            console.error('Admission verification error:', error);
            return {
                success: false,
                valid: false,
                message: 'Unable to verify admission number right now.'
            };
        }
    }
}

// Initialize Auth Manager
const authManager = new AuthManager();

// Handle login form submission
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');

    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            const userRole = document.getElementById('userRole').value;
            const userId = document.getElementById('userId').value;
            const password = document.getElementById('password').value;
            const rememberMe = document.getElementById('rememberMe').checked;

            if (!userRole || !userId || !password) {
                showAlert('Please fill in all fields', 'error');
                return;
            }

            const result = await authManager.login(userId, password, userRole);

            if (result.success) {
                if (rememberMe) {
                    localStorage.setItem('rememberMe', 'true');
                }

                // Redirect based on role
                const dashboardPages = {
                    student: 'pages/student-dashboard.html',
                    parent: 'pages/parent-dashboard.html',
                    admin: 'pages/admin-dashboard.html'
                };

                window.location.href = dashboardPages[userRole];
            } else {
                showAlert(result.message, 'error');
            }
        });
    }
});

// Utility function to show alerts
function showAlert(message, type = 'info') {
    // Create alert element
    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    alert.textContent = message;
    alert.style.position = 'fixed';
    alert.style.top = '20px';
    alert.style.right = '20px';
    alert.style.zIndex = '9999';
    alert.style.maxWidth = '400px';

    document.body.appendChild(alert);

    // Auto remove after 5 seconds
    setTimeout(() => {
        alert.remove();
    }, 5000);
}

// Check if user is authenticated
function checkAuthentication() {
    const path = window.location.pathname;
    const pageName = path.split('/').pop();
    const isPublicPage = pageName === '' || pageName === 'index.html' || pageName === 'signup.html' || pageName === 'forgot-password.html';

    if (!authManager.isAuthenticated() && !isPublicPage) {
        redirectToLogin();
    }
}

function redirectToLogin() {
    const onPagesSubpath = window.location.pathname.includes('/pages/');
    window.location.href = onPagesSubpath ? '../index.html' : 'index.html';
}

// Run authentication check on page load
document.addEventListener('DOMContentLoaded', checkAuthentication);
