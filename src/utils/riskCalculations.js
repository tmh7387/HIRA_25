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
    'EXTREME': 4,
    'HIGH': 3,
    'MEDIUM': 2,
    'LOW': 1
  };

  let highestRisk = 'LOW';
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
      if (matrixType === 'ICAO') {
        highestRisk = currentRisk;
      } else {
        switch (currentRiskLevel) {
          case 4:
            highestRisk = 'EXTREME';
            break;
          case 3:
            highestRisk = 'HIGH';
            break;
          case 2:
            highestRisk = 'MEDIUM';
            break;
          default:
            highestRisk = 'LOW';
        }
      }
    }
  }

  return highestRisk;
}