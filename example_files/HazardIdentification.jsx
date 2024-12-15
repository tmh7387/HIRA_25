import React from 'react';
import PropTypes from 'prop-types';
import { useForm, useFieldArray } from 'react-hook-form';
import { Plus, Trash2, PlusCircle, MinusCircle } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import useFormStore from '../stores/formStore';

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
              {...register(`events.${eventIndex}.name`)}
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
              {...register(`events.${eventIndex}.hazards.${hazardIndex}.description`)}
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
              `events.${eventIndex}.hazards.${hazardIndex}.consequences.${consequenceIndex}.description`
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
            `events.${eventIndex}.hazards.${hazardIndex}.consequences.${consequenceIndex}.currentControls`
          )}
          rows={2}
          placeholder="List current control measures"
          className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>
    </div>
  </div>
);

export default function HazardIdentification({ onSubmit, initialData }) {
  const { hazards, updateFormData } = useFormStore();

  console.log('Initial Data:', initialData); // Debug log
  console.log('Form Store Hazards:', hazards); // Debug log

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

  // Get initial events from various sources, with fallback to default
  const initialEvents = initialData?.events || 
                       (hazards?.events || []).length > 0 ? hazards.events : 
                       [defaultEvent];

  const { register, control, handleSubmit, watch } = useForm({
    defaultValues: {
      events: initialEvents
    }
  });

  // Watch form values for debugging
  const watchEvents = watch('events');
  console.log('Watched Events:', watchEvents);

  const { fields: events, append: appendEvent, remove: removeEvent } = useFieldArray({
    control,
    name: "events"
  });

  const handleFormSubmit = (data) => {
    // Ensure all IDs are preserved and data is properly structured
    const formattedData = {
      events: data.events.map(event => ({
        uniqueId: event.uniqueId || uuidv4(),
        name: event.name,
        hazards: event.hazards.map(hazard => ({
          uniqueId: hazard.uniqueId || uuidv4(),
          description: hazard.description,
          consequences: hazard.consequences.map(consequence => ({
            uniqueId: consequence.uniqueId || uuidv4(),
            description: consequence.description,
            currentControls: consequence.currentControls || ''
          }))
        }))
      }))
    };

    console.log('Submitting Hazard Data:', formattedData); // Debug log

    // Update form store before submitting
    updateFormData(2, formattedData);

    // Submit the data
    onSubmit(formattedData);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto p-6">
      <div className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Hazard Identification</h2>

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
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                Next Step
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

HazardIdentification.propTypes = {
  onSubmit: PropTypes.func.isRequired,
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
