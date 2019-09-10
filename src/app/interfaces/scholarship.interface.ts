import { ICollege } from '@nte/interfaces/college.interface';
import { IIdentifiable } from '@nte/interfaces/global.interface';

export interface IAwardStat {
  amount: any;
  count: any;
}

export interface IRecommendedScholarship {
  id: number;
  institution: ICollege;
  recommender: IScholarshipRecommender;
  scholarship: IScholarship;
}

export interface ISavedScholarship {
  amount_awarded: number;
  archived: boolean;
  created_on: string;
  decision: string;
  id: number;
  scholarship: IScholarship;
  status: string;
  student: number;
  type: `saved`;
  updated_on: string;
}

export interface IScholarship {
  application_url: string;
  applying: boolean;
  art: any[];
  associated_college: string;
  associated_highschool: string;
  avail_to_detail: string;
  avail_to_details: string;
  avg_awards?: any;
  award_amount?: any;
  award_amount_avg?: any;
  award_amount_max: number;
  award_amount_min: number;
  award_count?: any;
  award_coverage?: any;
  award_coverage_details: string;
  award_coverage_id?: any;
  award_schedule: string;
  award_type: string;
  award_type_detail: string;
  award_type_details: string;
  award_type_id: number;
  awardAvg?: IAwardStat;
  awarded_annually: string;
  awardMax?: IAwardStat;
  awardMin?: IAwardStat;
  citizenship: any[];
  city: any[];
  club: string[];
  contact: IContact;
  contact_id: number;
  corp_aff: any[];
  country: any[];
  county: any[];
  criteria: ICriteria;
  criteria_details: string;
  deadline_details: string;
  deadlines?: any[];
  deadlines_formatted?: any[];
  disability: any[];
  district?: any;
  enrollment_level: string[];
  ethnicity: any[];
  gender: string;
  grade: string;
  grant_pct?: any;
  greek_org: any[];
  high_school: any[];
  id: number;
  interest: any[];
  isExpanded: boolean;
  major: any[];
  marital_status: any[];
  max_age: string;
  max_awards?: any;
  military_aff: any[];
  min_age: string;
  min_awards?: any;
  name: string;
  national_merit: any[];
  num_apps: number;
  prof_circum: any[];
  prof_org: any[];
  profession: any[];
  race: any[];
  recommendation_count: number;
  religion: string[];
  renew_details: string;
  renewable: string;
  repay_detail: string;
  repay_details: string;
  repay_required: string;
  saved: boolean;
  scholarship_cats: string;
  scholarship_id: number;
  school: any[];
  school_details: string;
  school_restricted: string;
  school_specific: string;
  school_state: any[];
  selected: IIdentifiable[];
  separate_app_required: string;
  sponsor: ISponsor;
  sponsor_id: number;
  sport: any[];
  state: any[];
  status: string;
  study_areas: string;
  type: string;
  union: any[];
  unlimited_awards: string;
}

export interface IScholarshipRecommender {
  email: string;
  get_full_name: string;
  graduation_year: number;
  id: number;
  profile_photo: string;
  stakeholder_type: string;
}

export interface ISponsor {
  address1: string;
  address2: string;
  address3: string;
  address4: string;
  city: string;
  country: string;
  email: string;
  fax: string;
  id: number;
  is_school: string;
  name: string;
  phone: string;
  scid: string;
  sponsor_id: number;
  state: string;
  url: string;
  zip_code: string;
}

export interface ICriteria {
  gender: string;
  grade: string;
  id: number;
  max_act?: any;
  max_age?: any;
  max_class_rank?: any;
  max_ged?: any;
  max_gpa?: any;
  max_sat_composite?: any;
  max_sat_math?: any;
  max_sat_verbal?: any;
  max_sat_writing?: any;
  min_act?: any;
  min_age?: any;
  min_class_rank?: any;
  min_ged?: any;
  min_gpa?: any;
  min_sat_composite?: any;
  min_sat_math?: any;
  min_sat_verbal?: any;
  min_sat_writing?: any;
  min_toefl?: any;
  scholarship_id: number;
}

export interface IContact {
  address1: string;
  address2: string;
  address3: string;
  address4: string;
  city: string;
  contact_id: number;
  country: string;
  email: string;
  fax: string;
  id: number;
  name: string;
  phone: string;
  state: string;
  title: string;
  zip_code: string;
}
