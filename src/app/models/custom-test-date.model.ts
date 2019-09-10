export class CustomTestDate {
  public date: string = ``;

  constructor(obj: any) {
    for (const prop in obj) {
      if (this.hasOwnProperty(prop)) {
        this[prop] = obj[prop];
      }
    }
  }
}
