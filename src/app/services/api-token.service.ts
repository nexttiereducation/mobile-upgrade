import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ApiTokenService {
  private _token: BehaviorSubject<string> = new BehaviorSubject(null);

  public set token(token: string) {
    this._token.next(token);
  }
  public get token(): string {
    return this._token.getValue();
  }
  public get token$(): Observable<string> {
    return this._token.asObservable();
  }

}
