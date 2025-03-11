import { supabase } from './supabase';

/**
 * Fetch hazards and their consequences by event ID.
 */
export async function getHazardsByEventId(eventId) {
  try {
    const { data: hazards, error } = await supabase
      .from('hira_hazards')
      .select(`
        id,
        description,
        hira_consequences (
          id,
          description,
          current_controls
        )
      `)
      .eq('event_id', eventId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching hazards:', error);
      throw error;
    }

    return hazards.map(hazard => ({
      hazard_id: hazard.id,
      description: hazard.description,
      consequences: hazard.hira_consequences.map(consequence => ({
        consequence_id: consequence.id,
        description: consequence.description,
        current_controls: consequence.current_controls,
      }))
    }));
  } catch (error) {
    console.error('Error getting hazards:', error);
    throw error;
  }
}

/**
 * Save hazard identification data, preserving existing records
 */
export async function saveHazardIdentification(projectId, eventsData) {
  try {
    const savedEvents = [];

    // Process each event
    for (const event of eventsData) {
      let eventRecord;

      // First, check if there's an existing event we're working with
      if (event.event_id) {
        // Get existing event data
        const { data: existingEvent, error: fetchError } = await supabase
          .from('hira_events')
          .select('*')
          .eq('id', event.event_id)
          .single();

        if (fetchError) throw fetchError;
        eventRecord = existingEvent;

        // Update event name if it changed
        if (existingEvent.name !== event.name) {
          const { data: updatedEvent, error: updateError } = await supabase
            .from('hira_events')
            .update({ 
              name: event.name,
              updated_at: new Date().toISOString()
            })
            .eq('id', event.event_id)
            .select()
            .single();

          if (updateError) throw updateError;
          eventRecord = updatedEvent;
        }
      } else {
        // Create new event if it's completely new
        const { data: newEvent, error: createError } = await supabase
          .from('hira_events')
          .insert({
            project_id: projectId,
            name: event.name,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select()
          .single();

        if (createError) throw createError;
        eventRecord = newEvent;
      }

      const savedHazards = [];

      // Process hazards
      for (const hazard of event.hazards) {
        let hazardRecord;

        // Check for existing hazard
        if (hazard.hazard_id) {
          // Get existing hazard
          const { data: existingHazard, error: fetchError } = await supabase
            .from('hira_hazards')
            .select('*')
            .eq('id', hazard.hazard_id)
            .single();

          if (fetchError && fetchError.code !== 'PGRST116') throw fetchError;

          if (existingHazard) {
            // Update if description changed
            if (existingHazard.description !== hazard.description) {
              const { data: updatedHazard, error: updateError } = await supabase
                .from('hira_hazards')
                .update({
                  description: hazard.description,
                  updated_at: new Date().toISOString()
                })
                .eq('id', hazard.hazard_id)
                .select()
                .single();

              if (updateError) throw updateError;
              hazardRecord = updatedHazard;
            } else {
              hazardRecord = existingHazard;
            }
          }
        }

        // Create new hazard if it doesn't exist
        if (!hazardRecord) {
          const { data: newHazard, error: createError } = await supabase
            .from('hira_hazards')
            .insert({
              event_id: eventRecord.id,
              description: hazard.description,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
            .select()
            .single();

          if (createError) throw createError;
          hazardRecord = newHazard;
        }

        const savedConsequences = [];

        // Process consequences
        for (const consequence of hazard.consequences) {
          let consequenceRecord;

          if (consequence.consequence_id) {
            // Get existing consequence
            const { data: existingConsequence, error: fetchError } = await supabase
              .from('hira_consequences')
              .select('*')
              .eq('id', consequence.consequence_id)
              .single();

            if (fetchError && fetchError.code !== 'PGRST116') throw fetchError;

            if (existingConsequence) {
              // Update if description or controls changed
              if (existingConsequence.description !== consequence.description ||
                  existingConsequence.current_controls !== consequence.current_controls) {
                const { data: updatedConsequence, error: updateError } = await supabase
                  .from('hira_consequences')
                  .update({
                    description: consequence.description,
                    current_controls: consequence.current_controls,
                    updated_at: new Date().toISOString()
                  })
                  .eq('id', consequence.consequence_id)
                  .select()
                  .single();

                if (updateError) throw updateError;
                consequenceRecord = updatedConsequence;
              } else {
                consequenceRecord = existingConsequence;
              }
            }
          }

          // Create new consequence if it doesn't exist
          if (!consequenceRecord) {
            const { data: newConsequence, error: createError } = await supabase
              .from('hira_consequences')
              .insert({
                hazard_id: hazardRecord.id,
                description: consequence.description,
                current_controls: consequence.current_controls,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              })
              .select()
              .single();

            if (createError) throw createError;
            consequenceRecord = newConsequence;

            // Create risk assessment only for new consequences
            const { error: assessmentError } = await supabase
              .from('hira_risk_assessments')
              .insert({
                consequence_id: newConsequence.id,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              });

            if (assessmentError) throw assessmentError;
          }

          savedConsequences.push({
            consequence_id: consequenceRecord.id,
            description: consequenceRecord.description,
            current_controls: consequenceRecord.current_controls
          });
        }

        savedHazards.push({
          hazard_id: hazardRecord.id,
          description: hazardRecord.description,
          consequences: savedConsequences
        });
      }

      savedEvents.push({
        event_id: eventRecord.id,
        name: eventRecord.name,
        hazards: savedHazards
      });
    }

    return { events: savedEvents };
  } catch (error) {
    console.error('Error saving hazard identification:', error);
    throw error;
  }
}

/**
 * Update hazards and their consequences for a specific event.
 */
export async function updateHazards(eventId, hazardsData) {
  try {
    // Fetch existing hazards with their consequences for the event
    const { data: existingHazards, error: fetchError } = await supabase
      .from('hira_hazards')
      .select(`
        id,
        description,
        hira_consequences (
          id,
          description,
          current_controls
        )
      `)
      .eq('event_id', eventId);

    if (fetchError) throw fetchError;

    // Create a map of existing hazards and consequences
    const existingHazardMap = new Map(existingHazards?.map(h => [h.description, h]) || []);

    // Process each hazard
    const hazardPromises = hazardsData.map(async hazard => {
      // Create new hazard
      const { data: createdHazard, error: hazardError } = await supabase
        .from('hira_hazards')
        .insert({
          event_id: eventId,
          description: hazard.description,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (hazardError) throw hazardError;

      // Process consequences
      const consequencePromises = hazard.consequences.map(async consequence => {
        // Create new consequence
        const { data: createdConsequence, error: consequenceError } = await supabase
          .from('hira_consequences')
          .insert({
            hazard_id: createdHazard.id,
            description: consequence.description,
            current_controls: consequence.current_controls,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select()
          .single();

        if (consequenceError) throw consequenceError;

        // Create empty risk assessment
        const { error: assessmentError } = await supabase
          .from('hira_risk_assessments')
          .insert({
            consequence_id: createdConsequence.id,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });

        if (assessmentError) throw assessmentError;

        return {
          consequence_id: createdConsequence.id,
          description: createdConsequence.description,
          current_controls: createdConsequence.current_controls
        };
      });

      const savedConsequences = await Promise.all(consequencePromises);

      return {
        hazard_id: createdHazard.id,
        description: createdHazard.description,
        consequences: savedConsequences
      };
    });

    return await Promise.all(hazardPromises);
  } catch (error) {
    console.error('Error updating hazards:', error);
    throw error;
  }
}

/**
 * Delete all hazards and their consequences for a specific event.
 */
export async function deleteHazards(eventId) {
  try {
    const { error } = await supabase
      .from('hira_hazards')
      .delete()
      .eq('event_id', eventId);

    if (error) throw error;
  } catch (error) {
    console.error('Error deleting hazards:', error);
    throw error;
  }
}