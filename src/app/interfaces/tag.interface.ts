import { INameable } from '@nte/interfaces/global.interface';

export interface ITag {
  creator: number;
  id: number | string;
  name: string;
  selected?: boolean;
  tag_type: string;
}

export interface ITagItem {
  id: number;
  tag: INameable;
}
