# Shared Lists

A collaborative list management application with real-time shared data, built with React, TypeScript, Node.js, Express, and SQLite. Create, share, and manage lists with your team or groups - all data is synchronized across users!

## ✨ Features

- 🔐 **User Authentication** - Secure token-based login system with user roles
- 📝 **List Management** - Create, edit, and organize your lists with real-time updates
- 👥 **Group Collaboration** - Share lists with groups and collaborate with other users
- 🔄 **Shared Data** - All users see the same data via centralized SQLite database
- 🎨 **Modern UI** - Built with shadcn/ui and Tailwind CSS for a beautiful, responsive interface
- 🌙 **Theme Support** - System-aware dark/light mode
- 🔑 **Role-Based Access** - Admin features for user management
- 🧪 **Tested** - Comprehensive test coverage with Vitest
- 🐳 **Docker Ready** - Single container deployment with Docker Compose

## 🏗️ Architecture

This application uses a client-server architecture:

- **Frontend**: React SPA served on port 3000
- **Backend**: Express REST API on port 3001
- **Database**: SQLite with persistent storage
- **Docker**: Both services run in a single container

### Data Flow
```
Client (React) → API (Express) → Database (SQLite)
                    ↓
              Persistent Storage (Docker Volume)
```

## 🚀 Tech Stack

### Frontend
- **Framework:** React 18.3
- **Language:** TypeScript 5.8
- **Build Tool:** Vite 5.4
- **Styling:** Tailwind CSS 3.4
- **UI Components:** shadcn/ui with Radix UI primitives
- **Routing:** React Router DOM 6.30
- **State Management:** TanStack Query (React Query) 5.83
- **Form Handling:** React Hook Form 7.61 + Zod validation
- **Animations:** Framer Motion 12.34

### Backend
- **Runtime:** Node.js 20
- **Framework:** Express 4.18
- **Database:** SQLite 3 (better-sqlite3)
- **Security:** express-rate-limit, CORS
- **Authentication:** Token-based auth

## 📋 Prerequisites

- Node.js v20 or higher
- npm (comes with Node.js)
- Docker & Docker Compose (for containerized deployment)

## 🛠️ Installation & Development

### Option 1: Local Development (Recommended for Development)

1. **Clone the repository:**
   ```bash
   git clone https://github.com/xXDatiXx/shared-lists.git
   cd shared-lists
   ```

2. **Install frontend dependencies:**
   ```bash
   npm install
   ```

3. **Install backend dependencies:**
   ```bash
   cd server
   npm install
   cd ..
   ```

4. **Create environment file:**
   ```bash
   cp .env.example .env
   ```

5. **Start the backend server:**
   ```bash
   cd server
   npm start
   # Backend runs on http://localhost:3001
   ```

6. **In a new terminal, start the frontend:**
   ```bash
   npm run dev
   # Frontend runs on http://localhost:5173
   ```

7. **Access the application:**
   - Open your browser to `http://localhost:5173`
   - Login with the admin token: `admin-setup-token`

### Option 2: Docker Deployment (Recommended for Production)

Build and run with Docker Compose:

```bash
docker-compose up -d
```

The application will be available at:
- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:3001`

**First time login:** Use the admin token `admin-setup-token`

### Persistent Data

When using Docker, all data is stored in a Docker volume at `/app/server/data/database.sqlite`. This ensures your data persists across container restarts.

To backup your data:
```bash
docker-compose exec app cat /app/server/data/database.sqlite > backup.sqlite
```

## 📜 Available Scripts

### Frontend
| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server (port 5173) |
| `npm run build` | Build for production |
| `npm run build:dev` | Build in development mode |
| `npm run preview` | Preview production build |
| `npm run lint` | Lint code with ESLint |
| `npm run test` | Run tests once |
| `npm run test:watch` | Run tests in watch mode |

### Backend
| Script | Description |
|--------|-------------|
| `npm start` | Start backend server (port 3001) |
| `npm run dev` | Start with auto-reload (requires nodemon) |

## 🗂️ Project Structure

```
shared-lists/
├── src/                    # Frontend source code
│   ├── components/         # Reusable UI components
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Utility functions and API client
│   │   ├── api.ts          # Backend API client
│   │   ├── auth.ts         # Authentication logic
│   │   ├── db.ts           # Database types
│   │   └── groups.ts       # Groups logic
│   ├── pages/              # Page components
│   │   ├── Index.tsx       # Home page
│   │   ├── ListView.tsx    # Individual list view
│   │   ├── LoginPage.tsx   # Authentication page
│   │   ├── AdminPage.tsx   # Admin dashboard
│   │   ├── GroupsPage.tsx  # Groups management
│   │   └── NotFound.tsx    # 404 page
│   └── test/               # Test files
├── server/                 # Backend source code
│   ├── index.js            # Express server
│   ├── database.js         # SQLite configuration
│   ├── routes/             # API routes
│   │   ├── users.js        # User endpoints
│   │   ├── lists.js        # List endpoints
│   │   └── groups.js       # Group endpoints
│   ├── middleware/
│   │   └── auth.js         # Authentication middleware
│   └── data/               # SQLite database (auto-created)
├── public/                 # Static assets
├── Dockerfile              # Docker configuration
├── docker-compose.yml      # Docker Compose setup
├── start.sh                # Container startup script
└── .env.example            # Environment variables template
```

## 🔌 API Endpoints

### Users
- `POST /api/users/login` - Login with token
- `POST /api/users` - Create new user (admin only)
- `GET /api/users` - Get all users
- `DELETE /api/users/:id` - Delete user (admin only)
- `POST /api/users/init-admin` - Initialize admin user

### Lists
- `GET /api/lists` - Get all lists
- `GET /api/lists/:id` - Get specific list
- `POST /api/lists` - Create new list
- `PUT /api/lists/:id` - Update list
- `DELETE /api/lists/:id` - Delete list
- `POST /api/lists/:id/items` - Add item to list
- `PUT /api/lists/:listId/items/:itemId` - Update item
- `DELETE /api/lists/:listId/items/:itemId` - Delete item

### Groups
- `GET /api/groups` - Get all groups
- `GET /api/groups/:id` - Get specific group
- `POST /api/groups` - Create new group
- `PUT /api/groups/:id` - Update group
- `DELETE /api/groups/:id` - Delete group
- `POST /api/groups/:id/members` - Add member to group
- `DELETE /api/groups/:id/members/:userId` - Remove member
- `POST /api/groups/:id/lists` - Add list to group
- `DELETE /api/groups/:id/lists/:listId` - Remove list from group

## 🎯 Key Features Breakdown

### Authentication System
- Token-based authentication
- Role-based access control (User/Admin)
- Protected routes and API endpoints
- Persistent sessions via localStorage

### List Management
- Create and manage multiple lists with custom emojis and colors
- Add, complete, and remove items
- Track who added and completed each item
- Real-time synchronization across all users

### Groups
- Create and manage user groups
- Share lists with specific groups
- Add and remove members
- Collaborative list management

### Admin Panel
- User creation and management
- Token generation for new users
- System administration tools
- Access control configuration

## 🎨 UI Components

The project uses shadcn/ui components including:
- Accordions, Alerts, Avatars
- Buttons, Cards, Checkboxes
- Dialogs, Dropdowns, Forms
- Navigation menus, Tabs, Tooltips
- And many more...

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
# Backend API URL (for development)
VITE_API_URL=http://localhost:3001/api

# Backend configuration (server/.env if needed)
PORT=3001
NODE_ENV=production
RATE_LIMIT_MAX=100
```

### Database

The SQLite database is automatically created on first run with the following schema:

- **users**: User accounts and authentication
- **lists**: Shopping lists and task lists
- **items**: Individual list items
- **groups**: User groups for collaboration
- **group_members**: Group membership relationships
- **group_lists**: Lists shared with groups

### Tailwind CSS
Custom configuration available in `tailwind.config.ts` with:
- Custom color schemes
- Typography plugin
- Animation utilities

### TypeScript
Strict TypeScript configuration for type safety across both frontend and backend.

## 🧪 Testing

Run the test suite:

```bash
# Run all tests
npm run test

# Watch mode for development
npm run test:watch
```

Tests are written using Vitest and React Testing Library.

## 📦 Building for Production

### Frontend Build
Create an optimized production build:

```bash
npm run build
```

The built files will be in the `dist` directory.

### Docker Build
Build and deploy everything with Docker:

```bash
docker-compose build
docker-compose up -d
```

## 🔒 Security

- Token-based authentication for all API endpoints
- Rate limiting to prevent abuse (configurable)
- CORS configuration for secure cross-origin requests
- SQL injection protection via parameterized queries
- No passwords stored (token-only authentication)

## 🚀 Deployment

### Docker Deployment (Recommended)

The application is containerized and ready for deployment:

```bash
# Build and start
docker-compose up -d

# View logs
docker-compose logs -f

# Stop
docker-compose down

# Backup data
docker-compose exec app cat /app/server/data/database.sqlite > backup.sqlite
```

### Manual Deployment

1. Build the frontend:
   ```bash
   npm run build
   ```

2. Install backend dependencies:
   ```bash
   cd server && npm install --production
   ```

3. Start the backend:
   ```bash
   cd server && node index.js
   ```

4. Serve the frontend using a static file server:
   ```bash
   npm install -g serve
   serve -s dist -l 3000
   ```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is open source and available under the MIT License.

## 👤 Author

**xXDatiXx**
- GitHub: [@xXDatiXx](https://github.com/xXDatiXx)

## 🙏 Acknowledgments

- Built with [Vite](https://vitejs.dev/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Icons from [Lucide](https://lucide.dev/)
- Powered by [React](https://react.dev/)
- Backend with [Express](https://expressjs.com/)
- Database with [better-sqlite3](https://github.com/WiseLibs/better-sqlite3)
