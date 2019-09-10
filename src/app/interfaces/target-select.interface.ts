import { Target } from '@nte/models/target-select.model';

export interface IConfig {
  action: string;
  targets: Target[];
}

export interface ISelection<T> {
  id: number;
  name: string;
  photoUrl: string;
  type: T;
}
