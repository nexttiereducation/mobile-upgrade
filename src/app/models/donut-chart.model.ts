export class DonutChart {
  public values: number[];

  constructor(val: number) {
    this.values = [
      val,
      100 - val
    ];
  }

}
