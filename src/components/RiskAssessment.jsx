import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { supabase } from '../services/supabase';
import RiskMatrixSelector from './RiskMatrixSelector';
import RiskMatrixReference from './RiskMatrixReference';
import AssessmentForm from './AssessmentForm';
import useProjectStore from '../stores/projectStore';
import { useRiskMatrixStore } from '../stores/riskMatrixStore';
import { updateAssessments } from '../services/riskAssessmentService';

// Error Alert Component
const ErrorAlert = ({ message }) => {
  if (!message) return null;

  return (
    <div className="p-4 mb-4 bg-red-50 border border-red-200 rounded-lg">
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293-1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
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
  const {
    currentProject,
    hazardIdentificationData,
    riskAssessmentData,
    setStepData,
    setCurrentStep,
    error: storeError,
  } = useProjectStore();
  const { matrixType, setMatrixType } = useRiskMatrixStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localError, setLocalError] = useState(null);
  const events = hazardIdentificationData?.events || [];

 // Set up form with default values from hazard identification
 const defaultValues = {
  assessments: events.flatMap(event =>
    (event.hazards || []).flatMap(hazard =>
      (hazard.consequences || [])
        .filter(consequence => consequence && consequence.consequence_id) // Updated to use consequence_id
        .map(consequence => ({
          assessment_id: null,
          consequence_id: consequence.consequence_id, // Updated to use consequence_id
          event: event.name,
          event_id: event.id,
          hazard: hazard.description,
          hazard_id: hazard.id,
          consequence: consequence.description,
          current_controls: consequence.current_controls || '',
          probability: '',
          severity: '',
          likelihood: '',
          impact: '',
          tolerability: ''
        }))
    )
  )
};
  const { register, handleSubmit, watch, setValue } = useForm({ defaultValues });
  const watchAssessments = watch('assessments');

  // Save data changes to store
  useEffect(() => {
    const saveData = async () => {
      try {
        if (!watchAssessments?.length) return;

        // Filter assessments based on matrix type and required fields
        const validAssessments = watchAssessments.filter(assessment => {
          if (matrixType === 'ICAO') {
            return assessment.probability && assessment.severity;
          }
          return assessment.likelihood && assessment.impact;
        });

        if (validAssessments.length > 0) {
          const formattedData = {
            assessments: validAssessments.map(assessment => {
              const baseData = {
                consequence_id: assessment.consequence_id,
                probability: assessment.probability ? parseInt(assessment.probability, 10) : null,
                severity: assessment.severity || null,
                likelihood: assessment.likelihood ? parseInt(assessment.likelihood, 10) : null,
                impact: assessment.impact ? parseInt(assessment.impact, 10) : null,
                tolerability: assessment.tolerability || null
              };

              if (assessment.assessment_id) {
                baseData.id = assessment.assessment_id;
              }

              return baseData;
            })
          };

          await setStepData(3, formattedData);
        }
      } catch (error) {
        console.error('Error auto-saving:', error);
      }
    };

    const timeoutId = setTimeout(saveData, 1000);
    return () => clearTimeout(timeoutId);
  }, [watchAssessments, setStepData, matrixType]);

  // Load existing assessments
  useEffect(() => {
    const loadExistingAssessments = async () => {
      if (!currentProject?.id) return;

      try {
        setLocalError(null);
        const formAssessments = watchAssessments;

        // Get array of consequence_ids from form assessments
        const consequenceIds = formAssessments.map(a => a.consequence_id);

        // Load existing risk assessments by consequence_ids
        const { data: assessments, error: queryError } = await supabase
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
          .in('consequence_id', consequenceIds);

        if (queryError) throw queryError;

        // Map the assessments data to the form fields
        assessments.forEach(assessment => {
          const index = formAssessments.findIndex(
            a => a.consequence_id === assessment.consequence_id
          );

          if (index !== -1) {
            setValue(`assessments.${index}.assessment_id`, assessment.id);
            setValue(`assessments.${index}.probability`, assessment.probability || '');
            setValue(`assessments.${index}.severity`, assessment.severity || '');
            setValue(`assessments.${index}.likelihood`, assessment.likelihood || '');
            setValue(`assessments.${index}.impact`, assessment.impact || '');
            setValue(`assessments.${index}.tolerability`, assessment.tolerability || '');

            if (!matrixType && assessment.matrix_type) {
              setMatrixType(assessment.matrix_type);
            }
          }
        });
      } catch (error) {
        console.error('Error loading existing assessments:', error);
        setLocalError('Failed to load existing assessments. Please try again.');
      }
    };

    loadExistingAssessments();
  }, [currentProject?.id, setValue, setMatrixType, watchAssessments]);

  const handleFormSubmit = async data => {
    try {
      setIsSubmitting(true);
      setLocalError(null);

      const { assessments } = data;
      // Format the data to match the service's expected structure
      const formattedData = {
        assessments: assessments.map(assessment => {
          const baseData = {
            consequence_id: assessment.consequence_id,
            probability: assessment.probability ? parseInt(assessment.probability, 10) : null,
            severity: assessment.severity || null,
            likelihood: assessment.likelihood ? parseInt(assessment.likelihood, 10) : null,
            impact: assessment.impact ? parseInt(assessment.impact, 10) : null,
            tolerability: assessment.tolerability || null
          };

          if (assessment.assessment_id) {
            baseData.id = assessment.assessment_id;
          }

          return baseData;
        }),
      };

      const result = await updateAssessments(formattedData, matrixType);

      if (!result) {
        throw new Error('Failed to save assessments.');
      }

      const saved = await setStepData(3, result);
      if (!saved) throw new Error('Failed to save risk assessment data to store.');

      setCurrentStep(4);
    } catch (error) {
      console.error('Error submitting form:', error);
      setLocalError(error.message || 'Failed to save risk assessments. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Risk Assessment</h2>
        <RiskMatrixSelector />
        <RiskMatrixReference />
      </div>

      {(storeError || localError) && <ErrorAlert message={localError || storeError} />}

      {Object.keys(watchAssessments || {}).length > 0 ? (
        <AssessmentForm
          groupedAssessments={watchAssessments.reduce((acc, assessment) => {
            if (!acc[assessment.event_id]) {
              acc[assessment.event_id] = { event: assessment.event, assessments: [] };
            }
            acc[assessment.event_id].assessments.push(assessment);
            return acc;
          }, {})}
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