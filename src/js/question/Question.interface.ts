export interface QuestionOption {
  enableDb?: boolean;
}

export interface IQuestion {
  element: HTMLElement;
  name: string;
  options?: QuestionOption;
}

export interface IQuestionDb<Value extends unknown> {
  name: string;
  slug: string;
  value: Value;
  createdAt: Date;
  updatedAt: Date;
}
