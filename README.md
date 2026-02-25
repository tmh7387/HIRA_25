# HIRA (Hazard Identification Risk Analysis)

A comprehensive web application for conducting and managing aviation hazard identification and risk analysis assessments with ICAO-compliant risk matrices.

## Project Structure

```
src/
├── components/          # React components
│   ├── ProjectList.jsx
│   ├── ProjectForm.jsx
│   ├── HazardIdentification.jsx
│   ├── RiskAssessment.jsx
│   ├── RiskControls.jsx
│   ├── ProjectSummary.jsx
│   ├── SignIn.jsx
│   ├── Registration.jsx
│   ├── ICAORiskMatrix.jsx
│   ├── IntegratedRiskMatrix.jsx
│   ├── RiskMatrixSelector.jsx
│   ├── RiskMatrixReference.jsx
│   ├── FloatingMatrix.jsx
│   ├── AssessmentForm.jsx
│   └── FileUpload.jsx
├── config/             # Configuration files
│   └── theme.js
├── constants/          # Risk matrix constants
│   ├── icaoMatrix.js
│   └── integratedMatrix.js
├── services/           # API and external services
│   ├── supabase.js
│   ├── projectService.js
│   ├── hazardService.js
│   ├── riskAssessmentService.js
│   └── controlService.js
├── stores/             # State management (Zustand)
│   ├── projectStore.js
│   └── riskMatrixStore.js
├── types/              # JSDoc type definitions
│   └── project.js
├── utils/              # Utility functions
│   ├── errorHandler.js
│   ├── projectIdGenerator.js
│   ├── riskCalculations.js
│   └── storage.js
├── App.jsx            # Main application component
├── index.js           # JavaScript entry point
└── index.css          # Global styles
```

## Features

### Core Functionality
- **User Authentication**: Secure sign-in and registration with Supabase
- **Project Management Dashboard**: Create, view, and manage HIRA projects
- **Multi-step HIRA Workflow**:
  1. **Project Details**: Define project information and scope
  2. **Hazard Identification**: Identify and document hazards
  3. **Risk Assessment**: Evaluate risks using ICAO or Integrated risk matrices
  4. **Risk Controls**: Define and implement risk mitigation controls
  5. **Project Summary**: Review complete assessment with exportable reports

### Risk Assessment Tools
- **Dual Risk Matrix Support**:
  - ICAO Standard Risk Matrix (5x5)
  - Integrated Risk Matrix (customizable)
- **Real-time Risk Calculations**: Automatic risk level determination
- **Visual Risk Matrix Display**: Interactive matrix with color-coded risk levels
- **Floating Matrix Reference**: Context-aware risk matrix guidance

### Data Management
- **File Upload Support**: Attach supporting documents to projects
- **Auto-save Functionality**: Automatic data persistence
- **Project State Management**: Resume projects at any stage
- **Data Validation**: Input validation and error handling

### User Experience
- **Step Navigation**: Easy navigation between HIRA stages
- **Progress Tracking**: Visual indicators for completed steps
- **Responsive Design**: Mobile-friendly interface
- **Real-time Feedback**: Instant validation and error messages

## Technology Stack

### Frontend
- **React 18**: Modern UI library with hooks
- **React Router DOM 7**: Client-side routing and navigation
- **Tailwind CSS 3.4**: Utility-first CSS framework
- **Lucide React**: Icon library for consistent UI elements
- **React Hook Form**: Performant form validation

### State Management
- **Zustand 4.5**: Lightweight state management
  - `projectStore`: Project data and workflow state
  - `riskMatrixStore`: Risk matrix configuration and calculations

### Backend & Services
- **Supabase**: Backend-as-a-Service
  - Authentication and user management
  - PostgreSQL database
  - Real-time data synchronization
  - File storage
- **Service Layer**:
  - `projectService`: Project CRUD operations
  - `hazardService`: Hazard management
  - `riskAssessmentService`: Risk assessment operations
  - `controlService`: Risk control management

### Development Tools
- **React Scripts 5**: Build tooling and development server
- **ESLint**: Code linting and quality enforcement
- **PostCSS & Autoprefixer**: CSS processing
- **PropTypes**: Runtime type checking

### Utilities
- **date-fns**: Date formatting and manipulation
- **uuid**: Unique identifier generation
- **sharp**: Image processing

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

1. Clone the repository and navigate to the project directory:
   ```bash
   cd HIRA_25
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables (see Environment Setup above)

4. Start the development server:
   ```bash
   npm start
   ```
   The application will open at `http://localhost:3000`

### Available Scripts

- `npm start`: Start development server
- `npm run build`: Build production-optimized bundle
- `npm test`: Run test suite
- `npm run eject`: Eject from Create React App (irreversible)

## Development Guidelines

### Component Architecture

**Component Structure**:
- Use functional components with React hooks
- Document props using PropTypes for runtime validation
- Follow single responsibility principle
- Implement proper component composition

**Component Categories**:
- **Feature Components**: `ProjectForm`, `HazardIdentification`, `RiskAssessment`, `RiskControls`
- **UI Components**: `FileUpload`, `RiskMatrixSelector`, `FloatingMatrix`
- **Layout Components**: `ProjectList`, `ProjectSummary`, `StepNavigation`
- **Auth Components**: `SignIn`, `Registration`

### State Management Strategy

**Global State (Zustand)**:
- `projectStore`: Current project, workflow state, navigation
- `riskMatrixStore`: Risk matrix type, calculations, display settings

**Local State**:
- Form inputs and validation
- UI interactions (modals, dropdowns)
- Component-specific temporary data

**State Best Practices**:
- Minimize global state usage
- Use computed values for derived state
- Implement proper state initialization
- Handle loading and error states

### Styling Guidelines

**Tailwind CSS**:
- Use utility classes for consistent styling
- Follow mobile-first responsive design
- Leverage Tailwind's design tokens

**Theme System** ([theme.js](src/config/theme.js)):
- Colors: Primary (blue), secondary (green), accent (yellow), neutral
- Typography: Font sizes, weights, line heights
- Spacing: Consistent padding and margins
- Component classes: Reusable button and card styles

**Common Patterns**:
```jsx
// Button styles
className="btn-primary" // Primary action button
className="btn-secondary" // Secondary action button

// Card styles
className="card" // Standard card container

// Form styles
className="form-label" // Form field labels
className="form-input" // Form input fields
```

### Service Layer Architecture

**Service Pattern**:
- Encapsulate all Supabase interactions
- Provide consistent error handling
- Return standardized response formats
- Implement proper data transformation

**Available Services**:
- `projectService`: Project CRUD operations
- `hazardService`: Hazard management
- `riskAssessmentService`: Risk assessment CRUD
- `controlService`: Risk control management
- `supabase`: Core Supabase client configuration

### Error Handling

**Error Handling Strategy**:
- Use `errorHandler` utility for consistent error processing
- Provide user-friendly error messages
- Log detailed errors for debugging
- Implement graceful degradation

**Error Handler Usage**:
```javascript
import { errorHandler } from '../utils/errorHandler';

try {
  // Risky operation
} catch (error) {
  const errorMessage = errorHandler(error, 'Operation context');
  // Display errorMessage to user
}
```

### File Naming Conventions

- **Components**: PascalCase (e.g., `ProjectForm.jsx`, `RiskAssessment.jsx`)
- **Services**: camelCase (e.g., `projectService.js`, `hazardService.js`)
- **Utilities**: camelCase (e.g., `errorHandler.js`, `riskCalculations.js`)
- **Stores**: camelCase (e.g., `projectStore.js`, `riskMatrixStore.js`)
- **Constants**: camelCase (e.g., `icaoMatrix.js`, `integratedMatrix.js`)
- **Types**: camelCase (e.g., `project.js`)

### Code Quality Standards

**Linting & Formatting**:
- ESLint configuration extends `react-app`
- Enforce React hooks rules
- Maintain consistent code style

**Best Practices**:
- Write self-documenting code with clear variable names
- Add JSDoc comments for complex functions
- Implement proper prop validation
- Follow React performance best practices (memoization, lazy loading)
- Use async/await for asynchronous operations
- Handle edge cases and null/undefined values

**Code Review Checklist**:
- ✅ PropTypes defined for all components
- ✅ Error handling implemented
- ✅ Accessibility attributes included
- ✅ Responsive design verified
- ✅ Loading and error states handled
- ✅ Data validation implemented

## Database Schema

### Supabase Tables

**projects**:
- `id` (uuid, primary key)
- `user_id` (uuid, foreign key to auth.users)
- `project_id` (text, unique project identifier)
- `project_name` (text)
- `project_description` (text)
- `location` (text)
- `department` (text)
- `created_at` (timestamp)
- `updated_at` (timestamp)
- `status` (text)

**hazards**:
- `id` (uuid, primary key)
- `project_id` (uuid, foreign key to projects)
- `hazard_number` (text)
- `hazard_description` (text)
- `hazard_category` (text)
- `created_at` (timestamp)
- `updated_at` (timestamp)

**risk_assessments**:
- `id` (uuid, primary key)
- `hazard_id` (uuid, foreign key to hazards)
- `likelihood` (integer, 1-5)
- `severity` (integer, 1-5)
- `risk_level` (text)
- `matrix_type` (text, 'icao' or 'integrated')
- `created_at` (timestamp)
- `updated_at` (timestamp)

**risk_controls**:
- `id` (uuid, primary key)
- `risk_assessment_id` (uuid, foreign key to risk_assessments)
- `control_type` (text)
- `control_description` (text)
- `responsible_party` (text)
- `implementation_date` (date)
- `status` (text)
- `created_at` (timestamp)
- `updated_at` (timestamp)

## Application Workflow

### User Journey

1. **Authentication**:
   - Sign in with existing account or register new account
   - Supabase handles authentication and session management

2. **Project Management**:
   - View list of existing projects
   - Create new HIRA project or continue existing project
   - Projects auto-save progress at each step

3. **HIRA Process** (5 Steps):

   **Step 1: Project Details**
   - Enter project name, description, location, department
   - System generates unique project ID
   - Navigate to next step or save and exit

   **Step 2: Hazard Identification**
   - Add multiple hazards with descriptions and categories
   - Each hazard assigned unique hazard number
   - Edit or delete hazards as needed

   **Step 3: Risk Assessment**
   - Select risk matrix type (ICAO or Integrated)
   - Floating matrix reference available for guidance
   - For each hazard:
     - Select likelihood (1-5)
     - Select severity (1-5)
     - System calculates risk level automatically
   - Visual risk matrix displays current assessment

   **Step 4: Risk Controls**
   - For each assessed risk:
     - Define control measures
     - Specify control type (elimination, substitution, engineering, administrative, PPE)
     - Assign responsible party
     - Set implementation date
     - Track implementation status

   **Step 5: Project Summary**
   - Review complete HIRA assessment
   - View all hazards with risk levels and controls
   - Export report (future feature)
   - Submit or continue editing

## Risk Matrix Types

### ICAO Standard Risk Matrix (5x5)
- Likelihood scale: Extremely Improbable (1) to Frequent (5)
- Severity scale: Negligible (1) to Catastrophic (5)
- Risk levels: Low, Medium, High
- Standard aviation industry compliance

### Integrated Risk Matrix
- Customizable likelihood and severity definitions
- Flexible risk level classifications
- Adaptable to organization-specific requirements

## Production Deployment

### Building for Production

1. Ensure environment variables are configured:
   ```bash
   # Verify .env file exists with production Supabase credentials
   ```

2. Build the optimized production bundle:
   ```bash
   npm run build
   ```
   This creates an optimized build in the `build/` directory.

3. Test the production build locally (optional):
   ```bash
   npx serve -s build
   ```

### Deployment Options

**Option 1: Static Hosting** (Recommended)
- Deploy `build/` folder to:
  - Netlify
  - Vercel
  - AWS S3 + CloudFront
  - Azure Static Web Apps

**Option 2: Node.js Server**
- Use a static file server (Express, serve, etc.)
- Configure environment variables on the server
- Ensure proper HTTPS configuration

### Environment Variables for Production
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-production-anon-key
```

### Post-Deployment Checklist
- ✅ Verify Supabase connection
- ✅ Test user authentication flow
- ✅ Confirm database operations work
- ✅ Check file upload functionality
- ✅ Verify responsive design on mobile devices
- ✅ Test all HIRA workflow steps
- ✅ Validate risk calculations
- ✅ Review browser console for errors

## Troubleshooting

### Common Issues

**Issue: Supabase connection errors**
- Verify `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are correct
- Check Supabase project status and API settings
- Ensure environment variables are loaded (restart dev server)

**Issue: Authentication fails**
- Verify Supabase Auth is enabled in project settings
- Check email confirmation settings
- Review Supabase Auth logs for errors

**Issue: Data not persisting**
- Check Supabase Row Level Security (RLS) policies
- Verify user has proper permissions
- Review browser console for database errors

**Issue: Risk calculations incorrect**
- Verify selected matrix type (ICAO vs Integrated)
- Check `riskCalculations.js` for matrix definitions
- Ensure likelihood and severity values are within range (1-5)

**Issue: Styles not applying**
- Clear browser cache
- Verify Tailwind CSS is processing correctly
- Check `tailwind.config.js` configuration
- Ensure PostCSS is working properly

## Contributing

### Development Workflow

1. **Create a feature branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**:
   - Follow coding standards
   - Add PropTypes for components
   - Implement error handling
   - Write clear commit messages

3. **Test thoroughly**:
   - Test all affected features
   - Verify responsive design
   - Check browser console for errors
   - Test with different user roles

4. **Submit a pull request**:
   - Provide clear description of changes
   - Reference any related issues
   - Ensure all checks pass

### Code Contribution Guidelines

- Follow existing code structure and naming conventions
- Maintain consistent formatting and style
- Add comments for complex logic
- Update documentation as needed
- Do not commit sensitive data or credentials

## Security Considerations

- Never commit `.env` files or credentials
- Use Supabase Row Level Security (RLS) policies
- Validate all user inputs
- Sanitize data before database operations
- Implement proper authentication checks
- Use HTTPS in production
- Keep dependencies updated
- Review Supabase security best practices

## Support & Contact

For issues, questions, or feature requests related to the HIRA application, please contact the development team or create an issue in the project repository.

## License

This project is private and confidential. All rights reserved.

---

**Last Updated**: 2025
**Version**: 1.0.0
