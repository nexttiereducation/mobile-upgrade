import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { ICollege } from '@nte/interfaces/college.interface';

@Injectable({ providedIn: 'root' })
export class CollegeTabsService {
  private _activeCollege: BehaviorSubject<ICollege> = new BehaviorSubject<ICollege>(null);

  set activeCollege(college: ICollege) {
    this._activeCollege.next(college);
  }

  get activeCollege() {
    return this._activeCollege.getValue();
  }

  get activeCollege$() {
    return this._activeCollege.asObservable();
  }

  constructor() { }
}
