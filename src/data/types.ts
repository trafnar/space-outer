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
  standards?: Record<string, string>;
};

// Block-level nodes: stack vertically in a question prompt.
export type Block =
  | { type: "paragraph"; content: Inline[] }
  | { type: "diagram"; file: string; alt?: string; imageSrc?: string }
  | {
      type: "choices";
      id: string;
      options: Choice[];
      multiple?: boolean;
    };

// Inline-level nodes: flow within a paragraph.
export type Inline =
  | { type: "text"; text: string }
  | { type: "blank"; id: string };

export type Choice = {
  id: string;
  text: string;
  imageSrc?: string;
};

// Unified response. `values` maps a blank id or choices-block id to its
// answer. For a fill-in blank, the value is the typed text. For a
// choices block (standalone or matching a blank), the value is the id
// of the chosen option. No discriminant: the prompt determines how each
// entry is interpreted.
export type Response = {
  values: Record<string, string>;
};

export type Question = ManifestQuestion & {
  prompt: Block[];
  correct: Response;
  userResponse: Response;
};

export type Test = {
  slug: string;
  manifest: Manifest;
  questions: Question[];
};

export type TestSummary = {
  slug: string;
  manifest: Manifest;
};
