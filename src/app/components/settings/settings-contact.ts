import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ToastController } from '@ionic/angular';
import { cloneDeep } from 'lodash';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { EMAIL_REGEX } from '@nte/constants/regex.constants';
import { IContactEmail } from '@nte/interfaces/contact-email.interface';
import { IContactPhone } from '@nte/interfaces/contact-phone.interface';
import { IContactSettings } from '@nte/interfaces/contact-settings.interface';
import { IPhoneVerification } from '@nte/interfaces/phone-verification.interface';
import { IUserOverview } from '@nte/interfaces/user-overview.interface';
import { SettingsProvider } from '@nte/services/settings.service';

@Component({
  selector: `contact-settings`,
  templateUrl: `settings-contact.html`
})
export class ContactSettingsComponent implements OnInit, OnDestroy {
  @Input() canEdit: boolean;
  @Input() currentUser: IUserOverview;

  public alternateEmailControl: FormControl = new FormControl();
  public altPhoneControl: FormControl = new FormControl();
  public countryPhoneCodes: any[];
  public emailRegex: RegExp = EMAIL_REGEX;
  public initialUser: IUserOverview;
  public phoneControl: FormControl = new FormControl();
  public primaryEmailControl: FormControl = new FormControl();
  public verificationCode: number;

  private ngUnsubscribe: Subject<any> = new Subject();

  get showVerificationForm() {
    return this.phoneValid(this.currentUser)
      && !this.currentUser.is_phone_verified
      && this.currentUser.notification_settings.sms.isEnabled;
  }

  constructor(private settingsProvider: SettingsProvider,
    private toast: ToastController) { }

  ngOnInit() {
    this.primaryEmailControl.setValue(this.currentUser.email);
    const altInfo = this.currentUser.alternate_contact_information;
    if (altInfo) {
      if (altInfo.email) {
        this.alternateEmailControl.setValue(this.currentUser.alternate_contact_information.email);
      }
      this.initialUser = cloneDeep(this.currentUser);
    } else {
      this.setAlternateContact();
    }
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  getUpdatedEmail(isAlternate?: boolean, removeValue?: boolean) {
    const baseProperty = isAlternate ? this.currentUser.alternate_contact_information : this.currentUser;
    return {
      email: (removeValue && isAlternate) ? null : baseProperty.email,
      isAlternate: isAlternate
    };
  }

  getUpdatedPhone(isAlternate?: boolean, removeValue?: boolean) {
    const baseProperty = isAlternate ? this.currentUser.alternate_contact_information : this.currentUser;
    return {
      isAlternate: isAlternate,
      phoneNumber: removeValue ? null : baseProperty.phone_number,
      phoneType: baseProperty.phone_type
    };
  }

  isEdited(propName: string, subPropName?: string) {
    if (subPropName) {
      return this.currentUser[propName][subPropName] !== this.initialUser[propName][subPropName];
    } else {
      return this.currentUser[propName] !== this.initialUser[propName];
    }
  }

  phoneValid(property: IUserOverview | IContactSettings) {
    return property.phone_number && property.phone_number.length > 10 && property.phone_type;
  }

  reset(propName: string, subPropName?: string) {
    if (subPropName) {
      this.currentUser[propName][subPropName] = this.initialUser[propName][subPropName];
    } else {
      this.currentUser[propName] = this.initialUser[propName];
    }
  }

  resetUser(updatedUser: IUserOverview) {
    this.currentUser = updatedUser;
    if (!this.currentUser.alternate_contact_information) {
      this.setAlternateContact();
    } else {
      this.initialUser = cloneDeep(this.currentUser);
    }
  }

  setAlternateContact() {
    this.currentUser.alternate_contact_information = {
      email: null,
      id: null,
      is_phone_verified: null,
      phone_number: null,
      phone_type: null,
      phone_verification_code: null
    };
    this.initialUser = cloneDeep(this.currentUser);
  }

  setPhone(phone: string, isAlternate: boolean) {
    if (phone) {
      const hasValue = (phone && phone.length > 0);
      if (phone.length && phone.charAt(0) !== `+`) {
        this.toast.create({ message: `Country code required.` }).present();
        return;
      }
      this.updatePhone(isAlternate, hasValue);
    }
  }

  updateEmail(isAlternate: boolean, hasValue: boolean = true) {
    const updatedEmail: IContactEmail = this.getUpdatedEmail(isAlternate, !hasValue);
    if (updatedEmail.email && updatedEmail.email.length) {
      this.settingsProvider.updateEmail(this.currentUser.id, updatedEmail)
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe(
          response => {
            this.resetUser(response);
            this.toast.create({ message: `${isAlternate ? `Alternate` : `Main`} email address saved.` }).present();
          },
          () => this.toast.create({ message: `Can't update email settings. Please try again.` }).present()
        );
    }
  }

  updatePhone(isAlternate: boolean, hasValue: boolean = true) {
    if (hasValue
      && (this.phoneValid(this.currentUser)
        || (isAlternate
          && !this.phoneValid(this.currentUser.alternate_contact_information)))) {
      return;
    }
    const updatedPhone: IContactPhone = this.getUpdatedPhone(isAlternate, !hasValue);
    if (updatedPhone.phoneNumber && updatedPhone.phoneNumber.length) {
      this.settingsProvider.updatePhone(this.currentUser.id, updatedPhone)
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe(
          response => {
            this.resetUser(response);
            this.toast.create({ message: `${isAlternate ? `Alternate` : `Main`} phone number/type saved.` }).present();
          },
          () => this.toast.create({ message: `Can't update phone settings. Please try again.` }).present()
        );
    }
  }

  updateNotificationSettings() {
    this.settingsProvider.updateNotificationSettings(this.currentUser)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(
        response => this.resetUser(response),
        () => this.toast.create({ message: `Can't update notification settings. Please try again.` }).present()
      );
  }

  verifyPhone() {
    const verificationInfo: IPhoneVerification = {
      phoneNumber: this.currentUser.phone_number,
      verificationCode: this.verificationCode
    };
    this.settingsProvider.verifyPhone(this.currentUser.id, verificationInfo)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(
        response => {
          this.resetUser(response);
          this.verificationCode = null;
          this.toast.create({ message: `Phone number verified.` }).present();
        },
        () => this.toast.create({ message: `Can't verify phone number. Please try again.` }).present()
      );
  }

}
