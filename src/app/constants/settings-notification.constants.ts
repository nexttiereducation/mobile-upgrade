export const NOTIFICATION_SETTING_SECTIONS = [
  {
    title: `Tasks`,
    fields: [
      {
        displayAs: `New or changed task`,
        key: `hasTaskAddedEditedOrDeleted`
      },
      {
        displayAs: `Task due soon`,
        key: `hasTaskDeadlineApproaching`
      },
      {
        displayAs: `New notes/files on task`,
        key: `hasTaskNotesAndFilesAdded`
      }
    ]
  },
  {
    title: `Recommendations`,
    fields: [
      {
        displayAs: `New college recommendation`,
        key: `hasCollegeRecommendationReceived`
      },
      {
        displayAs: `New scholarship recommendation`,
        key: `hasScholarshipRecommendationReceived`
      }
    ]
  },
  {
    title: `Messages`,
    fields: [
      {
        displayAs: `New message`,
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
