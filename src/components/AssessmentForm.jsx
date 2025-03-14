import React from 'react';
import PropTypes from 'prop-types';
import { useRiskMatrixStore } from '../stores/riskMatrixStore';
import ICAORiskMatrix from './ICAORiskMatrix';
import IntegratedRiskMatrix from './IntegratedRiskMatrix';
import { calculateICAORiskTolerability } from '../utils/riskCalculations';

export default function AssessmentForm({ groupedAssessments, setValue, onSubmit, isSubmitting }) {
  const { matrixType } = useRiskMatrixStore();

  // Flatten assessments list for indexing
  const allAssessments = Object.values(groupedAssessments).flatMap(group => group.assessments);

  const handleMatrixChange = (assessmentId, values) => {
    const assessmentIndex = allAssessments.findIndex(
      (a) => a.consequence_id === assessmentId
    );

    if (assessmentIndex === -1) {
      console.error('Assessment not found for consequence_id:', assessmentId);
      return;
    }

    console.log(
      'Updating assessment:',
      assessmentId,
      'at index:',
      assessmentIndex,
      'with values:',
      values
    );

    if (matrixType === 'ICAO') {
      setValue(`assessments.${assessmentIndex}.probability`, values.probability);
      setValue(`assessments.${assessmentIndex}.severity`, values.severity);
      if (values.probability && values.severity) {
        const tolerability = calculateICAORiskTolerability(values.probability, values.severity);
        setValue(`assessments.${assessmentIndex}.tolerability`, tolerability);
      }
    } else {
      setValue(`assessments.${assessmentIndex}.likelihood`, values.likelihood);
      setValue(`assessments.${assessmentIndex}.impact`, values.impact);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {Object.entries(groupedAssessments).map(([event_id, { event, assessments }], groupIndex) => (
        <div key={`group-${event_id}-${groupIndex}`} className="bg-white rounded-lg shadow p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">{event}</h3>

          <div className="space-y-6">
            {assessments.map((assessment, index) => (
              <div key={`assessment-${assessment.consequence_id}-${index}`} className="bg-gray-50 rounded-lg p-4">
                <div className="mb-4">
                  <h4 className="font-medium text-gray-700">Hazard</h4>
                  <p className="text-gray-600">{assessment.hazard}</p>
                </div>

                <div className="mb-4">
                  <h4 className="font-medium text-gray-700">Consequence</h4>
                  <p className="text-gray-600">{assessment.consequence}</p>
                </div>

                <div className="mb-4">
                  <h4 className="font-medium text-gray-700">Current Controls</h4>
                  <p className="text-gray-600">{assessment.current_controls}</p>
                </div>

                <div>
                  {matrixType === 'ICAO' ? (
                    <ICAORiskMatrix
                      probability={assessment.probability}
                      severity={assessment.severity}
                      onChange={(values) => handleMatrixChange(assessment.consequence_id, values)}
                      showTolerability={true}
                      tolerability={assessment.tolerability}
                    />
                  ) : (
                    <IntegratedRiskMatrix
                      likelihood={assessment.likelihood}
                      impact={assessment.impact}
                      onChange={(values) => handleMatrixChange(assessment.consequence_id, values)}
                      showRiskLevel={true}
                    />
                  )}
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
          className={`px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200 ${
            isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {isSubmitting ? 'Saving...' : 'Next Step'}
        </button>
      </div>
    </form>
  );
}

AssessmentForm.propTypes = {
  groupedAssessments: PropTypes.object.isRequired,
  setValue: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  isSubmitting: PropTypes.bool
};
