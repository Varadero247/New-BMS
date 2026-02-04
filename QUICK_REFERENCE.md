# IMS Quick Reference Card

## 🚀 Start Everything
```bash
cd /home/dyl/New-BMS
pnpm dev:dashboard  # Starts Gateway + Dashboard
```

## 🔑 Login (Manual Workaround)
1. Get token: `curl -X POST http://localhost:4000/api/auth/login -H "Content-Type: application/json" -d '{"email":"admin@ims.local","password":"admin123"}'`
2. Browser console (F12): `localStorage.setItem('token', 'YOUR_TOKEN');`
3. Refresh page

## ✅ Health Checks
```bash
curl http://localhost:4000/health  # Gateway
curl http://localhost:4006/health  # HR API
curl http://localhost:4007/health  # Payroll API
```

## 📊 Current Status
- ✅ PostgreSQL: Running
- ✅ 6 Services: Running
- ⚠️ Token Auth: Needs fix (30 mins)
- ⚠️ Login Page: Missing (1 hour)

## 🎯 Next Steps
1. Fix token auth (30 mins)
2. Build login page (1 hour)
3. Test all modules (2 hours)
