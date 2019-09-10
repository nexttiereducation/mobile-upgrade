export interface IChoice {
  id: number;
  isChosen: boolean;
  value: string;
}

export class PromptTestDatesOptions {
  public choices: IChoice[];

  constructor(choices: string) {
    const choicesArray = choices;
    this.choices = new Array<IChoice>();

    for (let i = 0, choice; choice = choicesArray[i]; ++i) {
      Object.keys(choice).forEach((key) => {
        this.choices.push({
          id: choice[key],
          isChosen: false,
          value: key
        });
      });
    }
  }
}
