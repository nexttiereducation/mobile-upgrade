export interface ITask {
  at_risk: {
    count: number;
    url: string;
  };
  behind: {
    count: number;
    url: string;
  };
  deadline: Date;
  detail_url: string;
  details?: ITask[];
  id: number;
  name: string;
  next: string;
  on_schedule: {
    count: number;
    url: string;
  };
  show: boolean;
  student_count: number;
}
