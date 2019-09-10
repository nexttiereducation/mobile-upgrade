// APPLICATION MANAGER Constants

export const STATUS_TRANSLATIONS = {
  'Accepted': `done`,
  'Complete': `done`,
  'Completed': `done`,
  'Declined': `un-started`,
  'Deferred': `other`,
  'In Progress': `started`,
  'Incomplete': `un-started`,
  'Not Sent': `un-started`,
  'Not Started': `un-started`,
  'Not Taken': `un-started`,
  'Received': `done`,
  'Registered': `started`,
  'Requested': `done`,
  'Sent': `done`,
  'Waitlisted': `other`
};

export const OVERVIEW_STATUS_VALUES = [
  `fafsa_progress`,
  `css_progress`,
  `letters_progress`
];

export const OVERVIEW_STATUS_TITLES = {
  css_progress: [`Not Started`, `In Progress`, `Complete`],
  fafsa_progress: [`Not Started`, `In Progress`, `Complete`],
  letters_progress: [`Not Started`, `Requested`]
};

// DATA TABLE Constants

export const TABLE_VALUES = [
  `testing_task`,
  `transcript_task`,
  `letters_task`,
  `application_task`
];

export const SORT_VALUES = {
  COLLEGE: `institution__name`,
  DEADLINE: `deadline`,
  NAME: `student__last_name`
};
