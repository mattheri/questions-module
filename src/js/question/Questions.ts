import { QuestionDb } from "../db/QuestionDb";
import Question from "./Question";
import { IQuestion } from "./Question.interface";

class Questions {
  static instance: Questions;
  public questions: Question[];
  private db: typeof QuestionDb;
  private _daysLimit = 30;

  private constructor(db: typeof QuestionDb) {
    this.questions = [];
    this.db = db;
    this.init();
  }

  static getInstance() {
    if (!Questions.instance) {
      Questions.instance = new Questions(QuestionDb);
    }
    return Questions.instance;
  }

  public addQuestion({ element, name, options }: IQuestion) {
    this.questions.push(new Question(element, name, this.db, options));
    return this;
  }

  public async getAnswers() {
    const questions = this.questions.map((question) => question.getAnswer());

    return await Promise.all(questions);
  }

  /**
   * Get the days limit for the questions. Defaults to 30 days.
   */
  public get daysLimit() {
    return this._daysLimit;
  }

  /**
   * Set the days limit for the questions. Defaults to 30 days.
   */
  public set daysLimit(value: number) {
    this._daysLimit = value;
  }

  private isOverDaysLimit(createdAt: Date) {
    const now = new Date();
    const diff = now.getTime() - createdAt.getTime();
    const diffDays = Math.ceil(diff / (1000 * 60 * 60 * 24));

    return diffDays > this._daysLimit;
  }

  private async init() {
    const promises = this.questions.map(async (question) => {
      return (
        this.isOverDaysLimit(await question.getCreatedAt()) &&
        (await question.deleteQuestion())
      );
    });

    return await Promise.all(promises);
  }
}

export default Questions.getInstance();
