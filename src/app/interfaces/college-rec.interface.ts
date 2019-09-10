import { ICollegeItem } from '@nte/interfaces/college.interface';
import { IRecommendation } from '@nte/interfaces/recommendation.interface';

export interface ICollegeRec extends IRecommendation {
  institution: ICollegeItem;
}
