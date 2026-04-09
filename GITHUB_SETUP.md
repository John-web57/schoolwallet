# GitHub Setup Instructions

## 🚀 Push SchoolWallet to GitHub

This project has been initialized with Git. Follow these steps to push it to GitHub.

### Step 1: Create a New Repository on GitHub

1. Go to [github.com](https://github.com) and log in
2. Click **"+" icon** → **New repository**
3. Name it: **schoolwallet** (or your preferred name)
4. Add description: "Secure Digital Pocket Money System for Schools"
5. Choose **Public** or **Private**
6. **Don't** initialize with README, .gitignore, or license (we already have them)
7. Click **"Create repository"**

### Step 2: Add Remote Repository

Copy and paste this command in your terminal:

```bash
cd "/home/omiti/Desktop/School system"
git remote add origin https://github.com/YOUR_USERNAME/schoolwallet.git
```

Replace `YOUR_USERNAME` with your actual GitHub username.

### Step 3: Rename Branch (Optional)

If you prefer `main` instead of `master`:

```bash
git branch -M main
```

### Step 4: Push to GitHub

```bash
git push -u origin master
```

Or if you renamed to `main`:

```bash
git push -u origin main
```

### Step 5: Verify on GitHub

Visit `https://github.com/YOUR_USERNAME/schoolwallet` to see your repository!

---

## 📋 What's Tracked vs. Ignored

### ✅ Files Being Tracked (23 files)
- HTML pages (login, dashboards, signup)
- CSS styling
- JavaScript files (auth, dashboards)
- Backend server code
- Documentation files
- Configuration files (.env.example)

### ❌ Files Being Ignored (.gitignore)
- `.env` (database passwords, secrets)
- `node_modules/` (dependencies)
- `.vscode/` (IDE settings)
- `*.log` (log files)
- `package-lock.json`
- Database files

---

## 🔑 Important Security Notes

1. **Never commit `.env` file** - It contains database passwords!
   - `.gitignore` prevents this automatically
   - Always use `.env.example` as template

2. **First time setup on new machine:**
   ```bash
   cp backend/.env.example backend/.env
   # Then edit .env with your actual database credentials
   ```

3. **Keep sensitive data secure:**
   - Database passwords
   - JWT secrets
   - API keys
   - All in `.env` only!

---

## 📌 Git Workflow for Future Changes

### Make changes:
```bash
cd "/home/omiti/Desktop/School system"
# Make your code changes...
```

### Commit changes:
```bash
git add .
git commit -m "Description of changes"
```

### Push to GitHub:
```bash
git push
```

### See history:
```bash
git log --oneline
```

---

## 🌿 Creating Branches

### Create development branch:
```bash
git checkout -b development
git push -u origin development
```

### Switch branches:
```bash
git checkout master      # Back to master
git checkout development # Back to dev
```

---

## 🔗 Useful GitHub Links

- **GitHub Docs**: https://docs.github.com
- **Git Guide**: https://git-scm.com/docs
- **GitHub Flow**: https://guides.github.com/introduction/flow/

---

## ✅ Checklist

- [ ] Created GitHub account (if not already)
- [ ] Created new repository on GitHub
- [ ] Added remote URL: `git remote add origin ...`
- [ ] Pushed to GitHub: `git push -u origin master`
- [ ] Verified files on GitHub (23 files visible)
- [ ] `.env` file NOT visible on GitHub
- [ ] `node_modules/` NOT visible on GitHub

---

**Your SchoolWallet project is now ready for version control on GitHub!** 🎉

For questions, check the [GitHub Docs](https://docs.github.com).
