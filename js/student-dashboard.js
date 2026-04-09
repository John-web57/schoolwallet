// Student Dashboard JavaScript

// Initialize dashboard on page load
document.addEventListener('DOMContentLoaded', function() {
    checkAuthentication();
    
    const user = authManager.getCurrentUser();
    if (user && user.role === 'student') {
        loadStudentDashboard(user);
    }
});

function loadStudentDashboard(user) {
    // Update header info
    document.getElementById('userInfo').textContent = `Welcome, ${user.name}! | Class: ${user.class}`;
    
    // Load profile info
    document.getElementById('profileName').textContent = user.name;
    document.getElementById('profileID').textContent = user.id;
    document.getElementById('profileClass').textContent = user.class;
    document.getElementById('profileEmail').textContent = user.email || 'Not provided';
    document.getElementById('profilePhone').textContent = user.phone || 'Not provided';
    
    // Load withdrawal requests
    loadWithdrawalRequests();
    
    // Load transactions
    loadTransactions(user);
}

function loadWithdrawalRequests() {
    // Mock data - Replace with actual API call
    const withdrawalRequests = [
        {
            id: 'WD001',
            dateRequested: '2026-03-06',
            amount: 1000,
            batch: '2026-03-10',
            status: 'pending'
        }
    ];
    
    const table = document.getElementById('withdrawalTable');
    
    if (withdrawalRequests.length === 0) {
        table.innerHTML = '<tr><td colspan="5" style="text-align: center; color: #999;">No pending withdrawal requests</td></tr>';
        return;
    }
    
    table.innerHTML = withdrawalRequests.map(wr => `
        <tr>
            <td>${wr.dateRequested}</td>
            <td>KSh ${wr.amount.toLocaleString()}</td>
            <td>${wr.batch}</td>
            <td><span class="badge badge-warning">${wr.status.toUpperCase()}</span></td>
            <td>
                <button class="btn btn-secondary" onclick="viewWithdrawalDetails('${wr.id}')">View</button>
            </td>
        </tr>
    `).join('');
}

function loadTransactions(user) {
    // Mock data - Replace with actual API call
    const transactions = [
        {
            date: '2026-03-07',
            description: 'Deposit from Parent',
            type: 'credit',
            amount: 500,
            balance: 5000
        },
        {
            date: '2026-03-05',
            description: 'Canteen Purchase',
            type: 'debit',
            amount: 150,
            balance: 4500
        },
        {
            date: '2026-03-02',
            description: 'School Shop Purchase',
            type: 'debit',
            amount: 200,
            balance: 4650
        },
        {
            date: '2026-02-28',
            description: 'Library Fine Payment',
            type: 'debit',
            amount: 50,
            balance: 4850
        },
        {
            date: '2026-02-25',
            description: 'Monthly Allowance',
            type: 'credit',
            amount: 2000,
            balance: 4900
        }
    ];
    
    // Calculate totals
    let totalCredits = 0;  // Amount deposited
    let totalDebits = 0;   // Amount spent
    
    transactions.forEach(tx => {
        if (tx.type === 'credit') {
            totalCredits += tx.amount;
        } else {
            totalDebits += tx.amount;
        }
    });
    
    const remainingBalance = totalCredits - totalDebits;
    
    // Update Balance Display
    document.getElementById('balanceAmount').textContent = remainingBalance.toLocaleString();
    document.getElementById('totalBalance').textContent = `KSh ${totalCredits.toLocaleString()}`;
    document.getElementById('amountSpent').textContent = `KSh ${totalDebits.toLocaleString()}`;
    
    // Update Summary Stats
    document.getElementById('statTotalReceived').textContent = `KSh ${totalCredits.toLocaleString()}`;
    document.getElementById('statTotalSpent').textContent = `KSh ${totalDebits.toLocaleString()}`;
    document.getElementById('statRemaining').textContent = `KSh ${remainingBalance.toLocaleString()}`;
    
    // Update Transaction Table
    const table = document.getElementById('transactionTable');
    table.innerHTML = transactions.map(tx => `
        <tr>
            <td>${tx.date}</td>
            <td>${tx.description}</td>
            <td><span class="badge badge-${tx.type === 'credit' ? 'success' : 'danger'}">${tx.type.toUpperCase()}</span></td>
            <td style="color: ${tx.type === 'credit' ? '#10b981' : '#ef4444'};">
                ${tx.type === 'credit' ? '+' : '-'}KSh ${tx.amount.toLocaleString()}
            </td>
            <td>KSh ${tx.balance.toLocaleString()}</td>
        </tr>
    `).join('');
}

// Modal Functions
function openRequestWithdrawalModal() {
    document.getElementById('withdrawalModal').classList.add('show');
}

function closeWithdrawalModal() {
    document.getElementById('withdrawalModal').classList.remove('show');
    document.getElementById('withdrawalForm').reset();
}

function openProfileModal() {
    document.getElementById('profileModal').classList.add('show');
}

function closeProfileModal() {
    document.getElementById('profileModal').classList.remove('show');
}

// Handle withdrawal form submission
document.addEventListener('DOMContentLoaded', function() {
    const withdrawalForm = document.getElementById('withdrawalForm');
    if (withdrawalForm) {
        withdrawalForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const amount = document.getElementById('withdrawalAmount').value;
            const method = document.getElementById('withdrawalMethod').value;
            const reason = document.getElementById('withdrawalReason').value;
            
            if (!amount || !method) {
                showAlert('Please fill in all required fields', 'error');
                return;
            }
            
            // Submit withdrawal request
            const result = await submitWithdrawalRequest(amount, method, reason);
            
            if (result.success) {
                showAlert('Withdrawal request submitted successfully!', 'success');
                closeWithdrawalModal();
                loadWithdrawalRequests();
            } else {
                showAlert(result.message || 'Failed to submit withdrawal request', 'error');
            }
        });
    }
});

async function submitWithdrawalRequest(amount, method, reason) {
    // Mock API call - Replace with actual backend
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (amount > 0) {
        return {
            success: true,
            message: 'Withdrawal request submitted'
        };
    }
    return {
        success: false,
        message: 'Invalid amount'
    };
}

function viewWithdrawalDetails(withdrawalId) {
    showAlert(`View details for withdrawal: ${withdrawalId}`, 'info');
    // TODO: Implement withdrawal details modal
}

function logout() {
    if (confirm('Are you sure you want to logout?')) {
        authManager.logout();
    }
}

// Close modal when clicking outside
window.onclick = function(event) {
    const withdrawalModal = document.getElementById('withdrawalModal');
    const profileModal = document.getElementById('profileModal');
    
    if (event.target === withdrawalModal) {
        withdrawalModal.classList.remove('show');
    }
    if (event.target === profileModal) {
        profileModal.classList.remove('show');
    }
}
