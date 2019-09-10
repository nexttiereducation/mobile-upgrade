export class TaskTrackerChange<T> {
  public data: T;
  constructor(data: any) {
    this.data = data;
  }
}
