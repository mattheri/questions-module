import { QuestionDb } from "../db/QuestionDb";
import { IQuestionDb, QuestionOption } from "./Question.interface";
import slugify from "slugify";

class Question {
  element: HTMLElement;
  options: QuestionOption | null;
  name: string;
  slug: string;
  db: QuestionDb;

  constructor(
    element: HTMLElement,
    name: string,
    db: typeof QuestionDb,
    options?: QuestionOption
  ) {
    this.element = element;
    this.options = options || null;
    this.name = name;
    this.slug = slugify(name);
    this.db = new db();
    this.init();
  }

  get possibleAnswers() {
    return Array.from(this.element.querySelectorAll("[data-answer]"));
  }

  get selectedAnswer(): HTMLElement | null {
    return this.element.querySelector("[data-answer].selected");
  }

  private get updatedAt() {
    return new Date(Date.now());
  }

  private async init() {
    this.possibleAnswers.forEach((answer) => {
      answer.addEventListener("click", (e) => {
        this.onUpdate(e.target);
      });
    });

    const previous = await this.db.getQuestion(this.slug);

    if (previous) return;

    this.save();
  }

  private async save(questionDb?: IQuestionDb<string>) {
    const question = {
      name: questionDb?.name || this.name,
      slug: questionDb?.slug || this.slug,
      value: this.selectedAnswer!.dataset.answer!,
      createdAt: questionDb?.createdAt || new Date(),
      updatedAt: this.updatedAt,
    };

    await this.db.save(question);
  }

  private async onUpdate(element: EventTarget | null) {
    this.addSelectedClass(element);
    this.save(await this.db.getQuestion(this.slug));
  }

  private addSelectedClass(element: EventTarget | null) {
    this.possibleAnswers.forEach((answer) => {
      answer.classList.remove("selected");
    });

    (element as HTMLElement)?.classList.add("selected");
  }

  public async getAnswer() {
    return await this.db.getQuestion(this.slug);
  }

  public async getCreatedAt() {
    const question = await this.db.getQuestion(this.slug);

    return question?.createdAt || new Date();
  }

  public async deleteQuestion() {
    await this.db.delete(this.slug);
  }
}

export default Question;
