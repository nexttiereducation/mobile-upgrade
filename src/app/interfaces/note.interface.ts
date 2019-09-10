export interface IAuthor {
  first_name: string;
  id: number;
  last_name: string;
}

export interface INote {
  author: IAuthor;
  created: Date;
  id: number;
  note: string;
}
