# Sample Data Creation - Quick Summary

## What Was Created

### 📄 File: `server/seed-sample-data.js`
A comprehensive script that populates your database with realistic sample data.

### 📋 What It Creates

#### 8 Medical Representatives (MRs)
- Realistic Indian names
- Company email addresses (@ajakapharma.com)
- Employee IDs (MR001-MR008)
- Territories across major Indian cities
- Phone numbers in +91 format

#### 40-120 Visit Reports
- 5-15 visits per MR
- Distributed over last 90 days
- Products discussed (1-3 per visit)
- Doctor feedback and notes
- Interest levels (High/Medium/Low)
- Visit outcomes (Positive/Neutral/Follow-up)
- 30% include orders

## How to Use

### Quick Start
```bash
cd server
npm run seed-sample
```

### Sample Login
```
Email: rajesh.kumar@ajakapharma.com
Password: password123
```

All MRs use the same password: `password123`

## Sample MRs Created

| Name | Email | Territory | Region |
|------|-------|-----------|--------|
| Rajesh Kumar | rajesh.kumar@ajakapharma.com | Mumbai Central | Western |
| Priya Sharma | priya.sharma@ajakapharma.com | Delhi NCR | Northern |
| Amit Patel | amit.patel@ajakapharma.com | Bangalore South | Southern |
| Sneha Reddy | sneha.reddy@ajakapharma.com | Hyderabad East | Southern |
| Vikram Singh | vikram.singh@ajakapharma.com | Pune West | Western |
| Anjali Verma | anjali.verma@ajakapharma.com | Chennai North | Southern |
| Rahul Gupta | rahul.gupta@ajakapharma.com | Kolkata Central | Eastern |
| Kavita Desai | kavita.desai@ajakapharma.com | Ahmedabad West | Western |

## Prerequisites

Before running:
1. ✅ Have doctors in database
2. ✅ Have products in database
3. ✅ MongoDB running
4. ✅ `.env` configured

## What You'll See

### Admin Dashboard
- 8 MRs with performance data
- 40-120 visit reports
- Charts with real data
- MR performance metrics

### MR Dashboard
- Personal visit history
- Performance statistics
- Recent reports
- Order tracking

### Reports Page
- All visits from all MRs
- Filterable and searchable
- Exportable to CSV

## Features

✅ Realistic Indian names and locations
✅ Proper date distribution (last 90 days)
✅ Varied visit outcomes
✅ Random but realistic patterns
✅ Safe to re-run (checks for duplicates)
✅ Professional-looking data

## Script Added to package.json

```json
"scripts": {
  "seed-sample": "node seed-sample-data.js"
}
```

## Files Created

1. `server/seed-sample-data.js` - Main seeding script
2. `SAMPLE_DATA_GUIDE.md` - Detailed documentation
3. `SAMPLE_DATA_SUMMARY.md` - This quick reference

## Result

Your application will now have:
- ✅ 8 active MRs
- ✅ 40-120 visit reports
- ✅ Real-looking performance data
- ✅ Functional dashboards with charts
- ✅ Testable filtering and search
- ✅ Exportable reports

Perfect for demos, testing, and development!
