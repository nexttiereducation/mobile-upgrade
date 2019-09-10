export class StudentNote {
  public created?: string;
  public currentContent?: any;
  public editing?: boolean;
  public id: number;
  public note: string;
  public title: string;
  public updated?: string;

  constructor(note: any = {}) {
    this.created = note.created || null;
    this.currentContent = note.currentContent || {};
    this.editing = note.editing || true;
    this.id = note.id || -1;
    this.note = note.note || ``;
    this.title = note.title || ``;
    this.updated = note.updated || null;
  }
}
