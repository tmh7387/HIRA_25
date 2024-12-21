import { supabase } from './supabase';

export const controlService = {
  async createRiskControl(assessment_id, controlData) {
    try {
      const { data, error } = await supabase
        .from('hira_risk_controls')
        .insert({
          assessment_id: assessment_id,
          additional_mitigation: controlData.additional_mitigation,
          risk_owner: controlData.risk_owner,
          target_date: controlData.target_date,
          date_implemented: controlData.date_implemented,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating risk control:', error);
      throw error;
    }
  },

  async updateRiskControl(controlId, controlData) {
    try {
      const { data, error } = await supabase
        .from('hira_risk_controls')
        .update({
          additional_mitigation: controlData.additional_mitigation,
          risk_owner: controlData.risk_owner,
          target_date: controlData.target_date,
          date_implemented: controlData.date_implemented,
          updated_at: new Date().toISOString()
        })
        .eq('id', controlId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating risk control:', error);
      throw error;
    }
  },

  async getRiskControlByAssessmentId(assessment_id) {
    try {
      const { data, error } = await supabase
        .from('hira_risk_controls')
        .select(`
          id,
          assessment_id,
          additional_mitigation,
          risk_owner,
          target_date,
          date_implemented
        `)
        .eq('assessment_id', assessment_id)
        .single();

      if (error && error.code !== 'PGRST116') { // Ignore "not found" error
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error getting risk control:', error);
      throw error;
    }
  },

  async deleteRiskControl(controlId) {
    try {
      const { error } = await supabase
        .from('hira_risk_controls')
        .delete()
        .eq('id', controlId);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting risk control:', error);
      throw error;
    }
  }
};
