import type { Question, Score, Test } from "@/data/types";

export type ViewQuestion = Pick<
  Question,
  "n" | "points" | "standards" | "prompt" | "correct" | "userResponse"
>;

export type TestViewData = {
  title: string;
  student: string;
  score: Score;
  standards?: Record<string, string>;
  questions: ViewQuestion[];
};

export type WorksheetViewData = {
  title: string;
  questions: ViewQuestion[];
};

function toViewQuestion(question: Question): ViewQuestion {
  return {
    n: question.n,
    points: question.points,
    standards: question.standards,
    prompt: question.prompt,
    correct: question.correct,
    userResponse: question.userResponse,
  };
}

export function toTestViewData(test: Test): TestViewData {
  return {
    title: test.manifest.title,
    student: test.manifest.student,
    score: test.manifest.score,
    standards: test.manifest.standards,
    questions: test.questions.map(toViewQuestion),
  };
}

export function toWorksheetViewData(test: Test): WorksheetViewData {
  return {
    title: test.manifest.title,
    questions: test.questions.map(toViewQuestion),
  };
}
