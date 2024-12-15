import { create } from 'zustand';

const useFormStore = create((set, get) => ({
  // Project Details
  projectDetails: null,
  
  // Hazard Identification
  hazards: null,
  
  // Risk Assessment
  assessments: null,
  
  // Risk Controls
  controls: null,

  // Current Project
  currentProject: null,

  // Actions
  setProjectDetails: (details) => {
    console.log('Setting project details:', details); // Debug log
    set({ projectDetails: details });
  },
  
  setHazards: (hazards) => set({ hazards: hazards }),
  
  setAssessments: (assessments) => set({ assessments: assessments }),
  
  setControls: (controls) => set({ controls: controls }),
  
  setCurrentProject: (project) => {
    console.log('Setting current project:', project); // Debug log
    const projectDetails = project ? {
      projectId: project.projectId,
      title: project.title,
      date: project.date,
      facilitator: project.facilitator,
      attendees: project.attendees || [],
      operational_desc: project.operational_desc || '',
      operational_files: Array.isArray(project.operational_files) ? project.operational_files : []
    } : null;

    console.log('Transformed project details:', projectDetails); // Debug log

    set({ 
      currentProject: project,
      projectDetails: projectDetails,
      hazards: project?.events ? { events: project.events } : null,
      assessments: project?.assessments || null,
      controls: project?.controls || null
    });
  },

  // Reset form data
  resetForm: () => set({
    projectDetails: null,
    hazards: null,
    assessments: null,
    controls: null,
    currentProject: null
  }),

  // Load existing project data
  loadProjectData: (project) => {
    console.log('Loading project data:', project); // Debug log
    const projectDetails = {
      projectId: project.projectId,
      title: project.title,
      date: project.date,
      facilitator: project.facilitator,
      attendees: project.attendees || [],
      operational_desc: project.operational_desc || '',
      operational_files: Array.isArray(project.operational_files) ? project.operational_files : []
    };

    console.log('Transformed project details:', projectDetails); // Debug log

    set({
      currentProject: project,
      projectDetails: projectDetails,
      hazards: project.events ? { events: project.events } : null,
      assessments: project.assessments || null,
      controls: project.controls || null
    });
  },

  // Update form data when navigating between steps
  updateFormData: (step, data) => {
    console.log('Updating form data for step:', step, 'with data:', data); // Debug log
    const state = get();
    switch (step) {
      case 1: // Project Details
        const updatedDetails = {
          ...data,
          operational_files: Array.isArray(data.operational_files) ? data.operational_files : []
        };
        console.log('Updated project details:', updatedDetails); // Debug log
        set({ 
          projectDetails: updatedDetails,
          currentProject: {
            ...state.currentProject,
            ...updatedDetails
          }
        });
        break;
      case 2: // Hazard Identification
        set({ 
          hazards: data,
          currentProject: {
            ...state.currentProject,
            events: data.events
          }
        });
        break;
      case 3: // Risk Assessment
        const formattedAssessments = Array.isArray(data) 
          ? { assessments: data }
          : data?.assessments 
            ? data 
            : { assessments: [] };
        set({ 
          assessments: formattedAssessments,
          currentProject: {
            ...state.currentProject,
            assessments: formattedAssessments.assessments
          }
        });
        break;
      case 4: // Risk Controls
        set({ 
          controls: data,
          currentProject: {
            ...state.currentProject,
            controls: data
          }
        });
        break;
      default:
        break;
    }
  },

  // Get form data for a specific step
  getFormData: (step) => {
    const state = get();
    let data;
    switch (step) {
      case 1:
        data = state.projectDetails || {
          ...state.currentProject,
          operational_files: Array.isArray(state.currentProject?.operational_files) 
            ? state.currentProject.operational_files 
            : []
        };
        console.log('Getting form data for step 1:', data); // Debug log
        return data;
      case 2:
        return state.hazards || (state.currentProject?.events ? { events: state.currentProject.events } : undefined);
      case 3:
        if (state.assessments?.assessments) {
          return state.assessments.assessments;
        }
        if (state.currentProject?.assessments) {
          return state.currentProject.assessments;
        }
        return [];
      case 4:
        return state.controls || state.currentProject?.controls;
      default:
        return null;
    }
  }
}));

export default useFormStore;
