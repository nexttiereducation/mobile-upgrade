import { IScholarship } from '@nte/interfaces/scholarship.interface';

export interface IScholarshipRec {
  created_on: string;
  id: number;
  scholarship: IScholarship;
}
