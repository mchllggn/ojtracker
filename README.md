# MyApp - Full-Stack MVC Application

A modern full-stack web application with authentication, built using React, Node.js, Express, and Prisma ORM with MySQL.

## Architecture

This application follows the **MVC (Model-View-Controller)** architectural pattern:

### Backend Structure

```
backend/
├── controllers/     # Business logic layer
│   └── authController.js
├── routes/         # Route definitions
│   └── auth.js
├── middleware/     # Authentication middleware
│   └── auth.js
├── prisma/         # Database schema and migrations
│   └── schema.prisma
├── index.js        # Main server file
├── package.json
└── .env
```

### Frontend Structure

```
src/
├── components/     # Reusable UI components
│   └── TextInput.tsx
├── pages/         # Page components
│   ├── Index.tsx
│   ├── Login.tsx
│   └── Register.tsx
├── services/      # API service layer
│   └── authService.ts
└── main.tsx
```

## Features

- **User Authentication**: Register and login functionality
- **JWT Tokens**: Secure authentication with JSON Web Tokens
- **Password Hashing**: bcryptjs for secure password storage
- **Database**: MySQL with Prisma ORM
- **Responsive UI**: Tailwind CSS styling
- **TypeScript**: Type-safe frontend and backend
- **MVC Architecture**: Clean separation of concerns

## API Endpoints

### Authentication Routes (`/api/auth`)

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile (protected)

### Health Check

- `GET /api/health` - Server health check

## Getting Started

### Prerequisites

- Node.js (v18+)
- MySQL (XAMPP or standalone)
- pnpm (recommended) or npm

### Backend Setup

1. **Install dependencies:**

   ```bash
   cd backend
   pnpm install
   ```

2. **Database setup:**

   - Ensure MySQL is running (XAMPP Control Panel)
   - Update `.env` with your database credentials
   - Run migrations:

   ```bash
   npx prisma migrate dev --name init
   ```

3. **Start the backend server:**
   ```bash
   pnpm start
   ```
   Server runs on `http://localhost:3000`

### Frontend Setup

1. **Install dependencies:**

   ```bash
   pnpm install
   ```

2. **Start the development server:**
   ```bash
   pnpm run dev
   ```
   App runs on `http://localhost:5174`

## Environment Variables

Create a `.env` file in the backend directory:

```env
DATABASE_URL="mysql://username:password@localhost:3306/myapp_db"
JWT_SECRET="your-secret-key"
PORT=3000
```

## MVC Components

### Model

- **Prisma Schema**: Defines database structure
- **Database**: MySQL with Prisma client for data access

### View

- **React Components**: UI components and pages
- **Tailwind CSS**: Styling and responsive design

### Controller

- **Express Routes**: Handle HTTP requests
- **Auth Controller**: Business logic for authentication
- **Middleware**: Authentication and validation

## Security Features

- Password hashing with bcryptjs
- JWT token-based authentication
- CORS enabled for frontend communication
- Input validation and sanitization
- Protected routes with middleware

## Development

### Available Scripts

**Backend:**

- `pnpm start` - Start production server
- `pnpm dev` - Start development server with nodemon (auto-restart on changes)

**Frontend:**

- `pnpm dev` - Start Vite development server
- `pnpm build` - Build for production
- `pnpm preview` - Preview production build

### Database Management

**Prisma Commands:**

- `npx prisma migrate dev` - Create and apply migrations
- `npx prisma studio` - Open Prisma Studio (database GUI)
- `npx prisma generate` - Generate Prisma client

### Development Tools

**Nodemon Configuration:**

- Automatically restarts server on file changes
- Ignores `node_modules` and `prisma/migrations`
- Watches `.js` and `.json` files

## Project Structure Benefits

1. **Separation of Concerns**: Clear distinction between data, logic, and presentation
2. **Maintainability**: Easy to modify individual components
3. **Scalability**: Simple to add new features and routes
4. **Testability**: Isolated components for unit testing
5. **Type Safety**: TypeScript provides compile-time error checking

## Contributing

1. Follow the MVC architecture
2. Use TypeScript for type safety
3. Write clean, documented code
4. Test API endpoints thoroughly
5. Follow consistent naming conventions
   ...reactDom.configs.recommended.rules,
   },
   })

```

```
