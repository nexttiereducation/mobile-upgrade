import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { ApiService } from '@nte/services/api.service';

@Injectable({ providedIn: 'root' })
export class PushNotificationService {
  // tslint:disable:no-console
  private _fcmToken: BehaviorSubject<string> = new BehaviorSubject(null);

  get fcmToken() {
    return this._fcmToken.getValue();
  }
  set fcmToken(token: string) {
    if (!this.fcmToken || token !== this.fcmToken) {
      this._fcmToken.next(token);
      this.setToken();
    }
  }
  get fcmToken$() {
    return this._fcmToken.asObservable();
  }

  constructor(private api: ApiService) { }

  public setToken() {
    if (this.fcmToken && this.fcmToken.length) {
      this.api.post(`/notification/`, { token: this.fcmToken })
        .subscribe(() => {
          console.log(`FCM token posted to NextTier API: ${this.fcmToken}`);
        });
    }
  }

}
