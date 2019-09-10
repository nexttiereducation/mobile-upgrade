export class Prompt<T> {
   public amount_awarded?: string;
   public choice: T;
   public custom_deadlines?: string[];
   public institution?: number;
   public scholarship?: number;
   public task: number;

  constructor(choice: T, task: number) {
    this.choice = choice;
    this.task = task;
  }
}
