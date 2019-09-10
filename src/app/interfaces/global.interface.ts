export interface IIdentifiable {
  id: number;
}

export interface INameable {
  id: number;
  name: string;
}

export interface ITitleable {
  id: number;
  title: string;
}

export interface ISelectable {
  isSelected?: boolean;
}
