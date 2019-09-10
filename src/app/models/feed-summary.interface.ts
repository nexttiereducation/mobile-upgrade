export interface IFeedCategoryDetail {
  category_count: number;
  category_icon: string;
  filter_url: string;
  isSelected?: boolean;
}

export interface IFeedCategories {
  accepted_connections: IFeedCategoryDetail;
  accepted_recommendations: IFeedCategoryDetail;
  achievements_earned: IFeedCategoryDetail;
  failed_logins: IFeedCategoryDetail;
  files_uploaded_to_profile: IFeedCategoryDetail;
  files_uploaded_to_task: IFeedCategoryDetail;
  notes_added: IFeedCategoryDetail;
  rejected_recommendations: IFeedCategoryDetail;
  schools_added: IFeedCategoryDetail;
  schools_removed: IFeedCategoryDetail;
  submitted_applications: IFeedCategoryDetail;
  successful_logins: IFeedCategoryDetail;
  tasks_completed: IFeedCategoryDetail;
  tasks_due: IFeedCategoryDetail;
  tasks_started: IFeedCategoryDetail;
}

export interface IFeedSummary {
  categories: IFeedCategories;
  categoryKeys?: string[];
  display_day: string;
}
