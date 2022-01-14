import Dexie from "dexie";
import { IQuestionDb } from "../question/Question.interface";
import { QuestionDb } from "./QuestionDb";

export class IndexedDb extends Dexie {
  questions!: Dexie.Table<IQuestionDb<string>, string>;

  constructor(name: string) {
    super(name);

    const db = this;
    db.version(1).stores({
      questions: "slug, name, value, createdAt, updatedAt",
    });

    db.questions.mapToClass(QuestionDb);
  }
}
