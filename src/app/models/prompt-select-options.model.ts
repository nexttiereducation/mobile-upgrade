export interface IPromptSelectChoice {
  id: any;
  value: string;
}

export class PromptSelectOptions {
  public choices: IPromptSelectChoice[];

  constructor(choices: string) {
    // tslint:disable-next-line:no-eval
    const choicesArray = eval(choices);
    this.choices = new Array<IPromptSelectChoice>();

    for (let i = 0, choice; choice = choicesArray[i]; ++i) {
      if (typeof (choice) === `string`) {
        this.choices.push({
          id: choice,
          value: choice
        });
      } else {
        Object.keys(choice).forEach((key) => {
          this.choices.push({
            id: choice[key],
            value: key
          });
        });
      }
    }
  }
}
