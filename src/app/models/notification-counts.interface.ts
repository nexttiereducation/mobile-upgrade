interface ICount {
  read: number;
  total: number;
  unread: number;
}

export interface INotificationCounts extends ICount {
  categories: {
    Accomplishment: ICount
    Communication: ICount,
    Task: ICount
  };
}
