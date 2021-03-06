import { IApplicationDate } from '@nte/interfaces/application-date.interface';
import { ICollegeDetails } from '@nte/interfaces/college-details.interface';

export interface ICollege {
  account_name?: any;
  admissions_address?: string;
  admissions_url?: string;
  application_group: any;
  campus_size?: any;
  city?: string;
  deadlines: IApplicationDate[];
  details?: ICollegeDetails;
  financial_aid_url?: string;
  home_url?: string;
  id: number;
  is_account?: boolean;
  is_displayed?: boolean;
  is_form?: boolean;
  is_group?: boolean;
  is_public?: boolean;
  is_undergraduate?: boolean;
  is_visible?: boolean;
  isBookmarked?: boolean;
  latitude?: string;
  longitude?: string;
  name: string;
  net_price?: number;
  online_application_url?: string;
  photo_url: string;
  population?: number;
  program_detail?: string[];
  program?: string[];
  region?: string;
  religious_affil?: string;
  school_setting?: any;
  sector?: string;
  selected: boolean;
  six_year_grad_pcf?: number;
  state?: string;
  tags?: number[];
  telephone?: string;
  total_costs_in_state?: number;
  total_costs_out_of_state?: number;
  unit_id?: number;
  urbanization?: string;
  zipcode?: string;
}

export interface ICollegeItem {
  city: string;
  id: number;
  name: string;
  photo_url: string;
  state: string;
}
