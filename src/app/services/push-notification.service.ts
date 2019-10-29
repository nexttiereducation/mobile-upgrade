import { Injectable } from '@angular/core';
import { Plugins, PushNotification, PushNotificationActionPerformed, PushNotificationToken } from '@capacitor/core';
import { BehaviorSubject } from 'rxjs';

import { ApiService } from '@nte/services/api.service';

const { PushNotifications } = Plugins;

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

  public init() {
    PushNotifications.register();

    PushNotifications.addListener('registration',
      (token: PushNotificationToken) => {
        console.log('Push registration success, token: ' + token.value);
      }
    );

    PushNotifications.addListener('registrationError',
      (error: any) => {
        console.log('Error on registration: ' + JSON.stringify(error));
      }
    );

    PushNotifications.addListener('pushNotificationReceived',
      (notification: PushNotification) => {
        console.log('Push received: ' + JSON.stringify(notification));
      }
    );

    PushNotifications.addListener('pushNotificationActionPerformed',
      (notification: PushNotificationActionPerformed) => {
        console.log('Push action performed: ' + JSON.stringify(notification));
      }
    );
  }

  public setToken() {
    if (this.fcmToken && this.fcmToken.length) {
      this.api.post(`/notification/`, { token: this.fcmToken })
        .subscribe(() => {
          console.log(`FCM token posted to NextTier API: ${this.fcmToken}`);
        });
    }
  }

}
