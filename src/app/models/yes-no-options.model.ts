export class YesNoOptions {
  public choices: string[];

  constructor(choices: string) {
    // tslint:disable-next-line:no-eval
    this.choices = new Array<string>(...eval(choices));
  }
}
