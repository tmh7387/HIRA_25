import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useForm, useFieldArray } from 'react-hook-form';
import { Plus, Trash2, PlusCircle, MinusCircle } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import useProjectStore from '../stores/projectStore';
import { projectService } from '../services/projectService';


const HazardEvent = ({ eventIndex, register, control, removeEvent }) => {
  const { fields: hazards, append: appendHazard, remove: removeHazard } = useFieldArray({
    control,
    name: `events.${eventIndex}.hazards`
  });

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
              key={hazard.uniqueId}
              eventIndex={eventIndex}
              hazardIndex={hazardIndex}
              register={register}
              control={control}
              removeHazard={removeHazard}
            />
          ))}

          <button
            type="button"
            onClick={() => appendHazard({
              uniqueId: uuidv4(),
              description: '',
              consequences: [{
                uniqueId: uuidv4(),
                description: '',
                currentControls: ''
              }]
            })}
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

  return (
    <div className="pl-6 border-l-2 border-blue-200">
      <div className="space-y-4">
        <div className="flex justify-between items-start">
          <div className="flex-1 mr-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Hazard</label>
            <input
              type="text"
              {...register(
                `events.${eventIndex}.hazards.${hazardIndex}.description`,
                { required: 'Hazard description is required' }
              )}
              placeholder="Describe the hazard"
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          {hazardIndex > 0 && (
            <button
              type="button"
              onClick={() => removeHazard(hazardIndex)}
              className="text-red-600 hover:text-red-800"
            >
              <MinusCircle className="h-5 w-5" />
            </button>
          )}
        </div>

        <div className="pl-6 space-y-4">
          {consequences.map((consequence, consequenceIndex) => (
            <ConsequenceItem
              key={consequence.uniqueId}
              eventIndex={eventIndex}
              hazardIndex={hazardIndex}
              consequenceIndex={consequenceIndex}
              register={register}
              removeConsequence={removeConsequence}
            />
          ))}

          <button
            type="button"
            onClick={() => appendConsequence({
              uniqueId: uuidv4(),
              description: '',
              currentControls: ''
            })}
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
        </div>
        {consequenceIndex > 0 && (
          <button
            type="button"
            onClick={() => removeConsequence(consequenceIndex)}
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
            `events.${eventIndex}.hazards.${hazardIndex}.consequences.${consequenceIndex}.currentControls`,
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

// Error Alert Component
const ErrorAlert = ({ message }) => {
  if (!message) return null;

  return (
    <div className="p-4 mb-4 bg-red-50 border border-red-200 rounded-lg">
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3">
          <p className="text-sm text-red-700">{message}</p>
        </div>
      </div>
    </div>
  );
};

export default function HazardIdentification() {
  const { 
    currentProject,
    hazardIdentificationData,
    setStepData,
    setCurrentStep,
    error: storeError,
    isLoading
  } = useProjectStore();

  // Local state for component-specific errors
  const [localError, setLocalError] = useState(null);

  // Create default event structure
  const defaultEvent = {
    uniqueId: uuidv4(),
    name: '',
    hazards: [{
      uniqueId: uuidv4(),
      description: '',
      consequences: [{
        uniqueId: uuidv4(),
        description: '',
        currentControls: ''
      }]
    }]
  };

  // Local state for form data
  const [formData, setFormData] = useState(() => ({
    events: hazardIdentificationData?.events || [defaultEvent]
  }));

  // Set up form with local state
  const { register, control, handleSubmit, formState: { errors }, reset, watch, setValue, getValues } = useForm({
    defaultValues: formData
  });

  // Watch form changes and auto-save
  const watchAllFields = watch();
  useEffect(() => {
    const saveData = async () => {
      try {
        const currentData = getValues();
        if (!currentData.events?.length) return;

        // Filter out empty events, hazards, and consequences
        const validEvents = currentData.events
          .filter(event => event.name.trim())
          .map(event => ({
            uniqueId: event.uniqueId,
            name: event.name.trim(),
            hazards: event.hazards
              .filter(hazard => hazard.description.trim())
              .map(hazard => ({
                uniqueId: hazard.uniqueId,
                description: hazard.description.trim(),
                consequences: hazard.consequences
                  .filter(consequence => consequence.description.trim())
                  .map(consequence => ({
                    uniqueId: consequence.uniqueId,
                    description: consequence.description.trim(),
                    currentControls: consequence.currentControls?.trim() || ''
                  }))
              }))
          }));

        if (validEvents.length > 0) {
          await setStepData(2, { events: validEvents });
        }
      } catch (error) {
        console.error('Error auto-saving:', error);
      }
    };

    // Debounce save to prevent too many requests
    const timeoutId = setTimeout(saveData, 1000);
    return () => clearTimeout(timeoutId);
  }, [watchAllFields, setStepData, getValues]);

  // Update form when hazardIdentificationData changes
  useEffect(() => {
    if (hazardIdentificationData?.events) {
      const events = hazardIdentificationData.events.map(event => ({
        ...event,
        uniqueId: event.uniqueId || uuidv4(),
        hazards: event.hazards.map(hazard => ({
          ...hazard,
          uniqueId: hazard.uniqueId || uuidv4(),
          consequences: hazard.consequences.map(consequence => ({
            ...consequence,
            uniqueId: consequence.uniqueId || uuidv4()
          }))
        }))
      }));
      setFormData({ events });
      reset({ events });
    }
  }, [hazardIdentificationData, reset]);

  const { fields: events, append: appendEvent, remove: removeEvent } = useFieldArray({
    control,
    name: "events"
  });

  // Load saved data when component mounts
  useEffect(() => {
    if (hazardIdentificationData) {
      console.log('Loading saved hazard identification data:', hazardIdentificationData);
    }
  }, [hazardIdentificationData]);

  const handleFormSubmit = async (data) => {
    try {
      setLocalError(null);

      // Check if we have a current project
      if (!currentProject?.project_id) {
        throw new Error('No active project found. Please ensure the project is created first.');
      }

      // Filter out empty events, hazards, and consequences
      const validEvents = data.events
        .filter(event => event.name.trim())
        .map(event => {
          const validHazards = event.hazards
            .filter(hazard => hazard.description.trim())
            .map(hazard => {
              const validConsequences = hazard.consequences
                .filter(consequence => consequence.description.trim())
                .map(consequence => ({
                  uniqueId: consequence.uniqueId,
                  description: consequence.description.trim(),
                  currentControls: consequence.currentControls?.trim() || ''
                }));

              return {
                uniqueId: hazard.uniqueId,
                description: hazard.description.trim(),
                consequences: validConsequences
              };
            });

          return {
            uniqueId: event.uniqueId,
            name: event.name.trim(),
            hazards: validHazards
          };
        });

      // Check if we have any valid data
      if (validEvents.length === 0) {
        throw new Error('Please add at least one safety event with hazards and consequences');
      }

      const formattedData = { events: validEvents };
      console.log('Saving hazard identification data...', formattedData);

      // Save to store and database
      const saved = await setStepData(2, formattedData);
      if (!saved) {
        throw new Error('Failed to save hazard identification data');
      }

      // Update local state to match saved data
      setFormData(formattedData);

      // Proceed to next step
      setCurrentStep(3);
    } catch (err) {
      console.error('Error saving hazard identification:', err);
      setLocalError(err.message);
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Check if we have a current project
  if (!currentProject?.project_id) {
    return (
      <div className="space-y-6 max-w-6xl mx-auto p-6">
        <div className="bg-white shadow-md rounded-lg p-6">
          <p className="text-center text-red-600">
            No active project found. Please ensure the project is created first.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto p-6">
      <div className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Hazard Identification</h2>

        {(storeError || localError) && (
          <ErrorAlert message={localError || storeError} />
        )}

        {Object.keys(errors).length > 0 && (
          <ErrorAlert message="Please fill in all required fields" />
        )}

        <form onSubmit={handleSubmit(handleFormSubmit)}>
          <div className="space-y-8">
            {events.map((event, eventIndex) => (
              <HazardEvent
                key={event.uniqueId || eventIndex}
                eventIndex={eventIndex}
                register={register}
                control={control}
                removeEvent={removeEvent}
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
                disabled={isLoading}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Saving...' : 'Next Step'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

HazardIdentification.propTypes = {
  onSubmit: PropTypes.func,
  initialData: PropTypes.shape({
    events: PropTypes.arrayOf(PropTypes.shape({
      uniqueId: PropTypes.string,
      name: PropTypes.string,
      hazards: PropTypes.arrayOf(PropTypes.shape({
        uniqueId: PropTypes.string,
        description: PropTypes.string,
        consequences: PropTypes.arrayOf(PropTypes.shape({
          uniqueId: PropTypes.string,
          description: PropTypes.string,
          currentControls: PropTypes.string
        }))
      }))
    }))
  })
};

HazardEvent.propTypes = {
  eventIndex: PropTypes.number.isRequired,
  register: PropTypes.func.isRequired,
  control: PropTypes.object.isRequired,
  removeEvent: PropTypes.func.isRequired
};

HazardItem.propTypes = {
  eventIndex: PropTypes.number.isRequired,
  hazardIndex: PropTypes.number.isRequired,
  register: PropTypes.func.isRequired,
  control: PropTypes.object.isRequired,
  removeHazard: PropTypes.func.isRequired
};

ConsequenceItem.propTypes = {
  eventIndex: PropTypes.number.isRequired,
  hazardIndex: PropTypes.number.isRequired,
  consequenceIndex: PropTypes.number.isRequired,
  register: PropTypes.func.isRequired,
  removeConsequence: PropTypes.func.isRequired
};

ErrorAlert.propTypes = {
  message: PropTypes.string
};
