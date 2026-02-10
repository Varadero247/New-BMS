# IMS System Testing Guide - Immediate Testing
**Purpose**: Test current system to verify functionality and identify issues  
**Time Required**: 2-4 hours  
**Prerequisites**: System running locally  

---

## 🎯 TESTING OBJECTIVES

1. Verify all services start successfully
2. Test database connectivity
3. Test authentication flow
4. Identify broken endpoints
5. Verify API Gateway routing
6. Test frontend applications
7. Document all findings

---

## 📋 PRE-FLIGHT CHECKLIST

### Step 1: Verify Prerequisites

```bash
cd /home/dyl/New-BMS

# Check Node.js version
node --version
# Should be v20.x.x or higher

# Check pnpm version
pnpm --version
# Should be 9.x.x or higher

# Check PostgreSQL is running
pg_isready
# Should return: accepting connections

# Check Redis is running (if using rate limiting)
redis-cli ping
# Should return: PONG
```

### Step 2: Install Dependencies

```bash
# Install all dependencies
pnpm install

# Verify installation
pnpm list --depth=0
```

### Step 3: Database Setup

```bash
# Check database exists
psql -U postgres -l | grep ims

# If not exists, create it
psql -U postgres -c "CREATE DATABASE ims;"

# Generate Prisma client
pnpm --filter @ims/database generate

# Run migrations
pnpm --filter @ims/database migrate deploy
```

---

## 🧪 TEST SUITE 1: SERVICE STARTUP

### Test 1.1: Check Services Script

```bash
# Run the service check script
./scripts/check-services.sh

# Expected output:
# ✅ API Gateway (4000): Running
# ✅ HR API (4006): Running
# ✅ Payroll API (4007): Running
# ❌ Health Safety API (4001): Not running
# ... etc
```

**Record Results**:
```
Service Status Report:
- API Gateway (4000): [ ] Running [ ] Not Running [ ] Error
- Dashboard (3000): [ ] Running [ ] Not Running [ ] Error
- HR API (4006): [ ] Running [ ] Not Running [ ] Error
- HR Web (3006): [ ] Running [ ] Not Running [ ] Error
- Payroll API (4007): [ ] Running [ ] Not Running [ ] Error
- Payroll Web (3007): [ ] Running [ ] Not Running [ ] Error
```

### Test 1.2: Start All Services

```bash
# Try starting the dashboard (includes API Gateway)
pnpm dev:dashboard

# In a new terminal, check if services are responding
curl http://localhost:4000/health
# Expected: {"status":"healthy"} or similar

curl http://localhost:3000
# Expected: HTML response or redirect to login
```

### Test 1.3: Individual Service Startup

```bash
# Start HR module
pnpm dev:hr

# Check HR API
curl http://localhost:4006/health

# Check HR Web
curl http://localhost:3006
```

**Common Issues & Fixes**:

**Issue**: Port already in use
```bash
# Find process using port
lsof -i :4000

# Kill the process
kill -9 <PID>
```

**Issue**: Database connection error
```bash
# Check DATABASE_URL in .env
cat .env | grep DATABASE_URL

# Test connection
psql $DATABASE_URL -c "SELECT 1;"
```

**Issue**: Module not found
```bash
# Rebuild packages
pnpm --filter @ims/database build
pnpm --filter @ims/auth build
pnpm --filter @ims/monitoring build
```

---

## 🧪 TEST SUITE 2: DATABASE TESTING

### Test 2.1: Database Connectivity

Create: `test-db-connection.js`

```javascript
const { PrismaClient } = require('@prisma/client');

async function testDatabase() {
  const prisma = new PrismaClient();
  
  try {
    console.log('Testing database connection...');
    
    // Test connection
    await prisma.$connect();
    console.log('✅ Database connected');
    
    // Test query
    const userCount = await prisma.user.count();
    console.log(`✅ Found ${userCount} users in database`);
    
    // Test all tables
    const tables = [
      'user', 'session', 'employee', 'department',
      'incident', 'risk', 'action'
    ];
    
    for (const table of tables) {
      try {
        const count = await prisma[table].count();
        console.log(`✅ Table '${table}': ${count} records`);
      } catch (error) {
        console.log(`❌ Table '${table}': ERROR - ${error.message}`);
      }
    }
    
    await prisma.$disconnect();
    console.log('\n✅ All database tests passed');
    
  } catch (error) {
    console.error('❌ Database test failed:', error.message);
    process.exit(1);
  }
}

testDatabase();
```

Run test:
```bash
node test-db-connection.js
```

### Test 2.2: Seed Data Check

```bash
# Check if demo data exists
psql -U postgres ims -c "SELECT email FROM users LIMIT 5;"

# Expected: Should see admin@ims.local and other users

# If no data, seed the database
pnpm --filter @ims/database seed
```

---

## 🧪 TEST SUITE 3: AUTHENTICATION TESTING

### Test 3.1: Manual API Testing

Create: `test-auth.sh`

```bash
#!/bin/bash

API_URL="http://localhost:4000"

echo "🧪 Testing Authentication API"
echo "=============================="

# Test 1: Login with demo credentials
echo ""
echo "Test 1: Login with demo credentials"
RESPONSE=$(curl -s -X POST "$API_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@ims.local",
    "password": "admin123"
  }')

echo "Response: $RESPONSE"

# Extract token
TOKEN=$(echo $RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo "❌ Login failed - no token received"
  exit 1
else
  echo "✅ Login successful - token received"
fi

# Test 2: Access protected endpoint
echo ""
echo "Test 2: Access protected endpoint with token"
ME_RESPONSE=$(curl -s -X GET "$API_URL/api/auth/me" \
  -H "Authorization: Bearer $TOKEN")

echo "Response: $ME_RESPONSE"

if echo $ME_RESPONSE | grep -q "email"; then
  echo "✅ Protected endpoint accessible"
else
  echo "❌ Protected endpoint failed"
fi

# Test 3: Invalid credentials
echo ""
echo "Test 3: Login with invalid credentials"
INVALID_RESPONSE=$(curl -s -X POST "$API_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "wrong@example.com",
    "password": "wrongpassword"
  }')

if echo $INVALID_RESPONSE | grep -q "error"; then
  echo "✅ Invalid login rejected correctly"
else
  echo "❌ Invalid login should be rejected"
fi

echo ""
echo "=============================="
echo "Authentication tests complete"
```

Run test:
```bash
chmod +x test-auth.sh
./test-auth.sh
```

### Test 3.2: Frontend Login Test

```bash
# Start dashboard
pnpm dev:dashboard

# Open browser
# Navigate to: http://localhost:3000

# Try to access dashboard without login
# Expected: Redirect to /login page

# Login with:
# Email: admin@ims.local
# Password: admin123

# Expected: Successful login, redirect to dashboard
```

**Manual Testing Checklist**:
- [ ] Login page loads correctly
- [ ] Can enter email and password
- [ ] "Login" button works
- [ ] Invalid credentials show error
- [ ] Valid credentials log in successfully
- [ ] Redirected to dashboard after login
- [ ] Can see user name/email in UI
- [ ] Logout button works

---

## 🧪 TEST SUITE 4: API ENDPOINT TESTING

### Test 4.1: Test API Gateway Routing

Create: `test-api-endpoints.sh`

```bash
#!/bin/bash

API_URL="http://localhost:4000"

# First, login to get token
TOKEN=$(curl -s -X POST "$API_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@ims.local","password":"admin123"}' \
  | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo "❌ Failed to get auth token"
  exit 1
fi

echo "🧪 Testing API Endpoints"
echo "========================"
echo "Token: ${TOKEN:0:20}..."
echo ""

# Test endpoints
declare -a endpoints=(
  "GET|/api/auth/me|200"
  "GET|/api/dashboard/stats|200"
  "GET|/api/hr/employees|200"
  "GET|/api/hr/departments|200"
  "GET|/api/payroll/salary-structures|200"
  "GET|/api/health-safety/incidents|404|Not Started"
  "GET|/api/environment/aspects|404|Not Started"
  "GET|/api/quality/nonconformances|404|Not Started"
)

for endpoint in "${endpoints[@]}"; do
  IFS='|' read -r method path expected_status note <<< "$endpoint"
  
  echo "Testing: $method $path"
  
  if [ "$method" = "GET" ]; then
    STATUS=$(curl -s -o /dev/null -w "%{http_code}" \
      -X GET "$API_URL$path" \
      -H "Authorization: Bearer $TOKEN")
  fi
  
  if [ "$STATUS" = "$expected_status" ]; then
    if [ -n "$note" ]; then
      echo "  ✅ Status: $STATUS ($note)"
    else
      echo "  ✅ Status: $STATUS"
    fi
  else
    echo "  ❌ Status: $STATUS (expected $expected_status)"
  fi
  echo ""
done

echo "========================"
echo "API endpoint tests complete"
```

Run test:
```bash
chmod +x test-api-endpoints.sh
./test-api-endpoints.sh
```

### Test 4.2: Test CRUD Operations

Create: `test-crud.sh`

```bash
#!/bin/bash

API_URL="http://localhost:4000"

# Login
TOKEN=$(curl -s -X POST "$API_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@ims.local","password":"admin123"}' \
  | grep -o '"token":"[^"]*' | cut -d'"' -f4)

echo "🧪 Testing CRUD Operations"
echo "=========================="

# CREATE
echo "Test 1: CREATE - Adding new employee"
CREATE_RESPONSE=$(curl -s -X POST "$API_URL/api/hr/employees" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "employeeNumber": "EMP'$(date +%s)'",
    "firstName": "Test",
    "lastName": "User",
    "email": "test'$(date +%s)'@example.com",
    "dateOfBirth": "1990-01-01",
    "hireDate": "2024-01-01",
    "status": "ACTIVE"
  }')

EMPLOYEE_ID=$(echo $CREATE_RESPONSE | grep -o '"id":"[^"]*' | cut -d'"' -f4)

if [ -n "$EMPLOYEE_ID" ]; then
  echo "✅ CREATE successful - ID: $EMPLOYEE_ID"
else
  echo "❌ CREATE failed"
  echo "Response: $CREATE_RESPONSE"
  exit 1
fi

# READ
echo ""
echo "Test 2: READ - Fetching employee"
READ_RESPONSE=$(curl -s -X GET "$API_URL/api/hr/employees/$EMPLOYEE_ID" \
  -H "Authorization: Bearer $TOKEN")

if echo $READ_RESPONSE | grep -q "$EMPLOYEE_ID"; then
  echo "✅ READ successful"
else
  echo "❌ READ failed"
  echo "Response: $READ_RESPONSE"
fi

# UPDATE
echo ""
echo "Test 3: UPDATE - Updating employee"
UPDATE_RESPONSE=$(curl -s -X PUT "$API_URL/api/hr/employees/$EMPLOYEE_ID" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Updated",
    "lastName": "Name"
  }')

if echo $UPDATE_RESPONSE | grep -q "Updated"; then
  echo "✅ UPDATE successful"
else
  echo "❌ UPDATE failed"
  echo "Response: $UPDATE_RESPONSE"
fi

# DELETE
echo ""
echo "Test 4: DELETE - Removing employee"
DELETE_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" \
  -X DELETE "$API_URL/api/hr/employees/$EMPLOYEE_ID" \
  -H "Authorization: Bearer $TOKEN")

if [ "$DELETE_RESPONSE" = "200" ] || [ "$DELETE_RESPONSE" = "204" ]; then
  echo "✅ DELETE successful"
else
  echo "❌ DELETE failed (Status: $DELETE_RESPONSE)"
fi

echo ""
echo "=========================="
echo "CRUD tests complete"
```

Run test:
```bash
chmod +x test-crud.sh
./test-crud.sh
```

---

## 🧪 TEST SUITE 5: FRONTEND TESTING

### Test 5.1: Dashboard Navigation Test

Manual testing checklist:

```
Dashboard Application (http://localhost:3000)
-------------------------------------------------
[ ] Login page loads
[ ] Can login with admin@ims.local / admin123
[ ] Dashboard shows after login
[ ] Navigation menu appears
[ ] Can navigate to HR section
[ ] Can navigate to Payroll section
[ ] User profile menu works
[ ] Logout works

HR Application (http://localhost:3006)
-------------------------------------------------
[ ] Login page loads
[ ] Can login with credentials
[ ] Employee list loads
[ ] Can view employee details
[ ] Can add new employee
[ ] Can edit employee
[ ] Can delete employee
[ ] Search functionality works

Payroll Application (http://localhost:3007)
-------------------------------------------------
[ ] Login page loads
[ ] Can login with credentials
[ ] Salary structures list loads
[ ] Can view payroll details
[ ] Navigation works
```

### Test 5.2: UI Component Test

Create: `test-ui-components.html`

```html
<!DOCTYPE html>
<html>
<head>
  <title>IMS UI Component Test</title>
  <style>
    body { font-family: Arial, sans-serif; padding: 20px; }
    .test { margin: 20px 0; padding: 15px; border: 1px solid #ddd; }
    .pass { background-color: #d4edda; }
    .fail { background-color: #f8d7da; }
    button { padding: 10px 20px; margin: 5px; cursor: pointer; }
  </style>
</head>
<body>
  <h1>IMS Frontend Component Test</h1>
  
  <div class="test" id="test1">
    <h3>Test 1: API Connection</h3>
    <button onclick="testAPI()">Test API</button>
    <div id="api-result"></div>
  </div>

  <div class="test" id="test2">
    <h3>Test 2: Authentication</h3>
    <button onclick="testAuth()">Test Login</button>
    <div id="auth-result"></div>
  </div>

  <div class="test" id="test3">
    <h3>Test 3: Fetch Data</h3>
    <button onclick="testFetch()">Fetch Employees</button>
    <div id="fetch-result"></div>
  </div>

  <script>
    const API_URL = 'http://localhost:4000';
    let authToken = null;

    async function testAPI() {
      const result = document.getElementById('api-result');
      result.textContent = 'Testing...';
      
      try {
        const response = await fetch(`${API_URL}/health`);
        const data = await response.json();
        
        if (response.ok) {
          result.textContent = '✅ API is responding: ' + JSON.stringify(data);
          document.getElementById('test1').className = 'test pass';
        } else {
          result.textContent = '❌ API error: ' + response.status;
          document.getElementById('test1').className = 'test fail';
        }
      } catch (error) {
        result.textContent = '❌ Connection failed: ' + error.message;
        document.getElementById('test1').className = 'test fail';
      }
    }

    async function testAuth() {
      const result = document.getElementById('auth-result');
      result.textContent = 'Testing...';
      
      try {
        const response = await fetch(`${API_URL}/api/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: 'admin@ims.local',
            password: 'admin123'
          })
        });
        
        const data = await response.json();
        
        if (data.success && data.data.token) {
          authToken = data.data.token;
          result.textContent = '✅ Login successful! Token: ' + authToken.substring(0, 20) + '...';
          document.getElementById('test2').className = 'test pass';
        } else {
          result.textContent = '❌ Login failed: ' + JSON.stringify(data);
          document.getElementById('test2').className = 'test fail';
        }
      } catch (error) {
        result.textContent = '❌ Auth failed: ' + error.message;
        document.getElementById('test2').className = 'test fail';
      }
    }

    async function testFetch() {
      const result = document.getElementById('fetch-result');
      result.textContent = 'Testing...';
      
      if (!authToken) {
        result.textContent = '❌ Please login first';
        return;
      }
      
      try {
        const response = await fetch(`${API_URL}/api/hr/employees`, {
          headers: { 'Authorization': `Bearer ${authToken}` }
        });
        
        const data = await response.json();
        
        if (response.ok && data.data) {
          result.textContent = `✅ Fetched ${data.data.length} employees`;
          document.getElementById('test3').className = 'test pass';
        } else {
          result.textContent = '❌ Fetch failed: ' + JSON.stringify(data);
          document.getElementById('test3').className = 'test fail';
        }
      } catch (error) {
        result.textContent = '❌ Fetch failed: ' + error.message;
        document.getElementById('test3').className = 'test fail';
      }
    }
  </script>
</body>
</html>
```

Open in browser: `test-ui-components.html`

---

## 📊 TEST RESULTS TEMPLATE

Create: `TEST_RESULTS.md`

```markdown
# IMS System Test Results

**Date**: [DATE]
**Tester**: [YOUR NAME]
**System**: IMS v1.0

## Environment
- Node Version: [VERSION]
- PostgreSQL Version: [VERSION]
- OS: [OS]

## Test Results Summary

| Test Suite | Status | Pass | Fail | Notes |
|------------|--------|------|------|-------|
| Service Startup | [ ] | 0/6 | 0 | |
| Database | [ ] | 0/5 | 0 | |
| Authentication | [ ] | 0/3 | 0 | |
| API Endpoints | [ ] | 0/10 | 0 | |
| CRUD Operations | [ ] | 0/4 | 0 | |
| Frontend | [ ] | 0/8 | 0 | |

## Detailed Results

### 1. Service Startup
- API Gateway (4000): [PASS/FAIL]
- Dashboard (3000): [PASS/FAIL]
- HR API (4006): [PASS/FAIL]
- HR Web (3006): [PASS/FAIL]
- Payroll API (4007): [PASS/FAIL]
- Payroll Web (3007): [PASS/FAIL]

### 2. Database Tests
- Connection: [PASS/FAIL]
- User table: [PASS/FAIL]
- Employee table: [PASS/FAIL]
- Seed data: [PASS/FAIL]
- Query performance: [PASS/FAIL]

### 3. Authentication Tests
- Login with valid credentials: [PASS/FAIL]
- Login with invalid credentials: [PASS/FAIL]
- Protected endpoint access: [PASS/FAIL]

### 4. Issues Found

1. **Issue**: [Description]
   - **Severity**: Critical/High/Medium/Low
   - **Steps to Reproduce**: 
   - **Expected**: 
   - **Actual**: 
   - **Fix**: 

## Recommendations

1. [RECOMMENDATION]
2. [RECOMMENDATION]

## Next Steps

- [ ] Fix critical issues
- [ ] Retest failed areas
- [ ] Document workarounds
```

---

## 🐛 COMMON ISSUES & SOLUTIONS

### Issue 1: Services Won't Start

**Symptoms**: `Error: Cannot find module`, `Port already in use`

**Solution**:
```bash
# Clean install
rm -rf node_modules
rm pnpm-lock.yaml
pnpm install

# Kill processes on ports
./scripts/stop-all-services.sh

# Restart
pnpm dev:dashboard
```

### Issue 2: Database Connection Fails

**Symptoms**: `Error: Can't reach database server`

**Solution**:
```bash
# Check PostgreSQL is running
sudo systemctl status postgresql

# Or with Docker
docker ps | grep postgres

# Check connection string
echo $DATABASE_URL

# Test connection
psql $DATABASE_URL -c "SELECT 1;"
```

### Issue 3: Authentication Fails

**Symptoms**: 401 errors, "Invalid token"

**Solution**:
```bash
# Check JWT_SECRET exists
echo $JWT_SECRET

# Check user exists in database
psql -U postgres ims -c "SELECT email FROM users WHERE email='admin@ims.local';"

# If no users, seed database
pnpm --filter @ims/database seed
```

### Issue 4: Frontend Shows Blank Page

**Symptoms**: White screen, console errors

**Solution**:
```bash
# Check browser console for errors
# Check .env has NEXT_PUBLIC_API_URL

# Rebuild
pnpm --filter @ims/web-dashboard build
pnpm --filter @ims/web-dashboard dev
```

---

## ✅ TESTING COMPLETE CHECKLIST

When you've completed all tests:

- [ ] All 6 core services tested
- [ ] Database connectivity verified
- [ ] Authentication working
- [ ] At least 5 API endpoints tested
- [ ] CRUD operations tested
- [ ] Frontend tested manually
- [ ] Issues documented
- [ ] TEST_RESULTS.md completed

---

## 📝 NEXT STEPS AFTER TESTING

Based on your test results:

**If most tests PASS** (>80%):
1. Review the security analysis document
2. Start implementing Phase 1 fixes
3. Focus on missing features

**If many tests FAIL** (40-80%):
1. Fix broken services first
2. Verify database schema
3. Check environment configuration
4. Then proceed with Phase 1

**If most tests FAIL** (<40%):
1. Review system architecture document
2. Ensure all prerequisites met
3. Consider fresh installation
4. Get assistance if needed

---

**Ready to start testing? Run the first test:**

```bash
cd /home/dyl/New-BMS
./scripts/check-services.sh
```

Good luck! 🧪
