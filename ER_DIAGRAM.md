# Ajaka Pharma - Entity Relationship Diagram

## Visual ER Diagram

```
                                    ┌──────────────────────┐
                                    │       USERS          │
                                    │  (Admin/Manager/MR)  │
                                    ├──────────────────────┤
                                    │ • _id (PK)           │
                                    │ • name               │
                                    │ • email (UNIQUE)     │
                                    │ • password (HASHED)  │
                                    │ • role               │
                                    │ • employeeId         │
                                    │ • phone              │
                                    │ • territory          │
                                    │ • reportingManager   │
                                    │ • isActive           │
                                    └──────────────────────┘
                                            │
                        ┌───────────────────┼───────────────────┐
                        │                   │                   │
                        │ assignedMR        │ mr                │ mr
                        │ (1:N)             │ (1:N)             │ (1:N)
                        ↓                   ↓                   ↓
            ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
            │     DOCTORS      │  │  VISIT REPORTS   │  │    MR TARGETS    │
            ├──────────────────┤  ├──────────────────┤  ├──────────────────┤
            │ • _id (PK)       │  │ • _id (PK)       │  │ • _id (PK)       │
            │ • srNo           │  │ • mr (FK)        │  │ • mr (FK)        │
            │ • name           │  │ • doctor (FK)    │  │ • targetPeriod   │
            │ • qualification  │  │ • visitDate      │  │   - month        │
            │ • place          │  │ • visitType      │  │   - year         │
            │ • specialization │  │ • products[]     │  │ • targets        │
            │ • phone          │  │ • notes          │  │   - visits       │
            │ • email          │  │ • status         │  │   - sales        │
            │ • assignedMR(FK) │  │ • createdAt      │  │ • achieved       │
            │ • isActive       │  └──────────────────┘  │   - visits       │
            └──────────────────┘           │            │   - sales        │
                    │                      │            └──────────────────┘
                    │ doctor               │ visitReport
                    │ (1:N)                │ (1:1)
                    │                      ↓
                    │              ┌──────────────────┐
                    │              │     ORDERS       │
                    │              ├──────────────────┤
                    │              │ • _id (PK)       │
                    └──────────────│ • mr (FK)        │
                       doctor (FK) │ • doctor (FK)    │
                                   │ • visitReport(FK)│
                                   │ • orderDetails   │
                                   │   - orderType    │
                                   │   - orderDate    │
                                   │ • items[]        │
                                   │   - product (FK) │
                                   │   - quantity     │
                                   │ • status         │
                                   └──────────────────┘
                                           │
                                           │ product
                                           │ (N:M)
                                           ↓
                                   ┌──────────────────┐
                                   │    PRODUCTS      │
                                   ├──────────────────┤
                                   │ • _id (PK)       │
                                   │ • productId      │
                                   │ • name           │
                                   │ • category       │
                                   │ • price          │
                                   │ • isActive       │
                                   └──────────────────┘
```

## Detailed Entity Descriptions

### 1. USERS
**Purpose:** Store all system users (Admin, Manager, MR)

**Attributes:**
- `_id`: Primary Key (MongoDB ObjectId)
- `name`: User's full name
- `email`: Unique email for login
- `password`: Bcrypt hashed password
- `role`: User role (Admin/Manager/MR)
- `employeeId`: Company employee ID
- `phone`: Contact number
- `territory`: Assigned territory/region
- `reportingManager`: Reference to manager (FK to Users)
- `isActive`: Account status
- `createdAt`: Account creation timestamp

**Relationships:**
- Self-referencing: reportingManager → Users (Manager hierarchy)
- One-to-Many: Users → Doctors (MR manages doctors)
- One-to-Many: Users → Visit Reports (MR creates reports)
- One-to-Many: Users → Orders (MR places orders)
- One-to-Many: Users → MR Targets (MR has targets)

---

### 2. DOCTORS
**Purpose:** Store doctor information

**Attributes:**
- `_id`: Primary Key
- `srNo`: Serial number
- `name`: Doctor's name
- `qualification`: Medical qualifications (MBBS, MD, etc.)
- `place`: City/Location
- `specialization`: Medical specialization
- `phone`: Contact number
- `email`: Email address
- `assignedMR`: Reference to MR (FK to Users)
- `isActive`: Active status

**Relationships:**
- Many-to-One: Doctors → Users (assigned to MR)
- One-to-Many: Doctors → Visit Reports (doctor has visits)
- One-to-Many: Doctors → Orders (doctor receives orders)

---

### 3. VISIT REPORTS
**Purpose:** Track MR visits to doctors

**Attributes:**
- `_id`: Primary Key
- `mr`: Reference to MR (FK to Users)
- `doctor`: Reference to Doctor (FK to Doctors)
- `visitDate`: Date of visit
- `visitType`: Type of visit (Regular/Follow-up)
- `productsDiscussed`: Array of product references
- `notes`: Visit notes/remarks
- `status`: Visit status (Completed/Pending)
- `createdAt`: Report creation timestamp

**Relationships:**
- Many-to-One: Visit Reports → Users (created by MR)
- Many-to-One: Visit Reports → Doctors (visit to doctor)
- Many-to-Many: Visit Reports → Products (products discussed)
- One-to-Many: Visit Reports → Orders (orders from visit)

---

### 4. ORDERS
**Purpose:** Track product orders

**Attributes:**
- `_id`: Primary Key
- `mr`: Reference to MR (FK to Users)
- `doctor`: Reference to Doctor (FK to Doctors)
- `visitReport`: Reference to Visit Report (FK)
- `orderDetails`: Embedded document
  - `orderType`: Doctor/Stockist order
  - `orderDate`: Order date
- `items`: Array of order items
  - `product`: Reference to Product (FK)
  - `quantity`: Order quantity
- `status`: Order status (Pending/Approved/Delivered)
- `createdAt`: Order creation timestamp

**Relationships:**
- Many-to-One: Orders → Users (placed by MR)
- Many-to-One: Orders → Doctors (ordered for doctor)
- Many-to-One: Orders → Visit Reports (from visit)
- Many-to-Many: Orders → Products (through items array)

---

### 5. PRODUCTS
**Purpose:** Store pharmaceutical product information

**Attributes:**
- `_id`: Primary Key
- `productId`: Unique product identifier
- `name`: Product name
- `category`: Product category
- `price`: Product price (MRP)
- `isActive`: Product availability status
- `createdAt`: Product creation timestamp

**Relationships:**
- Many-to-Many: Products → Visit Reports (discussed in visits)
- Many-to-Many: Products → Orders (ordered products)

---

### 6. MR TARGETS
**Purpose:** Track MR performance targets

**Attributes:**
- `_id`: Primary Key
- `mr`: Reference to MR (FK to Users)
- `targetPeriod`: Embedded document
  - `month`: Target month
  - `year`: Target year
- `targets`: Embedded document
  - `visits`: Target visit count
  - `sales`: Target sales amount
- `achieved`: Embedded document
  - `visits`: Achieved visit count
  - `sales`: Achieved sales amount
- `createdAt`: Target creation timestamp

**Relationships:**
- Many-to-One: MR Targets → Users (targets for MR)

---

### 7. MR PERFORMANCE LOGS
**Purpose:** Track historical MR performance

**Attributes:**
- `_id`: Primary Key
- `mr`: Reference to MR (FK to Users)
- `period`: Embedded document
  - `month`: Performance month
  - `year`: Performance year
- `metrics`: Embedded document
  - `totalVisits`: Total visits made
  - `totalOrders`: Total orders placed
  - `performanceScore`: Calculated score
- `createdAt`: Log creation timestamp

**Relationships:**
- Many-to-One: Performance Logs → Users (performance of MR)

---

## Cardinality Summary

| Relationship | Type | Description |
|-------------|------|-------------|
| Users → Doctors | 1:N | One MR manages many doctors |
| Users → Visit Reports | 1:N | One MR creates many reports |
| Users → Orders | 1:N | One MR places many orders |
| Users → MR Targets | 1:N | One MR has many targets |
| Doctors → Visit Reports | 1:N | One doctor has many visits |
| Doctors → Orders | 1:N | One doctor receives many orders |
| Visit Reports → Orders | 1:N | One visit can have multiple orders |
| Products ↔ Orders | N:M | Many products in many orders |
| Products ↔ Visit Reports | N:M | Many products discussed in many visits |
| Users → Users | 1:N | Manager manages many MRs |

---

## Database Indexes (for Performance)

```javascript
// Users
email: unique index
employeeId: unique index

// Doctors
assignedMR: index
place: index
isActive: index

// Visit Reports
mr: index
doctor: index
visitDate: index
status: index

// Orders
mr: index
doctor: index
status: index
createdAt: index

// Products
productId: unique index
isActive: index
```

---

## Sample Data Flow

1. **Admin creates MR account** → Users collection
2. **Admin assigns doctors to MR** → Doctors collection (assignedMR field)
3. **MR visits doctor** → Visit Reports collection
4. **MR discusses products** → Visit Reports (productsDiscussed array)
5. **MR places order** → Orders collection (linked to visit report)
6. **System tracks performance** → MR Performance Logs collection

---

## MongoDB Advantages for This Schema

1. **Embedded Documents**: Order items, target periods stored as nested objects
2. **Arrays**: Products discussed, order items stored as arrays
3. **Flexible Schema**: Easy to add new fields without migrations
4. **References**: ObjectId references for relationships
5. **Indexing**: Fast queries on frequently accessed fields
6. **Aggregation**: Complex analytics queries with aggregation pipeline

