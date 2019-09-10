import { IPotentialMajor } from '@nte/interfaces/potential-major.interface';

interface ICareer {
  description: string;
  id: number;
  interest_code: string;
  is_bright_outlook: boolean;
  onetsoc_code: string;
  pathway: IPathway;
  title: string;
}

interface ICluster {
  code: string;
  created_on: string;
  id: number;
  title: string;
  updated_on: string;
}

interface IPathway {
  cluster: ICluster;
  code: string;
  created_on: string;
  id: number;
  potential_majors: IPotentialMajor[];
  title: string;
  updated_on: string;
}

export interface ICareerTracker {
  career: ICareer;
  created_on: string;
  id: number;
  updated_on: string;
}
