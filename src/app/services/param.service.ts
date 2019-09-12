import { Injectable } from '@angular/core';
import { ParamMap } from '@angular/router';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class ParamService {
  private _params: BehaviorSubject<ParamMap> = new BehaviorSubject<ParamMap>(null);

  set params(params: ParamMap) {
    this._params.next(params);
  }

  get params() {
    return this._params.getValue();
  }

  constructor() { }

  getBoolean(paramName: string) {
    if (this.params.has(paramName)) {
      if (this.params.get(paramName) === `undefined`) {
        return null;
      } else {
        return this.params.get(paramName) === `true`;
      }
    } else {
      return null;
    }
  }

  getNumber(paramName: string) {
    if (this.params.has(paramName)) {
      if (this.params.get(paramName) === `undefined`) {
        return null;
      } else {
        return +this.params.get(paramName);
      }
    } else {
      return null;
    }
  }

  getObject(paramName: string) {
    if (this.params.has(paramName)) {
      if (this.params.get(paramName) === `undefined`) {
        return null;
      } else {
        return JSON.parse(this.params.get(paramName));
      }
    } else {
      return null;
    }
  }

  getString(paramName: string) {
    if (this.params.has(paramName)) {
      if (this.params.get(paramName) === `undefined`) {
        return null;
      } else {
        return this.params.get(paramName);
      }
    } else {
      return null;
    }
  }
}
