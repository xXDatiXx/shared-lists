# Shared Lists

A collaborative list management application built with React, TypeScript, and Vite. Create, share, and manage lists with your team or groups.

## ✨ Features

- 🔐 **User Authentication** - Secure login system with user roles
- 📝 **List Management** - Create, edit, and organize your lists
- 👥 **Group Collaboration** - Share lists with groups and collaborate in real-time
- 🎨 **Modern UI** - Built with shadcn/ui and Tailwind CSS for a beautiful, responsive interface
- 🌙 **Theme Support** - System-aware dark/light mode
- 🔑 **Role-Based Access** - Admin features for user management
- 🧪 **Tested** - Comprehensive test coverage with Vitest
- 🐳 **Docker Ready** - Containerized deployment with Docker Compose

## 🚀 Tech Stack

- **Frontend Framework:** React 18.3
- **Language:** TypeScript 5.8
- **Build Tool:** Vite 5.4
- **Styling:** Tailwind CSS 3.4
- **UI Components:** shadcn/ui with Radix UI primitives
- **Routing:** React Router DOM 6.30
- **State Management:** TanStack Query (React Query) 5.83
- **Form Handling:** React Hook Form 7.61 + Zod validation
- **Animations:** Framer Motion 12.34
- **Testing:** Vitest 3.2 + Testing Library

## 📋 Prerequisites

- Node.js (v18 or higher recommended)
- npm, pnpm, or bun
- Docker & Docker Compose (optional, for containerized deployment)

## 🛠️ Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/xXDatiXx/shared-lists.git
   cd shared-lists
   ```

2. **Install dependencies:**
   ```bash
   npm install
   # or
   bun install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   # or
   bun dev
   ```

4. **Open your browser:**
   Navigate to `http://localhost:5173`

## 🐳 Docker Deployment

Build and run with Docker Compose:

```bash
docker-compose up -d
```

The application will be available at the port specified in your docker-compose.yml.

## 📜 Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run build:dev` | Build in development mode |
| `npm run preview` | Preview production build |
| `npm run lint` | Lint code with ESLint |
| `npm run test` | Run tests once |
| `npm run test:watch` | Run tests in watch mode |

## 🗂️ Project Structure

```
shared-lists/
├── src/
│   ├── components/    # Reusable UI components
│   ├── hooks/         # Custom React hooks
│   ├── lib/           # Utility functions and libraries
│   ├── pages/         # Page components
│   │   ├── Index.tsx        # Home page
│   │   ├── ListView.tsx     # Individual list view
│   │   ├── LoginPage.tsx    # Authentication page
│   │   ├── AdminPage.tsx    # Admin dashboard
│   │   ├── GroupsPage.tsx   # Groups management
│   │   └── NotFound.tsx     # 404 page
│   ├── test/          # Test files
│   ├── App.tsx        # Main application component
│   ├── main.tsx       # Application entry point
│   └── index.css      # Global styles
├── public/            # Static assets
├── Dockerfile         # Docker configuration
├── docker-compose.yml # Docker Compose setup
└── vite.config.ts     # Vite configuration
```

## 🎯 Key Features Breakdown

### Authentication System
- User login and session management
- Role-based access control (User/Admin)
- Protected routes

### List Management
- Create and manage multiple lists
- Individual list views with detailed editing
- Real-time updates

### Groups
- Create and manage user groups
- Share lists with groups
- Collaborative list editing

### Admin Panel
- User management
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

### Tailwind CSS
Custom configuration available in `tailwind.config.ts` with:
- Custom color schemes
- Typography plugin
- Animation utilities

### TypeScript
Strict TypeScript configuration for type safety across the application.

### Vite
Optimized build configuration with React SWC plugin for fast refresh.

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

Create an optimized production build:

```bash
npm run build
```

The built files will be in the `dist` directory, ready for deployment.

Preview the production build locally:

```bash
npm run preview
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

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
