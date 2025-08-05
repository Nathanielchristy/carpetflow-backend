# CarpetFlow Backend API

A comprehensive Express.js backend API for the CarpetFlow Business Management System.

## Features

- **Authentication & Authorization**: JWT-based authentication with role-based access control
- **User Management**: CRUD operations for users with different roles (admin, salesperson, warehouse, accountant)
- **Customer Management**: Complete customer lifecycle management
- **Inventory Management**: Stock tracking, low stock alerts, and movement history
- **Invoice Management**: Create, update, and track invoices with automatic stock updates
- **Dashboard & Analytics**: Real-time statistics and business insights
- **Reports**: Sales, inventory, customer, and financial reports
- **Multi-location Support**: Dubai and Abu Dhabi location management
- **Security**: Input validation, rate limiting, CORS, and helmet security

## Tech Stack

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **express-validator** - Input validation
- **helmet** - Security headers
- **cors** - Cross-origin resource sharing
- **morgan** - HTTP request logging
- **compression** - Response compression
- **express-rate-limit** - Rate limiting

## Installation

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp env.example .env
```

4. Update the `.env` file with your configuration:
```env
PORT=5000
NODE_ENV=development
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:5173
```

## Running the Server

### Development
```bash
npm run dev
```

### Production
```bash
npm start
```

The server will start on `http://localhost:5000`

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `GET /api/auth/verify` - Verify JWT token

### Users
- `GET /api/users` - Get all users (paginated)
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create new user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Customers
- `GET /api/customers` - Get all customers (paginated)
- `GET /api/customers/:id` - Get customer by ID
- `POST /api/customers` - Create new customer
- `PUT /api/customers/:id` - Update customer
- `DELETE /api/customers/:id` - Delete customer

### Inventory
- `GET /api/inventory` - Get all inventory items (paginated)
- `GET /api/inventory/:id` - Get inventory item by ID
- `POST /api/inventory` - Create new inventory item
- `PUT /api/inventory/:id` - Update inventory item
- `DELETE /api/inventory/:id` - Delete inventory item
- `PATCH /api/inventory/:id/stock` - Update stock quantity

### Invoices
- `GET /api/invoices` - Get all invoices (paginated)
- `GET /api/invoices/:id` - Get invoice by ID
- `POST /api/invoices` - Create new invoice
- `PUT /api/invoices/:id` - Update invoice
- `DELETE /api/invoices/:id` - Delete invoice

### Stock Movements
- `GET /api/stock` - Get all stock movements (paginated)
- `GET /api/stock/:id` - Get stock movement by ID

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics
- `GET /api/dashboard/activities` - Get recent activities
- `GET /api/dashboard/alerts/low-stock` - Get low stock alerts
- `GET /api/dashboard/alerts/overdue` - Get overdue invoices

### Reports
- `GET /api/reports/sales` - Get sales report
- `GET /api/reports/inventory` - Get inventory report
- `GET /api/reports/customers` - Get customer report
- `GET /api/reports/financial` - Get financial report

## Authentication

All protected routes require a valid JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

## Demo Accounts

The system includes pre-configured demo accounts:

| Email | Role | Location | Password |
|-------|------|----------|----------|
| admin@carpetflow.com | Admin | All | password123 |
| dubai@carpetflow.com | Salesperson | Dubai | password123 |
| abu-dhabi@carpetflow.com | Warehouse | Abu Dhabi | password123 |
| accountant@carpetflow.com | Accountant | Dubai | password123 |

## Data Structure

### User Roles
- `admin` - Full access to all locations
- `salesperson` - Sales operations
- `warehouse` - Inventory management
- `accountant` - Financial operations

### Invoice Status
- `draft` - Invoice in draft state
- `sent` - Invoice sent to customer
- `paid` - Invoice fully paid
- `unpaid` - Invoice not paid
- `partially_paid` - Invoice partially paid
- `cancelled` - Invoice cancelled

### Stock Movement Types
- `in` - Stock added
- `out` - Stock removed
- `adjustment` - Stock adjustment
- `transfer` - Stock transfer

## Error Handling

The API returns consistent error responses:
```json
{
  "success": false,
  "error": "Error message",
  "details": [] // Validation errors
}
```

## Security Features

- **JWT Authentication** - Secure token-based authentication
- **Password Hashing** - bcrypt with salt rounds
- **Input Validation** - Comprehensive request validation
- **Rate Limiting** - Prevent abuse
- **CORS Protection** - Cross-origin request control
- **Security Headers** - Helmet for additional security
- **Location-based Access Control** - Users can only access their location's data

## Development

### Project Structure
```
backend/
├── data/
│   └── mockData.js          # Mock data and utilities
├── middleware/
│   ├── auth.js              # Authentication middleware
│   └── errorHandler.js      # Error handling middleware
├── routes/
│   ├── auth.js              # Authentication routes
│   ├── users.js             # User management routes
│   ├── customers.js         # Customer management routes
│   ├── inventory.js         # Inventory management routes
│   ├── invoices.js          # Invoice management routes
│   ├── stock.js             # Stock movement routes
│   ├── dashboard.js         # Dashboard routes
│   └── reports.js           # Report routes
├── server.js                # Main server file
├── package.json             # Dependencies and scripts
└── README.md               # This file
```

### Adding New Features

1. Create new route file in `routes/` directory
2. Add route import to `server.js`
3. Update mock data in `data/mockData.js` if needed
4. Test with the frontend application

## Testing

Run tests (when implemented):
```bash
npm test
```

## Production Deployment

1. Set `NODE_ENV=production`
2. Use a strong JWT secret
3. Configure proper CORS origins
4. Set up a reverse proxy (nginx)
5. Use PM2 or similar process manager
6. Set up proper logging
7. Configure database (MongoDB/PostgreSQL) for production

## Future Enhancements

- Database integration (MongoDB/PostgreSQL)
- File upload for product images
- Email notifications
- PDF invoice generation
- Advanced reporting with charts
- Real-time notifications
- API documentation with Swagger
- Unit and integration tests
- Docker containerization 