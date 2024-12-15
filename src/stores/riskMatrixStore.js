import { create } from 'zustand';

export const useRiskMatrixStore = create((set) => ({
  matrixType: 'ICAO',
  setMatrixType: (type) => set({ matrixType: type }),
}));