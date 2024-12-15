import { RISK_MATRIX } from '../constants/icaoMatrix';

export function calculateICAORiskTolerability(probability, severity) {
  const riskIndex = `${probability}${severity}`;
  return RISK_MATRIX[riskIndex] || 'ACCEPTABLE';
}

export function calculateRiskRating(probability, severity) {
  const riskValue = probability * severity;
  
  if (riskValue <= 4) return 'Low';
  if (riskValue <= 9) return 'Medium';
  if (riskValue <= 14) return 'High';
  return 'Extreme';
}