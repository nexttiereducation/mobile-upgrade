export class BackEndPrompt<T> {
  public api_endpoint: string;
  public event: string;
  public id: number;
  public options: T;
  public question: string;
  public task: number;
  public type: string;

  constructor(data: any) {
    this.id = data.id;
    this.event = data.event;
    this.question = data.question;
    this.api_endpoint = data.api_endpoint;
    this.options = data.choices;
    this.type = data.type;
    this.task = data.task;
  }
}
