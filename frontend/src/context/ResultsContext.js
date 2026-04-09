import React, { createContext, useContext, useState } from 'react';

const ResultsContext = createContext(null);

export function ResultsProvider({ children }) {
  const [results, setResults] = useState({
    aptitude: null,
    technical: null,
    behavioral: null,
  });

  const saveResult = (roundType, data) => {
    setResults(prev => ({ ...prev, [roundType]: data }));
  };

  const clearResult = (roundType) => {
    setResults(prev => ({ ...prev, [roundType]: null }));
  };

  const completedCount = Object.values(results).filter(Boolean).length;

  const overallScore = completedCount > 0
    ? Math.round(
        Object.values(results)
          .filter(Boolean)
          .reduce((sum, r) => sum + (r.percentage || r.pct || 0), 0) / completedCount
      )
    : 0;

  return (
    <ResultsContext.Provider value={{ results, saveResult, clearResult, completedCount, overallScore }}>
      {children}
    </ResultsContext.Provider>
  );
}

export const useResults = () => {
  const ctx = useContext(ResultsContext);
  if (!ctx) throw new Error('useResults must be used inside ResultsProvider');
  return ctx;
};
