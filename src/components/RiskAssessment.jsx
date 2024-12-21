import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import RiskMatrixSelector from './RiskMatrixSelector';
import RiskMatrixReference from './RiskMatrixReference';
import AssessmentForm from './AssessmentForm';
import useProjectStore from '../stores/projectStore';
import { useRiskMatrixStore } from '../stores/riskMatrixStore';
import { updateAssessments, getAssessmentsByConsequenceId } from '../services/riskAssessmentService';

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

export default function RiskAssessment() {
  const { currentProject, hazardIdentificationData, riskAssessmentData, setStepData, setCurrentStep, error: storeError } = useProjectStore();
  const { matrixType, setMatrixType } = useRiskMatrixStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localError, setLocalError] = useState(null);
  const events = hazardIdentificationData?.events || [];

  console.log('Initial events:', events);

  // Local state for form data
  const [formData, setFormData] = useState(() => ({
    assessments: events.flatMap(event =>
      (event.hazards || []).flatMap(hazard =>
        (hazard.consequences || []).map(consequence => {
          console.log('Setting up consequence:', consequence);
          console.log('Consequence ID:', consequence.id);
          console.log('Consequence uniqueId:', consequence.uniqueId);
          return {
            consequence_id: consequence.uniqueId, // The unique identifier for this consequence
            event: event.name,
            event_id: event.id,
            hazard: hazard.description,
            hazard_id: hazard.id,
            consequence: consequence.description,
            current_controls: consequence.current_controls,
            probability: '',
            severity: '',
            likelihood: '',
            impact: '',
            tolerability: ''
          };
        })
      )
    )
  }));

  // Create form with local state
  const { register, handleSubmit, watch, setValue, reset } = useForm({
    defaultValues: formData
  });

  // Watch form changes and auto-save
  const watchAllFields = watch();
  useEffect(() => {
    const saveData = async () => {
      try {
        const currentData = watchAllFields;
        if (!currentData?.assessments?.length) return;

        // Filter out incomplete assessments
        const validAssessments = currentData.assessments.filter(assessment => {
          if (matrixType === 'ICAO') {
            return assessment.probability && assessment.severity;
          } else {
            return assessment.likelihood && assessment.impact;
          }
        });

        if (validAssessments.length > 0) {
          await setStepData(3, { assessments: validAssessments });
        }
      } catch (error) {
        console.error('Error auto-saving:', error);
      }
    };

    // Debounce save to prevent too many requests
    const timeoutId = setTimeout(saveData, 1000);
    return () => clearTimeout(timeoutId);
  }, [watchAllFields, setStepData, matrixType]);

  // Load existing assessments when component mounts or when riskAssessmentData changes
  useEffect(() => {
    const loadExistingAssessments = async () => {
      if (!currentProject?.id) return;

      try {
        setLocalError(null);

        // If we have data in the store, use that
        if (riskAssessmentData?.assessments) {
          console.log('Using stored assessments:', riskAssessmentData.assessments);
          
          // Find matching assessments by consequence_id
          const formAssessments = watch('assessments');
          console.log('Form assessments:', formAssessments);

          riskAssessmentData.assessments.forEach(assessment => {
            const index = formAssessments.findIndex(a => a.consequence_id === assessment.consequence_id);
            console.log('Found assessment at index:', index, 'for consequence_id:', assessment.consequence_id);
            
            if (index !== -1) {
              setValue(`assessments.${index}.probability`, assessment.probability);
              setValue(`assessments.${index}.severity`, assessment.severity);
              setValue(`assessments.${index}.likelihood`, assessment.likelihood);
              setValue(`assessments.${index}.impact`, assessment.impact);
              setValue(`assessments.${index}.tolerability`, assessment.tolerability);
            }
          });

          if (riskAssessmentData.assessments[0]?.matrixType) {
            setMatrixType(riskAssessmentData.assessments[0].matrixType);
          }
          return;
        }

        // Load assessments for each consequence
        const formAssessments = watch('assessments');
        for (const assessment of formAssessments) {
          const existingAssessment = await getAssessmentsByConsequenceId(assessment.consequence_id);
          if (existingAssessment) {
            const index = formAssessments.findIndex(a => a.consequence_id === existingAssessment.consequence_id);
            if (index !== -1) {
              setValue(`assessments.${index}.probability`, existingAssessment.probability);
              setValue(`assessments.${index}.severity`, existingAssessment.severity);
              setValue(`assessments.${index}.likelihood`, existingAssessment.likelihood);
              setValue(`assessments.${index}.impact`, existingAssessment.impact);
              setValue(`assessments.${index}.tolerability`, existingAssessment.tolerability);

              // Set matrix type from first assessment
              if (existingAssessment.matrix_type) {
                setMatrixType(existingAssessment.matrix_type);
              }
            }
          }
        }
      } catch (error) {
        console.error('Error loading existing assessments:', error);
        setLocalError('Failed to load existing assessments. Please try again.');
      }
    };

    loadExistingAssessments();
  }, [currentProject?.id, setValue, setMatrixType, riskAssessmentData, watch]);

  const watchAssessments = watch('assessments') || [];
  console.log('Watched assessments:', watchAssessments);

  // Group assessments by event
  const groupedAssessments = watchAssessments.reduce((acc, assessment) => {
    if (!acc[assessment.event_id]) {
      acc[assessment.event_id] = {
        event: assessment.event,
        assessments: []
      };
    }
    acc[assessment.event_id].assessments.push(assessment);
    return acc;
  }, {});

  const handleFormSubmit = async (data) => {
    try {
      setIsSubmitting(true);
      setLocalError(null);

      // Check if we have a current project
      if (!currentProject?.id) {
        throw new Error('No active project found. Please ensure the project is created first.');
      }

      // Validate that all required fields are filled
      const hasEmptyFields = data.assessments.some(assessment => {
        if (!assessment.consequence_id) {
          console.error('Missing consequence_id for assessment:', assessment);
          return true;
        }
        if (matrixType === 'ICAO') {
          return !assessment.probability || !assessment.severity;
        } else {
          return !assessment.likelihood || !assessment.impact;
        }
      });

      if (hasEmptyFields) {
        throw new Error('Please fill in all required fields for each assessment.');
      }

      console.log('Submitting form data:', data);
      console.log('Assessments with consequence_ids:', data.assessments.map(a => ({
        consequence_id: a.consequence_id,
        event: a.event,
        hazard: a.hazard
      })));
      
      // Format and validate the data before submitting
      const formattedData = {
        assessments: data.assessments.map(assessment => ({
          consequence_id: assessment.consequence_id,
          event: assessment.event,
          event_id: assessment.event_id,
          hazard: assessment.hazard,
          hazard_id: assessment.hazard_id,
          consequence: assessment.consequence,
          current_controls: assessment.current_controls,
          probability: assessment.probability ? parseInt(assessment.probability) : null,
          severity: assessment.severity || null,
          likelihood: assessment.likelihood ? parseInt(assessment.likelihood) : null,
          impact: assessment.impact ? parseInt(assessment.impact) : null,
          tolerability: assessment.tolerability || null
        }))
      };

      console.log('Formatted data:', formattedData);
      
      // Save assessments with matrix type
      const result = await updateAssessments(currentProject.id, formattedData, matrixType);
      console.log('Save result:', result);
      
      // Update store
      const saved = await setStepData(3, result);
      if (!saved) {
        throw new Error('Failed to save risk assessment data');
      }

      // Navigate to next step
      setCurrentStep(4);
    } catch (error) {
      console.error('Error saving risk assessments:', error);
      setLocalError(error.message || 'Failed to save risk assessments. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
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

      {(storeError || localError) && (
        <ErrorAlert message={localError || storeError} />
      )}

      {hasAssessments ? (
        <AssessmentForm 
          groupedAssessments={groupedAssessments}
          setValue={setValue}
          onSubmit={handleSubmit(handleFormSubmit)}
          isSubmitting={isSubmitting}
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
