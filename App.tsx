
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Plus, Save, Upload, Download, Printer, Moon, Sun, 
  Trash2, FileText, Settings, HelpCircle, Layout, Sparkles, AlertCircle
} from 'lucide-react';
import { Paper, Section, Question, QuestionType, Subject, ExamType } from './types';
import { CLASSES, SUBJECTS, EXAM_TYPES, DEFAULT_INSTRUCTIONS } from './constants';
import QuestionEditor from './components/QuestionEditor';
import PaperPreview from './components/PaperPreview';
import { generateSampleQuestions } from './services/geminiService';

const INITIAL_PAPER: Paper = {
  schoolName: '',
  schoolAddress: '',
  examType: ExamType.ANNUAL,
  className: CLASSES[9],
  subject: Subject.SCIENCE,
  duration: { hours: 3, minutes: 0 },
  totalMarks: 100,
  generalInstructions: DEFAULT_INSTRUCTIONS,
  sections: [
    {
      id: 'sec_1',
      title: 'Section A',
      instructions: 'Choose the correct option.',
      questions: []
    }
  ]
};

const App: React.FC = () => {
  const [paper, setPaper] = useState<Paper>(INITIAL_PAPER);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');
  const [isGenerating, setIsGenerating] = useState<string | null>(null); // sectionId or null

  // Auto-calculate marks
  const calculatedTotal = useMemo(() => {
    return paper.sections.reduce((acc, sec) => 
      acc + sec.questions.reduce((qAcc, q) => qAcc + q.marks, 0), 0
    );
  }, [paper.sections]);

  // Sync manual marks with calculated marks if they differ
  useEffect(() => {
    if (calculatedTotal !== paper.totalMarks) {
      setPaper(prev => ({ ...prev, totalMarks: calculatedTotal }));
    }
  }, [calculatedTotal]);

  const addSection = () => {
    const newSection: Section = {
      id: `sec_${Date.now()}`,
      title: `Section ${String.fromCharCode(65 + paper.sections.length)}`,
      instructions: '',
      questions: []
    };
    setPaper(prev => ({ ...prev, sections: [...prev.sections, newSection] }));
  };

  const deleteSection = (id: string) => {
    setPaper(prev => ({ ...prev, sections: prev.sections.filter(s => s.id !== id) }));
  };

  const updateSection = (id: string, updates: Partial<Section>) => {
    setPaper(prev => ({
      ...prev,
      sections: prev.sections.map(s => s.id === id ? { ...s, ...updates } : s)
    }));
  };

  const addQuestion = (sectionId: string, type: QuestionType) => {
    const newQuestion: Question = {
      id: `q_${Date.now()}`,
      type,
      text: '',
      marks: type === QuestionType.MCQ || type === QuestionType.VERY_SHORT || type === QuestionType.FILL_BLANKS ? 1 : 
             type === QuestionType.SHORT ? 3 : 5,
      options: type === QuestionType.MCQ ? ['', '', '', ''] : undefined,
      pairs: type === QuestionType.MATCH_FOLLOWING ? [{left: '', right: ''}] : undefined,
      passage: (type === QuestionType.PASSAGE || type === QuestionType.CASE_STUDY) ? '' : undefined
    };

    setPaper(prev => ({
      ...prev,
      sections: prev.sections.map(s => s.id === sectionId ? {
        ...s,
        questions: [...s.questions, newQuestion]
      } : s)
    }));
  };

  const handleAISuggestion = async (sectionId: string, type: QuestionType) => {
    setIsGenerating(sectionId);
    try {
      const suggestions = await generateSampleQuestions(paper.subject, paper.className, type, 1);
      if (suggestions.length > 0) {
        setPaper(prev => ({
          ...prev,
          sections: prev.sections.map(s => s.id === sectionId ? {
            ...s,
            questions: [...s.questions, ...suggestions]
          } : s)
        }));
      }
    } catch (e) {
      alert("AI suggestion failed. Please ensure you have a valid API key and internet connection.");
    } finally {
      setIsGenerating(null);
    }
  };

  const saveToDisk = () => {
    const blob = new Blob([JSON.stringify(paper, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `exam_${paper.subject.toLowerCase()}_${paper.className.toLowerCase().replace(' ', '_')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const loadFromDisk = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        setPaper(data);
      } catch (err) {
        alert("Invalid JSON file");
      }
    };
    reader.readAsText(file);
  };

  const handlePrint = () => {
    setActiveTab('preview');
    setTimeout(() => {
        window.print();
    }, 500);
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'dark bg-slate-900 text-white' : 'bg-slate-50 text-slate-900'}`}>
      
      {/* Header */}
      <header className={`sticky top-0 z-50 px-4 py-3 border-b no-print ${isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200 shadow-sm'}`}>
        <div className="max-w-[1600px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white">
              <FileText size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">ExamCraft</h1>
              <p className="text-[10px] uppercase font-bold text-blue-600 tracking-widest">Question Paper Pro</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button 
              onClick={() => setActiveTab(activeTab === 'edit' ? 'preview' : 'edit')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'preview' 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' 
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <Layout size={18} />
              {activeTab === 'edit' ? 'Switch to Preview' : 'Back to Editor'}
            </button>
            <div className="h-6 w-[1px] bg-slate-300 mx-2" />
            <button 
              onClick={handlePrint}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-400 transition-colors"
              title="Print Exam Paper"
            >
              <Printer size={20} />
            </button>
            <button 
              onClick={saveToDisk}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-400 transition-colors"
              title="Export as JSON"
            >
              <Download size={20} />
            </button>
            <label className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-400 transition-colors cursor-pointer" title="Load JSON">
              <Upload size={20} />
              <input type="file" onChange={loadFromDisk} className="hidden" accept=".json" />
            </label>
            <button 
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-400 transition-colors"
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto p-4 md:p-6 lg:p-8 flex flex-col md:flex-row gap-8">
        
        {/* Editor View */}
        <div className={`flex-1 space-y-8 ${activeTab === 'preview' ? 'hidden' : 'block'} no-print`}>
          
          {/* Paper Settings Panel */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-2 mb-6 border-b border-slate-100 dark:border-slate-700 pb-4">
              <Settings className="text-blue-500" size={20} />
              <h2 className="text-lg font-bold">Exam Details</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">School Name</label>
                  <input
                    type="text"
                    value={paper.schoolName}
                    onChange={(e) => setPaper(prev => ({ ...prev, schoolName: e.target.value }))}
                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    placeholder="e.g. Saint Xavier's International School"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">School Address</label>
                  <textarea
                    value={paper.schoolAddress}
                    onChange={(e) => setPaper(prev => ({ ...prev, schoolAddress: e.target.value }))}
                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none h-20"
                    placeholder="Enter city and state..."
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Class</label>
                  <select
                    value={paper.className}
                    onChange={(e) => setPaper(prev => ({ ...prev, className: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none"
                  >
                    {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Subject</label>
                  <select
                    value={paper.subject}
                    onChange={(e) => setPaper(prev => ({ ...prev, subject: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none"
                  >
                    {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Exam Type</label>
                  <select
                    value={paper.examType}
                    onChange={(e) => setPaper(prev => ({ ...prev, examType: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none"
                  >
                    {EXAM_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                   <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Duration</label>
                   <div className="flex items-center gap-1">
                      <input 
                        type="number" 
                        value={paper.duration.hours} 
                        onChange={(e) => setPaper(prev => ({ ...prev, duration: { ...prev.duration, hours: parseInt(e.target.value) || 0 } }))}
                        className="w-full px-2 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none text-center"
                      />
                      <span className="text-xs font-bold">H</span>
                      <input 
                        type="number" 
                        value={paper.duration.minutes} 
                        onChange={(e) => setPaper(prev => ({ ...prev, duration: { ...prev.duration, minutes: parseInt(e.target.value) || 0 } }))}
                        className="w-full px-2 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none text-center"
                      />
                      <span className="text-xs font-bold">M</span>
                   </div>
                </div>
                <div className="col-span-2">
                   <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">General Instructions</label>
                   <textarea
                    value={paper.generalInstructions}
                    onChange={(e) => setPaper(prev => ({ ...prev, generalInstructions: e.target.value }))}
                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none h-32"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Sections Panel */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Layout className="text-blue-500" size={24} />
                Question Sections
              </h2>
              <button 
                onClick={addSection}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-blue-500/20"
              >
                <Plus size={18} /> Add Section
              </button>
            </div>

            {paper.sections.map((section, idx) => (
              <div key={section.id} className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
                <div className="flex items-start justify-between mb-6 gap-4">
                  <div className="flex-1 space-y-4">
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 flex items-center justify-center bg-blue-100 text-blue-700 rounded-full font-bold text-sm">
                        {String.fromCharCode(65 + idx)}
                      </span>
                      <input
                        type="text"
                        value={section.title}
                        onChange={(e) => updateSection(section.id, { title: e.target.value })}
                        className="text-lg font-bold bg-transparent border-b border-transparent hover:border-slate-200 focus:border-blue-500 outline-none pb-1"
                        placeholder="Section Title (e.g. Section A)"
                      />
                    </div>
                    <input
                      type="text"
                      value={section.instructions}
                      onChange={(e) => updateSection(section.id, { instructions: e.target.value })}
                      className="w-full text-sm italic text-slate-500 bg-transparent border-b border-transparent hover:border-slate-200 focus:border-blue-500 outline-none"
                      placeholder="Add specific instructions for this section..."
                    />
                  </div>
                  <button 
                    onClick={() => deleteSection(section.id)}
                    className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>

                {/* Questions List */}
                <div className="space-y-4 mb-6">
                  {section.questions.map((q, qIdx) => (
                    <QuestionEditor
                      key={q.id}
                      question={q}
                      onUpdate={(updates) => {
                        const newQs = section.questions.map(curr => curr.id === q.id ? { ...curr, ...updates } : curr);
                        updateSection(section.id, { questions: newQs });
                      }}
                      onDelete={() => {
                        const newQs = section.questions.filter(curr => curr.id !== q.id);
                        updateSection(section.id, { questions: newQs });
                      }}
                      onGenerateAI={() => handleAISuggestion(section.id, q.type)}
                      isGenerating={isGenerating === section.id}
                    />
                  ))}
                </div>

                {/* Add Question Actions */}
                <div className="flex flex-wrap gap-2 pt-4 border-t border-slate-100 dark:border-slate-700">
                  {Object.values(QuestionType).map(type => (
                    <button
                      key={type}
                      onClick={() => addQuestion(section.id, type)}
                      className="px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-xs font-bold rounded-lg transition-all"
                    >
                      + {type}
                    </button>
                  ))}
                  <button
                    onClick={() => handleAISuggestion(section.id, QuestionType.MCQ)}
                    disabled={isGenerating === section.id}
                    className="px-3 py-1.5 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 text-xs font-bold rounded-lg flex items-center gap-1 hover:bg-purple-100 transition-all"
                  >
                    <Sparkles size={14} /> AI MCQ
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Floating Preview (Large Screens) or Full View (Toggle) */}
        <div className={`flex-none w-full md:w-[210mm] transition-all duration-300 ${activeTab === 'edit' ? 'hidden xl:block opacity-40 hover:opacity-100 scale-95 origin-right pointer-events-none xl:pointer-events-auto' : 'block'}`}>
          <div className="sticky top-28 mb-10 no-print">
             <div className="flex items-center justify-between bg-blue-600 text-white px-6 py-4 rounded-t-2xl shadow-lg">
                <div className="flex items-center gap-2">
                   <Layout size={20} />
                   <h3 className="font-bold">Live A4 Preview</h3>
                </div>
                <div className="flex items-center gap-4 text-sm font-bold">
                   <div className="flex items-center gap-1">
                      <span className="opacity-70">Total Marks:</span>
                      <span>{calculatedTotal} / {paper.totalMarks}</span>
                   </div>
                   <button onClick={handlePrint} className="bg-white text-blue-600 px-3 py-1 rounded-lg hover:bg-blue-50">
                      Print Now
                   </button>
                </div>
             </div>
             <div className="bg-slate-200 p-8 rounded-b-2xl shadow-inner max-h-[80vh] overflow-y-auto custom-scrollbar">
                <PaperPreview paper={paper} />
             </div>
          </div>
          
          {/* Print only component */}
          <div className="hidden print:block">
            <PaperPreview paper={paper} />
          </div>
        </div>
      </main>

      {/* Manual Instructions / Info */}
      <footer className="max-w-[1600px] mx-auto p-8 border-t border-slate-200 no-print">
         <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-4">
               <h4 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                  <HelpCircle size={18} className="text-blue-500" />
                  How to Use
               </h4>
               <ul className="text-sm text-slate-500 space-y-2">
                  <li>1. Fill in school details and exam metadata.</li>
                  <li>2. Create sections (A, B, C...) for organization.</li>
                  <li>3. Add questions using the type buttons.</li>
                  <li>4. Use the AI Suggest button for quick question ideas.</li>
                  <li>5. Print or Export to PDF using the print icon.</li>
               </ul>
            </div>
            <div className="space-y-4">
               <h4 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                  <Sparkles size={18} className="text-purple-500" />
                  Smart Features
               </h4>
               <ul className="text-sm text-slate-500 space-y-2">
                  <li>• Automatic marks calculation.</li>
                  <li>• Special symbol toolbar for Math & Sanskrit.</li>
                  <li>• JSON save/load for later editing.</li>
                  <li>• Professional A4 print layouts built-in.</li>
               </ul>
            </div>
            <div className="bg-blue-50 dark:bg-slate-800/50 p-4 rounded-xl border border-blue-100 dark:border-slate-700 flex gap-4">
                <AlertCircle className="text-blue-500 shrink-0" />
                <div className="text-xs text-blue-800 dark:text-blue-300 leading-relaxed">
                   <strong>Pro Tip:</strong> For the best print result, ensure "Background Graphics" is enabled in your browser's print settings dialog. This preserves the styled section boxes and dividers.
                </div>
            </div>
         </div>
         <div className="mt-12 text-center text-xs text-slate-400 font-medium">
            &copy; {new Date().getFullYear()} ExamCraft Question Paper Generator. All rights reserved.
         </div>
      </footer>
    </div>
  );
};

export default App;
