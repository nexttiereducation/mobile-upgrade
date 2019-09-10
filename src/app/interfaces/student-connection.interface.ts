import { IStudent } from '@nte/interfaces/student.interface';

export interface IStudentConnection {
  id: number;
  isSelected: boolean;
  student: IStudent;
}
