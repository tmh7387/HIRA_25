import { useEffect, useState } from 'react';
import { Loader, AlertCircle, Home, ArrowRight, LogOut } from 'lucide-react';
import { supabase } from './services/supabase';
import useProjectStore from './stores/projectStore';
import ProjectList from './components/ProjectList';
import SignIn from './components/SignIn';
import Registration from './components/Registration';
import ProjectForm from './components/ProjectForm';
import HazardIdentification from './components/HazardIdentification';
import RiskAssessment from './components/RiskAssessment';
import RiskControls from './components/RiskControls';
import ProjectSummary from './components/ProjectSummary';
import { controlService } from './services/controlService';

// Error Alert Component
function ErrorAlert({ message, onDismiss }) {
  if (!message) return null;

  return (
    <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
          <span className="text-red-700 font-medium">{message}</span>
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="text-red-400 hover:text-red-500 transition-colors duration-200"
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
function StepNavigation({ currentStep, onStepClick, isLoading, getStepData }) {
  const steps = [
    { step: 1, name: 'Project Details' },
    { step: 2, name: 'Hazard Identification' },
    { step: 3, name: 'Risk Assessment' },
    { step: 4, name: 'Risk Controls' },
    { step: 5, name: 'Summary' }
  ];

  // Check if a step is accessible
  const canAccessStep = (step) => {
    if (step <= 1) return true;
    return getStepData(step - 1) !== null;
  };

  return (
    <nav className="flex items-center space-x-2">
      {steps.map(({ step, name }) => {
        const isAccessible = canAccessStep(step);
        const isCurrent = currentStep === step;
        const buttonClasses = `
          px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200
          ${isCurrent ? 'bg-primary-light text-primary-main' : 
            isAccessible ? 'text-neutral-dark hover:text-primary-main hover:bg-primary-light' : 
            'text-neutral-main cursor-not-allowed opacity-50'}
        `;

        return (
          <div key={step} className="flex items-center">
            <button
              onClick={() => isAccessible && onStepClick(step)}
              disabled={isLoading || !isAccessible}
              className={buttonClasses}
              title={!isAccessible ? 'Complete previous step first' : name}
            >
              {name}
            </button>
            {step < steps.length && (
              <ArrowRight className="h-4 w-4 mx-2 text-neutral-main" />
            )}
          </div>
        );
      })}
    </nav>
  );
}

function App() {
  const [user, setUser] = useState(null);
  const [showRegistration, setShowRegistration] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  
  const { 
    isLoading,
    error,
    currentStep,
    currentProject,
    projectDetails,
    riskControlsData,
    setCurrentStep,
    clearError,
    loadProjects,
    resetState,
    getStepData,
    setStepData
  } = useProjectStore();

  useEffect(() => {
    // Check for existing session
    const checkUser = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        setUser(data.session?.user || null);
      } catch (error) {
        console.error('Error checking auth session:', error);
      } finally {
        setAuthLoading(false);
      }
    };

    // Set up auth state listener
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user || null);
      }
    );

    checkUser();
    
    // Cleanup
    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (user) {
      loadProjects();
    }
  }, [user, loadProjects]);

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      resetState();
      setCurrentStep(0);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

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
      case 5:
        return 'Project Summary';
      default:
        return 'Projects Dashboard';
    }
  };

  const handleDashboardClick = () => {
    if (isLoading) return;
    resetState();
    setCurrentStep(0);
  };

  const handleRiskControlSubmit = async (data) => {
    try {
      // Save each control
      const savedControls = await Promise.all(
        data.controls.map(async control => {
          const existingControl = riskControlsData?.controls?.find(
            c => c.assessment_id === control.assessment_id
          );
          
          if (existingControl) {
            return controlService.updateRiskControl(existingControl.id, control);
          } else {
            return controlService.createRiskControl(control.assessment_id, control);
          }
        })
      );

      // Update store with saved controls
      await setStepData(4, { controls: savedControls });

      // After successful save, move to step 5
      setCurrentStep(5);
    } catch (error) {
      console.error('Error saving controls:', error);
    }
  };

  const renderStepContent = () => {
    if (isLoading) {
      return <LoadingSpinner />;
    }

    switch (currentStep) {
      case 1:
        return <ProjectForm />;
      case 2:
        return <HazardIdentification />;
      case 3:
        return <RiskAssessment />;
      case 4:
        return (
          <RiskControls 
            onSubmit={handleRiskControlSubmit}
            initialData={riskControlsData?.controls}
          />
        );
      case 5:
        return <ProjectSummary />;
      default:
        return <ProjectList />;
    }
  };

  // Show loading spinner during initial auth check
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-lighter">
        <LoadingSpinner />
      </div>
    );
  }

  // Render auth screens if user is not logged in
  if (!user) {
    return (
      <div className="min-h-screen bg-neutral-lighter flex flex-col items-center justify-center">
        <div className="mb-8">
          <img
            src="/logo.png"
            alt="HIRA"
            className="h-24 w-auto"
          />
        </div>
        
        {showRegistration ? (
          <Registration 
            onRegister={setUser} 
            onCancel={() => setShowRegistration(false)} 
          />
        ) : (
          <SignIn 
            onSignIn={setUser} 
            onRegisterClick={() => setShowRegistration(true)} 
          />
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-lighter">
      {/* Header */}
      <header className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center mb-4">
            <div className="flex-1">
              <p className="text-neutral-main">
                {getViewTitle()}
              </p>
              {currentProject && currentStep > 0 && (
                <p className="mt-1 text-sm text-neutral-dark">
                  Project: {projectDetails?.title || currentProject.title}
                </p>
              )}
            </div>
            <div className="flex flex-col items-center flex-1">
              <img
                src="/logo.png"
                alt="HIRA"
                className="h-20 w-auto"
              />
            </div>
            <div className="flex-1 flex justify-end space-x-2">
              {currentStep > 0 && (
                <button
                  onClick={handleDashboardClick}
                  disabled={isLoading}
                  className="inline-flex items-center px-4 py-2 bg-secondary-main text-white rounded-lg font-medium shadow-sm hover:bg-secondary-hover hover:shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Home className="w-4 h-4 mr-2" />
                  Dashboard
                </button>
              )}
              <button
                onClick={handleSignOut}
                className="inline-flex items-center px-4 py-2 bg-neutral-main text-white rounded-lg font-medium shadow-sm hover:bg-neutral-dark hover:shadow-md transition-all duration-200"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </button>
            </div>
          </div>
          {currentStep > 0 && (
            <StepNavigation 
              currentStep={currentStep}
              onStepClick={setCurrentStep}
              isLoading={isLoading}
              getStepData={getStepData}
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
          {renderStepContent()}
        </div>
      </main>
    </div>
  );
}

export default App;
