# HIRA (Hazard Identification Risk Analysis)

A web application for conducting and managing hazard identification and risk analysis assessments.

## Project Structure

```
src-new/
├── components/          # React components
├── config/             # Configuration files
├── services/           # API and external services
├── stores/             # State management (Zustand)
├── types/              # TypeScript/JSDoc type definitions
├── utils/              # Utility functions
├── App.jsx            # Main application component
├── index.html         # HTML entry point
├── main.jsx          # JavaScript entry point
└── index.css         # Global styles
```

## Features

- Project Management Dashboard
- Multi-step HIRA Process:
  1. Project Details
  2. Hazard Identification
  3. Risk Assessment
  4. Risk Controls
- File Upload Support
- Real-time Risk Matrix Updates
- Export Capabilities

## Technology Stack

- React 18
- Vite
- Tailwind CSS
- Zustand (State Management)
- Supabase (Backend)
- Express (Production Server)

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account and project

### Environment Setup

Create a `.env` file in the root directory:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start development server:
   ```bash
   npm run dev
   ```

3. Build for production:
   ```bash
   npm run build
   ```

4. Start production server:
   ```bash
   npm start
   ```

## Development Guidelines

### Component Structure

- Components should be function components using hooks
- Props should be documented using PropTypes
- Each component should have a single responsibility
- Use the common styles defined in theme.js

### State Management

- Use Zustand for global state
- Keep component state local when possible
- Use the projectStore for project-related state

### Styling

- Use Tailwind CSS utility classes
- Follow the theme color scheme defined in theme.js
- Use the common component classes defined in index.css

### Error Handling

- Use the errorHandler utility for consistent error handling
- Always provide user-friendly error messages
- Log errors appropriately for debugging

### File Naming

- Components: PascalCase (e.g., ProjectForm.jsx)
- Utilities: camelCase (e.g., errorHandler.js)
- Types: camelCase (e.g., project.js)

### Code Style

- Use ESLint for code linting
- Follow React best practices
- Write clear, self-documenting code
- Add JSDoc comments for complex functions

## Production Deployment

1. Build the application:
   ```bash
   npm run build
   ```

2. Start the production server:
   ```bash
   npm start
   ```

The server will automatically find an available port if the default port (3000) is in use.

## Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## License

This project is private and confidential. All rights reserved.
