import { IApplicationDate } from '@nte/interfaces/application-date.interface';
import { INameable } from '@nte/interfaces/global.interface';

export interface ICollegeDetails {
  act_25?: any;
  act_75?: any;
  act_english_25?: any;
  act_english_75?: any;
  act_math_25?: any;
  act_math_75?: any;
  act_writing_25?: any;
  act_writing_75?: any;
  admission_rate: string;
  admissions_rep_required?: boolean;
  admissions_telephone: string;
  af_offcamp?: boolean;
  airport_distance?: number;
  alumni_relations_importance?: any;
  application_admission: number;
  application_count: number;
  application_dates: IApplicationDate[];
  application_fee: number;
  army_offcamp?: boolean;
  athletic_conference?: string;
  athletic_division?: number;
  audition_required?: boolean;
  average_annual_debt_payment: number;
  average_annual_earnings: number;
  average_debt?: number;
  average_secondary_school_GPA?: number;
  avg_gpa?: any;
  background_url: string;
  ca_counselor_rec;
  ca_has_mid_year;
  ca_has_writing;
  ca_other_rec;
  ca_teacher_rec;
  character_quality_importance;
  class_rank_importance;
  coeducational_college;
  css_deadline?: any;
  css_deadlines?: any[];
  date_founded_exists;
  display_name;
  essay_importance;
  essay_required: string;
  extra_curricular_importance;
  facebook_handle;
  facebook_url;
  female_college;
  female_enrollment: number;
  financial_aid_deadline?: any;
  financial_aid_deadlines?: any[];
  financial_aid_url;
  founded_as_coed;
  four_year_grad_pcf: string;
  freshman_perecent_on_campus;
  geographical_importance;
  grad_population: number;
  group_app_essays_required;
  groups: INameable[];
  has_application_fee: boolean;
  has_group_app_supplement: boolean;
  has_group_app_supplements;
  historically_black;
  id: number;
  importance: {
    considered: string[],
    important: string[],
    'not considered': string[],
    'very important': string[],
  };
  in_state_tuition;
  initial_financial_aid: number;
  instagram_handle;
  instagram_url;
  institution: number;
  interview_importance: string;
  is_four_year?: boolean;
  letters_of_recommendation: string;
  low_income_access: number;
  major_city;
  male_college;
  male_enrollment: number;
  median_child_individual_earnings;
  minority_affiliation_importance;
  mission_statement_url?: any;
  mission_statement?: any;
  mobility_rate: number;
  most_popular_major_1?: string;
  most_popular_major_2?: string;
  most_popular_major_3?: string;
  navy_offcamp?: boolean;
  need_blind;
  non_ca_number_of_letters;
  non_profit: boolean;
  number_of_essays: number;
  number_of_letters: number;
  offers_interviews: boolean;
  orientation_required: boolean;
  other_pre_professional;
  out_of_state_tuition;
  percent_in_fraternity;
  percent_in_sorority;
  percent_working_students;
  percentage_enter_work_more_than_one_year;
  percentage_enter_work_one_year?: number;
  percentage_enter_work_six_months;
  percentage_fresh_out;
  percentage_further_education_immediate?: number;
  percentage_further_education_more_than_one_year;
  percentage_further_education_one_year;
  placement_required: boolean;
  placement_test_name?: any;
  portfolio_required;
  pre_dentistry?: boolean;
  pre_law?: boolean;
  pre_medicine?: boolean;
  pre_optometry?: boolean;
  pre_pharmacy?: boolean;
  pre_theology?: boolean;
  pre_veterinary?: boolean;
  public_transit;
  recommendation_importance;
  religious_involvement_importance;
  residency_required: boolean;
  retention_pcf: string;
  rotc_airforce;
  rotc_army;
  rotc_navy;
  rss_url;
  sat_math_25?: any;
  sat_math_75?: any;
  sat_reading_25?: any;
  sat_reading_75?: any;
  sat_writing_25?: any;
  sat_writing_75?: any;
  sat2: boolean;
  scholarship_deadline: string;
  scholarship_deadlines;
  scholarship_process;
  scholarship_url: string;
  school_interview_importance;
  secondary_school_record_importance;
  smart_search_keywords;
  snapchat_handle;
  state_residency_importance;
  talent_importance;
  team_nickname;
  test_accepted: string;
  test_required: boolean;
  test_score_importance;
  top_majors;
  total_costs_in_state_off_campus: string;
  total_costs_out_of_state_off_campus: string;
  transcripts_or_report: boolean;
  tuition_high?: any;
  tuition_low?: any;
  twitter_handle;
  twitter_url;
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
  volunteer_work_importance;
  work_experience_importance;
  writing_sample_required;
  youtube_url;
}
