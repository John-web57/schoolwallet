# SchoolWallet Backend API Documentation

## Base URL
```
http://localhost:5000/api/v1
```

## Authentication
All endpoints (except auth endpoints) require a Bearer token in the Authorization header:
```
Authorization: Bearer {token}
```

---

## Authentication Endpoints

### 1. Login
**POST** `/auth/login`

**Request:**
```json
{
    "userId": "STU001",
    "password": "password123",
    "role": "student"
}
```

**Response:**
```json
{
    "success": true,
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
        "id": "STU001",
        "name": "John Doe",
        "role": "student",
        "email": "john.doe@school.edu"
    }
}
```

### 2. Signup
**POST** `/auth/signup`

**Request:**
```json
{
    "role": "student",
    "fullName": "John Doe",
    "email": "john.doe@school.edu",
    "phone": "+1-555-0100",
    "password": "SecurePass123",
    "studentID": "STU001",
    "class": "Form 4A"
}
```

### 3. Logout
**POST** `/auth/logout`

**Request:** (No body)

### 4. Reset Password
**POST** `/auth/reset-password`

**Request:**
```json
{
    "email": "user@school.edu"
}
```

---

## Wallet Endpoints

### 1. Get Wallet Balance
**GET** `/wallet/balance`

**Response:**
```json
{
    "walletId": "WAL001",
    "userId": "STU001",
    "balance": 5000.00,
    "currency": "USD",
    "status": "active",
    "lastUpdated": "2026-03-07T14:30:00Z"
}
```

### 2. Get Wallet Details
**GET** `/wallet/details`

**Response:**
```json
{
    "walletId": "WAL001",
    "userId": "STU001",
    "balance": 5000.00,
    "status": "active",
    "monthlySpending": 850.00,
    "monthlyTransactions": 12,
    "spendingLimit": 3000.00,
    "remainingBudget": 2150.00,
    "createdAt": "2026-01-15T10:00:00Z"
}
```

---

## Transaction Endpoints

### 1. Get Transaction History
**GET** `/transactions`

**Query Parameters:**
- `limit` (optional): Number of transactions to return (default: 20)
- `offset` (optional): Pagination offset (default: 0)
- `type` (optional): Filter by transaction type (deposit, withdrawal, purchase, etc.)
- `startDate` (optional): ISO date format
- `endDate` (optional): ISO date format

**Response:**
```json
{
    "success": true,
    "total": 50,
    "transactions": [
        {
            "transactionId": "TXN001",
            "type": "purchase",
            "amount": 150.00,
            "description": "Canteen Purchase",
            "merchant": "School Canteen",
            "previousBalance": 5150.00,
            "newBalance": 5000.00,
            "status": "completed",
            "timestamp": "2026-03-07T10:30:00Z"
        }
    ]
}
```

### 2. Get Transaction Details
**GET** `/transactions/{transactionId}`

**Response:**
```json
{
    "success": true,
    "transaction": {
        "transactionId": "TXN001",
        "walletId": "WAL001",
        "type": "purchase",
        "amount": 150.00,
        "description": "Canteen Purchase",
        "merchant": "School Canteen",
        "category": "Food",
        "previousBalance": 5150.00,
        "newBalance": 5000.00,
        "status": "completed",
        "referenceId": "MER-12345",
        "timestamp": "2026-03-07T10:30:00Z"
    }
}
```

---

## Withdrawal Endpoints

### 1. Request Withdrawal
**POST** `/withdrawals/request`

**Request:**
```json
{
    "amount": 500.00,
    "method": "cash",
    "reason": "Need cash for books"
}
```

**Response:**
```json
{
    "success": true,
    "requestId": "WD001",
    "status": "pending",
    "amount": 500.00,
    "scheduledBatch": "2026-03-10",
    "message": "Withdrawal request submitted successfully"
}
```

### 2. Get Withdrawal Requests
**GET** `/withdrawals/requests`

**Query Parameters:**
- `status` (optional): pending, approved, rejected, completed
- `limit` (optional): Default 20

**Response:**
```json
{
    "success": true,
    "requests": [
        {
            "requestId": "WD001",
            "amount": 500.00,
            "method": "cash",
            "status": "pending",
            "scheduledBatch": "2026-03-10",
            "requestedAt": "2026-03-06T15:00:00Z"
        }
    ]
}
```

### 3. Cancel Withdrawal Request
**POST** `/withdrawals/{requestId}/cancel`

**Response:**
```json
{
    "success": true,
    "message": "Withdrawal request cancelled"
}
```

---

## Deposit Endpoints

### 1. Initiate Deposit
**POST** `/deposits/initiate`

**Request:**
```json
{
    "studentId": "STU001",
    "amount": 500.00,
    "paymentMethod": "card",
    "note": "Monthly allowance"
}
```

**Response:**
```json
{
    "success": true,
    "depositId": "DEP001",
    "status": "pending",
    "amount": 500.00,
    "paymentUrl": "https://payment-gateway.com/pay/DEP001"
}
```

### 2. Get Deposit History
**GET** `/deposits/history`

**Query Parameters:**
- `studentId` (optional): For parents to view specific student
- `limit` (optional): Default 20

**Response:**
```json
{
    "success": true,
    "deposits": [
        {
            "depositId": "DEP001",
            "studentId": "STU001",
            "amount": 500.00,
            "paymentMethod": "card",
            "status": "completed",
            "confirmationId": "CARD-12345",
            "completedAt": "2026-03-07T10:00:00Z"
        }
    ]
}
```

---

## Parent Endpoints

### 1. Get Linked Students
**GET** `/parent/students`

**Response:**
```json
{
    "success": true,
    "students": [
        {
            "studentId": "STU001",
            "name": "John Doe",
            "class": "Form 4A",
            "balance": 5000.00,
            "monthlySpending": 850.00
        }
    ]
}
```

### 2. Get Student Spending Report
**GET** `/parent/students/{studentId}/spending`

**Query Parameters:**
- `period` (optional): current_month, last_month, last_3_months, custom
- `startDate` (optional): ISO date format
- `endDate` (optional): ISO date format

**Response:**
```json
{
    "success": true,
    "studentId": "STU001",
    "period": "current_month",
    "totalSpent": 850.00,
    "totalTransactions": 12,
    "largestExpense": 150.00,
    "byCategory": [
        {
            "category": "Food",
            "amount": 540.00,
            "percentage": 63.5,
            "transactionCount": 8
        }
    ]
}
```

### 3. Set Spending Limit
**POST** `/parent/students/{studentId}/limits`

**Request:**
```json
{
    "monthlyLimit": 3000.00,
    "dailyLimit": 500.00,
    "weeklyLimit": 1500.00,
    "enableNotifications": true
}
```

---

## Admin Endpoints

### 1. Schedule Withdrawal Batch
**POST** `/admin/batches`

**Request:**
```json
{
    "batchDate": "2026-03-10",
    "batchTime": "09:00",
    "maxAmount": null,
    "autoApprove": false
}
```

**Response:**
```json
{
    "success": true,
    "batchId": "BATCH001",
    "status": "scheduled",
    "scheduledDate": "2026-03-10T09:00:00Z"
}
```

### 2. Get All Withdrawal Requests
**GET** `/admin/withdrawals`

**Query Parameters:**
- `status` (optional): pending, approved, rejected, completed
- `startDate` (optional): ISO date format
- `endDate` (optional): ISO date format
- `limit` (optional): Default 50

### 3. Approve Withdrawal
**POST** `/admin/withdrawals/{requestId}/approve`

**Request:**
```json
{
    "batchId": "BATCH001"
}
```

### 4. Reject Withdrawal
**POST** `/admin/withdrawals/{requestId}/reject`

**Request:**
```json
{
    "reason": "Insufficient balance"
}
```

### 5. Get System Statistics
**GET** `/admin/statistics`

**Response:**
```json
{
    "success": true,
    "stats": {
        "totalUsers": 156,
        "students": 120,
        "parents": 36,
        "totalFunds": 485200.00,
        "todayTransactions": 47,
        "todayVolume": 8920.00,
        "pendingWithdrawals": 45,
        "systemUptime": "100%"
    }
}
```

### 6. Get Audit Logs
**GET** `/admin/audit-logs`

**Query Parameters:**
- `userId` (optional): Filter by user
- `action` (optional): Filter by action type
- `startDate` (optional): ISO date format
- `endDate` (optional): ISO date format
- `limit` (optional): Default 100

**Response:**
```json
{
    "success": true,
    "logs": [
        {
            "logId": "LOG001",
            "userId": "STU001",
            "action": "WITHDRAWAL_REQUEST",
            "entityType": "withdrawal",
            "entityId": "WD001",
            "timestamp": "2026-03-07T10:30:00Z"
        }
    ]
}
```

### 7. Export Report
**GET** `/admin/reports/export`

**Query Parameters:**
- `type` (required): daily, weekly, monthly, custom
- `format` (optional): csv, pdf, json (default: csv)
- `startDate` (optional): ISO date format
- `endDate` (optional): ISO date format

---

## Error Responses

All errors follow this format:

```json
{
    "success": false,
    "error": "ERROR_CODE",
    "message": "Human readable error message",
    "statusCode": 400
}
```

### Common Error Codes
- `INVALID_CREDENTIALS`: Login failed
- `INSUFFICIENT_BALANCE`: Not enough funds
- `INVALID_REQUEST`: Malformed request
- `UNAUTHORIZED`: Missing or invalid token
- `FORBIDDEN`: User doesn't have permission
- `NOT_FOUND`: Resource not found
- `SERVER_ERROR`: Internal server error
- `RATE_LIMITED`: Too many requests

---

## Security Considerations

1. **Authentication**: JWT tokens with 1-hour expiration
2. **HTTPS**: All endpoints use HTTPS only
3. **Rate Limiting**: 100 requests per minute per user
4. **Input Validation**: All inputs are validated server-side
5. **CORS**: Configured for allowed origins only
6. **SQL Injection Prevention**: Parameterized queries
7. **Password Security**: Bcrypt hashing with salt
8. **Audit Logging**: All transactions logged
9. **Session Management**: Automatic logout after inactivity

---

## API Versioning

Current API version: **v1**

Future versions will be accessible at `/api/v2`, etc.

---

## Rate Limiting

- Standard rate limit: 100 requests per minute
- Admin endpoints: 500 requests per minute
- Authentication endpoints: 10 requests per minute

Response headers:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1646700660
```
