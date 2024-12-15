import React from 'react';
import { useRiskMatrixStore } from '../stores/riskMatrixStore';
import { RISK_MATRIX, TOLERABILITY_COLORS } from '../constants/icaoMatrix';
import { calculateRiskScore } from '../constants/integratedMatrix';

export default function FloatingMatrix() {
  const { matrixType } = useRiskMatrixStore();

  const renderICAOMatrix = () => {
    const severityLabels = ['A', 'B', 'C', 'D', 'E'];
    const probabilityLabels = [5, 4, 3, 2, 1];

    const getCellColor = (prob, sev) => {
      const tolerability = RISK_MATRIX[`${prob}${sev}`];
      const baseColor = {
        'INTOLERABLE': 'bg-red-100',
        'TOLERABLE': 'bg-yellow-100',
        'ACCEPTABLE': 'bg-green-100'
      }[tolerability] || 'bg-gray-100';
      return baseColor;
    };

    return (
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm border-collapse">
          <thead>
            <tr>
              <th className="border px-2 py-1 bg-gray-50">Probability</th>
              <th colSpan="5" className="border px-2 py-1 bg-gray-50">Severity</th>
            </tr>
            <tr>
              <th className="border px-2 py-1 bg-gray-50"></th>
              {severityLabels.map(sev => (
                <th key={sev} className="border px-2 py-1 bg-gray-50">{sev}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {probabilityLabels.map(prob => (
              <tr key={prob}>
                <td className="border px-2 py-1">{prob}</td>
                {severityLabels.map(sev => (
                  <td key={`${prob}${sev}`} className={`border px-4 py-2 text-center ${getCellColor(prob, sev)}`}>
                    {prob}{sev}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        <div className="mt-2 flex gap-4 text-xs justify-center">
          <div className="flex items-center">
            <div className="w-4 h-4 bg-red-100 mr-1"></div>
            <span>Intolerable</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-yellow-100 mr-1"></div>
            <span>Tolerable</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-green-100 mr-1"></div>
            <span>Acceptable</span>
          </div>
        </div>
      </div>
    );
  };

  const renderIntegratedMatrix = () => {
    const getCellColor = (severity, probability) => {
      const score = calculateRiskScore(severity, probability);
      if (score >= 20) return 'bg-red-200'; // Darker red for high risk
      if (score >= 15) return 'bg-orange-200'; // Darker orange for moderate risk
      if (score >= 7) return 'bg-yellow-100';
      return 'bg-green-100';
    };

    return (
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm border-collapse">
          <thead>
            <tr>
              <th className="border px-2 py-1 bg-gray-50">Impact</th>
              <th colSpan="5" className="border px-2 py-1 bg-gray-50">Likelihood</th>
            </tr>
            <tr>
              <th className="border px-2 py-1 bg-gray-50"></th>
              {[1, 2, 3, 4, 5].map(n => (
                <th key={n} className="border px-2 py-1 bg-gray-50">{n}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[5, 4, 3, 2, 1].map(severity => (
              <tr key={severity}>
                <td className="border px-2 py-1">{severity}</td>
                {[1, 2, 3, 4, 5].map(probability => {
                  const score = calculateRiskScore(severity, probability);
                  return (
                    <td key={`${severity}-${probability}`} className={`border px-4 py-2 text-center ${getCellColor(severity, probability)}`}>
                      {score}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
        <div className="mt-2 flex gap-4 text-xs justify-center">
          <div className="flex items-center">
            <div className="w-4 h-4 bg-green-100 mr-1"></div>
            <span>Low Risk (1-6)</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-yellow-100 mr-1"></div>
            <span>Medium Risk (7-14)</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-orange-200 mr-1"></div>
            <span>Moderate Risk (15-19)</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-red-200 mr-1"></div>
            <span>High Risk (20-25)</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg p-4 border border-gray-200">
      <h3 className="text-lg font-semibold mb-4">{matrixType} Risk Matrix</h3>
      {matrixType === 'ICAO' ? renderICAOMatrix() : renderIntegratedMatrix()}
    </div>
  );
}