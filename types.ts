
export enum QuestionType {
  MCQ = 'MCQ',
  VERY_SHORT = 'Very Short Answer',
  SHORT = 'Short Answer',
  LONG = 'Long Answer',
  FILL_BLANKS = 'Fill in the Blanks',
  TRUE_FALSE = 'True / False',
  MATCH_FOLLOWING = 'Match the Following',
  CASE_STUDY = 'Case Study Based',
  PASSAGE = 'Passage Based',
  PRACTICAL = 'Practical Questions'
}

export interface MatchPair {
  left: string;
  right: string;
}

export interface Question {
  id: string;
  type: QuestionType;
  text: string;
  marks: number;
  options?: string[]; // For MCQ
  correctAnswer?: string;
  pairs?: MatchPair[]; // For Match the following
  passage?: string; // For Passage/Case Study
  subQuestions?: Question[]; // For Passage/Case Study nested questions
}

export interface Section {
  id: string;
  title: string;
  instructions: string;
  questions: Question[];
}

export interface Paper {
  schoolName: string;
  schoolAddress: string;
  examType: string;
  className: string;
  subject: string;
  duration: { hours: number; minutes: number };
  totalMarks: number;
  generalInstructions: string;
  sections: Section[];
}

export enum Subject {
  HINDI = 'Hindi',
  ENGLISH = 'English',
  MATHS = 'Mathematics',
  SCIENCE = 'Science',
  SOCIAL_SCIENCE = 'Social Science',
  COMPUTER = 'Computer Science',
  SANSKRIT = 'Sanskrit',
  CUSTOM = 'Custom'
}

export enum ExamType {
  UNIT_TEST = 'Unit Test',
  HALF_YEARLY = 'Half Yearly',
  ANNUAL = 'Annual Examination',
  BOARD = 'Board Examination',
  CUSTOM = 'Custom Exam'
}
