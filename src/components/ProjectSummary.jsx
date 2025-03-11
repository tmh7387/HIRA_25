import React from 'react';
import useProjectStore from '../stores/projectStore';
import { useRiskMatrixStore } from '../stores/riskMatrixStore';
import { calculateRiskRating } from '../utils/riskCalculations';

export default function ProjectSummary() {
  const { 
    currentProject,
    projectDetails,
    hazardIdentificationData,
    riskAssessmentData,
    riskControlsData 
  } = useProjectStore();
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
        'Extreme': 'bg-red-100 text-red-800',
        'High': 'bg-orange-100 text-orange-800',
        'Medium': 'bg-yellow-100 text-yellow-800',
        'Low': 'bg-green-100 text-green-800'
      };
      return styles[riskRating] || 'bg-gray-100';
    }
  };

  const summaryData = {
    projectId: currentProject?.id || '',
    title: projectDetails?.title || '',
    date: projectDetails?.date || '',
    facilitator: projectDetails?.facilitator || {},
    assessments: riskAssessmentData?.assessments?.map(assessment => {
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

      const controlInfo = riskControlsData?.controls?.find(control => 
        control.assessment_id === assessment.id
      );

      return {
        assessment_id: assessment.id,
        event: eventInfo?.name || '',
        hazard: hazardInfo?.description || '',
        consequence: consequenceInfo?.description || '',
        current_controls: consequenceInfo?.current_controls || '',
        additional_mitigation: controlInfo?.additional_mitigation || '',
        probability: assessment.probability,
        severity: assessment.severity,
        likelihood: assessment.likelihood,
        impact: assessment.impact,
        tolerability: assessment.tolerability
      };
    }) || []
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Project Summary</h2>

        <div className="space-y-6">
          {/* Project Details */}
          <section className="border-b pb-6">
            <h3 className="text-lg font-semibold mb-4">Project Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Project Title</p>
                <p className="font-medium">{summaryData.title}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Project ID</p>
                <p className="font-medium">{summaryData.projectId}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Date</p>
                <p className="font-medium">{summaryData.date}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Facilitator</p>
                <p className="font-medium">{summaryData.facilitator.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Designation</p>
                <p className="font-medium">{summaryData.facilitator.designation}</p>
              </div>
            </div>
          </section>

          {/* Risk Assessment Summary */}
          <section>
            <h3 className="text-lg font-semibold mb-4">Risk Assessments</h3>
            <div className="space-y-4">
              {summaryData.assessments.map((assessment) => (
                <div key={assessment.assessment_id} className="border rounded-lg p-4">
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
                    {assessment.additional_mitigation && (
                      <div>
                        <p className="text-sm text-gray-600">Additional Mitigation</p>
                        <p>{assessment.additional_mitigation}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="mt-6 flex justify-end space-x-4">
          <button
            onClick={() => window.print()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Export Report
          </button>
        </div>
      </div>
    </div>
  );
}