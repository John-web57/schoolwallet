#!/usr/bin/env bash

# SchoolWallet Project Setup Script
# This script sets up the entire SchoolWallet system for development

echo "╔════════════════════════════════════════════════════════════╗"
echo "║           SchoolWallet - Setup Script v1.0                 ║"
echo "║      Secure Digital Pocket Money Management System         ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check prerequisites
echo -e "${BLUE}[1/4] Checking prerequisites...${NC}"

# Check Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}✗ Node.js not found. Please install Node.js v14+${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Node.js found: $(node -v)${NC}"

# Check npm
if ! command -v npm &> /dev/null; then
    echo -e "${RED}✗ npm not found. Please install npm${NC}"
    exit 1
fi
echo -e "${GREEN}✓ npm found: $(npm -v)${NC}"

# Check MySQL
if ! command -v mysql &> /dev/null; then
    echo -e "${YELLOW}⚠ MySQL not found. Setup database manually:${NC}"
    echo "  1. Install MySQL v5.7+"
    echo "  2. Run: mysql -u root -p schoolwallet < backend/database_schema.sql"
else
    echo -e "${GREEN}✓ MySQL found${NC}"
fi

echo ""
echo -e "${BLUE}[2/4] Installing backend dependencies...${NC}"

cd backend

if [ ! -f "package.json" ]; then
    echo -e "${RED}✗ package.json not found${NC}"
    exit 1
fi

npm install

if [ $? -ne 0 ]; then
    echo -e "${RED}✗ Failed to install dependencies${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Dependencies installed${NC}"

echo ""
echo -e "${BLUE}[3/4] Setting up environment configuration...${NC}"

if [ ! -f ".env" ]; then
    if [ -f ".env.example" ]; then
        cp .env.example .env
        echo -e "${GREEN}✓ Created .env file from template${NC}"
        echo -e "${YELLOW}  Please edit .env with your database credentials${NC}"
    else
        echo -e "${RED}✗ .env.example not found${NC}"
        exit 1
    fi
else
    echo -e "${GREEN}✓ .env already exists${NC}"
fi

echo ""
echo -e "${BLUE}[4/4] Verifying installation...${NC}"

# Check all required files
required_files=(
    "server.js"
    "package.json"
    ".env"
    "database_schema.sql"
    "../index.html"
    "../css/style.css"
)

all_files_exist=true
for file in "${required_files[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}✓ Found: $file${NC}"
    else
        echo -e "${RED}✗ Missing: $file${NC}"
        all_files_exist=false
    fi
done

if [ "$all_files_exist" = false ]; then
    echo -e "${RED}✗ Some files are missing${NC}"
    exit 1
fi

echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo -e "${GREEN}║           ✓ Installation Complete!${NC}"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

echo -e "${YELLOW}Next Steps:${NC}"
echo "1. Edit backend/.env with your database credentials"
echo "2. Setup database: mysql -u root -p schoolwallet < backend/database_schema.sql"
echo "3. Start backend: npm run dev (from backend directory)"
echo "4. Start frontend: python -m http.server 8000 (from root directory)"
echo "5. Open browser: http://localhost:8000"
echo ""

echo -e "${YELLOW}Test Accounts:${NC}"
echo "  Student:  STU001 / password123"
echo "  Parent:   PAR001 / password123"
echo "  Admin:    ADM001 / password123"
echo ""

echo -e "${YELLOW}Documentation:${NC}"
echo "  • Read QUICKSTART.md for 5-minute setup"
echo "  • Read README.md for complete documentation"
echo "  • Read DOCS_INDEX.md for documentation guide"
echo ""

echo -e "${GREEN}Happy coding! 🚀${NC}"
