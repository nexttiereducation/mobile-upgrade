import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class NavStateService {
  private _data: BehaviorSubject<any> = new BehaviorSubject({});

  get data(): any {
    return this._data.getValue();
  }

  set data(data: any) {
    this._data.next(data);
  }

  constructor() { }

}
