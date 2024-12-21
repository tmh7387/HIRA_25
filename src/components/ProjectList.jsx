import React from 'react';
import { Edit2, Eye, Trash2, Plus, Loader } from 'lucide-react';
import useProjectStore from '../stores/projectStore';
import { calculateHighestRisk } from '../utils/riskCalculations';

// Error Alert Component
const ErrorAlert = ({ message, onDismiss }) => {
  if (!message) return null;

  return (
    <div className="p-4 mb-6 bg-red-50 border border-red-200 rounded-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <svg className="h-5 w-5 text-red-400 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <span className="text-sm text-red-700">{message}</span>
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="text-red-400 hover:text-red-500"
          >
            ×
          </button>
        )}
      </div>
    </div>
  );
};

function ActionButton({ icon: Icon, label, onClick, variant = 'default', className = '', disabled = false }) {
  const baseClasses = "inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200";
  const variantClasses = {
    default: "text-neutral-dark hover:bg-neutral-light",
    primary: "text-primary-main hover:bg-primary-light",
    secondary: "text-secondary-main hover:bg-secondary-light",
    danger: "text-accent-main hover:bg-accent-light"
  };
  const disabledClasses = disabled ? "opacity-50 cursor-not-allowed" : "hover:shadow-sm";

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses[variant]} ${disabledClasses} ${className}`}
    >
      <Icon className="h-4 w-4 mr-2" />
      {label}
    </button>
  );
}

function ProjectCard({ project, onEdit, onView, onDelete, isLoading }) {
  const highestRisk = project.riskAssessmentData?.assessments
    ? calculateHighestRisk(project.riskAssessmentData.assessments, project.riskAssessmentData.assessments[0]?.matrixType)
    : 'LOW';

  const actions = [
    { key: 'edit', icon: Edit2, label: 'Edit', onClick: () => onEdit(project), variant: 'primary' },
    { key: 'delete', icon: Trash2, label: 'Delete', onClick: () => onDelete(project), variant: 'danger' }
  ];

  return (
    <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-200 border border-neutral-light">
      <div className="flex justify-between items-start mb-6">
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-primary-main">
            {project.title || 'Untitled Project'}
          </h3>
        </div>
        <span className={`ml-4 px-4 py-1.5 text-xs font-semibold rounded-full ${
          // ICAO Risk Levels
          highestRisk === 'INTOLERABLE' ? 'bg-red-100 text-red-800' :
          highestRisk === 'TOLERABLE' ? 'bg-yellow-100 text-yellow-800' :
          highestRisk === 'ACCEPTABLE' ? 'bg-green-100 text-green-800' :
          // Integrated Risk Levels
          highestRisk === 'HIGH' ? 'bg-red-100 text-red-800' :
          highestRisk === 'MODERATE' ? 'bg-orange-100 text-orange-800' :
          highestRisk === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
          'bg-green-100 text-green-800' // LOW
        }`}>
          {highestRisk}
        </span>
      </div>

      <div className="space-y-4 mb-8 border-b border-neutral-light pb-6">
        <div className="flex items-center text-sm">
          <span className="font-medium text-neutral-dark w-28">Project ID:</span>
          <span className="text-neutral-main">{project.project_id}</span>
        </div>
        <div className="flex items-center text-sm">
          <span className="font-medium text-neutral-dark w-28">Date:</span>
          <span className="text-neutral-main">{project.date}</span>
        </div>
        <div className="flex items-center text-sm">
          <span className="font-medium text-neutral-dark w-28">Facilitator:</span>
          <span className="text-neutral-main">{project.facilitator?.name}</span>
        </div>
      </div>

      <div className="flex justify-end items-center space-x-4">
        {actions.map(({ key, icon, label, onClick, variant }) => (
          <ActionButton
            key={`${project.id}-${key}`}
            icon={icon}
            label={label}
            onClick={onClick}
            variant={variant}
            disabled={isLoading}
          />
        ))}
      </div>
    </div>
  );
}

export default function ProjectList() {
  const { 
    projects, 
    setCurrentProject, 
    setCurrentStep, 
    deleteProject,
    isLoading,
    error,
    clearError
  } = useProjectStore();

  const handleEdit = async (project) => {
    await setCurrentProject(project);
    setCurrentStep(1);
  };

  const handleView = async (project) => {
    await setCurrentProject(project);
    setCurrentStep(2);
  };

  const handleDelete = async (project) => {
    if (window.confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      try {
        await deleteProject(project.id);
      } catch (error) {
        console.error('Failed to delete project:', error);
      }
    }
  };

  const handleNewProject = async () => {
    await setCurrentProject(null);
    setCurrentStep(1);
  };

  if (isLoading && !projects.length) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="flex flex-col items-center">
          <Loader className="h-8 w-8 text-primary-main animate-spin" />
          <p className="mt-4 text-neutral-dark">Loading projects...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {error && (
        <ErrorAlert 
          message={error} 
          onDismiss={clearError}
        />
      )}

      <div className="flex justify-between items-center border-b border-neutral-light pb-6">
        <div>
          <h2 className="text-2xl font-bold text-primary-main">
            Projects Dashboard
          </h2>
          <p className="text-sm text-neutral-main mt-1">
            Manage your HIRA projects
          </p>
        </div>
        <button
          onClick={handleNewProject}
          disabled={isLoading}
          className="inline-flex items-center px-6 py-3 bg-primary-main text-white rounded-lg font-medium shadow-md hover:bg-primary-hover hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus className="h-5 w-5 mr-2" />
          New Project
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
        {projects?.map((project) => (
          <ProjectCard
            key={project.id}
            project={project}
            onEdit={handleEdit}
            onView={handleView}
            onDelete={handleDelete}
            isLoading={isLoading}
          />
        ))}
      </div>

      {(!projects || projects.length === 0) && !isLoading && (
        <div className="text-center py-16 bg-neutral-lighter rounded-xl border-2 border-dashed border-neutral-light">
          <p className="text-lg text-neutral-dark mb-6">No projects found</p>
          <button
            onClick={handleNewProject}
            disabled={isLoading}
            className="inline-flex items-center px-6 py-3 bg-primary-main text-white rounded-lg font-medium shadow-md hover:bg-primary-hover hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="h-5 w-5 mr-2" />
            Create Your First Project
          </button>
        </div>
      )}
    </div>
  );
}
