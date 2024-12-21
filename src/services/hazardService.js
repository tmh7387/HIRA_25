import { supabase } from './supabase';

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
      uniqueId: hazard.id,
      description: hazard.description,
      consequences: hazard.hira_consequences.map(consequence => ({
        uniqueId: consequence.id,
        description: consequence.description,
        currentControls: consequence.current_controls
      }))
    }));
  } catch (error) {
    console.error('Error getting hazards:', error);
    throw error;
  }
}

export async function updateHazards(eventId, hazardsData) {
  try {
    // First get all hazards for this event
    const { data: hazards, error: fetchError } = await supabase
      .from('hira_hazards')
      .select('id')
      .eq('event_id', eventId);

    if (fetchError) throw fetchError;

    if (hazards && hazards.length > 0) {
      // Delete all hazards for this event (cascades to consequences)
      const { error: deleteError } = await supabase
        .from('hira_hazards')
        .delete()
        .eq('event_id', eventId);

      if (deleteError) throw deleteError;
    }

    // Create hazards for this event
    const hazardsPromises = hazardsData.map(async hazard => {
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

      if (hazardError) {
        console.error('Error creating hazard:', hazardError);
        throw hazardError;
      }

      // Create consequences for this hazard
      const consequencesPromises = hazard.consequences.map(consequence => 
        supabase
          .from('hira_consequences')
          .insert({
            hazard_id: createdHazard.id,
            description: consequence.description,
            current_controls: consequence.currentControls,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select()
          .single()
      );

      const consequencesResults = await Promise.all(consequencesPromises);
      const consequences = consequencesResults.map(result => {
        if (result.error) throw result.error;
        return {
          uniqueId: result.data.id,
          description: result.data.description,
          currentControls: result.data.current_controls
        };
      });

      return {
        uniqueId: createdHazard.id,
        description: createdHazard.description,
        consequences
      };
    });

    return Promise.all(hazardsPromises);
  } catch (error) {
    console.error('Error updating hazards:', error);
    throw error;
  }
}

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