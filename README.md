# SchoolWallet - Secure Digital Pocket Money System
https://smart-job-tracker-66f5f.web.app/
## Overview

SchoolWallet is a comprehensive digital wallet system designed to enable secure, efficient, and transparent management of student pocket money in boarding schools. The system eliminates cash handling risks, prevents impersonation, and provides real-time monitoring for parents and administrators.

## Key Features

### For Students
- 💳 Digital wallet with real-time balance updates
- 📋 Secure withdrawal requests with batch-based scheduling
- 📊 Transaction history and spending insights
- 📱 Mobile-friendly interface
- 🔒 Secure authentication and authorization
- 💰 Spending analytics by category

### For Parents
- 👨‍👩‍👧 Monitor multiple children's accounts
- 💸 Remote deposits with multiple payment methods
- 📊 Detailed spending reports and analytics
- ⏳ Spending limits and controls
- 📬 Real-time transaction notifications
- 📈 Spending trends analysis

### For Administrators
- 👥 Complete user management system
- 📅 Withdrawal batch scheduling and management
- ✅ Withdrawal request approval/rejection
- 📊 System-wide analytics and reporting
- 📝 Comprehensive audit logs
- 🔐 Security monitoring
- 📊 Financial reports and exports

### System Features
- 🔐 Secure authentication with JWT tokens
- 🛡️ HTTPS/SSL encryption
- 💾 Database transaction integrity
- 📋 Complete audit trails
- 🔄 Batch-based withdrawal processing
- 📧 Email/SMS notifications
- 📊 Real-time analytics
- ⚡ High-performance caching
- 🌐 RESTful API design

## Security Features

1. **Authentication & Authorization**
   - JWT-based authentication
   - Role-based access control (RBAC)
   - Secure password hashing with bcrypt
   - Session management with automatic logout

2. **Data Protection**
   - HTTPS/SSL encryption
   - SQL injection prevention with parameterized queries
   - XSS protection with helmet
   - CORS configuration
   - Rate limiting

3. **Audit & Compliance**
   - Complete transaction audit logs
   - Security event logging
   - User activity tracking
   - Regulatory compliance ready

4. **Financial Security**
   - Double-entry transaction system
   - Balance verification
   - Withdrawal verification
   - Transaction reversal capabilities

## System Architecture

```
┌─────────────────┐
│   Frontend      │
│   (HTML/CSS/JS) │
└────────┬────────┘
         │
    ┌────▼────┐
    │  API    │
    │  Layer  │
    └────┬────┘
         │
    ┌────▼───────────┐
    │  Backend       │
    │  (Node.js)     │
    └────┬───────────┘
         │
    ┌────▼───────────┐
    │  Database      │
    │  (MySQL)       │
    └────────────────┘
```

## Project Structure

```
School system/
├── index.html                 # Landing/Login page
├── css/
│   └── style.css             # Global styles
├── js/
│   ├── auth.js               # Authentication logic
│   ├── student-dashboard.js  # Student dashboard
│   ├── parent-dashboard.js   # Parent portal
│   └── admin-dashboard.js    # Admin dashboard
├── pages/
│   ├── student-dashboard.html
│   ├── parent-dashboard.html
│   ├── admin-dashboard.html
│   ├── signup.html
│   └── forgot-password.html
└── backend/
    ├── server.js             # Express server
    ├── package.json          # Node.js dependencies
    ├── .env.example          # Environment variables
    ├── database_schema.sql   # Database schema
    └── API_DOCUMENTATION.md  # API documentation
```

## Installation & Setup

### Prerequisites
- Node.js (v14+)
- MySQL (v5.7+)
- Modern web browser
- Git

### Backend Setup

1. **Clone the repository**
```bash
cd "School system"
```

2. **Install dependencies**
```bash
cd backend
npm install
```

3. **Configure environment**
```bash
cp .env.example .env
# Edit .env with your database credentials
```

4. **Setup database**
```bash
# Create database
mysql -u root -p
mysql> CREATE DATABASE schoolwallet;

# Import schema
mysql -u root -p schoolwallet < database_schema.sql
```

5. **Start the backend server**
```bash
npm run dev
# Server runs on http://localhost:5000
```

### Frontend Setup

1. **Start a local web server**
```bash
# Using Python 3
python -m http.server 8000

# Or using Node.js http-server
npx http-server
```

2. **Access the application**
```
http://localhost:8000
```

## Default Test Credentials

### Student
- **User ID**: STU001
- **Password**: password123

### Parent
- **User ID**: PAR001
- **Password**: password123

### Administrator
- **User ID**: ADM001
- **Password**: password123

**⚠️ Change these credentials immediately in production!**

## API Endpoints

### Authentication
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/signup` - Create new account
- `POST /api/v1/auth/logout` - Logout user
- `POST /api/v1/auth/reset-password` - Reset password

### Wallet
- `GET /api/v1/wallet/balance` - Get current balance
- `GET /api/v1/wallet/details` - Get detailed wallet info

### Transactions
- `GET /api/v1/transactions` - Get transaction history
- `GET /api/v1/transactions/{id}` - Get transaction details

### Withdrawals
- `POST /api/v1/withdrawals/request` - Request withdrawal
- `GET /api/v1/withdrawals/requests` - Get withdrawal requests
- `POST /api/v1/withdrawals/{id}/cancel` - Cancel request

### Deposits
- `POST /api/v1/deposits/initiate` - Start deposit
- `GET /api/v1/deposits/history` - Get deposit history

### Parent Endpoints
- `GET /api/v1/parent/students` - Get linked students
- `GET /api/v1/parent/students/{id}/spending` - Spending report
- `POST /api/v1/parent/students/{id}/limits` - Set limits

### Admin Endpoints
- `POST /api/v1/admin/batches` - Schedule batch
- `GET /api/v1/admin/withdrawals` - Get all withdrawals
- `POST /api/v1/admin/withdrawals/{id}/approve` - Approve withdrawal
- `POST /api/v1/admin/withdrawals/{id}/reject` - Reject withdrawal
- `GET /api/v1/admin/statistics` - System statistics
- `GET /api/v1/admin/audit-logs` - Audit logs

See [API_DOCUMENTATION.md](backend/API_DOCUMENTATION.md) for complete API documentation.

## Usage Guide

### Student Workflow
1. Login with student credentials
2. View wallet balance and transaction history
3. Request withdrawal (amount and method)
4. Wait for admin to assign to batch
5. Withdraw during scheduled batch time
6. View spending analytics

### Parent Workflow
1. Login with parent credentials
2. Select a linked student
3. View student's balance and transactions
4. Deposit funds using various payment methods
5. Set spending limits and notifications
6. Monitor spending patterns

### Admin Workflow
1. Login with admin credentials
2. Schedule withdrawal batches
3. Review and approve/reject withdrawal requests
4. Manage user accounts
5. View audit logs and reports
6. Export transaction reports

## Database Schema

The system uses MySQL with the following key tables:
- `users` - User accounts (students, parents, admins)
- `wallets` - Digital wallet balances
- `transactions` - All financial transactions
- `withdrawal_requests` - Withdrawal requests
- `withdrawal_batches` - Scheduled withdrawal slots
- `deposits` - Deposit records
- `audit_logs` - Complete transaction history
- `security_logs` - Security events

See [database_schema.sql](backend/database_schema.sql) for complete schema.

## Security Best Practices

### For Deployment
1. Use HTTPS/SSL certificates
2. Set strong JWT secret
3. Configure database backups
4. Use environment variables for secrets
5. Enable rate limiting
6. Configure firewall rules
7. Set up WAF (Web Application Firewall)
8. Regular security audits

### For Users
1. Use strong passwords (min 8 characters)
2. Enable 2FA if available
3. Don't share credentials
4. Verify URLs before login
5. Logout after use
6. Report suspicious activity

## Maintenance & Monitoring

### Regular Tasks
- Database backups (daily)
- Log rotation
- Security updates
- Performance monitoring
- Audit log reviews

### Monitoring
- Application uptime monitoring
- Database performance
- API response times
- User activity
- Error rates

## Troubleshooting

### Backend won't start
```bash
# Check if port is in use
lsof -i :5000

# Check database connection
mysql -u root -p schoolwallet -e "SELECT 1"
```

### Database connection error
- Verify MySQL is running
- Check credentials in .env
- Ensure database exists
- Run schema migration

### API returns 500 error
- Check server logs: `tail -f logs/app.log`
- Verify database connectivity
- Check API request format
- Verify authentication token

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## License

This project is licensed under the MIT License - see LICENSE file for details.

## Support

For issues and questions:
- Create an issue in the repository
- Email: support@schoolwallet.edu
- Documentation: See docs/ folder

## Roadmap

- [ ] Mobile app (iOS/Android)
- [ ] Advanced analytics dashboard
- [ ] Machine learning fraud detection
- [ ] Multi-currency support
- [ ] Integration with school management systems
- [ ] USSD functionality for feature phones
- [ ] Merchant integration for school services
- [ ] Scholarship/grant management

## Acknowledgments

This system was developed with security and usability as primary concerns, following best practices in:
- OWASP Top 10 Security
- PCI DSS compliance
- GDPR data protection
- Financial system standards

## Version History

### v1.0.0 (2026-03-07)
- Initial release
- Core functionality for students, parents, and admins
- Basic reporting and analytics
- Audit logging

---

**Last Updated**: 2026-03-07  
**Version**: 1.0.0  
**Status**: Production Ready
