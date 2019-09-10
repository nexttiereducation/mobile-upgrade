import { ICollege } from '@nte/interfaces/college.interface';
import { IConnection } from '@nte/interfaces/connection.interface';
import { Stakeholder } from '@nte/models/stakeholder.model';

export interface ICollegeRecommendation {
  id: number;
  institution: ICollege;
  recommender: IConnection;
  student?: Stakeholder;
}
