import { supabase } from './supabase';

export const projectService = {
  // Save event and all its related data
  async saveEvent(projectId, eventData) {
    try {
      console.log('Saving event for project:', projectId, eventData);

      let event;
      // Check if event already exists
      if (eventData.uniqueId) {
        const { data: existingEvent, error: fetchError } = await supabase
          .from('hira_events')
          .select(`
            id,
            name,
            hira_hazards (
              id,
              description,
              hira_consequences (
                id,
                description,
                current_controls
              )
            )
          `)
          .eq('id', eventData.uniqueId)
          .single();

        if (!fetchError && existingEvent) {
          // Update existing event
          const { data: updatedEvent, error: updateError } = await supabase
            .from('hira_events')
            .update({
              name: eventData.name,
              updated_at: new Date().toISOString()
            })
            .eq('id', eventData.uniqueId)
            .select()
            .single();

          if (updateError) throw updateError;
          event = updatedEvent;

          // Update or delete existing hazards
          const existingHazards = existingEvent.hira_hazards || [];
          const newHazardIds = eventData.hazards.map(h => h.uniqueId).filter(Boolean);

          // Delete hazards that are no longer present
          if (existingHazards.length > 0) {
            const hazardsToDelete = existingHazards
              .filter(h => !newHazardIds.includes(h.id))
              .map(h => h.id);

            if (hazardsToDelete.length > 0) {
              const { error: deleteError } = await supabase
                .from('hira_hazards')
                .delete()
                .in('id', hazardsToDelete);

              if (deleteError) throw deleteError;
            }
          }
        }
      }

      // If event doesn't exist, create new one
      if (!event) {
        const { data: newEvent, error: createError } = await supabase
          .from('hira_events')
          .insert({
            project_id: projectId,
            name: eventData.name,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select()
          .single();

        if (createError) throw createError;
        event = newEvent;
      }

      console.log('Event saved:', event);

      // Save hazards
      for (const hazard of eventData.hazards) {
        let hazardRecord;
        if (hazard.uniqueId) {
          // Update existing hazard
          const { data: updatedHazard, error: updateError } = await supabase
            .from('hira_hazards')
            .update({
              description: hazard.description,
              updated_at: new Date().toISOString()
            })
            .eq('id', hazard.uniqueId)
            .select()
            .single();

          if (!updateError) hazardRecord = updatedHazard;
        }

        // Create new hazard if update failed or hazard doesn't exist
        if (!hazardRecord) {
          const { data: newHazard, error: createError } = await supabase
            .from('hira_hazards')
            .insert({
              event_id: event.id,
              description: hazard.description,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
            .select()
            .single();

          if (createError) throw createError;
          hazardRecord = newHazard;
        }

        // Handle consequences for this hazard
        const existingConsequences = hazard.uniqueId ?
          (await supabase
            .from('hira_consequences')
            .select('id')
            .eq('hazard_id', hazard.uniqueId)).data || [] : [];

        const newConsequenceIds = hazard.consequences.map(c => c.uniqueId).filter(Boolean);

        // Delete consequences that are no longer present
        if (existingConsequences.length > 0) {
          const consequencesToDelete = existingConsequences
            .filter(c => !newConsequenceIds.includes(c.id))
            .map(c => c.id);

          if (consequencesToDelete.length > 0) {
            const { error: deleteError } = await supabase
              .from('hira_consequences')
              .delete()
              .in('id', consequencesToDelete);

            if (deleteError) throw deleteError;
          }
        }

        // Save consequences
        for (const consequence of hazard.consequences) {
          if (consequence.uniqueId) {
            // Update existing consequence
            const { error: updateError } = await supabase
              .from('hira_consequences')
              .update({
                description: consequence.description,
                current_controls: consequence.currentControls,
                updated_at: new Date().toISOString()
              })
              .eq('id', consequence.uniqueId);

            if (!updateError) continue;
          }

          // Create new consequence if update failed or consequence doesn't exist
          const { error: createError } = await supabase
            .from('hira_consequences')
            .insert({
              hazard_id: hazardRecord.id,
              description: consequence.description,
              current_controls: consequence.currentControls,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            });

          if (createError) throw createError;
        }
      }

      // Then save each hazard for this event
      for (const hazard of eventData.hazards) {
        const { data: hazardData, error: hazardError } = await supabase
          .from('hira_hazards')
          .insert({
            event_id: event.id,
            description: hazard.description,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select()
          .single();

        if (hazardError) {
          console.error('Error saving hazard:', hazardError);
          throw hazardError;
        }

        console.log('Hazard saved:', hazardData);

        // Save consequences for this hazard
        const savedConsequences = [];
        for (const consequence of hazard.consequences) {
          const { data: consequenceData, error: consequenceError } = await supabase
            .from('hira_consequences')
            .insert({
              hazard_id: hazardData.id,
              description: consequence.description,
              current_controls: consequence.currentControls,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
            .select()
            .single();

          if (consequenceError) {
            console.error('Error saving consequence:', consequenceError);
            throw consequenceError;
          }

          console.log('Consequence saved:', consequenceData);
          savedConsequences.push({
            ...consequence,
            uniqueId: consequenceData.id // Update uniqueId to match database ID
          });
        }

        // Update hazard with saved consequences
        hazard.consequences = savedConsequences;
      }

      return event;
    } catch (error) {
      console.error('Error in saveEvent:', error);
      throw error;
    }
  },

  // Load all events and related data for a project
  async loadProjectData(projectId) {
    try {
      console.log('Loading project data:', projectId);

      // Get all events for the project with their related data
      const { data: events, error: eventsError } = await supabase
        .from('hira_events')
        .select(`
          id,
          name,
          hira_hazards (
            id,
            description,
            hira_consequences (
              id,
              description,
              current_controls
            )
          )
        `)
        .eq('project_id', projectId);

      if (eventsError) {
        console.error('Error loading events:', eventsError);
        throw eventsError;
      }

      console.log('Loaded events:', events);

      // Transform the data to match the frontend structure
      return events.map(event => ({
        uniqueId: event.id,
        name: event.name,
        hazards: event.hira_hazards.map(hazard => ({
          uniqueId: hazard.id,
          description: hazard.description,
          consequences: hazard.hira_consequences.map(consequence => ({
            uniqueId: consequence.id, // Use database ID as uniqueId
            description: consequence.description,
            currentControls: consequence.current_controls
          }))
        }))
      }));
    } catch (error) {
      console.error('Error in loadProjectData:', error);
      throw error;
    }
  },

  // Delete all data for a project
  async deleteProjectData(projectId) {
    try {
      console.log('Deleting project data:', projectId);

      // First get all events for this project
      const { data: events, error: eventsQueryError } = await supabase
        .from('hira_events')
        .select('id')
        .eq('project_id', projectId);

      if (eventsQueryError) throw eventsQueryError;

      // Get all hazards for these events
      const { data: hazards, error: hazardsQueryError } = await supabase
        .from('hira_hazards')
        .select('id')
        .in('event_id', events.map(e => e.id));

      if (hazardsQueryError) throw hazardsQueryError;

      // Get all consequences for these hazards
      const { data: consequences, error: consequencesQueryError } = await supabase
        .from('hira_consequences')
        .select('id')
        .in('hazard_id', hazards.map(h => h.id));

      if (consequencesQueryError) throw consequencesQueryError;

      // Delete risk assessments linked to these consequences
      const { error: assessmentsError } = await supabase
        .from('hira_risk_assessments')
        .delete()
        .in('consequence_id', consequences.map(c => c.id));

      if (assessmentsError) throw assessmentsError;

      // Delete consequences
      const { error: consequencesError } = await supabase
        .from('hira_consequences')
        .delete()
        .in('hazard_id', hazards.map(h => h.id));

      if (consequencesError) throw consequencesError;

      // Delete hazards
      const { error: hazardsError } = await supabase
        .from('hira_hazards')
        .delete()
        .in('event_id', events.map(e => e.id));

      if (hazardsError) throw hazardsError;

      // Delete events
      const { error: eventsError } = await supabase
        .from('hira_events')
        .delete()
        .eq('project_id', projectId);

      if (eventsError) throw eventsError;

      console.log('Project data deleted successfully');
    } catch (error) {
      console.error('Error in deleteProjectData:', error);
      throw error;
    }
  }
};
