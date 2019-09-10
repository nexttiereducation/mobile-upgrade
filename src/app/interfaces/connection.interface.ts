export interface IConnection {
  email: string;
  get_full_name: string;
  graduation_year: number;
  id: number;
  isSelected?: boolean;
  photo_url?: string;
  profile_photo: string;
  stakeholder_type: string;
}

export interface IConnectionItemUser {
  email: string;
  first_name: string;
  id: number;
  last_name: string;
  photo_url: string;
  stakeholder_type: string;
}

export interface IConnectionItem {
  connection_type: string;
  created_on: string;
  id: number;
  user: IConnectionItemUser;
}
