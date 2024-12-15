import { useEffect } from 'react';
import { Loader, AlertCircle, Home } from 'lucide-react';
import useProjectStore from './stores/projectStore';
import ProjectList from './components/ProjectList';
import ProjectForm from './components/ProjectForm';
import HazardIdentification from './components/HazardIdentification';

// Lazy load components that will be created later
// created 15dec24 const HazardIdentification = () => <div>Hazard Identification (Coming Soon)</div>;
const RiskAssessment = () => <div>Risk Assessment (Coming Soon)</div>;
const RiskControls = () => <div>Risk Controls (Coming Soon)</div>;

// Error Alert Component
function ErrorAlert({ message, onDismiss }) {
  if (!message) return null;

  return (
    <div className="p-4 bg-accent-lighter border border-accent-main rounded-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <AlertCircle className="h-5 w-5 text-accent-main mr-2" />
          <span className="text-accent-dark font-medium">{message}</span>
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="text-accent-main hover:text-accent-dark transition-colors duration-200"
          >
            ×
          </button>
        )}
      </div>
    </div>
  );
}

// Loading Spinner Component
function LoadingSpinner() {
  return (
    <div className="flex flex-col items-center justify-center p-8">
      <Loader className="w-8 h-8 text-primary-main animate-spin" />
      <p className="mt-2 text-neutral-main">Loading...</p>
    </div>
  );
}

// Step Navigation Component
function StepNavigation({ currentStep, onStepClick }) {
  const steps = [
    { step: 1, name: 'Project Details' },
    { step: 2, name: 'Hazard Identification' },
    { step: 3, name: 'Risk Assessment' },
    { step: 4, name: 'Risk Controls' }
  ];

  return (
    <nav className="flex space-x-4">
      {steps.map(({ step, name }) => (
        <button
          key={step}
          onClick={() => onStepClick(step)}
          className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
            currentStep === step
              ? 'bg-primary-light text-primary-main'
              : step <= currentStep
              ? 'text-neutral-dark hover:text-primary-main hover:bg-primary-light'
              : 'text-neutral-main cursor-not-allowed'
          }`}
          disabled={step > currentStep}
        >
          {name}
        </button>
      ))}
    </nav>
  );
}

function App() {
  const { 
    isLoading,
    error,
    currentStep,
    currentProject,
    setCurrentStep,
    clearError,
    loadProjects
  } = useProjectStore();

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  // Get the title for the current view
  const getViewTitle = () => {
    switch (currentStep) {
      case 1:
        return currentProject ? 'Edit Project' : 'New Project';
      case 2:
        return 'Hazard Identification';
      case 3:
        return 'Risk Assessment';
      case 4:
        return 'Risk Controls';
      default:
        return 'Projects Dashboard';
    }
  };

  // Render current step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return <ProjectForm />;
      case 2:
        return <HazardIdentification />;
      case 3:
        return <RiskAssessment />;
      case 4:
        return <RiskControls />;
      default:
        return <ProjectList />;
    }
  };

  return (
    <div className="min-h-screen bg-neutral-lighter">
      {/* Header */}
      <header className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-3xl font-bold text-primary-main">
                HIRA
              </h1>
              <p className="mt-1 text-neutral-main">
                {getViewTitle()}
              </p>
            </div>
            {currentStep > 0 && (
              <button
                onClick={() => setCurrentStep(0)}
                className="inline-flex items-center px-4 py-2 bg-secondary-main text-white rounded-lg font-medium shadow-sm hover:bg-secondary-hover hover:shadow-md transition-all duration-200"
              >
                <Home className="w-4 h-4 mr-2" />
                Dashboard
              </button>
            )}
          </div>
          {currentStep > 0 && (
            <StepNavigation 
              currentStep={currentStep}
              onStepClick={setCurrentStep}
            />
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6">
            <ErrorAlert 
              message={error} 
              onDismiss={clearError}
            />
          </div>
        )}

        <div className="bg-white shadow-lg rounded-xl p-6 sm:p-8">
          {isLoading ? (
            <LoadingSpinner />
          ) : (
            renderStepContent()
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
