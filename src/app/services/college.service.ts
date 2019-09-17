import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class CollegeService {
  private _active: BehaviorSubject<any> = new BehaviorSubject(null);
  private _details: BehaviorSubject<any> = new BehaviorSubject(null);

  get active() {
    return this._active.getValue();
  }
  set active(active: any) {
    this._active.next(active);
  }
  get active$() {
    return this._active.asObservable();
  }

  get details() {
    return this._details.getValue();
  }
  set details(details: any) {
    this._details.next(details);
  }
  get details$() {
    return this._details.asObservable();
  }
}
