import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject';

import 'rxjs/add/operator/map';

import { IStudent } from '@nte/models/student.interface';

@Injectable({ providedIn: 'root' })
export class StudentService {
  private _selected = new Subject<IStudent>();

  get selected() {
    return this._selected.asObservable();
  }

  constructor() { }

  public setSelected(student: IStudent) {
    this._selected.next(student);
  }

}
