// Admin Dashboard JavaScript

// Initialize dashboard
document.addEventListener('DOMContentLoaded', function() {
    checkAuthentication();
    
    const user = authManager.getCurrentUser();
    if (user && user.role === 'admin') {
        loadAdminDashboard(user);
    }
});

function loadAdminDashboard(user) {
    // Update header
    document.getElementById('userInfo').textContent = `Welcome, ${user.name}! | Department: ${user.department}`;
    
    // Load profile
    document.getElementById('profileName').textContent = user.name;
    document.getElementById('profileID').textContent = user.id;
    document.getElementById('profileDept').textContent = user.department;
    document.getElementById('profileEmail').textContent = user.email || 'Not provided';
    document.getElementById('profileLastLogin').textContent = new Date().toLocaleString();
    
    // Load data
    loadWithdrawalBatches();
    loadPendingWithdrawals();
    loadUsers();
    loadAuditLog();
}

function loadWithdrawalBatches() {
    // Mock data
    const batches = [
        {
            id: 'BATCH-001',
            date: '2026-03-10',
            amount: 5000,
            requests: 12,
            status: 'pending'
        },
        {
            id: 'BATCH-002',
            date: '2026-03-17',
            amount: 3500,
            requests: 8,
            status: 'scheduled'
        }
    ];
    
    const table = document.getElementById('batchTable');
    table.innerHTML = batches.map(batch => `
        <tr>
            <td>${batch.id}</td>
            <td>${batch.date}</td>
            <td>$${batch.amount.toLocaleString()}</td>
            <td>${batch.requests}</td>
            <td><span class="badge badge-${batch.status === 'pending' ? 'warning' : 'info'}">${batch.status.toUpperCase()}</span></td>
            <td>
                <button class="btn btn-secondary" onclick="viewBatchDetails('${batch.id}')">View</button>
                <button class="btn btn-danger" onclick="cancelBatch('${batch.id}')">Cancel</button>
            </td>
        </tr>
    `).join('');
}

function loadPendingWithdrawals() {
    // Mock data
    const withdrawals = [
        {
            id: 'WD-001',
            student: 'John Doe (STU001)',
            amount: 500,
            date: '2026-03-06',
            method: 'Cash from Cashier',
            status: 'pending'
        },
        {
            id: 'WD-002',
            student: 'Jane Smith (STU002)',
            amount: 300,
            date: '2026-03-06',
            method: 'Bank Transfer',
            status: 'pending'
        }
    ];
    
    const table = document.getElementById('withdrawalTable');
    table.innerHTML = withdrawals.map(wd => `
        <tr>
            <td>${wd.id}</td>
            <td>${wd.student}</td>
            <td>$${wd.amount}</td>
            <td>${wd.date}</td>
            <td>${wd.method}</td>
            <td><span class="badge badge-warning">${wd.status.toUpperCase()}</span></td>
            <td>
                <button class="btn btn-success" onclick="approveWithdrawal('${wd.id}')">Approve</button>
                <button class="btn btn-danger" onclick="rejectWithdrawal('${wd.id}')">Reject</button>
            </td>
        </tr>
    `).join('');
}

function loadUsers() {
    // Mock data
    const users = [
        {
            id: 'STU001',
            name: 'John Doe',
            role: 'student',
            status: 'active',
            joined: '2026-01-15'
        },
        {
            id: 'STU002',
            name: 'Jane Smith',
            role: 'student',
            status: 'active',
            joined: '2026-01-15'
        },
        {
            id: 'PAR001',
            name: 'John Parent',
            role: 'parent',
            status: 'active',
            joined: '2026-01-10'
        }
    ];
    
    const table = document.getElementById('userTable');
    table.innerHTML = users.map(user => `
        <tr>
            <td>${user.id}</td>
            <td>${user.name}</td>
            <td><span class="badge badge-info">${user.role.toUpperCase()}</span></td>
            <td><span class="badge badge-success">${user.status.toUpperCase()}</span></td>
            <td>${user.joined}</td>
            <td>
                <button class="btn btn-secondary" onclick="editUser('${user.id}')">Edit</button>
                <button class="btn btn-danger" onclick="deactivateUser('${user.id}')">Deactivate</button>
            </td>
        </tr>
    `).join('');
}

function loadAuditLog() {
    // Mock data
    const logs = [
        {
            id: 'TXN-00147',
            user: 'John Doe (STU001)',
            type: 'WITHDRAWAL REQUEST',
            amount: 500,
            timestamp: '2026-03-07 10:30:22',
            status: 'pending'
        },
        {
            id: 'TXN-00146',
            user: 'Jane Parent (PAR001)',
            type: 'DEPOSIT',
            amount: 500,
            timestamp: '2026-03-07 09:15:10',
            status: 'completed'
        }
    ];
    
    const table = document.getElementById('auditTable');
    table.innerHTML = logs.map(log => `
        <tr>
            <td>${log.id}</td>
            <td>${log.user}</td>
            <td>${log.type}</td>
            <td>$${log.amount}</td>
            <td>${log.timestamp}</td>
            <td><span class="badge badge-${log.status === 'completed' ? 'success' : 'warning'}">${log.status.toUpperCase()}</span></td>
            <td>
                <button class="btn btn-secondary" onclick="viewTransactionDetails('${log.id}')">View</button>
            </td>
        </tr>
    `).join('');
}

// Modal Functions
function openBatchScheduleModal() {
    document.getElementById('batchModal').classList.add('show');
}

function closeBatchModal() {
    document.getElementById('batchModal').classList.remove('show');
    document.getElementById('batchForm').reset();
}

function openProfileModal() {
    document.getElementById('profileModal').classList.add('show');
}

function closeProfileModal() {
    document.getElementById('profileModal').classList.remove('show');
}

// Handle batch form
document.addEventListener('DOMContentLoaded', function() {
    const batchForm = document.getElementById('batchForm');
    if (batchForm) {
        batchForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const date = document.getElementById('batchDate').value;
            const time = document.getElementById('batchTime').value;
            const maxAmount = document.getElementById('batchMaxAmount').value;
            const autoApprove = document.getElementById('batchAutoApprove').checked;
            
            if (!date || !time) {
                showAlert('Please fill in all required fields', 'error');
                return;
            }
            
            const result = await scheduleBatch(date, time, maxAmount, autoApprove);
            
            if (result.success) {
                showAlert(`Batch ${result.batchId} scheduled successfully!`, 'success');
                closeBatchModal();
                loadWithdrawalBatches();
            } else {
                showAlert(result.message || 'Failed to schedule batch', 'error');
            }
        });
    }
});

async function scheduleBatch(date, time, maxAmount, autoApprove) {
    // Mock API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
        success: true,
        batchId: 'BATCH-' + Math.floor(Math.random() * 10000)
    };
}

function viewBatchDetails(batchId) {
    showAlert(`View details for batch: ${batchId}`, 'info');
    // TODO: Implement batch details modal
}

function cancelBatch(batchId) {
    if (confirm(`Are you sure you want to cancel batch ${batchId}?`)) {
        showAlert(`Batch ${batchId} cancelled!`, 'success');
        loadWithdrawalBatches();
    }
}

function approveWithdrawal(withdrawalId) {
    if (confirm(`Approve withdrawal ${withdrawalId}?`)) {
        showAlert(`Withdrawal ${withdrawalId} approved!`, 'success');
        loadPendingWithdrawals();
    }
}

function rejectWithdrawal(withdrawalId) {
    if (confirm(`Are you sure you want to reject withdrawal ${withdrawalId}?`)) {
        showAlert(`Withdrawal ${withdrawalId} rejected!`, 'success');
        loadPendingWithdrawals();
    }
}

function openAddUserModal() {
    showAlert('Add user functionality - to be implemented', 'info');
}

function openBulkUploadModal() {
    showAlert('Bulk upload functionality - to be implemented', 'info');
}

function editUser(userId) {
    showAlert(`Edit user: ${userId}`, 'info');
}

function deactivateUser(userId) {
    if (confirm(`Are you sure you want to deactivate user ${userId}?`)) {
        showAlert(`User ${userId} deactivated!`, 'success');
        loadUsers();
    }
}

function filterAuditLog() {
    const filter = document.getElementById('auditFilter').value;
    showAlert(`Filter audit log by: ${filter}`, 'info');
    // TODO: Implement filtering
}

function exportAuditLog() {
    // Mock CSV export
    const csv = 'Transaction ID,User,Type,Amount,Timestamp,Status\nTXN-00147,John Doe,WITHDRAWAL REQUEST,KSh 500,2026-03-07 10:30:22,PENDING\n';
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'audit_log_' + new Date().toISOString().slice(0, 10) + '.csv';
    a.click();
    showAlert('Audit log exported successfully!', 'success');
}

function viewTransactionDetails(transactionId) {
    showAlert(`View details for transaction: ${transactionId}`, 'info');
}

function clearLogs() {
    if (confirm('Are you sure you want to clear all logs? This action cannot be undone.')) {
        showAlert('Logs cleared successfully!', 'success');
    }
}

function generateReport(type) {
    showAlert(`Generating ${type} report...`, 'info');
    // Simulate report generation
    setTimeout(() => {
        showAlert(`${type.charAt(0).toUpperCase() + type.slice(1)} report generated and ready for download!`, 'success');
    }, 2000);
}

function generateCustomReport() {
    showAlert('Custom report generation - to be implemented', 'info');
}

function logout() {
    if (confirm('Are you sure you want to logout?')) {
        authManager.logout();
    }
}

// Close modal when clicking outside
window.onclick = function(event) {
    const batchModal = document.getElementById('batchModal');
    const profileModal = document.getElementById('profileModal');
    
    if (event.target === batchModal) {
        batchModal.classList.remove('show');
    }
    if (event.target === profileModal) {
        profileModal.classList.remove('show');
    }
}
