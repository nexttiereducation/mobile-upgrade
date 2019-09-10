import { IEmptyState } from '@nte/models/empty-state';
import { IListTile } from '@nte/models/list-tile.interface';

export const TASK_LIST_BASE_URL = `/task_list_mobile/`;

export const TASK_LIST_EMPTY_STATES = {
  Counselor: {
    body: `Your counselor can assign you tasks to complete. ` +
      `Connect with them by logging in at nexttier.com and inviting them to join your team!`,
    imagePath: `task/type_counselor`,
    title: `You don't have any counselor tasks.`
  },
  Parent: {
    body: `Your connections are still pending. ` +
      `Once your student accepts your invitation to connect, you will see their tasks!`,
    imagePath: `task/tile_all`,
    title: `You don't have any student connections.`
  },
  Scholarship: {
    body: `You'll see tasks here once you mark a scholarship as 'Applying'.`,
    imagePath: `task/type_scholarship`,
    title: `You don't have any scholarship tasks.`
  },
  Survey: {
    body: `Your counselor can assign you surveys to take. ` +
      `Connect with them by logging in at nexttier.com and inviting them to join your team!`,
    imagePath: `task/type_survey`,
    title: `You don't have any survey tasks.`
  }
};

export const TASK_NOTES_EMPTY_STATE: IEmptyState = {
  body: `Start a conversation with your team about this task. Ask for advice, share updates, prioritize!`,
  imagePath: `task/detail_notes`,
  title: `This task doesn’t have any notes.`
};

export const TASK_SEARCH_EMPTY_STATE: IEmptyState = {
  body: `Try searching for something broad like transcript to ensure results`,
  imagePath: `general/search`,
  title: `We couldn't find a match`
};

export class TaskStatus {
  static get NOT_STARTED() {
    return `NS`;
  }

  static get STARTED() {
    return `ST`;
  }

  static get COMPLETED() {
    return `C`;
  }
}

export const TASK_BUCKETS = {
  All: {},
  Counselor: {},
  General: {},
  Scholarship: {},
  Survey: {}
};

export const TASK_STATUSES = {
  C: {
    color: `green`,
    icon: `checkmark`,
    name: `Completed`
  },
  NS: {
    action: `Start`,
    color: `primary`,
    icon: `play`,
    name: `Not Started`,
    nextStatus: `ST`
  },
  ST: {
    action: `Complete`,
    color: `orange`,
    icon: `more`,
    mdIcon: `more_horiz`,
    name: `In Progress`,
    nextStatus: `C`
  }
};

export const TASK_TILES: (IListTile | any)[] = [
  {
    colSpan: 8,
    filter: ``,
    iconFileName: `tile_search`,
    isLocked: true,
    name: `Search All`
  },
  {
    colSpan: 4,
    filter: `?task_type=U&task_type=UCS`,
    isLocked: true,
    name: `General`
  },
  {
    colSpan: 4,
    filter: `?status=ST&task_type=SURT&order_by=-status`,
    isLocked: true,
    name: `Survey`
  },
  {
    colSpan: 4,
    filter: `?task_type=CT`,
    isLocked: true,
    name: `Counselor`
  },
  {
    colSpan: 4,
    filter: `?task_type=ST`,
    isLocked: true,
    name: `Scholarship`,
    phase: `Senior`
  }
];
