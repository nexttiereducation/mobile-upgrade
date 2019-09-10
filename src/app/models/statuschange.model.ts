export class StatusChange<T> {
  public data: T;
  public hasChanged: boolean;

  constructor(hasChanged: boolean, data: T) {
    this.hasChanged = hasChanged;
    this.data = data;
  }
}
