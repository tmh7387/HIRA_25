import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import FloatingMatrix from './FloatingMatrix';

export default function RiskMatrixReference() {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="mt-6">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-2 bg-gray-50 rounded-md hover:bg-gray-100"
      >
        <span className="font-medium">Risk Matrix Reference</span>
        {isExpanded ? <ChevronUp /> : <ChevronDown />}
      </button>

      {isExpanded && (
        <div className="mt-2">
          <FloatingMatrix />
        </div>
      )}
    </div>
  );
}