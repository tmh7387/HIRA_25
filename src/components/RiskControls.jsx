import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useRiskMatrixStore } from '../stores/riskMatrixStore';
import { calculateRiskRating } from '../utils/riskCalculations';
import useProjectStore from '../stores/projectStore';
import { controlService } from '../services/controlService';

export default function RiskControls() {
  const { currentProject, riskAssessmentData, setStepData } = useProjectStore();
  const { matrixType } = useRiskMatrixStore();
  
  // Get assessments from risk assessment data
  const assessments = riskAssessmentData?.assessments || [];
  
  // Filter assessments based on risk level
  const filteredAssessments = assessments.filter(assessment => {
    if (matrixType === 'ICAO') {
      return assessment.tolerability !== 'ACCEPTABLE';
    } else {
      const riskRating = calculateRiskRating(assessment.likelihood || 0, assessment.impact || 0);
      return riskRating !== 'Low';
    }
  });

  const { register, handleSubmit, setValue } = useForm({
    defaultValues: {
      controls: filteredAssessments.map(assessment => ({
        assessment_id: assessment.id,
        additional_mitigation: '',
        risk_owner: '',
        target_date: '',
        date_implemented: ''
      }))
    }
  });

  // Load existing controls when component mounts
  useEffect(() => {
    const loadExistingControls = async () => {
      if (!currentProject?.id) return;

      try {
        // Load controls for each assessment
        const controlPromises = filteredAssessments.map(assessment =>
          controlService.getRiskControlByAssessmentId(assessment.id)
        );
        
        const controls = await Promise.all(controlPromises);
        
        // Set form values for existing controls
        controls.forEach((control, index) => {
          if (control) {
            setValue(`controls.${index}.additional_mitigation`, control.additional_mitigation);
            setValue(`controls.${index}.risk_owner`, control.risk_owner);
            setValue(`controls.${index}.target_date`, control.target_date);
            setValue(`controls.${index}.date_implemented`, control.date_implemented);
          }
        });
      } catch (error) {
        console.error('Error loading existing controls:', error);
      }
    };

    if (filteredAssessments.length > 0) {
      loadExistingControls();
    }
  }, [currentProject?.id, filteredAssessments, setValue]);

  const handleFormSubmit = async (data) => {
    try {
      console.log('Submitting form data:', data);
      
      // Save each control
      const savedControls = await Promise.all(
        data.controls.map(async control => {
          const existingControl = await controlService.getRiskControlByAssessmentId(control.assessment_id);
          
          if (existingControl) {
            return controlService.updateRiskControl(existingControl.id, control);
          } else {
            return controlService.createRiskControl(control.assessment_id, control);
          }
        })
      );

      // Update store
      await setStepData(4, { controls: savedControls });
    } catch (error) {
      console.error('Error saving risk controls:', error);
    }
  };

  const getRiskIndicator = (assessment) => {
    if (matrixType === 'ICAO') {
      return assessment.tolerability;
    } else {
      return calculateRiskRating(assessment.likelihood || 0, assessment.impact || 0);
    }
  };

  const getRiskIndicatorStyle = (indicator) => {
    const styles = {
      'INTOLERABLE': 'bg-red-200 text-red-800',
      'TOLERABLE': 'bg-yellow-100 text-yellow-800',
      'High': 'bg-red-200 text-red-800',
      'Moderate': 'bg-orange-200 text-orange-800',
      'Medium': 'bg-yellow-100 text-yellow-800'
    };
    return styles[indicator] || 'bg-gray-100 text-gray-800';
  };

  if (filteredAssessments.length === 0) {
    return (
      <div className="space-y-6 max-w-6xl mx-auto p-6">
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Risk Controls</h2>
          <div className="text-center py-8 text-gray-600">
            No risks requiring additional controls were identified.
            All risks are at acceptable/low levels.
          </div>
        </div>
      </div>
    );
  }

  // Group assessments by event
  const groupedAssessments = filteredAssessments.reduce((acc, assessment) => {
    if (!acc[assessment.event]) {
      acc[assessment.event] = [];
    }
    acc[assessment.event].push(assessment);
    return acc;
  }, {});

  return (
    <div className="space-y-6 max-w-6xl mx-auto p-6">
      <div className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Risk Controls</h2>
        <p className="text-sm text-gray-600 mb-6">
          Showing {filteredAssessments.length} risk{filteredAssessments.length !== 1 ? 's' : ''} requiring additional controls.
          {matrixType === 'ICAO' ? 
            ' (Excluding Acceptable risks)' : 
            ' (Excluding Low risks)'}
        </p>

        <form onSubmit={handleSubmit(handleFormSubmit)}>
          <div className="space-y-8">
            {Object.entries(groupedAssessments).map(([event, eventAssessments]) => (
              <div key={event} className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">{event}</h3>
                <div className="space-y-6">
                  {eventAssessments.map((assessment, index) => {
                    const riskIndicator = getRiskIndicator(assessment);
                    return (
                      <div key={assessment.assessment_id} className="bg-white rounded-lg p-4 shadow-sm">
                        <div className="space-y-4">
                          <div>
                            <h4 className="font-medium text-gray-700">Hazard</h4>
                            <p className="text-gray-600">{assessment.hazard}</p>
                          </div>

                          <div>
                            <h4 className="font-medium text-gray-700">Consequence</h4>
                            <p className="text-gray-600">{assessment.consequence}</p>
                            <input 
                              type="hidden" 
                              {...register(`controls.${index}.assessment_id`)} 
                              defaultValue={assessment.assessment_id}
                            />
                          </div>

                          <div>
                            <h4 className="font-medium text-gray-700">Current Controls</h4>
                            <p className="text-gray-600">{assessment.current_controls}</p>
                          </div>

                          <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getRiskIndicatorStyle(riskIndicator)}`}>
                            Risk Level: {riskIndicator}
                          </div>

                          <div className="grid grid-cols-1 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700">Additional Mitigation Measures</label>
                              <textarea
                                {...register(`controls.${index}.additional_mitigation`)}
                                rows={3}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                required
                              />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700">Risk Owner</label>
                                <input
                                  type="text"
                                  {...register(`controls.${index}.risk_owner`)}
                                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                  required
                                />
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-gray-700">Target Date</label>
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
                    );
                  })}
                </div>
              </div>
            ))}

            <div className="flex justify-end">
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Complete Assessment
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
