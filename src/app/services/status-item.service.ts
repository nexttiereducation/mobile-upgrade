import { Injectable } from '@angular/core';

import { ICollegeStatusItem, IScholarshipStatusItem, IStatusItem, StatusItem } from '@nte/models/status-item.interface';

@Injectable({ providedIn: 'root' })
export class StatusItemService {
  public getScholarshipPlaceholder(item: IScholarshipStatusItem) {
    let placeholder = ``;
    if (item.amount_awarded === null) {
      placeholder = item.isActive ? `N/A` : `ex. 5000`;
    }
    return placeholder;
  }

  public selectItem(
    result: any,
    item:
      | IStatusItem
      | IScholarshipStatusItem
      | ICollegeStatusItem = new StatusItem()
  ) {
    item.name = result.name;
    item.id = result.id;
  }

  public submitCustomResponse(
    query: string,
    item: IStatusItem | IScholarshipStatusItem | ICollegeStatusItem,
    isCollege: boolean
  ) {
    if (isCollege) {
      return;
    }
    item.name = query;
  }

  public toggleWaitlistedDeferred(
    item: IStatusItem | ICollegeStatusItem,
    property: string
  ) {
    const otherProperty = property === `waitlisted` ? `deferred` : `waitlisted`;
    if (item[property] === true) {
      item[otherProperty] = false;
    }
  }
}
