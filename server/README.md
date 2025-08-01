# University Management System - Server

Backend API server for the University Management System built with Node.js, Express, and MongoDB.

## Features

- 🔐 JWT Authentication
- 📊 Student Management
- 📚 Course Management
- 👥 User Management
- 📈 Statistics & Analytics
- 🔒 Security Middleware (Helmet, Rate Limiting)
- 📝 Structured Logging
- 🚀 Production Ready

## Prerequisites

- Node.js (v14 or higher)
- MongoDB
- npm or yarn

## Installation

1. Clone the repository
2. Navigate to the server directory:
   ```bash
   cd server
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Create environment file:
   ```bash
   cp .env-example .env
   ```

5. Update the `.env` file with your configuration:
   ```env
   PORT=5000
   NODE_ENV=development
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   ```

## Running the Application

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

### Testing
```bash
npm test
```

### Linting
```bash
npm run lint
npm run lint:fix
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration

### Users
- `GET /api/users` - Get all users
- `POST /api/users` - Create new user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Students
- `GET /api/students` - Get all students
- `POST /api/students` - Create new student
- `PUT /api/students/:id` - Update student
- `DELETE /api/students/:id` - Delete student

### Courses
- `GET /api/courses` - Get all courses
- `POST /api/courses` - Create new course
- `PUT /api/courses/:id` - Update course
- `DELETE /api/courses/:id` - Delete course

### Batches
- `GET /api/batches` - Get all batches
- `POST /api/batches` - Create new batch
- `PUT /api/batches/:id` - Update batch
- `DELETE /api/batches/:id` - Delete batch

### Statistics
- `GET /api/stats` - Get system statistics

## Project Structure

```
server/
├── src/
│   ├── config/          # Configuration files
│   ├── controllers/     # Route controllers
│   ├── middleware/      # Custom middleware
│   ├── models/          # Database models
│   ├── routes/          # API routes
│   ├── utilities/       # Utility functions
│   └── utils/           # Utility modules
├── logs/                # Application logs
├── .env-example         # Environment variables template
├── .eslintrc.js         # ESLint configuration
├── .gitignore           # Git ignore rules
├── database.js          # Database connection
├── index.js             # Application entry point
├── package.json         # Dependencies and scripts
└── vercel.json          # Vercel deployment config
```

## Security Features

- **Helmet**: Security headers
- **Rate Limiting**: API rate limiting
- **CORS**: Cross-origin resource sharing
- **JWT**: Secure authentication
- **Input Validation**: Request validation
- **Error Handling**: Centralized error handling

## Logging

The application uses Winston for structured logging:
- Logs are stored in the `logs/` directory
- Console logging in development
- File logging in production
- Different log levels: error, warn, info, debug

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | 5000 |
| `NODE_ENV` | Environment | development |
| `MONGO_URI` | MongoDB connection string | - |
| `JWT_SECRET` | JWT secret key | - |
| `JWT_EXPIRES_IN` | JWT expiration time | 24h |
| `CORS_ORIGIN` | Allowed CORS origin | http://localhost:3000 |
| `LOG_LEVEL` | Logging level | info |

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## License

MIT License - see LICENSE file for details 