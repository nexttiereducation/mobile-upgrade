import { Injectable } from '@angular/core';

import { IContactEmail } from '@nte/interfaces/contact-email.interface';
import { IContactPhone } from '@nte/interfaces/contact-phone.interface';
import { IPhoneVerification } from '@nte/interfaces/phone-verification.interface';
import { IUserOverview } from '@nte/interfaces/user-overview.interface';
import { NodeApiService } from '@nte/services/api-node.service';

@Injectable({ providedIn: 'root' })
export class SettingsService {

  constructor(private api: NodeApiService) { }

  updateEmail(userId: number, updatedEmail: IContactEmail) {
    return this.api.put(`/users/${userId}/contact/email`, updatedEmail);
  }

  updatePhone(userId: number, updatedPhone: IContactPhone) {
    return this.api.put(`/users/${userId}/contact/phone`, updatedPhone);
  }

  updateNotificationSettings(user: IUserOverview) {
    return this.api.patch(`/users/${user.id}/notification-settings`, user.notification_settings);
  }

  updateUserInfo(userId: number, updatedInfo: any) {
    return this.api.patch(`/users/${userId}/info`, updatedInfo);
  }

  verifyPhone(userId: number, verificationInfo: IPhoneVerification) {
    return this.api.post(`/users/${userId}/contact/phone/verify`, verificationInfo);
  }
}
