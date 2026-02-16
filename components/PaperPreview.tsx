
import React from 'react';
import { Paper, QuestionType } from '../types';

interface PaperPreviewProps {
  paper: Paper;
}

const PaperPreview: React.FC<PaperPreviewProps> = ({ paper }) => {
  return (
    <div className="a4-page p-[20mm] font-serif overflow-hidden">
      {/* School Header */}
      <div className="text-center border-b-2 border-black pb-4 mb-6">
        <h1 className="text-2xl font-bold uppercase mb-1 tracking-wider">{paper.schoolName || 'School Name'}</h1>
        <p className="text-sm font-medium mb-3">{paper.schoolAddress || 'School Address Line'}</p>
        <h2 className="text-xl font-bold border-t border-b border-slate-800 py-1 inline-block px-8 uppercase">{paper.examType}</h2>
      </div>

      {/* Info Row */}
      <div className="flex justify-between items-center mb-6 font-bold text-sm">
        <div className="space-y-1">
          <p>Class: <span className="font-normal underline decoration-slate-300 underline-offset-4">{paper.className}</span></p>
          <p>Subject: <span className="font-normal underline decoration-slate-300 underline-offset-4">{paper.subject}</span></p>
        </div>
        <div className="text-right space-y-1">
          <p>Time: <span className="font-normal">{paper.duration.hours}h {paper.duration.minutes}m</span></p>
          <p>Max Marks: <span className="font-normal">{paper.totalMarks}</span></p>
        </div>
      </div>

      {/* Instructions */}
      <div className="mb-6">
        <h3 className="font-bold text-sm uppercase mb-2">General Instructions:</h3>
        <ul className="text-xs list-disc list-inside space-y-1 leading-relaxed italic">
          {paper.generalInstructions.split('\n').map((line, idx) => (
            line.trim() && <li key={idx}>{line.trim()}</li>
          ))}
        </ul>
      </div>

      {/* Sections & Questions */}
      <div className="space-y-8">
        {paper.sections.map((section, sectionIdx) => (
          <div key={section.id} className="section-block">
            <div className="flex items-center justify-center mb-4">
               <span className="bg-slate-100 border border-black px-10 py-1 font-bold rounded-full uppercase text-sm">
                  {section.title}
               </span>
            </div>
            {section.instructions && (
              <p className="text-xs italic font-semibold mb-4 text-center">{section.instructions}</p>
            )}

            <div className="space-y-6">
              {section.questions.map((question, qIdx) => {
                const qNum = section.questions.slice(0, qIdx).reduce((acc, prev) => acc + (prev.type === QuestionType.PASSAGE ? 0 : 1), 1);
                
                return (
                  <div key={question.id} className="question-row flex gap-4">
                    <div className="font-bold text-sm min-w-[30px]">Q.{qIdx + 1}.</div>
                    <div className="flex-1">
                      <div className="flex justify-between gap-4 mb-2">
                        <div className="text-sm leading-relaxed whitespace-pre-wrap flex-1 font-hindi">
                          {question.text}
                        </div>
                        <div className="font-bold text-sm min-w-[40px] text-right italic">
                          [{question.marks}]
                        </div>
                      </div>

                      {/* Passage / Case Study Context */}
                      {(question.type === QuestionType.PASSAGE || question.type === QuestionType.CASE_STUDY) && question.passage && (
                        <div className="bg-slate-50 border-l-4 border-slate-300 p-4 mb-4 text-sm leading-relaxed italic italic font-hindi">
                          {question.passage}
                        </div>
                      )}

                      {/* MCQ Options */}
                      {question.type === QuestionType.MCQ && question.options && (
                        <div className="grid grid-cols-2 gap-y-2 mt-2 ml-4">
                          {question.options.map((opt, optIdx) => (
                            <div key={optIdx} className="text-sm font-hindi">
                              ({String.fromCharCode(97 + optIdx)}) {opt}
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Match Following */}
                      {question.type === QuestionType.MATCH_FOLLOWING && question.pairs && (
                        <div className="grid grid-cols-2 gap-x-8 mt-2 ml-4 max-w-[400px]">
                          <div className="space-y-1">
                            {question.pairs.map((p, i) => <div key={i} className="text-sm font-hindi">{i+1}. {p.left}</div>)}
                          </div>
                          <div className="space-y-1">
                            {question.pairs.map((p, i) => <div key={i} className="text-sm font-hindi">({String.fromCharCode(97+i)}) {p.right}</div>)}
                          </div>
                        </div>
                      )}

                      {/* Fill in the Blanks / Short / Long just leave space */}
                      {(question.type === QuestionType.SHORT || question.type === QuestionType.LONG) && (
                        <div className="mt-4 border-b border-dotted border-slate-200 h-8 opacity-0"></div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            
            <div className="text-right text-xs font-bold mt-4 border-t border-slate-100 pt-2">
              Total Marks for {section.title}: {section.questions.reduce((sum, q) => sum + q.marks, 0)}
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="mt-12 text-center border-t border-slate-300 pt-4 opacity-50 text-[10px] uppercase tracking-widest">
        End of Question Paper
      </div>
    </div>
  );
};

export default PaperPreview;
