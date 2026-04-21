// Initial pass at structuring test question data. This will likely need to
// evolve as we discover more variations in test types and as we implement more
// features around questions, answers, and scoring.

export type Score = {
  percent: number;
  earned: number;
  possible: number;
};

export type ManifestQuestion = {
  n: number;
  url: string | null;
  qid: string | null;
  type: string;
  points: { earned: number; possible: number };
  standards: string[];
};

export type Manifest = {
  title: string;
  takenOn: string | null;
  student: string;
  teacher: string | null;
  numQuestions: number;
  score: Score;
  questions: ManifestQuestion[];
};

export type PartField =
  | { kind: "text"; id: string; value: string }
  | { kind: "radio"; id: string; value: string; checked: boolean };

export type PartImage = {
  src: string;
  alt: string | null;
  width: number | null;
  height: number | null;
  localPath: string;
};

export type PartRole = "Question" | "Correct Response" | "Your Response";

export type QuestionPart = {
  role: PartRole | string;
  index: number;
  innerHTML: string;
  text: string;
  fields: PartField[];
  images: PartImage[];
};

export type Question = ManifestQuestion & {
  parts: QuestionPart[];
};
