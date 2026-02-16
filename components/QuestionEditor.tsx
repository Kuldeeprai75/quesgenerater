
import React, { useState } from 'react';
import { Question, QuestionType } from '../types';
import { Trash2, GripVertical, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';
import SymbolToolbar from './SymbolToolbar';

interface QuestionEditorProps {
  question: Question;
  onUpdate: (updates: Partial<Question>) => void;
  onDelete: () => void;
  onGenerateAI?: () => void;
  isGenerating?: boolean;
}

const QuestionEditor: React.FC<QuestionEditorProps> = ({ 
  question, onUpdate, onDelete, onGenerateAI, isGenerating 
}) => {
  const [showDetails, setShowDetails] = useState(true);

  const handleSymbolInsert = (symbol: string) => {
    onUpdate({ text: question.text + symbol });
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow mb-4">
      <div className="flex items-center gap-3 p-3 bg-slate-50 border-b border-slate-100">
        <GripVertical className="text-slate-400 cursor-grab active:cursor-grabbing" size={20} />
        <div className="flex-1 flex items-center gap-2">
          <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded uppercase">
            {question.type}
          </span>
          <input
            type="number"
            value={question.marks}
            onChange={(e) => onUpdate({ marks: parseInt(e.target.value) || 0 })}
            className="w-16 px-2 py-1 border border-slate-300 rounded text-sm font-semibold"
            placeholder="Marks"
          />
          <span className="text-xs text-slate-500 font-medium">Marks</span>
        </div>
        <div className="flex items-center gap-2">
           {onGenerateAI && (
            <button
              onClick={onGenerateAI}
              disabled={isGenerating}
              className="flex items-center gap-1 px-3 py-1 bg-purple-600 text-white text-xs font-medium rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors"
            >
              <Sparkles size={14} />
              {isGenerating ? 'Generating...' : 'AI Suggest'}
            </button>
          )}
          <button 
            onClick={() => setShowDetails(!showDetails)}
            className="p-1 text-slate-400 hover:text-slate-600 rounded"
          >
            {showDetails ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
          <button 
            onClick={onDelete}
            className="p-1 text-red-400 hover:text-red-600 rounded"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      {showDetails && (
        <div className="p-4 space-y-4">
          <SymbolToolbar onInsert={handleSymbolInsert} />
          
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Question Text</label>
            <textarea
              value={question.text}
              onChange={(e) => onUpdate({ text: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[80px]"
              placeholder="Enter question statement here..."
            />
          </div>

          {(question.type === QuestionType.PASSAGE || question.type === QuestionType.CASE_STUDY) && (
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Passage Content</label>
              <textarea
                value={question.passage || ''}
                onChange={(e) => onUpdate({ passage: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[120px]"
                placeholder="Paste passage or case study text here..."
              />
            </div>
          )}

          {question.type === QuestionType.MCQ && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {(question.options || ['', '', '', '']).map((opt, i) => (
                <div key={i} className="flex gap-2">
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 text-slate-600 text-xs font-bold border border-slate-200">
                    {String.fromCharCode(65 + i)}
                  </span>
                  <input
                    type="text"
                    value={opt}
                    onChange={(e) => {
                      const newOpts = [...(question.options || ['', '', '', ''])];
                      newOpts[i] = e.target.value;
                      onUpdate({ options: newOpts });
                    }}
                    className="flex-1 px-3 py-1 border border-slate-300 rounded-lg text-sm"
                    placeholder={`Option ${i + 1}`}
                  />
                </div>
              ))}
            </div>
          )}

          {question.type === QuestionType.MATCH_FOLLOWING && (
            <div className="space-y-2">
               <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Matching Pairs</label>
               {(question.pairs || [{left: '', right: ''}]).map((pair, i) => (
                 <div key={i} className="flex gap-2 items-center">
                   <input
                     type="text"
                     value={pair.left}
                     onChange={(e) => {
                        const newPairs = [...(question.pairs || [])];
                        newPairs[i].left = e.target.value;
                        onUpdate({ pairs: newPairs });
                     }}
                     className="flex-1 px-3 py-1 border border-slate-300 rounded-lg text-sm"
                     placeholder="Column A"
                   />
                   <span className="text-slate-400">---</span>
                   <input
                     type="text"
                     value={pair.right}
                     onChange={(e) => {
                        const newPairs = [...(question.pairs || [])];
                        newPairs[i].right = e.target.value;
                        onUpdate({ pairs: newPairs });
                     }}
                     className="flex-1 px-3 py-1 border border-slate-300 rounded-lg text-sm"
                     placeholder="Column B"
                   />
                   <button 
                    onClick={() => {
                        const newPairs = (question.pairs || []).filter((_, idx) => idx !== i);
                        onUpdate({ pairs: newPairs });
                    }}
                    className="text-red-400 p-1"
                   >
                    <Trash2 size={14} />
                   </button>
                 </div>
               ))}
               <button
                 onClick={() => {
                    const newPairs = [...(question.pairs || []), { left: '', right: '' }];
                    onUpdate({ pairs: newPairs });
                 }}
                 className="text-blue-600 text-xs font-bold hover:underline"
               >
                 + Add Pair
               </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default QuestionEditor;
