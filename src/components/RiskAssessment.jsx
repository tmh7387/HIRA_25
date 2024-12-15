import React from 'react';
import PropTypes from 'prop-types';
import { useForm } from 'react-hook-form';
import RiskMatrixSelector from './RiskMatrixSelector';
import RiskMatrixReference from './RiskMatrixReference';
import AssessmentForm from './AssessmentForm';
import useFormStore from '../stores/formStore';

export default function RiskAssessment({ events, onSubmit, initialData = [] }) {
  const { hazards } = useFormStore();
  const currentEvents = hazards?.events || events;

  // Ensure we have an array of events
  const eventsArray = Array.isArray(currentEvents) ? currentEvents : [];

  console.log('Events Array:', eventsArray); // Debug log

  const { register, handleSubmit, watch, setValue } = useForm({
    defaultValues: {
      assessments: initialData.length > 0 ? initialData : eventsArray.flatMap(event => 
        event.hazards.flatMap(hazard =>
          hazard.consequences.map(consequence => ({
            uniqueId: consequence.uniqueId,
            event: event.name,
            eventId: event.uniqueId,
            hazard: hazard.description,
            hazardId: hazard.uniqueId,
            consequence: consequence.description,
            consequenceId: consequence.uniqueId,
            currentControls: consequence.currentControls,
            probability: '',
            severity: '',
            likelihood: '',
            impact: '',
            tolerability: ''
          }))
        )
      )
    }
  });

  const watchAssessments = watch('assessments') || [];

  console.log('Watch Assessments:', watchAssessments); // Debug log

  // Group assessments by event
  const groupedAssessments = watchAssessments.reduce((acc, assessment) => {
    if (!acc[assessment.event]) {
      acc[assessment.event] = {
        event: assessment.event,
        assessments: []
      };
    }
    acc[assessment.event].assessments.push(assessment);
    return acc;
  }, {});

  console.log('Grouped Assessments:', groupedAssessments); // Debug log

  const handleFormSubmit = (data) => {
    // Ensure all necessary fields are included and properly formatted
    const formattedData = {
      assessments: (data.assessments || []).map(assessment => ({
        uniqueId: assessment.uniqueId,
        event: assessment.event,
        eventId: assessment.eventId,
        hazard: assessment.hazard,
        hazardId: assessment.hazardId,
        consequence: assessment.consequence,
        consequenceId: assessment.consequenceId,
        currentControls: assessment.currentControls,
        probability: assessment.probability ? parseInt(assessment.probability, 10) : null,
        severity: assessment.severity || null,
        likelihood: assessment.likelihood ? parseInt(assessment.likelihood, 10) : null,
        impact: assessment.impact ? parseInt(assessment.impact, 10) : null,
        tolerability: assessment.tolerability || null
      }))
    };

    // Log the data being submitted for debugging
    console.log('Submitting assessment data:', formattedData);
    
    onSubmit(formattedData);
  };

  // Only render AssessmentForm if we have assessments
  const hasAssessments = Object.keys(groupedAssessments).length > 0;

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Risk Assessment</h2>
        <RiskMatrixSelector />
        <RiskMatrixReference />
      </div>

      {hasAssessments ? (
        <AssessmentForm 
          groupedAssessments={groupedAssessments}
          setValue={setValue}
          onSubmit={handleSubmit(handleFormSubmit)}
        />
      ) : (
        <div className="bg-white rounded-lg shadow-md p-6">
          <p className="text-gray-600 text-center">
            No hazards or consequences found. Please add hazards in the previous step.
          </p>
        </div>
      )}
    </div>
  );
}

RiskAssessment.propTypes = {
  events: PropTypes.arrayOf(PropTypes.shape({
    uniqueId: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    hazards: PropTypes.arrayOf(PropTypes.shape({
      uniqueId: PropTypes.string.isRequired,
      description: PropTypes.string.isRequired,
      consequences: PropTypes.arrayOf(PropTypes.shape({
        uniqueId: PropTypes.string.isRequired,
        description: PropTypes.string.isRequired,
        currentControls: PropTypes.string.isRequired
      }))
    }))
  })).isRequired,
  onSubmit: PropTypes.func.isRequired,
  initialData: PropTypes.array
};
