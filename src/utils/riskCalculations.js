import { RISK_MATRIX } from '../constants/icaoMatrix';
import { calculateRiskLevel } from '../constants/integratedMatrix';

export function calculateICAORiskTolerability(probability, severity) {
  const riskIndex = `${probability}${severity}`;
  return RISK_MATRIX[riskIndex] || 'ACCEPTABLE';
}

export function calculateRiskRating(likelihood, impact) {
  return calculateRiskLevel(likelihood, impact);
}

export function calculateHighestRisk(assessments, matrixType) {
  if (!assessments || assessments.length === 0) {
    return 'LOW';
  }

  // Define risk level hierarchy for both matrix types
  const riskLevels = {
    // ICAO risk levels
    'INTOLERABLE': 4,
    'TOLERABLE': 3,
    'ACCEPTABLE': 2,
    // Integrated risk levels
    'EXTREME RISK': 4,
    'HIGH RISK': 3,
    'MEDIUM RISK': 2,
    'LOW RISK': 1
  };

  let highestRisk = 'LOW RISK';
  let highestRiskLevel = 1;

    for (const assessment of assessments) {
      let currentRisk;

      if (matrixType === 'ICAO') {
         currentRisk = calculateICAORiskTolerability(assessment.probability, assessment.severity);
      } else {
          currentRisk = calculateRiskRating(assessment.likelihood, assessment.impact).toUpperCase();
         }

        const currentRiskLevel = riskLevels[currentRisk] || 1;
        if (currentRiskLevel > highestRiskLevel) {
          highestRiskLevel = currentRiskLevel;
        // Map the risk level back to the appropriate display value
          highestRisk = currentRisk;
      }
    }

  return highestRisk;
}