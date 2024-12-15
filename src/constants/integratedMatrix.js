// Integrated Risk Matrix Constants
export const LIKELIHOOD_VALUES = {
  VERY_HIGH: { 
    value: 5, 
    label: 'Very High',
    description: 'Is expected to occur in most situations or is already happening (e.g. more than 75% probability)'
  },
  HIGH: { 
    value: 4, 
    label: 'High',
    description: 'Will probably occur in most situations (e.g. between 45% to 75% probability)'
  },
  MEDIUM: { 
    value: 3, 
    label: 'Medium',
    description: 'Might occur at some time (e.g. between 15% to 45% probability)'
  },
  LOW: { 
    value: 2, 
    label: 'Low',
    description: 'May occur only in exceptional circumstances (e.g. between 2% to 15% probability)'
  },
  EXTREMELY_LOW: { 
    value: 1, 
    label: 'Extremely Low',
    description: 'Almost inconceivable that the event will occur (e.g. less than 2% probability)'
  }
};

export const IMPACT_VALUES = {
  VERY_SIGNIFICANT: {
    value: 5,
    label: 'Very Significant',
    descriptions: {
      financial: 'More than 30% decrease in PBT',
      customer: 'More than 10% of customers lost',
      reputation: 'Very adverse publicity in local/international press',
      business: 'Less than 70% OTD',
      safety: 'Catastrophic accident – loss of aircraft/equipment/life'
    }
  },
  MAJOR: {
    value: 4,
    label: 'Major',
    descriptions: {
      financial: '20% to 30% decrease in PBT',
      customer: '5% to 10% of customers lost',
      reputation: 'Adverse publicity, limited to news reports',
      business: 'Between 70% and 75% OTD',
      safety: 'Major accident – multiple serious injuries, major damage'
    }
  },
  MODERATE: {
    value: 3,
    label: 'Moderate',
    descriptions: {
      financial: '10% to 20% decrease in PBT',
      customer: '2% to less than 5% of customers lost',
      reputation: 'May tarnish reputation with specific group',
      business: 'Between 75% and 80% OTD',
      safety: 'Significant reduction in safety margins'
    }
  },
  MINOR: {
    value: 2,
    label: 'Minor',
    descriptions: {
      financial: '5% to 10% decrease in PBT',
      customer: 'Up to 2% of customers lost',
      reputation: 'Minor case of damage to reputation',
      business: 'Between 80% and 85% OTD',
      safety: 'Minor injuries or damage'
    }
  },
  NEGLIGIBLE: {
    value: 1,
    label: 'Negligible',
    descriptions: {
      financial: 'Less than 5% decrease in PBT',
      customer: 'Negligible customers lost',
      reputation: 'Isolated case, no media coverage',
      business: 'More than 85% OTD',
      safety: 'No accident outcome'
    }
  }
};

// Risk score mapping based on the provided table
const RISK_SCORE_MAP = {
  '1,1': 1, '1,2': 2, '1,3': 3, '1,4': 7, '1,5': 8,
  '2,1': 4, '2,2': 5, '2,3': 9, '2,4': 10, '2,5': 11,
  '3,1': 6, '3,2': 12, '3,3': 13, '3,4': 14, '3,5': 20,
  '4,1': 15, '4,2': 16, '4,3': 17, '4,4': 21, '4,5': 22,
  '5,1': 18, '5,2': 19, '5,3': 23, '5,4': 24, '5,5': 25
};

export const RISK_LEVELS = {
  RED: { 
    label: 'High Risk', 
    description: 'Immediate action required',
    range: [20, 25]
  },
  AMBER: { 
    label: 'Moderate Risk', 
    description: 'Management attention needed',
    range: [15, 19]
  },
  YELLOW: { 
    label: 'Medium Risk', 
    description: 'Manage by routine procedures',
    range: [7, 14]
  },
  GREEN: { 
    label: 'Low Risk', 
    description: 'No immediate concern',
    range: [1, 6]
  }
};

export function calculateRiskScore(severity, probability) {
  const key = `${severity},${probability}`;
  return RISK_SCORE_MAP[key] || 0;
}

export function calculateRiskLevel(severity, probability) {
  const score = calculateRiskScore(severity, probability);
  
  if (score >= 20) return 'RED';
  if (score >= 15) return 'AMBER';
  if (score >= 7) return 'YELLOW';
  return 'GREEN';
}