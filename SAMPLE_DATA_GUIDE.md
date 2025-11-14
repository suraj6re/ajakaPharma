# Sample Data Generation Guide

## Overview
This guide explains how to populate your MR Reporting System with realistic sample data for demonstration and testing purposes.

## What Gets Created

### 8 Sample Medical Representatives (MRs)
1. **Rajesh Kumar** - Mumbai Central, Western Region
2. **Priya Sharma** - Delhi NCR, Northern Region
3. **Amit Patel** - Bangalore South, Southern Region
4. **Sneha Reddy** - Hyderabad East, Southern Region
5. **Vikram Singh** - Pune West, Western Region
6. **Anjali Verma** - Chennai North, Southern Region
7. **Rahul Gupta** - Kolkata Central, Eastern Region
8. **Kavita Desai** - Ahmedabad West, Western Region

### Visit Reports
- 5-15 visit reports per MR (40-120 total visits)
- Visits distributed over the last 90 days
- Realistic visit data including:
  - Products discussed (1-3 per visit)
  - Samples given
  - Doctor feedback
  - Interest levels
  - Visit outcomes
  - 30% of visits include orders

## Prerequisites

Before running the sample data script, ensure you have:

1. ✅ **Doctors in database** - The script uses existing doctors
2. ✅ **Products in database** - The script uses existing products
3. ✅ **MongoDB running** - Database connection must be active
4. ✅ **Environment variables** - `.env` file configured with `MONGODB_URI`

## How to Run

### Step 1: Navigate to Server Directory
```bash
cd server
```

### Step 2: Run the Seed Script
```bash
npm run seed-sample
```

### Step 3: Wait for Completion
The script will:
- Connect to MongoDB
- Create 8 MRs with realistic Indian names
- Generate 40-120 visit reports
- Display progress and summary

## Sample Login Credentials

After running the script, you can log in as any of these MRs:

### MR 1: Rajesh Kumar
- **Email**: `rajesh.kumar@ajakapharma.com`
- **Password**: `password123`
- **Territory**: Mumbai Central

### MR 2: Priya Sharma
- **Email**: `priya.sharma@ajakapharma.com`
- **Password**: `password123`
- **Territory**: Delhi NCR

### MR 3: Amit Patel
- **Email**: `amit.patel@ajakapharma.com`
- **Password**: `password123`
- **Territory**: Bangalore South

### All Other MRs
- **Password**: `password123` (same for all)
- **Email Pattern**: `firstname.lastname@ajakapharma.com`

## What You'll See After Seeding

### Admin Dashboard
- Total MRs: 8
- Total Visits: 40-120
- Total Orders: 12-36 (30% of visits)
- MR Performance charts with real data
- Product discussion statistics

### MR Dashboard (when logged in as MR)
- Personal visit history
- Performance metrics
- Recent reports
- Order statistics

### Admin Reports Page
- All visit reports from all MRs
- Filterable by MR, date range
- Exportable to CSV

### Admin MRs Page
- List of 8 MRs with territories
- Performance metrics per MR
- Visit and order counts

## Data Characteristics

### Realistic Features
- ✅ Indian names and territories
- ✅ Proper employee IDs (MR001-MR008)
- ✅ Valid phone numbers (+91 format)
- ✅ Company email addresses
- ✅ Distributed across major Indian cities
- ✅ Varied visit outcomes and feedback
- ✅ Random but realistic visit patterns
- ✅ Appropriate product discussions per visit

### Visit Distribution
- **Date Range**: Last 90 days
- **Visits per MR**: 5-15 visits
- **Products per Visit**: 1-3 products
- **Orders**: 30% of visits include orders
- **Statuses**: Mix of Submitted, Approved, Completed

## Troubleshooting

### Error: "No doctors found"
**Solution**: Add doctors to your database first
```bash
# Import doctors from CSV or add manually through admin panel
```

### Error: "No products found"
**Solution**: Add products to your database first
```bash
# Import products from CSV or add manually through admin panel
```

### Error: "Connection failed"
**Solution**: Check your MongoDB connection
- Verify MongoDB is running
- Check `.env` file has correct `MONGODB_URI`
- Test connection: `mongosh` or MongoDB Compass

### MRs Already Exist
The script checks for existing MRs by email and skips creation if they already exist. It will only create new visit reports.

## Re-running the Script

You can safely re-run the script multiple times:
- ✅ Existing MRs won't be duplicated
- ✅ New visit reports will be added
- ✅ Existing visit reports won't be duplicated (checks by MR, doctor, and date)

## Cleaning Up Sample Data

To remove all sample data:

### Remove Sample MRs
```javascript
// In MongoDB shell or Compass
db.users.deleteMany({ 
  email: { $regex: '@ajakapharma.com' } 
})
```

### Remove Sample Visit Reports
```javascript
// Remove visits by sample MRs
db.visitreports.deleteMany({ 
  mr: { $in: [/* MR IDs */] } 
})
```

## Production Use

⚠️ **Warning**: This script is for **development and demo purposes only**

- Do NOT run in production
- All MRs have the same password (`password123`)
- Data is randomly generated
- Use for testing and demonstrations only

## Next Steps

After seeding sample data:

1. ✅ Log in as admin to view all data
2. ✅ Log in as any MR to see their dashboard
3. ✅ Test filtering and search features
4. ✅ Export reports to CSV
5. ✅ Test all CRUD operations
6. ✅ Verify charts and statistics

## Support

If you encounter issues:
1. Check MongoDB connection
2. Verify doctors and products exist
3. Check console output for errors
4. Review `.env` configuration

---

**Created by**: Ajaka Pharma Development Team
**Last Updated**: 2024
