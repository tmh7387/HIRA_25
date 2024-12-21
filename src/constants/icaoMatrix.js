/**
 * ICAO Risk Matrix Constants
 *
 * This file defines constants related to the ICAO risk matrix, including:
 * - Probability values
 * - Severity values
 * - The risk matrix itself
 * - Tolerability actions
 * - Tolerability colors
 *
 * The constants are used throughout the application to ensure consistency
 * and maintainability when working with the ICAO risk matrix.
 */

// Tolerability Level Constants
export const TOLERABILITY_INTOLERABLE = 'INTOLERABLE';
export const TOLERABILITY_TOLERABLE = 'TOLERABLE';
export const TOLERABILITY_ACCEPTABLE = 'ACCEPTABLE';

/**
 * Probability Values
 *
 * Maps probability labels to objects containing a numeric value, label, and description.
 * Note: These values are based on the ICAO standard and should not be changed.
 */
export const PROBABILITY_VALUES = {
  FREQUENT: {
    value: 5,
    label: 'Frequent',
    description: 'Likely to occur many times (has occurred frequently)',
  },
  OCCASIONAL: {
    value: 4,
    label: 'Occasional',
    description: 'Likely to occur sometimes (has occurred infrequently)',
  },
  REMOTE: {
    value: 3,
    label: 'Remote',
    description: 'Unlikely to occur, but possible (has occurred rarely)',
  },
  IMPROBABLE: {
    value: 2,
    label: 'Improbable',
    description:
      'Very unlikely to occur (not known to have occurred)',
  },
  EXTREMELY_IMPROBABLE: {
    value: 1,
    label: 'Extremely Improbable',
    description: 'Almost inconceivable that the event will occur',
  },
};

/**
 * Severity Values
 *
 * Maps severity labels to objects containing a string value, label, and description.
 * Note: These values are based on the ICAO standard and should not be changed.
 */
export const SEVERITY_VALUES = {
  CATASTROPHIC: {
    value: 'A',
    label: 'Catastrophic',
    description: 'Equipment destroyed; multiple deaths',
  },
  HAZARDOUS: {
    value: 'B',
    label: 'Hazardous',
    description:
      'A large reduction in safety margins, physical distress or a workload such that the operators cannot be relied upon to perform their tasks accurately or completely. Serious injury or death to a small number of occupants',
  },
  MAJOR: {
    value: 'C',
    label: 'Major',
    description:
      'A significant reduction in safety margins, a reduction in the ability of the operators to cope with adverse operating conditions as a result of increase in workload, or as a result of conditions impairing their efficiency. Serious incident. Injury to occupants',
  },
  MINOR: {
    value: 'D',
    label: 'Minor',
    description:
      'Nuisance. Operating limitations. Use of emergency procedures. Minor incident',
  },
  NEGLIGIBLE: {
    value: 'E',
    label: 'Negligible',
    description: 'Little consequences',
  },
};

/**
 * Risk Matrix
 *
 * Maps risk index strings (e.g., '5A', '4B') to tolerability levels.
 */
export const RISK_MATRIX = {
  '5A': TOLERABILITY_INTOLERABLE,
  '5B': TOLERABILITY_INTOLERABLE,
  '5C': TOLERABILITY_INTOLERABLE,
  '5D': TOLERABILITY_INTOLERABLE,
  '5E': TOLERABILITY_TOLERABLE,
  '4A': TOLERABILITY_INTOLERABLE,
  '4B': TOLERABILITY_INTOLERABLE,
  '4C': TOLERABILITY_INTOLERABLE,
  '4D': TOLERABILITY_TOLERABLE,
  '4E': TOLERABILITY_ACCEPTABLE,
  '3A': TOLERABILITY_INTOLERABLE,
  '3B': TOLERABILITY_INTOLERABLE,
  '3C': TOLERABILITY_TOLERABLE,
  '3D': TOLERABILITY_ACCEPTABLE,
  '3E': TOLERABILITY_ACCEPTABLE,
  '2A': TOLERABILITY_INTOLERABLE,
  '2B': TOLERABILITY_TOLERABLE,
  '2C': TOLERABILITY_ACCEPTABLE,
  '2D': TOLERABILITY_ACCEPTABLE,
  '2E': TOLERABILITY_ACCEPTABLE,
  '1A': TOLERABILITY_TOLERABLE,
  '1B': TOLERABILITY_ACCEPTABLE,
  '1C': TOLERABILITY_ACCEPTABLE,
  '1D': TOLERABILITY_ACCEPTABLE,
  '1E': TOLERABILITY_ACCEPTABLE,
};

/**
 * Tolerability Actions
 *
 * Maps tolerability levels to corresponding actions.
 */
export const TOLERABILITY_ACTIONS = {
  [TOLERABILITY_INTOLERABLE]: 'Unacceptable under the existing circumstances.',
  [TOLERABILITY_TOLERABLE]:
    'Acceptable based on risk mitigation. It may require management decision.',
  [TOLERABILITY_ACCEPTABLE]: 'Acceptable as is. Consequences are negligible.',
};

/**
 * Tolerability Colors
 *
 * Maps tolerability levels to corresponding Tailwind CSS color classes.
 */
export const TOLERABILITY_COLORS = {
  [TOLERABILITY_INTOLERABLE]: 'bg-red-100 text-red-800',
  [TOLERABILITY_TOLERABLE]: 'bg-yellow-100 text-yellow-800',
  [TOLERABILITY_ACCEPTABLE]: 'bg-green-100 text-green-800',
};
