export const NOTIFICATION_SETTING_SECTIONS = [
  {
    title: `Tasks`,
    fields: [
      {
        displayAs: `Task added / edited / removed`,
        key: `hasTaskAddedEditedOrDeleted`
      },
      {
        displayAs: `Task deadline approaching`,
        key: `hasTaskDeadlineApproaching`
      },
      {
        displayAs: `Notes/files added to task`,
        key: `hasTaskNotesAndFilesAdded`
      }
    ]
  },
  {
    title: `Recommendations`,
    fields: [
      {
        displayAs: `College recommendation received`,
        key: `hasCollegeRecommendationReceived`
      },
      {
        displayAs: `Scholarship recommendation received`,
        key: `hasScholarshipRecommendationReceived`
      }
    ]
  },
  {
    title: `Messages`,
    fields: [
      {
        displayAs: `Message received`,
        key: `hasMessageRecieved`

      }
    ]
  }
];
// export const NOTIFICATION_SETTING_OPTIONS = {
//   hasTaskDeadlineApproaching: {
//     section: 'Tasks',
//     displayAs: 'Task deadline approaching'
//   },
//   hasTaskNotesAndFilesAdded: {
//     section: 'Tasks',
//     displayAs: 'Note(s) and/or file(s) added to task'
//   },
//   hasTaskAddedEditedOrDeleted: {
//     section: 'Tasks',
//     displayAs: 'Task added, edited, and/or removed'
//   },
//   hasCollegeRecommendationReceived: {
//     section: 'Recommendations',
//     displayAs: 'College recommendation received'
//   },
//   hasScholarshipRecommendationReceived: {
//     section: 'Recommendations',
//     displayAs: 'Scholarship recommendation received'
//   },
//   hasMessageReceived: {
//     section: 'Messages',
//     displayAs: 'Message received'
//   }
// };
