import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

import { IStudent } from '@nte/interfaces/student.interface';


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
