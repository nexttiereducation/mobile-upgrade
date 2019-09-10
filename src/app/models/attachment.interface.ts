import { INameable } from './global.interface';

export interface IStudentDetailConnection {
  email: string;
  full_name: string;
  graduation_year: number;
  id: number;
}

export interface IAttachmentTaskTracker {
  id: number;
  institution_name?: string;
  task: INameable;
}

export interface IAttachment {
  author_name?: string;
  file: string;
  file_name: string;
  file_type?: string;
  id: number;
  recipient?: number;
  stakeholder: IStudentDetailConnection;
  task_tracker?: IAttachmentTaskTracker;
  uploaded_on: string;
}
