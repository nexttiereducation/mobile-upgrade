export class Option {
  public cluster_title?: string;
  public dependency_resolver?: string;
  public display?: string;
  public id: string | number;
  public isActive?: boolean = false;
  public value: string;

    constructor(option: Option) {
      this.value = option.value;
      this.dependency_resolver = option.dependency_resolver;
      this.display = option.display;
      this.id = (option.id || option.id === 0) ? option.id : option.value;
      this.isActive = option.isActive;
      this.cluster_title = option.cluster_title;
    }
}
