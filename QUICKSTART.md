# SchoolWallet - Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Prerequisites
- Node.js (v14+)
- MySQL (v5.7+)
- A modern web browser

---

## Step 1: Setup Database (2 minutes)

```bash
# Open MySQL
mysql -u root -p

# Create database
CREATE DATABASE schoolwallet;
EXIT;

# Import schema
mysql -u root -p schoolwallet < /path/to/backend/database_schema.sql
```

---

## Step 2: Setup Backend (2 minutes)

```bash
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Start server
npm run dev

# Output should show:
# SchoolWallet Server running on port 5000
```

---

## Step 3: Start Frontend (1 minute)

### Option A: Python HTTP Server
```bash
cd ..
python -m http.server 8000
```

### Option B: Node HTTP Server
```bash
npx http-server
```

### Option C: Open Directly
```bash
# Just open index.html in your browser
```

---

## Step 4: Login to Application

### Open Browser
```
http://localhost:8000/index.html
```

### Test Accounts

#### Student Account
- **Role**: Student
- **User ID**: STU001
- **Password**: password123

#### Parent Account
- **Role**: Parent
- **User ID**: PAR001
- **Password**: password123

#### Admin Account
- **Role**: Administrator
- **User ID**: ADM001
- **Password**: password123

---

## Exploring the System

### As Student
1. ✅ Login with STU001/password123
2. ✅ View wallet balance ($5,000)
3. ✅ Check recent transactions
4. ✅ Submit withdrawal request
5. ✅ View spending analytics

### As Parent
1. ✅ Login with PAR001/password123
2. ✅ Select linked student (John Doe)
3. ✅ View student's balance
4. ✅ Deposit funds
5. ✅ Set spending limits
6. ✅ View spending breakdown

### As Admin
1. ✅ Login with ADM001/password123
2. ✅ View system statistics
3. ✅ Schedule withdrawal batch
4. ✅ Approve/reject withdrawals
5. ✅ View audit logs
6. ✅ Manage users

---

## API Testing

### Health Check
```bash
curl http://localhost:5000/api/v1/health
```

### Login
```bash
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"userId":"STU001","password":"password123","role":"student"}'
```

### Get Balance (requires token)
```bash
curl http://localhost:5000/api/v1/wallet/balance \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## Project Structure

```
School system/
├── index.html                    # Login page
├── README.md                     # Full documentation
├── IMPLEMENTATION_SUMMARY.md     # Project summary
├── DEPLOYMENT_GUIDE.md          # Deployment instructions
│
├── css/
│   └── style.css               # All styling (1000+ lines)
│
├── js/
│   ├── auth.js                 # Authentication logic
│   ├── student-dashboard.js    # Student features
│   ├── parent-dashboard.js     # Parent features
│   └── admin-dashboard.js      # Admin features
│
├── pages/
│   ├── student-dashboard.html
│   ├── parent-dashboard.html
│   ├── admin-dashboard.html
│   ├── signup.html
│   └── forgot-password.html
│
└── backend/
    ├── server.js               # Express API server
    ├── package.json            # Node dependencies
    ├── .env.example            # Configuration template
    ├── database_schema.sql     # Database setup
    └── API_DOCUMENTATION.md    # API reference
```

---

## Key Features to Try

### 1. User Registration
- Click "Create New Account"
- Select role (Student/Parent)
- Fill in details
- Create account

### 2. Wallet Operations
- View balance in real-time
- Check transaction history
- Filter transactions by type
- View transaction details

### 3. Withdrawal Process
- Click "Request Withdrawal"
- Enter amount and method
- Submit request
- Admin will schedule batch
- Withdraw during batch time

### 4. Parent Deposits
- Select student to manage
- Click "Deposit Funds"
- Enter amount and method
- Complete payment

### 5. Admin Controls
- Schedule withdrawal batches
- Approve/reject requests
- View system statistics
- Export reports

---

## Troubleshooting

### Backend won't start
```bash
# Check if port 5000 is in use
lsof -i :5000

# Kill process if needed
kill -9 PROCESS_ID

# Try different port
PORT=5001 npm run dev
```

### Database connection error
```bash
# Test connection
mysql -u root -p -e "SELECT 1"

# Check if MySQL is running
sudo service mysql status

# Or on Mac
brew services list
```

### Login not working
- Check browser console (F12) for errors
- Verify backend is running
- Try correct credentials (STU001, PAR001, ADM001)
- Clear browser cache

### Styling looks broken
- Clear browser cache (Ctrl+F5 or Cmd+Shift+R)
- Check that css/style.css exists
- Check browser console for file not found errors

---

## Important Configuration Files

### Frontend Configuration
- Stored credentials use localStorage
- API calls to http://localhost:5000
- Change BASE_URL in auth.js if needed

### Backend Configuration (.env)
```
NODE_ENV=development
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=schoolwallet
JWT_SECRET=your-secret-key
```

---

## Next Steps

1. **Explore the Code**
   - Read index.html for HTML structure
   - Review css/style.css for styling
   - Study js/auth.js for authentication logic

2. **Modify Data**
   - Edit mock data in JavaScript files
   - Customize colors in CSS
   - Add your school details

3. **Deploy**
   - Follow DEPLOYMENT_GUIDE.md
   - Set up production database
   - Configure environment variables

4. **Extend Features**
   - Add SMS notifications
   - Implement payment gateway
   - Add advanced analytics
   - Create mobile app

---

## Getting Help

### Documentation Files
- **README.md** - Full project documentation
- **API_DOCUMENTATION.md** - API endpoint reference
- **DEPLOYMENT_GUIDE.md** - Production deployment steps
- **IMPLEMENTATION_SUMMARY.md** - Project overview

### Debug Mode
Open browser Developer Tools (F12) to:
- View console errors
- Check network requests
- Monitor localStorage
- Inspect HTML elements

### Common Tasks

**Change admin password:**
```sql
UPDATE users SET password_hash = SHA2('newpassword', 256) WHERE user_id = 'ADM001';
```

**Reset database:**
```bash
mysql -u root -p schoolwallet < backend/database_schema.sql
```

**Add new student:**
```bash
# Use signup page or insert via SQL
INSERT INTO users VALUES ('STU002', 'student', 'Jane Smith', 'jane@school.edu', '555-1234', SHA2('password', 256), 'active', NOW(), NOW(), NULL);
```

---

## Performance Tips

- Use Chrome DevTools for profiling
- Monitor database queries (check MySQL logs)
- Clear old transactions periodically
- Archive completed batches
- Optimize images if adding logo

---

## Security Reminders ⚠️

- ✅ Change all test passwords before production
- ✅ Enable HTTPS/SSL on production
- ✅ Use strong JWT secret
- ✅ Set proper database permissions
- ✅ Enable firewalls and rate limiting
- ✅ Regular security audits
- ✅ Keep Node.js and packages updated

---

## Support & Contact

For detailed information, refer to:
- **Technical Questions** → API_DOCUMENTATION.md
- **Deployment Issues** → DEPLOYMENT_GUIDE.md
- **Feature Overview** → README.md
- **Project Status** → IMPLEMENTATION_SUMMARY.md

---

**Ready to start?** 🎉

1. Setup database ✓
2. Start backend ✓
3. Start frontend ✓
4. Login ✓
5. Explore! 🚀

Happy coding! 💻
