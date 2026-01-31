# PROJECT KALI - Integrated Transport & Vehicle Management System (ITVMS)

A comprehensive vehicle management system for NIT University Dar es Salaam, built with modern web technologies and cloud deployment capabilities.

## 🚀 Features

- **Vehicle Management**: Add, update, and manage university vehicles
- **Driver Management**: Manage driver information and assignments
- **Trip Management**: Schedule and track vehicle trips
- **Maintenance Tracking**: Track vehicle maintenance and service history
- **Dashboard Analytics**: Real-time statistics and charts
- **Reports & Analytics**: Generate comprehensive reports
- **Authentication**: Secure user authentication and role-based access
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## 🛠️ Technology Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **Sequelize** - ORM for database operations
- **MySQL** - Database (Railway.app hosted)
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing

### Frontend
- **HTML5, CSS3, JavaScript** - Core technologies
- **Bootstrap 5** - UI framework
- **Chart.js** - Data visualization
- **Font Awesome** - Icons

### Deployment
- **Railway.app** - Cloud hosting platform
- **MySQL Cloud Database** - Managed database service

## 📋 Project Structure

```
nit-itvms/
├── backend/
│   └── src/
│       ├── config/
│       │   └── database.js      # Database configuration
│       ├── controllers/         # Route controllers (if needed)
│       ├── middleware/          # Custom middleware (if needed)
│       ├── models/
│       │   └── index.js         # Sequelize models
│       ├── routes/
│       │   ├── auth.js          # Authentication routes
│       │   ├── vehicles.js      # Vehicle management routes
│       │   ├── drivers.js       # Driver management routes
│       │   ├── trips.js         # Trip management routes
│       │   ├── maintenance.js   # Maintenance tracking routes
│       │   └── dashboard.js     # Dashboard data routes
│       ├── utils/               # Utility functions (if needed)
│       └── server.js            # Main server file
├── frontend/
│   ├── index.html               # Main HTML file
│   └── src/
│       ├── css/
│       │   └── style.css        # Custom styles
│       └── js/
│           ├── api.js           # API communication layer
│           └── app.js           # Main application logic
├── database/
│   └── schema.sql               # Database schema and sample data
├── .env.example                 # Environment variables template
├── .gitignore                   # Git ignore rules
├── package.json                 # Node.js dependencies
├── railway.json                 # Railway.app deployment config
└── README.md                    # This file
```

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- MySQL database (local or Railway.app)

### Local Development

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd nit-itvms
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` with your database credentials:
   ```env
   PORT=3000
   NODE_ENV=development
   DB_HOST=localhost
   DB_PORT=3306
   DB_NAME=nit_itvms
   DB_USER=your_db_user
   DB_PASSWORD=your_db_password
   JWT_SECRET=your_super_secret_jwt_key_here
   ```

4. **Set up the database**
   ```bash
   mysql -u your_db_user -p nit_itvms < database/schema.sql
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open the application**
   - Backend API: http://localhost:3000
   - Frontend: Open `frontend/index.html` in your browser

### Railway.app Deployment

1. **Create a Railway.app account**
   - Sign up at [railway.app](https://railway.app)

2. **Deploy the application**
   - Connect your GitHub repository to Railway.app
   - Railway.app will automatically detect the Node.js application
   - Set up environment variables in Railway.app dashboard
   - Deploy!

3. **Set up database**
   - Add a MySQL service in Railway.app
   - Update the database connection string in environment variables
   - Run the schema.sql file to set up tables

## 📊 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile

### Vehicles
- `GET /api/vehicles` - Get all vehicles
- `GET /api/vehicles/:id` - Get specific vehicle
- `POST /api/vehicles` - Create new vehicle
- `PUT /api/vehicles/:id` - Update vehicle
- `DELETE /api/vehicles/:id` - Delete vehicle
- `GET /api/vehicles/stats/summary` - Get vehicle statistics

### Drivers
- `GET /api/drivers` - Get all drivers
- `GET /api/drivers/:id` - Get specific driver
- `POST /api/drivers` - Create new driver
- `PUT /api/drivers/:id` - Update driver
- `DELETE /api/drivers/:id` - Delete driver
- `GET /api/drivers/vehicles/available` - Get available vehicles

### Trips
- `GET /api/trips` - Get all trips
- `GET /api/trips/:id` - Get specific trip
- `POST /api/trips` - Create new trip
- `PUT /api/trips/:id` - Update trip
- `DELETE /api/trips/:id` - Delete trip
- `GET /api/trips/resources/available` - Get available resources

### Maintenance
- `GET /api/maintenance` - Get maintenance records
- `GET /api/maintenance/:id` - Get specific record
- `POST /api/maintenance` - Create maintenance record
- `PUT /api/maintenance/:id` - Update maintenance record
- `DELETE /api/maintenance/:id` - Delete maintenance record

### Dashboard
- `GET /api/dashboard/overview` - Get dashboard overview
- `GET /api/dashboard/recent-trips` - Get recent trips
- `GET /api/dashboard/fuel-analysis` - Get fuel analysis data
- `GET /api/dashboard/vehicle-status` - Get vehicle status distribution
- `GET /api/dashboard/operational-costs` - Get operational costs
- `GET /api/dashboard/monthly-summary` - Get monthly summary

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | 3000 |
| `NODE_ENV` | Environment | development |
| `DB_HOST` | Database host | localhost |
| `DB_PORT` | Database port | 3306 |
| `DB_NAME` | Database name | nit_itvms |
| `DB_USER` | Database user | - |
| `DB_PASSWORD` | Database password | - |
| `JWT_SECRET` | JWT secret key | - |
| `JWT_EXPIRES_IN` | JWT expiration | 7d |
| `FRONTEND_URL` | Frontend URL | http://localhost:3001 |

## 🎯 Usage

1. **Login**: Use the authentication system to access the application
2. **Dashboard**: View real-time statistics and analytics
3. **Vehicle Management**: Add and manage university vehicles
4. **Driver Management**: Manage driver information and assignments
5. **Trip Management**: Schedule and track trips
6. **Maintenance**: Track vehicle maintenance history
7. **Reports**: Generate comprehensive reports

## 🔐 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Input validation and sanitization
- CORS configuration
- Helmet.js for security headers
- Rate limiting (can be added)

## 📱 Responsive Design

The application is fully responsive and works on:
- Desktop computers
- Tablets
- Mobile phones

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

For support and queries:
- Email: [your-email@nit.ac.tz]
- Phone: [your-phone-number]

## 🏫 About NIT University

Nelson Mandela African Institution of Science and Technology (NIT) Dar es Salaam is a leading institution of higher learning in Tanzania, committed to excellence in science, technology, and innovation.

---

**PROJECT KALI** - Integrated Transport & Vehicle Management System  
*Empowering efficient transport management for educational institutions*
#   N I T - v e h i c l e s - i n s p e c t i o n  
 