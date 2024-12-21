import { createContext, useContext } from 'react';
import { create } from 'zustand';
import { supabase } from '../services/supabase';
import { projectService } from '../services/projectService';
import { controlService } from '../services/controlService';
import { updateHazards, getHazardsByEventId } from '../services/hazardService';

// Custom error class for project operations
class ProjectOperationError extends Error {
  constructor(message, operation, details = null) {
    super(message);
    this.name = 'ProjectOperationError';
    this.operation = operation;
    this.details = details;
  }
}

const useProjectStore = create((set, get) => ({
  // State
  projects: [],
  currentProject: null,
  currentStep: 0,
  isLoading: false,
  error: null,
  retryCount: 0,
  maxRetries: 3,

  // Form Data State
  projectDetails: null,
  hazardIdentificationData: null,
  riskAssessmentData: null,
  riskControlsData: null,

  // Loading and Error Handlers
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),
  
  // Reset state
  resetState: () => set({
    currentProject: null,
    currentStep: 0,
    projectDetails: null,
    hazardIdentificationData: null,
    riskAssessmentData: null,
    riskControlsData: null,
    error: null,
    retryCount: 0
  }),

  // Get step data
  getStepData: (step) => {
    const store = get();
    switch (step) {
      case 1:
        return store.projectDetails;
      case 2:
        return store.hazardIdentificationData;
      case 3:
        return store.riskAssessmentData;
      case 4:
        return store.riskControlsData;
      default:
        return null;
    }
  },

  // Project Selection
  setCurrentProject: async (project) => {
    const store = get();
    store.setLoading(true);
    store.clearError();

    try {
      if (!project) {
        store.resetState();
        return;
      }

      // Set current project and project details
      set({ 
        currentProject: project,
        projectDetails: {
          project_id: project.project_id,
          title: project.title,
          date: project.date,
          facilitator: project.facilitator,
          attendees: project.attendees || [],
          operational_desc: project.operational_desc || '',
          operational_files: Array.isArray(project.operational_files) ? project.operational_files : []
        }
      });

      // Load all available step data
      const stepData = await Promise.all([
        store.loadStepData(2), // Hazard Identification
        store.loadStepData(3), // Risk Assessment
        store.loadStepData(4)  // Risk Controls
      ]);

      // Determine the furthest completed step
      let lastCompletedStep = 1; // Project details is step 1
      stepData.forEach((exists, index) => {
        if (exists) lastCompletedStep = index + 2;
      });

      // Set the current step to the next incomplete step
      set({ currentStep: Math.min(lastCompletedStep + 1, 4) });

    } catch (error) {
      console.error('Error setting current project:', error);
      store.setError(`Failed to load project data: ${error.message}`);
    } finally {
      store.setLoading(false);
    }
  },

  // Navigation
  setCurrentStep: (step) => {
    const store = get();
    
    // Always allow navigation to step 0 (dashboard) or 1 (project details)
    if (step <= 1) {
      set({ currentStep: step, error: null });
      return true;
    }

    // For other steps, check prerequisites
    const previousStepData = store.getStepData(step - 1);
    if (!previousStepData) {
      store.setError('Please complete the previous step first');
      return false;
    }

    set({ currentStep: step, error: null });
    return true;
  },

  // Project Operations with Retry Logic
  loadProjects: async () => {
    const store = get();
    store.setLoading(true);
    store.clearError();
    
    try {
      const { data, error } = await supabase
        .from('hira_projects')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw new ProjectOperationError('Failed to load projects', 'LOAD', error);

      set({ projects: data });
    } catch (error) {
      console.error('Load projects error:', error);
      if (store.retryCount < store.maxRetries) {
        set(state => ({ retryCount: state.retryCount + 1 }));
        await store.loadProjects();
      } else {
        set({ 
          error: `Failed to load projects after ${store.maxRetries} attempts: ${error.message}`,
          retryCount: 0
        });
      }
    } finally {
      store.setLoading(false);
    }
  },

  createProject: async (projectData) => {
    const store = get();
    store.setLoading(true);
    store.clearError();

    try {
      const { data, error } = await supabase
        .from('hira_projects')
        .insert([projectData])
        .select()
        .single();

      if (error) throw new ProjectOperationError('Failed to create project', 'CREATE', error);

      set(state => ({
        projects: [data, ...state.projects],
        currentProject: data,
        projectDetails: data,
        currentStep: 2 // Automatically advance to Hazard Identification
      }));

      return data;
    } catch (error) {
      console.error('Create project error:', error);
      set({ error: `Failed to create project: ${error.message}` });
      throw error;
    } finally {
      store.setLoading(false);
    }
  },

  updateProject: async (id, projectData) => {
    const store = get();
    store.setLoading(true);
    store.clearError();

    try {
      const { data, error } = await supabase
        .from('hira_projects')
        .update(projectData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw new ProjectOperationError('Failed to update project', 'UPDATE', error);

      set(state => ({
        projects: state.projects.map(p => p.id === id ? data : p),
        currentProject: data,
        projectDetails: data
      }));

      return data;
    } catch (error) {
      console.error('Update project error:', error);
      set({ error: `Failed to update project: ${error.message}` });
      throw error;
    } finally {
      store.setLoading(false);
    }
  },

  deleteProject: async (id) => {
    const store = get();
    store.setLoading(true);
    store.clearError();

    try {
      // Delete all related data using projectService
      await projectService.deleteProjectData(id);

      // Then delete the project
      const { error } = await supabase
        .from('hira_projects')
        .delete()
        .eq('id', id);

      if (error) throw new ProjectOperationError('Failed to delete project', 'DELETE', error);

      set(state => ({
        projects: state.projects.filter(p => p.id !== id),
        ...(state.currentProject?.id === id ? {
          currentProject: null,
          projectDetails: null,
          currentStep: 0
        } : {})
      }));
    } catch (error) {
      console.error('Delete project error:', error);
      set({ error: `Failed to delete project: ${error.message}` });
      throw error;
    } finally {
      store.setLoading(false);
    }
  },

  // Form Data Management
  setStepData: async (step, data) => {
    const store = get();
    try {
      // Update local state
      switch (step) {
        case 1:
          set({ projectDetails: data });
          break;
        case 2:
          set({ hazardIdentificationData: data });
          // Save to relational tables using project_id
          if (store.currentProject?.project_id) {
            console.log('Saving events and hazards:', data);
            
            // Save each event and its hazards
            for (const event of data.events) {
              // First save or update the event
              const { data: savedEvent, error: eventError } = await supabase
                .from('hira_events')
                .upsert({
                  id: event.uniqueId,
                  project_id: store.currentProject.project_id,
                  name: event.name,
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString()
                })
                .select()
                .single();

              if (eventError) throw eventError;

              // Then update hazards for this event
              await updateHazards(savedEvent.id, event.hazards);
            }
          } else {
            throw new Error('Project ID not found');
          }
          break;
        case 3:
          set({ riskAssessmentData: data });
          break;
        case 4:
          set({ riskControlsData: data });
          // Save risk controls using assessment_id
          if (data.controls && data.controls.length > 0) {
            console.log('Saving risk controls for assessments');
            for (const control of data.controls) {
              if (control.id) {
                await controlService.updateRiskControl(control.id, control);
              } else {
                await controlService.createRiskControl(control.assessment_id, control);
              }
            }
          }
          break;
        default:
          throw new Error(`Invalid step: ${step}`);
      }
      return true;
    } catch (error) {
      console.error(`Error in setStepData(${step}):`, error);
      store.setError(`Failed to save step ${step} data: ${error.message}`);
      return false;
    }
  },

  // Load step data from database
  loadStepData: async (step) => {
    const store = get();
    store.setLoading(true);
    store.clearError();

    try {
      if (!store.currentProject) throw new Error('No current project');

      switch (step) {
        case 2: // Hazard Identification
          // First get all events for this project
          const { data: events, error: eventsError } = await supabase
            .from('hira_events')
            .select('id, name')
            .eq('project_id', store.currentProject.project_id)
            .order('created_at', { ascending: true });

          if (eventsError) throw eventsError;

          if (events && events.length > 0) {
            // Get hazards for each event
            const eventsWithHazards = await Promise.all(events.map(async event => {
              const hazards = await getHazardsByEventId(event.id);
              return {
                uniqueId: event.id,
                name: event.name,
                hazards
              };
            }));

            set({ hazardIdentificationData: { events: eventsWithHazards } });
            return true;
          }
          return false;

        case 3: // Risk Assessment
          // Get all consequences from hazard identification data
          const consequences = store.hazardIdentificationData?.events?.flatMap(event =>
            event.hazards?.flatMap(hazard =>
              hazard.consequences?.map(consequence => ({
                consequence_id: consequence.uniqueId,
                event: event.name,
                hazard: hazard.description,
                consequence: consequence.description,
                current_controls: consequence.current_controls
              }))
            )
          ) || [];

          if (consequences.length === 0) return false;

          // Load assessments for each consequence
          const { getAssessmentsByConsequenceId } = await import('../services/riskAssessmentService');
          const assessmentPromises = consequences.map(async consequence => {
            const assessment = await getAssessmentsByConsequenceId(consequence.consequence_id);
            return assessment || {
              ...consequence,
              probability: null,
              severity: null,
              likelihood: null,
              impact: null,
              tolerability: null
            };
          });

          const assessments = await Promise.all(assessmentPromises);
          set({ riskAssessmentData: { assessments } });
          return true;

        case 4: // Risk Controls
          // Get assessment IDs from risk assessment data
          const assessmentIds = store.riskAssessmentData?.assessments?.map(a => a.id) || [];
          if (assessmentIds.length === 0) return false;

          // Load controls for each assessment
          const controlPromises = assessmentIds.map(assessmentId => 
            controlService.getRiskControlByAssessmentId(assessmentId)
          );
          const controls = await Promise.all(controlPromises);
          
          // Filter out null results and set data
          const validControls = controls.filter(Boolean);
          if (validControls.length > 0) {
            set({ riskControlsData: { controls: validControls } });
            return true;
          }
          return false;

        default:
          return false;
      }
    } catch (error) {
      console.error(`Load step ${step} error:`, error);
      store.setError(`Failed to load step ${step}: ${error.message}`);
      return false;
    } finally {
      store.setLoading(false);
    }
  }
}));

const ProjectStoreContext = createContext();

export const ProjectStoreProvider = ({ children }) => {
  const store = useProjectStore();
  return (
    <ProjectStoreContext.Provider value={store}>
      {children}
    </ProjectStoreContext.Provider>
  );
};

export const useProjectStoreContext = () => useContext(ProjectStoreContext);

export default useProjectStore;
