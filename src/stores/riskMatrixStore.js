import { create } from 'zustand';

export const useRiskMatrixStore = create((set) => ({
  // State
  matrixType: 'ICAO', // Default to ICAO matrix (uppercase)
  
  // Actions
  setMatrixType: (type) => {
    // Only accept 'ICAO' or 'Integrated'
    if (type !== 'ICAO' && type !== 'Integrated') {
      console.error('Invalid matrix type:', type);
      return;
    }
    set({ matrixType: type });
  },
}));
