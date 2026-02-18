# IMS Testing - Quick Start Guide

**Get testing infrastructure running in 30 minutes**

---

## 🎯 OBJECTIVE

Get your IMS application testing environment set up and run your first tests today.

---

## 📋 PREREQUISITES CHECK

Before starting, verify you have:

```bash
# 1. Node.js 20+
node --version  # Should show v20.x.x or higher

# 2. pnpm 9+
pnpm --version  # Should show 9.x.x or higher

# 3. PostgreSQL running
psql --version  # Should show PostgreSQL 16 or higher

# 4. Redis running (optional but recommended)
redis-cli ping  # Should return "PONG"

# 5. Project cloned
cd /home/dyl/New-BMS
pwd  # Should show /home/dyl/New-BMS
```

If any of these fail, fix them first before proceeding.

---

## 🚀 QUICK SETUP (30 MINUTES)

### Step 1: Install Testing Dependencies (5 minutes)

```bash
cd /home/dyl/New-BMS

# Install testing packages
pnpm add -D jest @types/jest ts-jest \
  supertest @types/supertest \
  @testing-library/react @testing-library/jest-dom \
  jest-mock-extended

echo "✅ Step 1 complete: Dependencies installed"
```

### Step 2: Create Test Configuration (5 minutes)

Create: `jest.config.js`

```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/packages', '<rootDir>/apps'],
  testMatch: ['**/__tests__/**/*.test.ts', '**/?(*.)+(spec|test).ts'],
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        tsconfig: {
          jsx: 'react',
          esModuleInterop: true,
          allowSyntheticDefaultImports: true,
        },
      },
    ],
  },
  collectCoverageFrom: [
    '**/*.{ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
    '!**/.next/**',
    '!**/dist/**',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  moduleNameMapper: {
    '^@ims/(.*)$': '<rootDir>/packages/$1/src',
  },
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  testPathIgnorePatterns: ['/node_modules/', '/.next/', '/dist/'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  maxWorkers: '50%',
  testTimeout: 10000,
};
```

Create: `jest.setup.ts`

```typescript
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.test' });

jest.setTimeout(30000);

const prisma = new PrismaClient();

beforeAll(async () => {
  await prisma.$connect();
  console.log('✅ Test database connected');
});

afterAll(async () => {
  await prisma.$disconnect();
});

beforeEach(async () => {
  // Clean database before each test
  const tables = await prisma.$queryRaw<Array<{ tablename: string }>>`
    SELECT tablename FROM pg_tables WHERE schemaname='public'
  `;

  for (const { tablename } of tables) {
    if (tablename !== '_prisma_migrations') {
      try {
        await prisma.$executeRawUnsafe(
          `TRUNCATE TABLE "public"."${tablename}" RESTART IDENTITY CASCADE;`
        );
      } catch (error) {
        console.warn(`Warning: Could not truncate ${tablename}`);
      }
    }
  }
});

global.prisma = prisma;

declare global {
  var prisma: PrismaClient;
}
```

```bash
echo "✅ Step 2 complete: Configuration created"
```

### Step 3: Create Test Database (5 minutes)

Create: `.env.test`

```bash
cat > .env.test << 'EOF'
# Test Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/ims_test?schema=public"

# Test Redis
REDIS_URL="redis://localhost:6379/1"

# Test Secrets (weak is OK for tests)
JWT_SECRET="test_jwt_secret_minimum_64_characters_xxxxxxxxxxxxxxxxxxxxxxxxx"
SESSION_SECRET="test_session_secret"

# Test Config
NODE_ENV="test"
PORT=4000
NEXT_PUBLIC_API_URL="http://localhost:4000"
LOG_LEVEL="error"
EOF

echo "✅ .env.test created"
```

Create test database:

```bash
# Create test database
psql -U postgres -c "DROP DATABASE IF EXISTS ims_test;"
psql -U postgres -c "CREATE DATABASE ims_test;"

echo "✅ Test database created"

# Run migrations on test database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/ims_test?schema=public" \
  pnpm --filter @ims/database migrate deploy

echo "✅ Step 3 complete: Test database ready"
```

### Step 4: Add Test Scripts to package.json (2 minutes)

Update `package.json`:

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:verbose": "jest --verbose",
    "test:ci": "jest --ci --coverage --maxWorkers=2"
  }
}
```

```bash
echo "✅ Step 4 complete: Test scripts added"
```

### Step 5: Create Your First Test (5 minutes)

Create: `packages/auth/__tests__/password.test.ts`

```typescript
import { hashPassword, comparePassword } from '../src/password';

describe('Password Utilities', () => {
  describe('hashPassword', () => {
    it('should hash a password', async () => {
      const password = 'MySecurePassword123!';
      const hashed = await hashPassword(password);

      expect(hashed).toBeDefined();
      expect(hashed).not.toBe(password);
      expect(hashed).toHaveLength(60); // bcrypt hash length
    });

    it('should generate different hashes for same password', async () => {
      const password = 'SamePassword123!';
      const hash1 = await hashPassword(password);
      const hash2 = await hashPassword(password);

      expect(hash1).not.toBe(hash2);
    });
  });

  describe('comparePassword', () => {
    it('should return true for correct password', async () => {
      const password = 'CorrectPassword123!';
      const hashed = await hashPassword(password);
      const isValid = await comparePassword(password, hashed);

      expect(isValid).toBe(true);
    });

    it('should return false for incorrect password', async () => {
      const password = 'CorrectPassword123!';
      const hashed = await hashPassword(password);
      const isValid = await comparePassword('WrongPassword123!', hashed);

      expect(isValid).toBe(false);
    });
  });
});
```

```bash
echo "✅ Step 5 complete: First test created"
```

### Step 6: Run Your First Test! (3 minutes)

```bash
# Run the test
pnpm test

# Expected output:
# PASS  packages/auth/__tests__/password.test.ts
#   Password Utilities
#     hashPassword
#       ✓ should hash a password (XXms)
#       ✓ should generate different hashes for same password (XXms)
#     comparePassword
#       ✓ should return true for correct password (XXms)
#       ✓ should return false for incorrect password (XXms)
#
# Test Suites: 1 passed, 1 total
# Tests:       4 passed, 4 total

echo "✅ Step 6 complete: First test passing!"
```

---

## 🎉 SUCCESS!

If you see "Tests: 4 passed, 4 total", congratulations! Your testing environment is working.

---

## 🧪 TRY MORE TESTS

### Test 1: Test the JWT Module

Create: `packages/auth/__tests__/jwt.test.ts`

```typescript
import { generateToken, verifyToken } from '../src/jwt';

describe('JWT Module', () => {
  beforeAll(() => {
    process.env.JWT_SECRET = 'test_secret_minimum_64_chars_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx';
  });

  describe('generateToken', () => {
    it('should generate a valid JWT token', async () => {
      const payload = {
        userId: 'user-123',
        email: 'test@example.com',
        role: 'USER',
      };

      const token = await generateToken(payload);

      expect(token).toBeDefined();
      expect(token.split('.')).toHaveLength(3); // JWT has 3 parts
    });
  });

  describe('verifyToken', () => {
    it('should verify a valid token', async () => {
      const payload = {
        userId: 'user-456',
        email: 'verify@example.com',
        role: 'ADMIN',
      };

      const token = await generateToken(payload);
      const decoded = await verifyToken(token);

      expect(decoded.userId).toBe(payload.userId);
      expect(decoded.email).toBe(payload.email);
      expect(decoded.role).toBe(payload.role);
    });

    it('should reject an invalid token', async () => {
      const invalidToken = 'invalid.token.here';

      await expect(verifyToken(invalidToken)).rejects.toThrow();
    });

    it('should reject a tampered token', async () => {
      const token = await generateToken({ userId: '123', email: 'test@example.com', role: 'USER' });
      const tamperedToken = token.slice(0, -10) + 'xxxxxxxxxx';

      await expect(verifyToken(tamperedToken)).rejects.toThrow();
    });
  });
});
```

Run it:

```bash
pnpm test jwt
```

### Test 2: Test an API Endpoint

Create: `apps/api-gateway/__tests__/auth.test.ts`

```typescript
import request from 'supertest';
import app from '../src/index';
import { prisma } from '@ims/database';
import { hashPassword } from '@ims/auth';

describe('Authentication API', () => {
  describe('POST /api/auth/login', () => {
    it('should login with valid credentials', async () => {
      // Create test user
      const testUser = await prisma.user.create({
        data: {
          email: 'test@example.com',
          password: await hashPassword('Password123!'),
          firstName: 'Test',
          lastName: 'User',
          role: 'USER',
        },
      });

      // Attempt login
      const response = await request(app).post('/api/auth/login').send({
        email: 'test@example.com',
        password: 'Password123!',
      });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.token).toBeDefined();
      expect(response.body.data.user.email).toBe('test@example.com');
    });

    it('should reject invalid credentials', async () => {
      const response = await request(app).post('/api/auth/login').send({
        email: 'nonexistent@example.com',
        password: 'WrongPassword123!',
      });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('INVALID_CREDENTIALS');
    });

    it('should validate required fields', async () => {
      const response = await request(app).post('/api/auth/login').send({
        email: 'invalid-email',
        // Missing password
      });

      expect(response.status).toBe(400);
    });
  });
});
```

Run it:

```bash
pnpm test auth.test
```

---

## 📊 CHECK COVERAGE

See how much of your code is tested:

```bash
pnpm test:coverage

# Output shows:
# File                | % Stmts | % Branch | % Funcs | % Lines
# --------------------|---------|----------|---------|--------
# All files           |   XX.XX |    XX.XX |   XX.XX |   XX.XX
```

Open the HTML report:

```bash
open coverage/lcov-report/index.html
```

---

## 🐛 TROUBLESHOOTING

### Issue: "Cannot find module '@ims/...'"

**Fix**:

```bash
# Build all packages first
pnpm turbo build
```

### Issue: "Connection refused" to PostgreSQL

**Fix**:

```bash
# Start PostgreSQL
docker-compose up postgres -d

# Or if using system PostgreSQL
sudo service postgresql start
```

### Issue: "Test database not found"

**Fix**:

```bash
psql -U postgres -c "CREATE DATABASE ims_test;"
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/ims_test" \
  pnpm --filter @ims/database migrate deploy
```

### Issue: Tests fail with "JWT_SECRET not defined"

**Fix**: Check `.env.test` exists and has JWT_SECRET defined

### Issue: Tests are slow

**Fix**: Use `--maxWorkers=50%` to limit parallel execution

```bash
pnpm test --maxWorkers=50%
```

---

## 🎯 WHAT TO TEST NEXT

Now that testing is working, test in this order:

### Priority 1: Security-Critical Functions

```bash
# 1. Authentication
packages/auth/__tests__/

# 2. Password hashing
# 3. JWT tokens
# 4. Session management
# 5. Input validation
```

### Priority 2: API Endpoints

```bash
# 1. Auth endpoints (/api/auth/*)
apps/api-gateway/__tests__/

# 2. User management
# 3. Dashboard
# 4. Domain-specific endpoints
```

### Priority 3: Business Logic

```bash
# 1. Risk calculations
# 2. Compliance checks
# 3. Report generation
```

---

## 📈 TESTING BEST PRACTICES

### Write Tests That:

- ✅ Test one thing at a time
- ✅ Have clear, descriptive names
- ✅ Are independent (can run in any order)
- ✅ Clean up after themselves
- ✅ Test both success and failure cases

### Example Good Test:

```typescript
it('should reject password shorter than 8 characters', async () => {
  const shortPassword = 'Short1!';

  await expect(hashPassword(shortPassword)).rejects.toThrow(
    'Password must be at least 8 characters'
  );
});
```

### Example Bad Test:

```typescript
it('should work', async () => {
  // Too vague, tests multiple things
  const user = await createUser();
  const token = await login(user);
  const data = await getData(token);
  expect(data).toBeDefined();
});
```

---

## 🎓 TESTING PATTERNS

### Pattern 1: Arrange-Act-Assert (AAA)

```typescript
it('should calculate risk score correctly', () => {
  // Arrange - Set up test data
  const risk = {
    likelihood: 3,
    severity: 4,
    detectability: 2,
  };

  // Act - Execute the code
  const score = calculateRiskScore(risk);

  // Assert - Check the result
  expect(score).toBe(24); // 3 × 4 × 2
});
```

### Pattern 2: Test User Factory

```typescript
async function createTestUser(overrides = {}) {
  return prisma.user.create({
    data: {
      email: `test${Date.now()}@example.com`,
      password: await hashPassword('Password123!'),
      firstName: 'Test',
      lastName: 'User',
      role: 'USER',
      ...overrides,
    },
  });
}

// Usage
it('should do something', async () => {
  const admin = await createTestUser({ role: 'ADMIN' });
  // Test with admin user
});
```

### Pattern 3: Testing Async Code

```typescript
it('should handle async errors', async () => {
  // Use async/await
  await expect(asyncFunction()).rejects.toThrow('Expected error');
});
```

---

## 📚 NEXT STEPS

### Today:

1. ✅ Get tests running (done!)
2. Write 5 more tests for auth package
3. Run tests with coverage
4. Fix any failing tests

### This Week:

1. Test all authentication functions
2. Test all password functions
3. Test JWT functions
4. Test 3 API endpoints
5. Aim for 50% coverage

### This Month:

1. Test all API endpoints
2. Add integration tests
3. Achieve 80% coverage
4. Set up CI to run tests automatically

---

## 🎉 TESTING CHECKLIST

Track your progress:

- [x] Install testing dependencies
- [x] Create jest.config.js
- [x] Create jest.setup.ts
- [x] Create test database
- [x] Create .env.test
- [x] Add test scripts
- [x] Run first test successfully
- [ ] Write 10 unit tests
- [ ] Write 5 integration tests
- [ ] Achieve 50% coverage
- [ ] Set up CI testing
- [ ] Achieve 80% coverage

---

## 💡 QUICK COMMANDS REFERENCE

```bash
# Run all tests
pnpm test

# Run tests in watch mode (auto-rerun on file changes)
pnpm test:watch

# Run tests with coverage
pnpm test:coverage

# Run specific test file
pnpm test auth.test

# Run tests matching pattern
pnpm test password

# Run tests in verbose mode
pnpm test:verbose

# Run only failed tests
pnpm test --onlyFailures

# Update snapshots
pnpm test -u
```

---

## 🚀 YOU'RE READY!

Your testing environment is now set up and working. You can:

1. ✅ Run tests with `pnpm test`
2. ✅ See coverage with `pnpm test:coverage`
3. ✅ Write new tests in `__tests__/` folders
4. ✅ Track progress toward 80% coverage

**Start writing tests and watch your code quality improve!**

---

**Questions? Issues?**

- Check the troubleshooting section above
- Review the testing patterns
- Refer to Phase 2 guide for advanced testing

**Happy Testing! 🧪**
