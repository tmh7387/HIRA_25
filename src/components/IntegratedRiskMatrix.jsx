import React from 'react';
import PropTypes from 'prop-types';
import { LIKELIHOOD_VALUES, IMPACT_VALUES, RISK_LEVELS, calculateRiskLevel } from '../constants/integratedMatrix';

export default function IntegratedRiskMatrix({ likelihood = '', impact = '', onChange, showRiskLevel = false }) {
  const handleLikelihoodChange = (event) => {
    const value = event.target.value ? parseInt(event.target.value, 10) : '';
    onChange({ likelihood: value, impact });
  };

  const handleImpactChange = (event) => {
    const value = event.target.value ? parseInt(event.target.value, 10) : '';
    onChange({ likelihood, impact: value });
  };

  const riskLevel = (likelihood && impact) ? calculateRiskLevel(likelihood, impact) : null;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Likelihood
          </label>
          <select
            value={likelihood ? likelihood.toString() : ''}
            onChange={handleLikelihoodChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="">Select likelihood</option>
            {Object.entries(LIKELIHOOD_VALUES).map(([key, { value, label }]) => (
              <option key={key} value={value}>
                {value} - {label}
              </option>
            ))}
          </select>
          {likelihood && (
            <div className="mt-2 text-sm text-gray-500">
              {LIKELIHOOD_VALUES[Object.keys(LIKELIHOOD_VALUES).find(
                key => LIKELIHOOD_VALUES[key].value === likelihood
              )]?.description}
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Impact
          </label>
          <select
            value={impact ? impact.toString() : ''}
            onChange={handleImpactChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="">Select impact</option>
            {Object.entries(IMPACT_VALUES).map(([key, { value, label }]) => (
              <option key={key} value={value}>
                {value} - {label}
              </option>
            ))}
          </select>
          {impact && (
            <div className="mt-2 space-y-2 text-sm text-gray-500">
              {Object.entries(IMPACT_VALUES[
                Object.keys(IMPACT_VALUES).find(
                  key => IMPACT_VALUES[key].value === impact
                )
              ]?.descriptions || {}).map(([category, description]) => (
                <div key={category} className="flex flex-col">
                  <span className="font-medium capitalize">{category}:</span>
                  <span>{description}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {showRiskLevel && riskLevel && (
        <div className={`rounded-lg border p-4 ${getRiskLevelStyle(riskLevel)}`}>
          <div className="mb-2">
            <span className="font-medium">{RISK_LEVELS[riskLevel].label}</span>
          </div>
          <p className="text-sm">
            {RISK_LEVELS[riskLevel].description}
          </p>
        </div>
      )}
    </div>
  );
}

function getRiskLevelStyle(level) {
  const styles = {
    RED: 'bg-red-50 border-red-200 text-red-700',
    AMBER: 'bg-orange-50 border-orange-200 text-orange-700',
    YELLOW: 'bg-yellow-50 border-yellow-200 text-yellow-700',
    GREEN: 'bg-green-50 border-green-200 text-green-700'
  };
  return styles[level] || styles.GREEN;
}

IntegratedRiskMatrix.propTypes = {
  likelihood: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  impact: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  onChange: PropTypes.func.isRequired,
  showRiskLevel: PropTypes.bool
};
