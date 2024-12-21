import { supabase } from './supabase';

async function findConsequence(consequence_id) {
  const { data, error } = await supabase
    .from('hira_consequences')
    .select(`
      id,
      description,
      current_controls,
      hazard:hira_hazards!inner(
        id,
        description,
        event:hira_events!inner(
          id,
          name
        )
      )
    `)
    .eq('id', consequence_id)
    .single();

  if (error) {
    console.error('Error finding consequence:', error);
    console.error('Attempted to find consequence with ID:', consequence_id);
    throw new Error(`Consequence not found: ${consequence_id}`);
  }

  if (!data) {
    console.error('No consequence found with ID:', consequence_id);
    throw new Error(`No consequence found with ID: ${consequence_id}`);
  }

  return data;
}

async function createOrUpdateAssessment(assessment, matrix_type) {
  // First verify the consequence exists
  const consequence = await findConsequence(assessment.consequence_id);

  // Check if an assessment already exists for this consequence
  const { data: existingAssessment, error: fetchError } = await supabase
    .from('hira_risk_assessments')
    .select('*')
    .eq('consequence_id', consequence.id)
    .single();

  if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 is "not found" error
    throw fetchError;
  }

  const assessmentData = {
    consequence_id: consequence.id,
    matrix_type: matrix_type.toLowerCase(),
    probability: assessment.probability ? parseInt(assessment.probability) : null,
    severity: assessment.severity || null,
    likelihood: assessment.likelihood ? parseInt(assessment.likelihood) : null,
    impact: assessment.impact ? parseInt(assessment.impact) : null,
    tolerability: assessment.tolerability || null
  };

  let result;
  if (existingAssessment) {
    // Update existing assessment
    const { data, error } = await supabase
      .from('hira_risk_assessments')
      .update(assessmentData)
      .eq('id', existingAssessment.id)
      .select()
      .single();

    if (error) throw error;
    result = data;
  } else {
    // Create new assessment
    const { data, error } = await supabase
      .from('hira_risk_assessments')
      .insert(assessmentData)
      .select()
      .single();

    if (error) throw error;
    result = data;
  }

  return {
    assessment_id: result.id,
    consequence_id: consequence.id,
    event: consequence.hazard.event.name,
    hazard: consequence.hazard.description,
    consequence: consequence.description,
    current_controls: consequence.current_controls,
    matrix_type: result.matrix_type,
    probability: result.probability,
    severity: result.severity,
    likelihood: result.likelihood,
    impact: result.impact,
    tolerability: result.tolerability
  };
}

export async function createAssessments(project_id, assessmentsData, matrix_type) {
  console.log('Creating assessments for project:', project_id);
  console.log('Assessments data:', assessmentsData);
  
  
  const assessmentPromises = assessmentsData.assessments.map(async assessment => {
    try {
      // Verify the consequence exists in hira_consequences
      const { data: consequence, error: consequenceError } = await supabase
        .from('hira_consequences')
        .select(`
          id,
          description,
          current_controls,
          hazard:hira_hazards!inner(
            id,
            description,
            event:hira_events!inner(
              id,
              name
            )
          )
        `)
        .eq('id', assessment.consequence_id) // Use consequence_id from hazard identification
        .single();

      if (consequenceError) {
        console.error('Error finding consequence:', consequenceError);
        throw new Error(`Consequence not found: ${assessment.consequence_id}`);
      }

      if (!consequence) {
        throw new Error(`No consequence found with ID: ${assessment.consequence_id}`);
      }

      console.log('Found consequence:', consequence);

      // Create the risk assessment
      const { data: createdAssessment, error: assessmentError } = await supabase
        .from('hira_risk_assessments')
        .insert({
          consequence_id: consequence.id,
          matrix_type: matrix_type,
          probability: assessment.probability ? parseInt(assessment.probability) : null,
          severity: assessment.severity || null,
          likelihood: assessment.likelihood ? parseInt(assessment.likelihood) : null,
          impact: assessment.impact ? parseInt(assessment.impact) : null,
          tolerability: assessment.tolerability || null
        })
        .select()
        .single();

      if (assessmentError) {
        console.error('Error creating assessment:', assessmentError);
        throw assessmentError;
      }

      console.log('Created assessment:', createdAssessment);

      return {
        assessment_id: createdAssessment.id,
        consequence_id: consequence.id, // Return consequence ID for form matching
        event: consequence.hazard.event.name,
        hazard: consequence.hazard.description,
        consequence: consequence.description,
        current_controls: consequence.current_controls,
        matrix_type: createdAssessment.matrix_type,
        probability: createdAssessment.probability,
        severity: createdAssessment.severity,
        likelihood: createdAssessment.likelihood,
        impact: createdAssessment.impact,
        tolerability: createdAssessment.tolerability
      };
    } catch (error) {
      console.error('Error processing assessment:', error);
      throw error;
    }
  });

  try {
    const results = await Promise.all(assessmentPromises);
    console.log('Successfully created all assessments:', results);
    return { assessments: results };
  } catch (error) {
    console.error('Error creating assessments:', error);
    throw error;
  }
}

export async function updateAssessments(assessmentsData, matrix_type) {
  try {
    console.log('Updating assessments:', assessmentsData);

    // Process each assessment
    const results = [];
    for (const assessment of assessmentsData.assessments) {
      // Check if assessment exists for this consequence
      const { data: existingAssessment, error: fetchError } = await supabase
        .from('hira_risk_assessments')
        .select('id')
        .eq('consequence_id', assessment.consequence_id)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') throw fetchError;

      const assessmentData = {
        consequence_id: assessment.consequence_id,
        matrix_type: matrix_type.toLowerCase(),
        probability: assessment.probability ? parseInt(assessment.probability) : null,
        severity: assessment.severity || null,
        likelihood: assessment.likelihood ? parseInt(assessment.likelihood) : null,
        impact: assessment.impact ? parseInt(assessment.impact) : null,
        tolerability: assessment.tolerability || null
      };

      let result;
      if (existingAssessment) {
        // Update existing assessment
        const { data, error } = await supabase
          .from('hira_risk_assessments')
          .update(assessmentData)
          .eq('id', existingAssessment.id)
          .select()
          .single();

        if (error) throw error;
        result = data;
      } else {
        // Create new assessment
        const { data, error } = await supabase
          .from('hira_risk_assessments')
          .insert(assessmentData)
          .select()
          .single();

        if (error) throw error;
        result = data;
      }

      // Get consequence details
      const { data: consequence, error: consequenceError } = await supabase
        .from('hira_consequences')
        .select(`
          id,
          description,
          current_controls,
          hazard:hira_hazards!inner(
            id,
            description,
            event:hira_events!inner(
              id,
              name
            )
          )
        `)
        .eq('id', assessment.consequence_id)
        .single();

      if (consequenceError) throw consequenceError;

      results.push({
        assessment_id: result.id,
        consequence_id: consequence.id,
        event: consequence.hazard.event.name,
        hazard: consequence.hazard.description,
        consequence: consequence.description,
        current_controls: consequence.current_controls,
        matrix_type: result.matrix_type,
        probability: result.probability,
        severity: result.severity,
        likelihood: result.likelihood,
        impact: result.impact,
        tolerability: result.tolerability
      });
    }

    return { assessments: results };
  } catch (error) {
    console.error('Error updating assessments:', error);
    throw error;
  }
}

export async function getAssessmentsByConsequenceId(consequence_id) {
  try {
    console.log('Getting assessment for consequence:', consequence_id);

    const { data, error } = await supabase
      .from('hira_risk_assessments')
      .select('*')
      .eq('consequence_id', consequence_id)
      .single();

    if (error && error.code !== 'PGRST116') throw error; // PGRST116 is "not found" error

    if (!data) return null;

    // Get the consequence details
    const { data: consequence, error: consequenceError } = await supabase
      .from('hira_consequences')
      .select(`
        id,
        description,
        current_controls,
        hazard:hira_hazards!inner(
          id,
          description,
          event:hira_events!inner(
            id,
            name
          )
        )
      `)
      .eq('id', consequence_id)
      .single();

    if (consequenceError) throw consequenceError;

    return {
      assessment_id: data.id,
      consequence_id: consequence.id,
      event: consequence.hazard.event.name,
      hazard: consequence.hazard.description,
      consequence: consequence.description,
      current_controls: consequence.current_controls,
      matrix_type: data.matrix_type,
      probability: data.probability,
      severity: data.severity,
      likelihood: data.likelihood,
      impact: data.impact,
      tolerability: data.tolerability
    };
  } catch (error) {
    console.error('Error getting assessment:', error);
    throw error;
  }
}
