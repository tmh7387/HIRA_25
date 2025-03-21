import React from 'react';
import PropTypes from 'prop-types';
import { ArrowLeft, Edit, Printer } from 'lucide-react';
import { useRiskMatrixStore } from '../stores/riskMatrixStore';
import { calculateRiskRating } from '../utils/riskCalculations';

export default function ProjectSummary({ project, onEdit, onBack }) {
  const { matrixType } = useRiskMatrixStore();

  const getRiskLevelStyle = (assessment) => {
    if (matrixType === 'ICAO') {
      const styles = {
        'INTOLERABLE': 'bg-red-100 text-red-800',
        'TOLERABLE': 'bg-yellow-100 text-yellow-800',
        'ACCEPTABLE': 'bg-green-100 text-green-800'
      };
      return styles[assessment.tolerability] || 'bg-gray-100';
    } else {
      const riskRating = calculateRiskRating(assessment.likelihood, assessment.impact);
      const styles = {
        'High': 'bg-red-100 text-red-800',
        'Moderate': 'bg-orange-100 text-orange-800',
        'Medium': 'bg-yellow-100 text-yellow-800',
        'Low': 'bg-green-100 text-green-800'
      };
      return styles[riskRating] || 'bg-gray-100';
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-6 flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </button>
        <div className="flex space-x-4">
          <button
            onClick={onEdit}
            className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Edit className="w-4 h-4 mr-2" />
            Edit Project
          </button>
          <button
            onClick={() => window.print()}
            className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Printer className="w-4 h-4 mr-2" />
            Export Report
          </button>
        </div>
      </div>

      <div className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Project Summary</h2>

        <div className="space-y-6">
          {/* Project Details */}
          <section className="border-b pb-6">
            <h3 className="text-lg font-semibold mb-4">Project Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Project Title</p>
                <p className="font-medium">{project.title}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Project ID</p>
                <p className="font-medium">{project.projectId}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Date</p>
                <p className="font-medium">{project.date}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Facilitator</p>
                <p className="font-medium">{project.facilitator.name}</p>
              </div>
            </div>
          </section>

          {/* Risk Assessment Summary */}
          {project.assessments && project.assessments.length > 0 && (
            <section>
              <h3 className="text-lg font-semibold mb-4">Risk Assessments</h3>
              <div className="space-y-4">
                {project.assessments.map((assessment) => (
                  <div key={assessment.uniqueId} className="border rounded-lg p-4">
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-gray-600">Event</p>
                        <p className="font-medium">{assessment.event}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Risk Level</p>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRiskLevelStyle(assessment)}`}>
                          {matrixType === 'ICAO' ? assessment.tolerability : calculateRiskRating(assessment.likelihood, assessment.impact)}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div>
                        <p className="text-sm text-gray-600">Hazard</p>
                        <p>{assessment.hazard}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Consequence</p>
                        <p>{assessment.consequence}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Current Controls</p>
                        <p>{assessment.currentControls}</p>
                      </div>
                      {assessment.additionalMitigation && (
                        <div>
                          <p className="text-sm text-gray-600">Additional Mitigation</p>
                          <p>{assessment.additionalMitigation}</p>
                        </div>
                      )}
                      {assessment.riskOwner && (
                        <div>
                          <p className="text-sm text-gray-600">Risk Owner</p>
                          <p>{assessment.riskOwner}</p>
                        </div>
                      )}
                      {assessment.targetDate && (
                        <div>
                          <p className="text-sm text-gray-600">Target Date</p>
                          <p>{assessment.targetDate}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}

ProjectSummary.propTypes = {
  project: PropTypes.shape({
    projectId: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    date: PropTypes.string.isRequired,
    facilitator: PropTypes.shape({
      name: PropTypes.string.isRequired,
      designation: PropTypes.string.isRequired
    }).isRequired,
    assessments: PropTypes.array // Make assessments optional
  }).isRequired,
  onEdit: PropTypes.func.isRequired,
  onBack: PropTypes.func.isRequired
};
