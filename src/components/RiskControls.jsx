import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { supabase } from '../services/supabase';
import useProjectStore from '../stores/projectStore';
import { useRiskMatrixStore } from '../stores/riskMatrixStore';
import { calculateRiskRating } from '../utils/riskCalculations';
import { controlService } from '../services/controlService';

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

export default function RiskControls() {
  const {
    currentProject,
    hazardIdentificationData,
    riskAssessmentData,
    setStepData,
    setCurrentStep,
    error: storeError,
  } = useProjectStore();
  const { matrixType } = useRiskMatrixStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localError, setLocalError] = useState(null);

  // Filter assessments based on risk level
  const filteredAssessments = riskAssessmentData?.assessments?.filter(assessment => {
    if (matrixType === 'ICAO') {
      return assessment.tolerability !== 'ACCEPTABLE';
    } else {
      const riskRating = calculateRiskRating(assessment.likelihood || 0, assessment.impact || 0);
      return riskRating !== 'Low';
    }
  }) || [];

  // Set up form with default values from risk assessments
  const defaultValues = {
    controls: filteredAssessments.map(assessment => {
      // Find the corresponding event and hazard info
      const eventInfo = hazardIdentificationData?.events?.find(event => 
        event.hazards?.some(hazard => 
          hazard.consequences?.some(cons => cons.consequence_id === assessment.consequence_id)
        )
      );

      const hazardInfo = eventInfo?.hazards?.find(hazard => 
        hazard.consequences?.some(cons => cons.consequence_id === assessment.consequence_id)
      );

      const consequenceInfo = hazardInfo?.consequences?.find(cons => 
        cons.consequence_id === assessment.consequence_id
      );

      return {
        assessment_id: assessment.id,
        event: eventInfo?.name,
        event_id: eventInfo?.id,
        hazard: hazardInfo?.description,
        hazard_id: hazardInfo?.id,
        consequence: consequenceInfo?.description,
        consequence_id: assessment.consequence_id,
        current_controls: consequenceInfo?.current_controls || '',
        tolerability: assessment.tolerability,
        additional_mitigation: '',
        risk_owner: '',
        target_date: '',
        date_implemented: ''
      };
    })
  };

  const { register, handleSubmit, watch, setValue } = useForm({ defaultValues });
  const watchControls = watch('controls');

  // Auto-save functionality
  useEffect(() => {
    const saveData = async () => {
      try {
        if (!watchControls?.length) return;

        const validControls = watchControls.filter(control => 
          control.additional_mitigation?.trim() ||
          control.risk_owner?.trim() ||
          control.target_date
        );

        if (validControls.length > 0) {
          const formattedData = {
            controls: validControls.map(control => ({
              assessment_id: control.assessment_id,
              additional_mitigation: control.additional_mitigation,
              risk_owner: control.risk_owner,
              target_date: control.target_date,
              date_implemented: control.date_implemented
            }))
          };

          await setStepData(4, formattedData);
        }
      } catch (error) {
        console.error('Error auto-saving:', error);
      }
    };

    const timeoutId = setTimeout(saveData, 1000);
    return () => clearTimeout(timeoutId);
  }, [watchControls, setStepData]);

// Load existing controls
useEffect(() => {
  const loadExistingControls = async () => {
    if (!currentProject?.id) return;

    try {
      setLocalError(null);
      const formControls = watchControls;

      if (!formControls?.length) return;

      const assessmentIds = formControls.map(c => c.assessment_id);

      // Load existing risk controls by assessment_ids - using same pattern as RiskAssessment
      const { data: controls, error: queryError } = await supabase
        .from('hira_risk_controls')
        .select(`
          id,
          assessment_id,
          additional_mitigation,
          risk_owner,
          target_date,
          date_implemented
        `)
        .in('assessment_id', assessmentIds);

      if (queryError) throw queryError;

      if (controls) {
        controls.forEach(control => {
          const index = formControls.findIndex(
            c => c.assessment_id === control.assessment_id
          );

          if (index !== -1) {
            setValue(`controls.${index}.additional_mitigation`, control.additional_mitigation || '');
            setValue(`controls.${index}.risk_owner`, control.risk_owner || '');
            setValue(`controls.${index}.target_date`, control.target_date || '');
            setValue(`controls.${index}.date_implemented`, control.date_implemented || '');
          }
        });
      }
    } catch (error) {
      console.error('Error loading existing controls:', error);
      setLocalError('Failed to load existing controls. Please try again.');
    }
  };

  loadExistingControls();
}, [currentProject?.id, setValue, watchControls]);

  const handleFormSubmit = async data => {
    try {
      setIsSubmitting(true);
      setLocalError(null);

      const { controls } = data;
      const formattedData = {
        controls: controls.map(control => ({
          assessment_id: control.assessment_id,
          additional_mitigation: control.additional_mitigation,
          risk_owner: control.risk_owner,
          target_date: control.target_date,
          date_implemented: control.date_implemented
        }))
      };

      // Save controls using service
      const savedControls = await Promise.all(
        formattedData.controls.map(async control => {
          const existingControl = await controlService.getRiskControlByAssessmentId(control.assessment_id);
          
          if (existingControl) {
            return await controlService.updateRiskControl(existingControl.id, control);
          } 
        })
      );

      const saved = await setStepData(4, { controls: savedControls });
      if (!saved) throw new Error('Failed to save risk controls data to store.');

      // Navigate to summary
      setCurrentStep(5);
    } catch (error) {
      console.error('Error submitting form:', error);
      setLocalError(error.message || 'Failed to save risk controls. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Group controls by event
  const groupedControls = watchControls?.reduce((acc, control) => {
    if (!acc[control.event_id]) {
      acc[control.event_id] = { event: control.event, controls: [] };
    }
    acc[control.event_id].controls.push(control);
    return acc;
  }, {}) || {};

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Risk Controls</h2>
        
        {(storeError || localError) && <ErrorAlert message={localError || storeError} />}

        {Object.keys(groupedControls).length > 0 ? (
          <form onSubmit={handleSubmit(handleFormSubmit)}>
            <div className="space-y-8">
              {Object.entries(groupedControls).map(([eventId, { event, controls }]) => (
                <div key={eventId} className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">{event}</h3>
                  <div className="space-y-6">
                    {controls.map((control, index) => (
                      <div key={control.assessment_id} className="bg-white rounded-lg p-4 shadow-sm">
                        <div className="space-y-4">
                          <div>
                            <h4 className="font-medium text-gray-700">Hazard</h4>
                            <p className="text-gray-600">{control.hazard}</p>
                          </div>

                          <div>
                            <h4 className="font-medium text-gray-700">Consequence</h4>
                            <p className="text-gray-600">{control.consequence}</p>
                          </div>

                          <div>
                            <h4 className="font-medium text-gray-700">Current Controls</h4>
                            <p className="text-gray-600">{control.current_controls}</p>
                          </div>

                          <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                            control.tolerability === 'INTOLERABLE' ? 'bg-red-200 text-red-800' :
                            control.tolerability === 'TOLERABLE' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            Risk Level: {control.tolerability}
                          </div>

                          <div className="grid grid-cols-1 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700">
                                Additional Mitigation Measures
                              </label>
                              <textarea
                                {...register(`controls.${index}.additional_mitigation`)}
                                rows={3}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                required
                              />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700">
                                  Risk Owner
                                </label>
                                <input
                                  type="text"
                                  {...register(`controls.${index}.risk_owner`)}
                                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                  required
                                />
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-gray-700">
                                  Target Date
                                </label>
                                <input
                                  type="date"
                                  {...register(`controls.${index}.target_date`)}
                                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                  required
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : 'Complete Assessment'}
                </button>
              </div>
            </div>
          </form>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-6">
            <p className="text-gray-600 text-center">
              No risks requiring additional controls were identified.
              All risks are at acceptable/low levels.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}