import { IScholarship } from '@nte/interfaces/scholarship.interface';

export interface IScholarshipTracker {
  created_on: string;
  id: number;
  scholarship: IScholarship;
  updated_on: string;
}
