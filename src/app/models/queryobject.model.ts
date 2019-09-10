export class QueryObject {
  public displayName?: string;
  public name: string;
  public values: any[] = [];

  constructor(queryObject?: QueryObject) {
    if (queryObject) {
      this.displayName = queryObject.displayName;
      this.name = queryObject.name;
      this.values = queryObject.values ? queryObject.values : [];
    }
  }
}
