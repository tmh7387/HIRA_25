import React from 'react';
import PropTypes from 'prop-types';
import { useForm } from 'react-hook-form';
import { useRiskMatrixStore } from '../stores/riskMatrixStore';
import { calculateRiskRating } from '../utils/riskCalculations';
import useFormStore from '../stores/formStore';

export default function RiskControls({ assessments, onSubmit, initialData }) {
  const { matrixType } = useRiskMatrixStore();
  const { currentProject, getCurrentProjectId } = useFormStore();
  
  // Use stored assessments if available, otherwise use props
  const currentAssessments = currentProject?.assessments || assessments;
  
  // Ensure we have an array to work with
  const assessmentsArray = Array.isArray(currentAssessments) ? currentAssessments : [];
  
  // Filter assessments based on risk level
  const filteredAssessments = assessmentsArray.filter(assessment => {
    if (matrixType === 'ICAO') {
      return assessment.tolerability !== 'ACCEPTABLE';
    } else {
      const riskRating = calculateRiskRating(assessment.likelihood || 0, assessment.impact || 0);
      return riskRating !== 'Low';
    }
  });

  // If we have initialData, match it with filtered assessments
  const defaultControls = initialData 
    ? filteredAssessments.map(assessment => {
        const existingControl = initialData.find(control => 
          control.consequence === assessment.consequence
        );
        return {
          consequence: assessment.consequence,
          consequenceId: assessment.consequenceId,
          additionalMitigation: existingControl?.additionalMitigation || '',
          riskOwner: existingControl?.riskOwner || '',
          targetDate: existingControl?.targetDate || '',
          dateImplemented: existingControl?.dateImplemented || ''
        };
      })
    : filteredAssessments.map(assessment => ({
        consequence: assessment.consequence,
        consequenceId: assessment.consequenceId,
        additionalMitigation: '',
        riskOwner: '',
        targetDate: '',
        dateImplemented: ''
      }));

  const { register, handleSubmit } = useForm({
    defaultValues: {
      controls: defaultControls
    }
  });

  const onFormSubmit = (data) => {
    // Get the current project ID
    const projectId = getCurrentProjectId();
    if (!projectId) {
      console.error('No project ID found');
      return;
    }

    // Ensure we're sending the exact structure expected by controlService
    onSubmit({
      projectId,
      controls: data.controls.map(control => ({
        consequence: control.consequence,
        consequenceId: control.consequenceId,
        additionalMitigation: control.additionalMitigation || '',
        riskOwner: control.riskOwner || '',
        targetDate: control.targetDate || null,
        dateImplemented: control.dateImplemented || null
      }))
    });
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
      // ICAO styles
      'INTOLERABLE': 'bg-red-200 text-red-800',
      'TOLERABLE': 'bg-yellow-100 text-yellow-800',
      // Integrated matrix styles
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

        <form onSubmit={handleSubmit(onFormSubmit)}>
          <div className="space-y-8">
            {Object.entries(groupedAssessments).map(([event, eventAssessments]) => (
              <div key={event} className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">{event}</h3>
                <div className="space-y-6">
                  {eventAssessments.map((assessment, index) => {
                    const riskIndicator = getRiskIndicator(assessment);
                    return (
                      <div key={assessment.uniqueId} className="bg-white rounded-lg p-4 shadow-sm">
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
                              {...register(`controls.${index}.consequence`)} 
                              defaultValue={assessment.consequence}
                            />
                            <input 
                              type="hidden" 
                              {...register(`controls.${index}.consequenceId`)} 
                              defaultValue={assessment.consequenceId}
                            />
                          </div>

                          <div>
                            <h4 className="font-medium text-gray-700">Current Controls</h4>
                            <p className="text-gray-600">{assessment.currentControls}</p>
                          </div>

                          <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getRiskIndicatorStyle(riskIndicator)}`}>
                            Risk Level: {riskIndicator}
                          </div>

                          <div className="grid grid-cols-1 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700">Additional Mitigation Measures</label>
                              <textarea
                                {...register(`controls.${index}.additionalMitigation`)}
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
                                  {...register(`controls.${index}.riskOwner`)}
                                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                  required
                                />
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-gray-700">Target Date</label>
                                <input
                                  type="date"
                                  {...register(`controls.${index}.targetDate`)}
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

RiskControls.propTypes = {
  assessments: PropTypes.arrayOf(PropTypes.shape({
    uniqueId: PropTypes.string.isRequired,
    event: PropTypes.string.isRequired,
    hazard: PropTypes.string.isRequired,
    consequence: PropTypes.string.isRequired,
    consequenceId: PropTypes.string.isRequired,
    currentControls: PropTypes.string.isRequired,
    // ICAO matrix props
    probability: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    severity: PropTypes.string,
    tolerability: PropTypes.string,
    // Integrated matrix props
    likelihood: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    impact: PropTypes.oneOfType([PropTypes.number, PropTypes.string])
  })).isRequired,
  onSubmit: PropTypes.func.isRequired,
  initialData: PropTypes.arrayOf(PropTypes.shape({
    consequence: PropTypes.string.isRequired,
    consequenceId: PropTypes.string.isRequired,
    additionalMitigation: PropTypes.string,
    riskOwner: PropTypes.string,
    targetDate: PropTypes.string,
    dateImplemented: PropTypes.string
  }))
};
