import { IConnection } from '@nte/interfaces/connection.interface';
import { Stakeholder } from '@nte/models/stakeholder.model';

export interface IRecommendation {
  id: number;
  recommender: IConnection;
  student?: Stakeholder;
}
