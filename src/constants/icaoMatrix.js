// ICAO Risk Matrix Constants
export const PROBABILITY_VALUES = {
  FREQUENT: { value: 5, label: 'Frequent', description: 'Likely to occur many times (has occurred frequently)' },
  OCCASIONAL: { value: 4, label: 'Occasional', description: 'Likely to occur sometimes (has occurred infrequently)' },
  REMOTE: { value: 3, label: 'Remote', description: 'Unlikely to occur but possible (has occurred rarely)' },
  IMPROBABLE: { value: 2, label: 'Improbable', description: 'Very unlikely to occur (not known to have occurred)' },
  EXTREMELY_IMPROBABLE: { value: 1, label: 'Extremely Improbable', description: 'Almost inconceivable that the event will occur' }
};

export const SEVERITY_VALUES = {
  CATASTROPHIC: { value: 'A', label: 'Catastrophic', description: 'Equipment destroyed, multiple deaths' },
  HAZARDOUS: { value: 'B', label: 'Hazardous', description: 'Large reduction in safety margins, physical distress or workload, serious injury, major equipment damage' },
  MAJOR: { value: 'C', label: 'Major', description: 'Significant reduction in safety margins, reduction in ability to cope with adverse conditions, injury to persons' },
  MINOR: { value: 'D', label: 'Minor', description: 'Nuisance, operating limitations, use of emergency procedures, minor incident' },
  NEGLIGIBLE: { value: 'E', label: 'Negligible', description: 'Little consequences' }
};

export const RISK_MATRIX = {
  '5A': 'INTOLERABLE',
  '5B': 'INTOLERABLE',
  '5C': 'INTOLERABLE',
  '5D': 'TOLERABLE',
  '5E': 'TOLERABLE',
  '4A': 'INTOLERABLE',
  '4B': 'INTOLERABLE',
  '4C': 'TOLERABLE',
  '4D': 'TOLERABLE',
  '4E': 'TOLERABLE',
  '3A': 'INTOLERABLE',
  '3B': 'TOLERABLE',
  '3C': 'TOLERABLE',
  '3D': 'TOLERABLE',
  '3E': 'ACCEPTABLE',
  '2A': 'TOLERABLE',
  '2B': 'TOLERABLE',
  '2C': 'TOLERABLE',
  '2D': 'ACCEPTABLE',
  '2E': 'ACCEPTABLE',
  '1A': 'TOLERABLE',
  '1B': 'ACCEPTABLE',
  '1C': 'ACCEPTABLE',
  '1D': 'ACCEPTABLE',
  '1E': 'ACCEPTABLE'
};

export const TOLERABILITY_ACTIONS = {
  INTOLERABLE: 'Take immediate action to mitigate the risk or stop the activity. Perform priority safety risk mitigation to ensure additional or enhanced preventative controls are in place.',
  TOLERABLE: 'Can be tolerated based on the safety risk mitigation. It may require management decision to accept the risk.',
  ACCEPTABLE: 'Acceptable as is. No further safety risk mitigation required.'
};

export const TOLERABILITY_COLORS = {
  INTOLERABLE: 'bg-red-100 text-red-800',
  TOLERABLE: 'bg-yellow-100 text-yellow-800',
  ACCEPTABLE: 'bg-green-100 text-green-800'
};