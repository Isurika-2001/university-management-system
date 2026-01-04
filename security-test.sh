#!/bin/bash

echo "🔒 Security Testing Checklist"
echo "============================"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 1. Dependency Check
echo ""
echo "1. Checking server dependencies..."
cd server
if npm audit --audit-level=moderate > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Server dependencies OK${NC}"
else
    echo -e "${RED}❌ Server has vulnerabilities - run: npm audit${NC}"
    npm audit --audit-level=moderate
fi

echo ""
echo "2. Checking client dependencies..."
cd ../client
if npm audit --audit-level=moderate > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Client dependencies OK${NC}"
else
    echo -e "${RED}❌ Client has vulnerabilities - run: npm audit${NC}"
    npm audit --audit-level=moderate
fi

# 2. Environment Check
echo ""
echo "3. Checking environment variables..."
cd ../server
if [ -f .env ]; then
    if grep -q "JWT_SECRET" .env && [ -n "$(grep JWT_SECRET .env | cut -d '=' -f2)" ]; then
        JWT_LENGTH=$(grep JWT_SECRET .env | cut -d '=' -f2 | wc -c)
        if [ $JWT_LENGTH -ge 32 ]; then
            echo -e "${GREEN}✅ JWT_SECRET is set and strong (${JWT_LENGTH} chars)${NC}"
        else
            echo -e "${YELLOW}⚠️  JWT_SECRET is too short (should be at least 32 chars)${NC}"
        fi
    else
        echo -e "${RED}❌ JWT_SECRET not set in .env${NC}"
    fi
    
    if grep -q "MONGO_URI" .env && [ -n "$(grep MONGO_URI .env | cut -d '=' -f2)" ]; then
        echo -e "${GREEN}✅ MONGO_URI is set${NC}"
    else
        echo -e "${RED}❌ MONGO_URI not set in .env${NC}"
    fi
    
    if grep -q "NODE_ENV=production" .env; then
        echo -e "${GREEN}✅ NODE_ENV is set to production${NC}"
    else
        echo -e "${YELLOW}⚠️  NODE_ENV not set to production${NC}"
    fi
else
    echo -e "${RED}❌ .env file not found${NC}"
fi

# 3. Build Check
echo ""
echo "4. Testing production build..."
cd ../client
if npm run build > /dev/null 2>&1; then
    if [ -d "build" ]; then
        BUILD_SIZE=$(du -sh build | cut -f1)
        echo -e "${GREEN}✅ Client build successful (Size: ${BUILD_SIZE})${NC}"
    else
        echo -e "${RED}❌ Build folder not created${NC}"
    fi
else
    echo -e "${RED}❌ Client build failed${NC}"
    echo "Run 'npm run build' to see errors"
fi

# 4. Security Headers Check (if server is running)
echo ""
echo "5. Security headers check..."
echo -e "${YELLOW}⚠️  Start your server and test at: https://securityheaders.com/${NC}"

# 5. Summary
echo ""
echo "============================"
echo "✅ Basic security checks complete"
echo ""
echo "Next steps:"
echo "1. Run: npm audit fix (in both server and client)"
echo "2. Test manually using SECURITY_TESTING_CHECKLIST.md"
echo "3. Use free tools: OWASP ZAP, Snyk, Security Headers"
echo "============================"

