interface ISetting {
  hasCollegeRecommendationReceived: boolean;
  hasMessageRecieved: boolean;
  hasScholarshipRecommendationReceived: boolean;
  hasTaskAddedEditedOrDeleted: boolean;
  hasTaskDeadlineApproaching: boolean;
  hasTaskNotesAndFilesAdded: boolean;
}

interface ISms {
  isEnabled: boolean;
}

export interface INotificationSetting {
  email: ISetting;
  push: ISetting;
  sms: ISms;
}
