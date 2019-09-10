export interface ISatScore {
  date_taken: string;
  editing: boolean;
  id: number;
  math: number;
  reading: number;
  reading_and_writing: number;
  testType?: string;
  writing: number;
}
