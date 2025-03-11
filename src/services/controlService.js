import { supabase } from './supabase';

export const controlService = {
  async updateRiskControl(controlId, controlData) {
    try {
      const { data, error } = await supabase
        .from('hira_risk_controls')
        .update({
          additional_mitigation: controlData.additional_mitigation,
          risk_owner: controlData.risk_owner,
          target_date: controlData.target_date || null,
          date_implemented: controlData.date_implemented || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', controlId)
        .select(`
          id,
          assessment_id,
          additional_mitigation,
          risk_owner,
          target_date,
          date_implemented,
          updated_at
        `)
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
        .single(); // Using single() since we know the record exists

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error getting risk control:', error);
      throw error;
    }
  }
};