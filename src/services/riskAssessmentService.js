import { supabase } from './supabase';
import { calculateRiskRating } from '../utils/riskCalculations';
/**
 * Get an assessment by consequence_id.
 */
export async function getAssessmentsByConsequenceId(consequence_id) {
  if (!consequence_id) {
    console.error('getAssessmentsByConsequenceId called without consequence_id');
    return null;
  }

  try {
    const { data: assessment, error } = await supabase
      .from('hira_risk_assessments')
      .select()
      .eq('consequence_id', consequence_id)
      .single();

    if (error) {
      console.error('Error getting assessment:', error);
      throw error;
    }

    return assessment;
  } catch (error) {
    console.error('Error in getAssessmentsByConsequenceId:', error);
    throw error;
  }
}

/**
 * Create multiple risk assessments.
 */
export async function createAssessments(project_id, assessmentsData, matrix_type) {
  try {
    const updatePromises = assessmentsData.assessments.map(assessment => 
      createOrUpdateAssessment(assessment, matrix_type)
    );

    const results = await Promise.all(updatePromises);
    return { assessments: results };
  } catch (error) {
    console.error('Error creating assessments:', error);
    throw error;
  }
}

/**
 * Update multiple risk assessments.
 */
export async function updateAssessments(assessmentsData, matrix_type) {
  try {
    const updatePromises = assessmentsData.assessments.map(async assessment => {
      // Find existing assessment
      const { data: existingAssessment, error: findError } = await supabase
        .from('hira_risk_assessments')
        .select(`
          id, 
          consequence_id,
          matrix_type,
          probability,
          severity,
          likelihood,
          impact,
          tolerability
        `)
        .eq('consequence_id', assessment.consequence_id)
        .single();

      if (findError) throw findError;

      // Update assessment
      const { data: result, error: updateError } = await supabase
        .from('hira_risk_assessments')
        .update({
          matrix_type: matrix_type.toLowerCase(),
          probability: assessment.probability,
          severity: assessment.severity,
          likelihood: assessment.likelihood,
          impact: assessment.impact,
          tolerability: matrix_type === 'ICAO' ? assessment.tolerability : calculateRiskRating(assessment.likelihood, assessment.impact),
          updated_at: new Date().toISOString()
        })
         .eq('id', existingAssessment.id)
        .select(`
          id,
          consequence_id,
          matrix_type,
          probability,
          severity,
          likelihood,
          impact,
          tolerability
        `)
        .single();

      if (updateError) throw updateError;


      // Create risk control record if it doesn't exist
      const { data: existingControl } = await supabase
        .from('hira_risk_controls')
        .select(`
          id,
          assessment_id
        `)
        .eq('assessment_id', result.id)
        .maybeSingle();

      if (!existingControl) {
        const { error: createError } = await supabase
          .from('hira_risk_controls')
          .insert({
            assessment_id: result.id,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select(`
            id,
            assessment_id,
            created_at,
            updated_at
          `)
          .single();

        if (createError) throw createError;
      }

      return result;
    });

    const results = await Promise.all(updatePromises);
    return { assessments: results };
  } catch (error) {
    console.error('Error updating assessments:', error);
    throw error;
  }
}

/**
 * Create or update a single assessment
 */
async function createOrUpdateAssessment(assessment, matrix_type) {
  try {
    // Find the existing assessment by consequence_id
    const { data: existingAssessment, error: findError } = await supabase
      .from('hira_risk_assessments')
      .select(`
        id,
        consequence_id
      `)
      .eq('consequence_id', assessment.consequence_id)
      .single();

    if (findError) {
      console.error('Error finding assessment:', findError);
      throw findError;
    }

    if (!existingAssessment) {
      throw new Error(`No risk assessment found for consequence: ${assessment.consequence_id}`);
    }

    // Update the assessment with new data
     const { data: result, error: updateError } = await supabase
      .from('hira_risk_assessments')
      .update({
        matrix_type: matrix_type.toLowerCase(),
        probability: assessment.probability ? parseInt(assessment.probability) : null,
        severity: assessment.severity || null,
        likelihood: assessment.likelihood ? parseInt(assessment.likelihood) : null,
        impact: assessment.impact ? parseInt(assessment.impact) : null,
        tolerability: matrix_type === 'ICAO' ? assessment.tolerability : calculateRiskRating(assessment.likelihood, assessment.impact),
        updated_at: new Date().toISOString()
      })
      .eq('id', existingAssessment.id)
      .select(`
        id,
        consequence_id,
        matrix_type,
        probability,
        severity,
        likelihood,
        impact,
        tolerability
      `)
      .single();

    if (updateError) {
      console.error('Error updating assessment:', updateError);
      throw updateError;
    }

    // After successfully updating the risk assessment, ensure risk control record exists
    if (result) {
      // Check if a risk control record already exists
      const { data: existingControl, error: controlFindError } = await supabase
        .from('hira_risk_controls')
        .select(`
          id,
          assessment_id
        `)
        .eq('assessment_id', result.id)
        .maybeSingle();

      if (controlFindError && controlFindError.code !== 'PGRST116') {
        console.error('Error checking existing control:', controlFindError);
        throw controlFindError;
      }

      // Create empty risk control record if it doesn't exist
      if (!existingControl) {
        const { error: controlCreateError } = await supabase
          .from('hira_risk_controls')
          .insert({
            assessment_id: result.id,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select(`
            id,
            assessment_id,
            created_at,
            updated_at
          `)
          .single();

        if (controlCreateError) {
          console.error('Error creating risk control:', controlCreateError);
          throw controlCreateError;
        }
      }
    }

    return result;
  } catch (error) {
    console.error('Error in createOrUpdateAssessment:', error);
    throw error;
  }
}