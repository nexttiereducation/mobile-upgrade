import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

import { IFeedCategory } from './feed-category.interface';
import { FEED_CATEGORIES } from '@nte/constants/feed-item.constants';
import { Stakeholder } from '@nte/models/stakeholder.model';

dayjs.extend(relativeTime);

export class FeedItem {
  public achievement?: string = undefined;
  public body: string = undefined;
  public category: number = undefined;
  public created_on: string = undefined;
  public goto: string = undefined;
  public id: number = undefined;
  public institution?: number = undefined;
  public institution_tracker?: number = undefined;
  public is_visible: boolean = undefined;
  public related_party?: number = undefined;
  public stakeholder: Stakeholder = undefined;
  public task_tracker?: number = undefined;

  get categoryDetails(): IFeedCategory {
    return FEED_CATEGORIES.get(this.category);
  }

  get createdOn(): string {
    return dayjs(this.created_on).toNow();
  }

  constructor(obj: any) {
    for (const prop in obj) {
      if (this.hasOwnProperty(prop)) {
        this[prop] = obj[prop];
      }
    }
  }
}
