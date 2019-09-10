import { IStudent } from './student.interface';

export interface IStudentConnection {
  id: number;
  isSelected: boolean;
  student: IStudent;
}
