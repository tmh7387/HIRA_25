import React from 'react';
import PropTypes from 'prop-types';
import { useRiskMatrixStore } from '../stores/riskMatrixStore';

export default function RiskMatrixSelector() {
  const { matrixType, setMatrixType } = useRiskMatrixStore();

  return (
    <div className="flex items-center space-x-4">
      <label className="text-sm font-medium text-gray-700">Risk Matrix Type:</label>
      <select
        value={matrixType}
        onChange={(e) => setMatrixType(e.target.value)}
        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
      >
        <option value="ICAO">ICAO Risk Matrix</option>
        <option value="Integrated">Integrated Risk Matrix</option>
      </select>
    </div>
  );
}

RiskMatrixSelector.propTypes = {
  matrixType: PropTypes.string.isRequired,
  setMatrixType: PropTypes.func.isRequired
};