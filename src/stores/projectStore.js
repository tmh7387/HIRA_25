import { create } from 'zustand';
import { supabase } from '../services/supabase';

const useProjectStore = create((set, get) => ({
  projects: [],
  currentProject: null,
  currentStep: 0,
  isLoading: false,
  error: null,

  setCurrentProject: (project) => set({ currentProject: project }),
  
  setCurrentStep: (step) => set({ currentStep: step }),

  loadProjects: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('hira_projects')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      set({ projects: data });
    } catch (error) {
      console.error('Load projects error:', error);
      set({ error: error.message });
    } finally {
      set({ isLoading: false });
    }
  },

  createProject: async (projectData) => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('hira_projects')
        .insert([projectData])
        .select()
        .single();

      if (error) throw error;

      set((state) => ({
        projects: [data, ...state.projects],
        currentProject: data
      }));

      return data;
    } catch (error) {
      console.error('Create project error:', error);
      set({ error: error.message });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  updateProject: async (id, projectData) => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('hira_projects')
        .update(projectData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      set((state) => ({
        projects: state.projects.map((p) =>
          p.id === id ? data : p
        ),
        currentProject: data
      }));

      return data;
    } catch (error) {
      console.error('Update project error:', error);
      set({ error: error.message });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  deleteProject: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const { error } = await supabase
        .from('hira_projects')
        .delete()
        .eq('id', id);

      if (error) throw error;

      set((state) => ({
        projects: state.projects.filter((p) => p.id !== id),
        currentProject: null
      }));
    } catch (error) {
      console.error('Delete project error:', error);
      set({ error: error.message });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  }
}));

export default useProjectStore;
