import React from 'react';
import { Edit2, Eye, Trash2, Plus } from 'lucide-react';
import useProjectStore from '../stores/projectStore';

function ActionButton({ icon: Icon, label, onClick, variant = 'default', className = '' }) {
  const baseClasses = "inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200";
  const variantClasses = {
    default: "text-neutral-dark hover:bg-neutral-light",
    primary: "text-primary-main hover:bg-primary-light",
    secondary: "text-secondary-main hover:bg-secondary-light",
    danger: "text-accent-main hover:bg-accent-light"
  };

  return (
    <button
      onClick={onClick}
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
    >
      <Icon className="h-4 w-4 mr-2" />
      {label}
    </button>
  );
}

function ProjectCard({ project, onEdit, onView, onDelete }) {
  const actions = [
    { key: 'edit', icon: Edit2, label: 'Edit', onClick: () => onEdit(project), variant: 'primary' },
    { key: 'view', icon: Eye, label: 'View', onClick: () => onView(project), variant: 'secondary' },
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
        <span className="ml-4 px-4 py-1.5 text-xs font-semibold rounded-full bg-primary-light text-primary-main">
          LOW
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
            key={`${project.project_id}-${key}`}
            icon={icon}
            label={label}
            onClick={onClick}
            variant={variant}
          />
        ))}
      </div>
    </div>
  );
}

export default function ProjectList() {
  const { projects, setCurrentProject, setCurrentStep } = useProjectStore();

  const handleEdit = (project) => {
    setCurrentProject(project);
    setCurrentStep(1);
  };

  const handleView = (project) => {
    setCurrentProject(project);
    setCurrentStep(2);
  };

  const handleDelete = (project) => {
    // TODO: Implement delete functionality
    console.log('Delete project:', project.project_id);
  };

  const handleNewProject = () => {
    setCurrentProject(null);
    setCurrentStep(1);
  };

  return (
    <div className="space-y-8">
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
          className="inline-flex items-center px-6 py-3 bg-primary-main text-white rounded-lg font-medium shadow-md hover:bg-primary-hover hover:shadow-lg transition-all duration-200"
        >
          <Plus className="h-5 w-5 mr-2" />
          New Project
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
        {projects?.map((project) => (
          <ProjectCard
            key={project.project_id}
            project={project}
            onEdit={handleEdit}
            onView={handleView}
            onDelete={handleDelete}
          />
        ))}
      </div>

      {(!projects || projects.length === 0) && (
        <div className="text-center py-16 bg-neutral-lighter rounded-xl border-2 border-dashed border-neutral-light">
          <p className="text-lg text-neutral-dark mb-6">No projects found</p>
          <button
            onClick={handleNewProject}
            className="inline-flex items-center px-6 py-3 bg-primary-main text-white rounded-lg font-medium shadow-md hover:bg-primary-hover hover:shadow-lg transition-all duration-200"
          >
            <Plus className="h-5 w-5 mr-2" />
            Create Your First Project
          </button>
        </div>
      )}
    </div>
  );
}
