import { IFeedCategory } from '@nte/models/feed-category.interface';

const URLS = {
  ACHIEVEMENT: `https://next-tier.s3.amazonaws.com/build/images/notifications/ic_thumb_noti_item_accomplishment.svg`,
  COMMUNITY_RESPONSE: `https://s3.amazonaws.com/next-tier/images/counselor/cd_community-reply.svg`,
  CONNECTIONS: `https://s3.amazonaws.com/next-tier/images/counselor/cd_connection-accepted.svg`,
  FILE: `https://s3.amazonaws.com/next-tier/images/counselor/cd_file-added.svg`,
  NOTE: `https://next-tier.s3.amazonaws.com/build/images/notifications/ic_thumb_noti_item_commv.svg`,
  SCHOOL: `https://next-tier.s3.amazonaws.com/build/images/ic_schools_ind.png`,
  STUDENT: `https://next-tier.s3.amazonaws.com/build/images/ic_student_badge.png`,
  TASK: `https://next-tier.s3.amazonaws.com/build/images/tasks/ic_thumb_noti_item_tasks.svg`
};

export const FEED_CATEGORIES = new Map<number, IFeedCategory>(
  [
    [0, { displayCategory: `Schools Added`, imageUrl: URLS.SCHOOL }],
    [1, { displayCategory: `Tasks Started`, imageUrl: URLS.TASK }],
    [2, { displayCategory: `Tasks Completed`, imageUrl: URLS.TASK }],
    [3, { displayCategory: `Notes Added`, imageUrl: URLS.NOTE }],
    [4, { displayCategory: `Achievements Earned`, imageUrl: URLS.ACHIEVEMENT }],
    [5, { displayCategory: `Submitted Applications`, imageUrl: URLS.STUDENT }],
    [6, { displayCategory: `Accepted Recommendations`, imageUrl: URLS.STUDENT }],
    [7, { displayCategory: `Rejected Recommendations`, imageUrl: URLS.STUDENT }],
    [8, { displayCategory: `Accepted Connections`, imageUrl: URLS.STUDENT }],
    [9, { displayCategory: `Tasks Due`, imageUrl: URLS.STUDENT }],
    [10, { displayCategory: `Schools Removed`, imageUrl: URLS.STUDENT }],
    [11, { displayCategory: `Successful Logins`, imageUrl: URLS.STUDENT }],
    [12, { displayCategory: `Failed Logins`, imageUrl: URLS.STUDENT }],
    [13, { displayCategory: `Files Uploaded to Tasks`, imageUrl: URLS.FILE }],
    [14, { displayCategory: `Files Uploaded to Profile`, imageUrl: URLS.FILE }],
    [16, { displayCategory: `Counselor Community Response`, imageUrl: URLS.COMMUNITY_RESPONSE }],
    [18, { displayCategory: `Invitation to Connect`, imageUrl: URLS.CONNECTIONS }]
  ]
);
