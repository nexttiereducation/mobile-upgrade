import { IApplicationDate } from '@nte/interfaces/application-date.interface';
import { INameable } from '@nte/interfaces/global.interface';

export interface ICollegeDetails {
  act_25?: any;
  act_75?: any;
  admission_rate: string;
  admissions_telephone: string;
  af_offcamp?: boolean;
  application_admission: string;
  application_count: string;
  application_dates: IApplicationDate[];
  application_fee: number;
  army_offcamp?: boolean;
  average_annual_debt_payment: number;
  average_annual_earnings: number;
  avg_gpa?: any;
  background_url: string;
  css_deadline?: any;
  essay_required: string;
  female_enrollment: number;
  financial_aid_deadline?: any;
  financial_aid_deadlines?: any[];
  four_year_grad_pcf: string;
  grad_population: number;
  groups: INameable[];
  has_application_fee: boolean;
  has_group_app_supplement: boolean;
  id: number;
  initial_financial_aid: number;
  institution: number;
  interview_importance: string;
  is_four_year?: boolean;
  letters_of_recommendation: string;
  low_income_access: number;
  male_enrollment: number;
  mission_statement_url?: any;
  mission_statement?: any;
  mobility_rate: number;
  most_popular_major_1?: string;
  most_popular_major_2?: string;
  most_popular_major_3?: string;
  navy_offcamp?: boolean;
  non_profit: boolean;
  number_of_essays: number;
  number_of_letters: number;
  offers_interviews: boolean;
  orientation_required: boolean;
  percentage_enter_work_one_year?: number;
  percentage_further_education_immediate?: number;
  placement_required: boolean;
  placement_test_name?: any;
  pre_dentistry?: boolean;
  pre_law?: boolean;
  pre_medicine?: boolean;
  pre_optometry?: boolean;
  pre_pharmacy?: boolean;
  pre_theology?: boolean;
  pre_veterinary?: boolean;
  residency_required: boolean;
  retention_pcf: string;
  sat_math_25?: any;
  sat_math_75?: any;
  sat_reading_25?: any;
  sat_reading_75?: any;
  sat_writing_25?: any;
  sat_writing_75?: any;
  sat2: boolean;
  scholarship_deadline: string;
  scholarship_url: string;
  test_accepted: string;
  test_required: boolean;
  total_costs_in_state_off_campus: string;
  total_costs_out_of_state_off_campus: string;
  transcripts_or_report: boolean;
  tuition_high?: any;
  tuition_low?: any;
  undergrad_american_indian: string;
  undergrad_asian: string;
  undergrad_black: string;
  undergrad_hawaiian: string;
  undergrad_hispanic: string;
  undergrad_men: string;
  undergrad_nonresident_alien: string;
  undergrad_pop: string;
  undergrad_population: number;
  undergrad_two_or_more: string;
  undergrad_unknown: string;
  undergrad_white: string;
  undergrad_women: string;
  vaccination_required: boolean;
}
