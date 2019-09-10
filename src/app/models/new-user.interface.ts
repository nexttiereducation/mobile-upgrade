export interface IGraduationInfo {
  phase: string;
  year: number;
}

export interface INewUser {
  auth_token?: any;
  confirmEmail?: string;
  district?: any;
  email: string;
  facebook_id?: any;
  first_name: string;
  graduation?: IGraduationInfo;
  graduation_year?: number;
  highschool?: number;
  highschool_name?: string;
  last_name: string;
  password: string;
  phase?: string;
  stakeholder_type: string;
}
