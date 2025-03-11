import React, { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { Plus, Trash2, PlusCircle, MinusCircle } from 'lucide-react';
import useProjectStore from '../stores/projectStore';

const HazardEvent = ({ eventIndex, register, control, removeEvent, getValues }) => {
  const { fields: hazards, append: appendHazard, remove: removeHazard } = useFieldArray({
    control,
    name: `events.${eventIndex}.hazards`
  });

  const handleAddHazard = () => {
    // Get current event values to preserve existing hazards
    const currentEvent = getValues(`events.${eventIndex}`);
    
    appendHazard({
      hazard_id: null, // New hazard won't have an ID yet
      description: '',
      consequences: [
        {
          consequence_id: null, // New consequence won't have an ID yet
          description: '',
          current_controls: ''
        }
      ]
    });
  };

  return (
    <div className="border rounded-lg p-6 bg-gray-50">
      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <div className="flex-1 mr-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Safety Event</label>
            <input
              type="text"
              {...register(`events.${eventIndex}.name`, { 
                required: 'Safety event name is required' 
              })}
              placeholder="Describe the safety event"
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
            <input
              type="hidden"
              {...register(`events.${eventIndex}.event_id`)}
            />
          </div>
          {eventIndex > 0 && (
            <button
              type="button"
              onClick={() => removeEvent(eventIndex)}
              className="text-red-600 hover:text-red-800"
            >
              <Trash2 className="h-5 w-5" />
            </button>
          )}
        </div>

        <div className="space-y-6">
          {hazards.map((hazard, hazardIndex) => (
            <HazardItem
              key={hazard.hazard_id || hazardIndex}
              eventIndex={eventIndex}
              hazardIndex={hazardIndex}
              register={register}
              control={control}
              removeHazard={() => removeHazard(hazardIndex)}
            />
          ))}

          <button
            type="button"
            onClick={handleAddHazard}
            className="ml-6 inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
          >
            <PlusCircle className="h-4 w-4 mr-1" />
            Add Hazard
          </button>
        </div>
      </div>
    </div>
  );
};

const HazardItem = ({ eventIndex, hazardIndex, register, control, removeHazard }) => {
  const { fields: consequences, append: appendConsequence, remove: removeConsequence } = useFieldArray({
    control,
    name: `events.${eventIndex}.hazards.${hazardIndex}.consequences`
  });

  const handleAddConsequence = () => {
    appendConsequence({
      consequence_id: null,
      description: '',
      current_controls: ''
    });
  };

  return (
    <div className="pl-6 border-l-2 border-blue-200">
      <div className="space-y-4">
        <div className="flex justify-between items-start">
          <div className="flex-1 mr-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Hazard</label>
            <input
              type="text"
              {...register(`events.${eventIndex}.hazards.${hazardIndex}.description`, { 
                required: 'Hazard description is required' 
              })}
              placeholder="Describe the hazard"
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
            <input
              type="hidden"
              {...register(`events.${eventIndex}.hazards.${hazardIndex}.hazard_id`)}
            />
          </div>
          {hazardIndex > 0 && (
            <button
              type="button"
              onClick={removeHazard}
              className="text-red-600 hover:text-red-800"
            >
              <MinusCircle className="h-5 w-5" />
            </button>
          )}
        </div>

        <div className="pl-6 space-y-4">
          {consequences.map((consequence, consequenceIndex) => (
            <ConsequenceItem
              key={consequence.consequence_id || consequenceIndex}
              eventIndex={eventIndex}
              hazardIndex={hazardIndex}
              consequenceIndex={consequenceIndex}
              register={register}
              removeConsequence={() => removeConsequence(consequenceIndex)}
            />
          ))}

          <button
            type="button"
            onClick={handleAddConsequence}
            className="ml-6 inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
          >
            <PlusCircle className="h-4 w-4 mr-1" />
            Add Consequence
          </button>
        </div>
      </div>
    </div>
  );
};

const ConsequenceItem = ({ eventIndex, hazardIndex, consequenceIndex, register, removeConsequence }) => (
  <div className="border-l-2 border-green-200 pl-6">
    <div className="space-y-4">
      <div className="flex justify-between items-start">
        <div className="flex-1 mr-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Consequence
          </label>
          <input
            type="text"
            {...register(
              `events.${eventIndex}.hazards.${hazardIndex}.consequences.${consequenceIndex}.description`,
              { required: 'Consequence description is required' }
            )}
            placeholder="Describe the consequence"
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
          <input
            type="hidden"
            {...register(
              `events.${eventIndex}.hazards.${hazardIndex}.consequences.${consequenceIndex}.consequence_id`
            )}
          />
        </div>
        {consequenceIndex > 0 && (
          <button
            type="button"
            onClick={removeConsequence}
            className="text-red-600 hover:text-red-800"
          >
            <MinusCircle className="h-5 w-5" />
          </button>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Current Controls
        </label>
        <textarea
          {...register(
            `events.${eventIndex}.hazards.${hazardIndex}.consequences.${consequenceIndex}.current_controls`,
            { required: 'Current controls are required' }
          )}
          rows={2}
          placeholder="List current control measures"
          className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>
    </div>
  </div>
);

export default function HazardIdentification() {
  const {
    currentProject,
    hazardIdentificationData,
    setStepData,
    setCurrentStep,
    error: storeError,
    isLoading: storeLoading
  } = useProjectStore();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localError, setLocalError] = useState(null);

  const defaultEvent = {
    name: '',
    hazards: [
      {
        hazard_id: null,
        description: '',
        consequences: [
          {
            consequence_id: null,
            description: '',
            current_controls: ''
          }
        ]
      }
    ]
  };

  const { register, control, handleSubmit, getValues } = useForm({
    defaultValues: hazardIdentificationData || { events: [defaultEvent] }
  });

  const { fields: events, append: appendEvent, remove: removeEvent } = useFieldArray({
    control,
    name: "events"
  });

  const handleFormSubmit = async (data) => {
    try {
      setIsSubmitting(true);
      setLocalError(null);

      const formattedData = {
        events: data.events
          .filter(event => event.name?.trim())
          .map(event => ({
            event_id: event.event_id || null,
            name: event.name.trim(),
            hazards: event.hazards
              .filter(hazard => hazard.description?.trim())
              .map(hazard => ({
                hazard_id: hazard.hazard_id || null,
                description: hazard.description.trim(),
                consequences: hazard.consequences
                  .filter(consequence => consequence.description?.trim())
                  .map(consequence => ({
                    consequence_id: consequence.consequence_id || null,
                    description: consequence.description.trim(),
                    current_controls: consequence.current_controls?.trim() || ''
                  }))
              }))
          }))
      };

      const saved = await setStepData(2, formattedData);
      if (!saved) throw new Error('Failed to save hazard identification data');

      setCurrentStep(3);
    } catch (error) {
      console.error('Error in form submission:', error);
      setLocalError('Failed to save hazard identification data. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (storeLoading || isSubmitting) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto p-6">
      <div className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Hazard Identification</h2>

        {localError && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {localError}
          </div>
        )}

        <form onSubmit={handleSubmit(handleFormSubmit)}>
          <div className="space-y-8">
            {events.map((event, eventIndex) => (
              <HazardEvent
                key={event.event_id || eventIndex}
                eventIndex={eventIndex}
                register={register}
                control={control}
                removeEvent={removeEvent}
                getValues={getValues}
              />
            ))}

            <div className="flex justify-between">
              <button
                type="button"
                onClick={() => appendEvent(defaultEvent)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Safety Event
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Saving...' : 'Next Step'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}