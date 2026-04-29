// Parent Dashboard JavaScript

// Mock student data for parents
const mockStudentData = {
    STU001: {
        id: 'STU001',
        name: 'John Doe',
        class: 'Form 4A',
        email: 'john.doe@school.edu',
        balance: 5000,
        transactions: [
            { date: '2026-03-07', description: 'Canteen', category: 'Food', amount: 150, balance: 5000 },
            { date: '2026-03-05', description: 'School Shop', category: 'Supplies', amount: 200, balance: 5150 },
            { date: '2026-03-02', description: 'Library Fine', category: 'Fine', amount: 50, balance: 5350 },
        ],
        monthlySpend: 850,
        monthlyTransactions: 12,
        spendingByCategory: [
            { category: 'Food', amount: 540, percentage: 63.5, count: 8 },
            { category: 'Supplies', amount: 200, percentage: 23.5, count: 2 },
            { category: 'Fine', amount: 110, percentage: 13, count: 2 }
        ],
        deposits: [
            { date: '2026-03-01', amount: 2000, status: 'completed', confirmationId: 'DEP001' },
            { date: '2026-02-15', amount: 1500, status: 'completed', confirmationId: 'DEP002' }
        ]
    }
};

// Initialize dashboard
document.addEventListener('DOMContentLoaded', function() {
    checkAuthentication();
    
    const user = authManager.getCurrentUser();
    if (user && user.role === 'parent') {
        loadParentDashboard(user);
    }
});

function loadParentDashboard(user) {
    // Update header
    document.getElementById('userInfo').textContent = `Welcome, ${user.name}!`;
    
    // Load profile
    document.getElementById('profileName').textContent = user.name;
    document.getElementById('profileID').textContent = user.id;
    document.getElementById('profileEmail').textContent = user.email || 'Not provided';
    document.getElementById('profilePhone').textContent = user.phone || 'Not provided';
    
    // Load student selector
    loadStudentSelector(user);
    
    // Handle student selection
    document.getElementById('studentSelector').addEventListener('change', function() {
        const studentId = this.value;
        if (studentId) {
            loadStudentData(studentId);
        } else {
            document.getElementById('studentOverviewGrid').style.display = 'none';
            document.getElementById('spendingCard').style.display = 'none';
            document.getElementById('categoriesCard').style.display = 'none';
            document.getElementById('depositHistoryCard').style.display = 'none';
            document.getElementById('transactionsCard').style.display = 'none';
            document.getElementById('withdrawalCard').style.display = 'none';
            document.getElementById('limitsCard').style.display = 'none';
        }
    });
}

function loadStudentSelector(parent) {
    const selector = document.getElementById('studentSelector');
    
    // Mock: Get students linked to parent
    const parentStudents = ['STU001'];
    
    parentStudents.forEach(studentId => {
        if (mockStudentData[studentId]) {
            const option = document.createElement('option');
            option.value = studentId;
            option.textContent = mockStudentData[studentId].name;
            selector.appendChild(option);
        }
    });
}

function loadStudentData(studentId) {
    const student = mockStudentData[studentId];
    
    if (!student) return;
    
    // Show all cards
    document.getElementById('studentOverviewGrid').style.display = 'grid';
    document.getElementById('spendingCard').style.display = 'block';
    document.getElementById('categoriesCard').style.display = 'block';
    document.getElementById('depositHistoryCard').style.display = 'block';
    document.getElementById('transactionsCard').style.display = 'block';
    document.getElementById('withdrawalCard').style.display = 'block';
    document.getElementById('limitsCard').style.display = 'block';
    
    // Update balance
    document.getElementById('studentBalance').textContent = student.balance.toLocaleString();
    
    // Update student info
    document.getElementById('studentName').textContent = student.name;
    document.getElementById('studentID').textContent = student.id;
    document.getElementById('studentClass').textContent = student.class;
    document.getElementById('studentEmail').textContent = student.email;
    
    // Update spending summary
    document.getElementById('monthlySpent').textContent = `KSh ${student.monthlySpend.toLocaleString()}`;
    document.getElementById('transactionCount').textContent = student.monthlyTransactions;
    
    const largestExpense = Math.max(...student.transactions.map(t => t.amount));
    document.getElementById('largestExpense').textContent = `KSh ${largestExpense}`;
    
    // Update spending categories
    loadSpendingCategories(student.spendingByCategory);
    
    // Update transactions
    loadTransactions(student.transactions);
    
    // Update deposit history
    loadDepositHistory(student.deposits);
    
    // Load withdrawal requests
    loadWithdrawalRequests(studentId);
}

function loadSpendingCategories(categories) {
    const table = document.getElementById('categoriesTable');
    table.innerHTML = categories.map(cat => `
        <tr>
            <td>${cat.category}</td>
            <td>KSh ${cat.amount}</td>
            <td>${cat.percentage.toFixed(1)}%</td>
            <td>${cat.count}</td>
        </tr>
    `).join('');
}

function loadTransactions(transactions) {
    const table = document.getElementById('transactionTable');
    table.innerHTML = transactions.map(tx => `
        <tr>
            <td>${tx.date}</td>
            <td>${tx.description}</td>
            <td>${tx.category}</td>
            <td style="color: #ef4444;">-$${tx.amount}</td>
            <td>$${tx.balance.toLocaleString()}</td>
        </tr>
    `).join('');
}

function loadDepositHistory(deposits) {
    const table = document.getElementById('depositHistoryTable');
    table.innerHTML = deposits.map(dep => `
        <tr>
            <td>${dep.date}</td>
            <td>$${dep.amount}</td>
            <td><span class="badge badge-success">${dep.status.toUpperCase()}</span></td>
            <td>${dep.confirmationId}</td>
        </tr>
    `).join('');
}

function loadWithdrawalRequests(studentId) {
    // Mock withdrawal requests
    const withdrawals = [
        {
            date: '2026-03-06',
            amount: 1000,
            status: 'pending',
            batch: '2026-03-10'
        }
    ];
    
    const table = document.getElementById('withdrawalTable');
    
    if (withdrawals.length === 0) {
        table.innerHTML = '<tr><td colspan="5" style="text-align: center; color: #999;">No pending withdrawals</td></tr>';
        return;
    }
    
    table.innerHTML = withdrawals.map(wd => `
        <tr>
            <td>${wd.date}</td>
            <td>$${wd.amount}</td>
            <td><span class="badge badge-warning">${wd.status.toUpperCase()}</span></td>
            <td>${wd.batch}</td>
            <td>
                <button class="btn btn-secondary" onclick="approveWithdrawal('${wd.date}')">Approve</button>
            </td>
        </tr>
    `).join('');
}

// Modal Functions
function openDepositModal() {
    document.getElementById('depositModal').classList.add('show');
}

function closeDepositModal() {
    document.getElementById('depositModal').classList.remove('show');
    document.getElementById('depositForm').reset();
}

function openProfileModal() {
    document.getElementById('profileModal').classList.add('show');
}

function closeProfileModal() {
    document.getElementById('profileModal').classList.remove('show');
}

function openMpesaModal() {
    document.getElementById('mpesaModal').classList.add('show');
}

function closeMpesaModal() {
    document.getElementById('mpesaModal').classList.remove('show');
    document.getElementById('mpesaForm').reset();
    document.getElementById('mpesaStatus').style.display = 'none';
}

function handlePaymentMethodChange() {
    const method = document.getElementById('paymentMethod').value;
    const amount = document.getElementById('depositAmount').value;
    
    if (method === 'mpesa') {
        if (!amount || amount <= 0) {
            showAlert('Please enter amount first', 'error');
            document.getElementById('paymentMethod').value = '';
            return;
        }
        // Update M-Pesa modal with the amount
        document.getElementById('mpesaAmount').value = amount;
        closeDepositModal();
        openMpesaModal();
    }
}

// Handle deposit form
document.addEventListener('DOMContentLoaded', function() {
    const depositForm = document.getElementById('depositForm');
    if (depositForm) {
        depositForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const amount = document.getElementById('depositAmount').value;
            const method = document.getElementById('paymentMethod').value;
            const note = document.getElementById('depositNote').value;
            
            if (!amount || !method) {
                showAlert('Please fill in all required fields', 'error');
                return;
            }
            
            const result = await processDeposit(amount, method, note);
            
            if (result.success) {
                showAlert('Deposit submitted successfully! Confirmation ID: ' + result.confirmationId, 'success');
                closeDepositModal();
                // Reload student data
                const studentSelector = document.getElementById('studentSelector');
                if (studentSelector.value) {
                    loadStudentData(studentSelector.value);
                }
            } else {
                showAlert(result.message || 'Deposit failed', 'error');
            }
        });
    }
});

async function processDeposit(amount, method, note) {
    // Mock API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (amount > 0 && method) {
        return {
            success: true,
            confirmationId: 'DEP' + Date.now()
        };
    }
    return {
        success: false,
        message: 'Invalid deposit details'
    };
}

// Handle M-Pesa Payment
document.addEventListener('DOMContentLoaded', function() {
    const mpesaForm = document.getElementById('mpesaForm');
    if (mpesaForm) {
        mpesaForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const phone = document.getElementById('mpesaPhone').value.trim();
            const amount = document.getElementById('mpesaAmount').value;
            const pin = document.getElementById('mpesaPin').value.trim();
            
            // Validate inputs
            if (!phone || !pin) {
                showAlert('Please enter phone number and PIN', 'error');
                return;
            }
            
            if (pin.length !== 4 || isNaN(pin)) {
                showAlert('PIN must be 4 digits', 'error');
                return;
            }
            
            if (!phone.startsWith('254')) {
                showAlert('Phone number must start with 254', 'error');
                return;
            }
            
            // Process M-Pesa payment
            const statusDiv = document.getElementById('mpesaStatus');
            statusDiv.style.display = 'block';
            statusDiv.innerHTML = '<p style="color: #1f2937;">Processing M-Pesa payment...</p>';
            statusDiv.style.backgroundColor = '#dbeafe';
            statusDiv.style.borderLeft = '4px solid #3b82f6';
            
            const result = await processMpesaPayment(phone, amount, pin);
            
            if (result.success) {
                statusDiv.innerHTML = `
                    <div style="color: #065f46; text-align: center;">
                        <p style="font-size: 14px; margin-bottom: 8px;"><strong>✓ Payment Successful!</strong></p>
                        <p style="font-size: 12px;">Confirmation ID: ${result.transactionId}</p>
                        <p style="font-size: 12px;">Amount: KSh ${amount}</p>
                    </div>
                `;
                statusDiv.style.backgroundColor = '#d1fae5';
                statusDiv.style.borderLeft = '4px solid #10b981';
                
                // Close after 2 seconds
                setTimeout(() => {
                    closeMpesaModal();
                    showAlert('M-Pesa deposit completed successfully!', 'success');
                    // Reload student data
                    const studentSelector = document.getElementById('studentSelector');
                    if (studentSelector.value) {
                        loadStudentData(studentSelector.value);
                    }
                }, 2000);
            } else {
                statusDiv.innerHTML = `<p style="color: #991b1b;">${result.message || 'Payment failed. Please try again.'}</p>`;
                statusDiv.style.backgroundColor = '#fee2e2';
                statusDiv.style.borderLeft = '4px solid #dc2626';
            }
        });
    }
});

async function processMpesaPayment(phone, amount, pin) {
    try {
        const response = await fetch(`${authManager.apiBaseUrl}/payments/mpesa`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authManager.getToken()}`
            },
            body: JSON.stringify({
                phone,
                amount: parseFloat(amount),
                pin
            })
        });
        
        const data = await response.json();
        
        if (response.ok && data.success) {
            return {
                success: true,
                transactionId: data.transactionId
            };
        }
        
        return {
            success: false,
            message: data.message || 'Payment processing failed'
        };
    } catch (error) {
        console.error('M-Pesa payment error:', error);
        return {
            success: false,
            message: 'Unable to process payment. Please try again.'
        };
    }
}

function updateSpendingLimit() {
    const limit = document.getElementById('monthlyLimit').value;
    if (limit > 0) {
        showAlert(`Monthly spending limit updated to $${limit}`, 'success');
    } else {
        showAlert('Please enter a valid amount', 'error');
    }
}

function updateDailyLimit() {
    const limit = document.getElementById('dailyLimit').value;
    if (limit > 0) {
        showAlert(`Daily spending limit updated to $${limit}`, 'success');
    } else {
        showAlert('Please enter a valid amount', 'error');
    }
}

function approveWithdrawal(date) {
    showAlert(`Withdrawal request from ${date} approved!`, 'success');
}

function logout() {
    if (confirm('Are you sure you want to logout?')) {
        authManager.logout();
    }
}

// Close modal when clicking outside
window.onclick = function(event) {
    const depositModal = document.getElementById('depositModal');
    const profileModal = document.getElementById('profileModal');
    
    if (event.target === depositModal) {
        depositModal.classList.remove('show');
    }
    if (event.target === profileModal) {
        profileModal.classList.remove('show');
    }
}
