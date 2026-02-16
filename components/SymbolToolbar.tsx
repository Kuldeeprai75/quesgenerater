
import React from 'react';
import { MATH_SYMBOLS, SANSKRIT_SYMBOLS } from '../constants';

interface SymbolToolbarProps {
  onInsert: (symbol: string) => void;
}

const SymbolToolbar: React.FC<SymbolToolbarProps> = ({ onInsert }) => {
  return (
    <div className="bg-slate-100 p-2 rounded-lg border border-slate-200 flex flex-wrap gap-1 mb-2">
      <div className="flex flex-wrap gap-1 border-r border-slate-300 pr-2 mr-2">
        {MATH_SYMBOLS.map(sym => (
          <button
            key={sym}
            onClick={() => onInsert(sym)}
            className="w-8 h-8 flex items-center justify-center bg-white border border-slate-300 rounded hover:bg-blue-50 hover:border-blue-300 transition-colors font-mono text-sm"
          >
            {sym}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap gap-1">
        {SANSKRIT_SYMBOLS.map(sym => (
          <button
            key={sym}
            onClick={() => onInsert(sym)}
            className="w-8 h-8 flex items-center justify-center bg-white border border-slate-300 rounded hover:bg-orange-50 hover:border-orange-300 transition-colors font-hindi text-sm"
          >
            {sym}
          </button>
        ))}
      </div>
    </div>
  );
};

export default SymbolToolbar;
