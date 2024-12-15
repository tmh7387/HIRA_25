import React from 'react';
import PropTypes from 'prop-types';
import { useRiskMatrixStore } from '../stores/riskMatrixStore';
import ICAORiskMatrix from './ICAORiskMatrix';
import IntegratedRiskMatrix from './IntegratedRiskMatrix';
import { calculateICAORiskTolerability } from '../utils/riskCalculations';

export default function AssessmentForm({ groupedAssessments, setValue, onSubmit }) {
  const { matrixType } = useRiskMatrixStore();

  const handleMatrixChange = (assessmentId, values) => {
    // Get all assessments as a flat array
    const allAssessments = Object.values(groupedAssessments)
      .flatMap(group => group.assessments);

    // Find the index of the assessment
    const assessmentIndex = allAssessments
      .findIndex(assessment => assessment.uniqueId === assessmentId);

    if (assessmentIndex === -1) return;

    // Get the assessment to ensure we preserve its consequenceId
    const assessment = allAssessments[assessmentIndex];

    if (matrixType === 'ICAO') {
      setValue(`assessments.${assessmentIndex}.probability`, values.probability);
      setValue(`assessments.${assessmentIndex}.severity`, values.severity);
      if (values.probability && values.severity) {
        const tolerability = calculateICAORiskTolerability(values.probability, values.severity);
        setValue(`assessments.${assessmentIndex}.tolerability`, tolerability);
      }
      // Ensure consequenceId is preserved
      setValue(`assessments.${assessmentIndex}.consequenceId`, assessment.consequenceId);
    } else {
      setValue(`assessments.${assessmentIndex}.likelihood`, values.likelihood);
      setValue(`assessments.${assessmentIndex}.impact`, values.impact);
      // Ensure consequenceId is preserved
      setValue(`assessments.${assessmentIndex}.consequenceId`, assessment.consequenceId);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {Object.entries(groupedAssessments).map(([eventId, { event, assessments }]) => (
        <div key={eventId} className="bg-white rounded-lg shadow p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">{event}</h3>
          
          <div className="space-y-6">
            {assessments.map((assessment) => (
              <div key={assessment.uniqueId} className="bg-gray-50 rounded-lg p-4">
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
                  <p className="text-gray-600">{assessment.currentControls}</p>
                </div>

                {matrixType === 'ICAO' ? (
                  <ICAORiskMatrix
                    key={`matrix-${assessment.uniqueId}`}
                    probability={assessment.probability}
                    severity={assessment.severity}
                    onChange={(values) => handleMatrixChange(assessment.uniqueId, values)}
                    showTolerability={true}
                  />
                ) : (
                  <IntegratedRiskMatrix
                    key={`matrix-${assessment.uniqueId}`}
                    likelihood={assessment.likelihood}
                    impact={assessment.impact}
                    onChange={(values) => handleMatrixChange(assessment.uniqueId, values)}
                    showRiskLevel={true}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      ))}

      <div className="flex justify-end">
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Next Step
        </button>
      </div>
    </form>
  );
}

AssessmentForm.propTypes = {
  groupedAssessments: PropTypes.object.isRequired,
  setValue: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired
};
