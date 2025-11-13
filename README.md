# MR Reporting System

A comprehensive Medical Representative (MR) reporting and management system built with MERN stack.

## Features

- **JWT Authentication** - Secure login system with role-based access control
- **Role Management** - Admin, Manager, and MR roles with different permissions
- **Doctor Management** - Track and manage doctor visits and relationships
- **Visit Reporting** - Record and monitor MR visits to doctors
- **Product Management** - Manage pharmaceutical products and samples
- **Order Management** - Track doctor and stockist orders
- **Performance Tracking** - Monitor MR performance and targets
- **Territory Management** - Organize MRs by territories and regions

## Tech Stack

### Frontend
- React 18
- React Router v6
- Tailwind CSS
- Axios
- Recharts (for analytics)

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT for authentication
- Bcrypt for password hashing

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB Atlas account or local MongoDB
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd mr-reporting-system
```

2. Install dependencies

Frontend:
```bash
npm install
```

Backend:
```bash
cd server
npm install
```

3. Environment Setup

Create a `.env` file in the root directory:
```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
PORT=5000
FRONTEND_URL=http://localhost:5173
```

4. Create Admin User

```bash
node server/create-admin.js
```

Default credentials:
- Email: suraj6re@gmail.com
- Password: Admin@123

### Running the Application

1. Start the backend server:
```bash
cd server
node index.js
```

2. Start the frontend (in a new terminal):
```bash
npm run dev
```

3. Access the application at `http://localhost:5173`

## Project Structure

```
mr-reporting-system/
├── src/                    # Frontend React application
│   ├── components/         # Reusable components
│   ├── pages/             # Page components
│   ├── services/          # API services
│   └── App.jsx            # Main app component
├── server/                # Backend Node.js application
│   ├── controllers/       # Request handlers
│   ├── models/           # MongoDB models
│   ├── routes/           # API routes
│   ├── middleware/       # Custom middleware
│   ├── utils/            # Utility functions
│   └── index.js          # Server entry point
└── README.md
```

## API Endpoints

### Authentication
- `POST /api/users/login` - User login

### Users
- `GET /api/users` - Get all users (Admin)
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create new user (Admin)
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Deactivate user (Admin)

### Doctors
- `GET /api/doctors` - Get all doctors
- `GET /api/doctors/:id` - Get doctor by ID
- `POST /api/doctors` - Add new doctor
- `PUT /api/doctors/:id` - Update doctor
- `DELETE /api/doctors/:id` - Delete doctor

### Visit Reports
- `GET /api/visit-reports` - Get all visit reports
- `POST /api/visit-reports` - Submit visit report
- `GET /api/visit-reports/:id` - Get visit report by ID

### Products
- `GET /api/products` - Get all products
- `POST /api/products` - Add new product (Admin)
- `PUT /api/products/:id` - Update product (Admin)

### Orders
- `GET /api/orders` - Get all orders
- `POST /api/orders` - Create new order
- `GET /api/orders/:id` - Get order by ID

## User Roles

### Admin
- Full system access
- Manage users, doctors, products
- View all reports and analytics
- Set MR targets

### Manager
- View team performance
- Manage assigned MRs
- View reports for their territory

### MR (Medical Representative)
- Submit visit reports
- Manage assigned doctors
- Place orders
- View personal performance

## Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Role-based access control
- Protected API routes
- Input validation
- CORS configuration

## Database Models

- **User** - System users (Admin, Manager, MR)
- **Doctor** - Doctor information and assignments
- **Product** - Pharmaceutical products
- **VisitReport** - MR visit records
- **Order** - Doctor and stockist orders
- **MRTarget** - Performance targets
- **MRPerformanceLog** - Performance tracking
- **ProductActivityLog** - Product activity tracking

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Support

For support, email suraj6re@gmail.com or create an issue in the repository.
