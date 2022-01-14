import { IndexedDb } from "./IndexedDb";

interface IQuestion<Value extends unknown = string> {
  name: string;
  slug: string;
  value: Value;
  createdAt: Date;
  updatedAt: Date;
}

export class QuestionDb {
  name!: string;
  slug!: string;
  value!: string;
  createdAt!: Date;
  updatedAt!: Date;
  private db: IndexedDb;

  constructor() {
    this.db = new IndexedDb("Questions");
    Object.defineProperties(this, {
      name: { value: [], writable: true, enumerable: false },
      slug: { value: [], writable: true, enumerable: false },
      value: { value: [], writable: true, enumerable: false },
    });
  }

  async getQuestion(slug: string) {
    return await this.db.questions.where("slug").equals(slug).first();
  }

  private get now(): Date {
    return new Date(Date.now());
  }

  async save({ name, slug, createdAt, value }: IQuestion<string>) {
    const question = {
      name,
      slug,
      value,
      createdAt: createdAt || this.now,
      updatedAt: this.now,
    };

    await this.db.questions.put(question);
  }

  async delete(slug: string) {
    await this.db.questions.delete(slug);
  }
}
