import React from 'react';
import PropTypes from 'prop-types';
import { PROBABILITY_VALUES, SEVERITY_VALUES, RISK_MATRIX, TOLERABILITY_ACTIONS, TOLERABILITY_COLORS } from '../constants/icaoMatrix';

export default function ICAORiskMatrix({ 
  probability = '', 
  severity = '', 
  onChange, 
  showTolerability = false 
}) {
  const handleProbabilityChange = (event) => {
    const value = event.target.value ? parseInt(event.target.value, 10) : '';
    onChange({ probability: value, severity });
  };

  const handleSeverityChange = (event) => {
    const value = event.target.value || '';
    onChange({ probability, severity: value });
  };

  const riskIndex = probability && severity ? `${probability}${severity}` : null;
  const tolerability = riskIndex ? RISK_MATRIX[riskIndex] : null;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Probability of Occurrence
          </label>
          <select
            value={probability ? probability.toString() : ''}
            onChange={handleProbabilityChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="">Select probability</option>
            {Object.entries(PROBABILITY_VALUES).map(([key, { value, label }]) => (
              <option key={key} value={value.toString()}>
                {value} - {label}
              </option>
            ))}
          </select>
          {probability && (
            <div className="mt-2 text-sm text-gray-500">
              {PROBABILITY_VALUES[Object.keys(PROBABILITY_VALUES).find(
                key => PROBABILITY_VALUES[key].value === probability
              )]?.description}
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Severity of Consequences
          </label>
          <select
            value={severity || ''}
            onChange={handleSeverityChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="">Select severity</option>
            {Object.entries(SEVERITY_VALUES).map(([key, { value, label }]) => (
              <option key={key} value={value}>
                {value} - {label}
              </option>
            ))}
          </select>
          {severity && (
            <div className="mt-2 text-sm text-gray-500">
              {SEVERITY_VALUES[Object.keys(SEVERITY_VALUES).find(
                key => SEVERITY_VALUES[key].value === severity
              )]?.description}
            </div>
          )}
        </div>
      </div>

      {showTolerability && tolerability && (
        <div className="rounded-lg border border-gray-200 p-4 bg-gray-50">
          <div className="mb-2">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${TOLERABILITY_COLORS[tolerability]}`}>
              {tolerability}
            </span>
          </div>
          <p className="text-sm text-gray-700">
            {TOLERABILITY_ACTIONS[tolerability]}
          </p>
        </div>
      )}
    </div>
  );
}

ICAORiskMatrix.propTypes = {
  probability: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  severity: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  showTolerability: PropTypes.bool
};