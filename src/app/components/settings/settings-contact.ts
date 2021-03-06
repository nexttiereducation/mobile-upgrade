import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { cloneDeep } from 'lodash';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { ToastService } from './../../services/toast.service';
import { EMAIL_REGEX } from '@nte/constants/regex.constants';
import { IContactEmail } from '@nte/interfaces/contact-email.interface';
import { IContactPhone } from '@nte/interfaces/contact-phone.interface';
import { IContactSettings } from '@nte/interfaces/contact-settings.interface';
import { IPhoneVerification } from '@nte/interfaces/phone-verification.interface';
import { IUserOverview } from '@nte/interfaces/user-overview.interface';
import { SettingsService } from '@nte/services/settings.service';

@Component({
  selector: `contact-settings`,
  templateUrl: `settings-contact.html`
})
export class ContactSettingsComponent implements OnInit, OnDestroy {
  @Input() canEdit: boolean;
  @Input() userOverview: IUserOverview;

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
    return this.phoneValid(this.userOverview)
      && !this.userOverview.is_phone_verified
      && this.userOverview.notification_settings.sms.isEnabled;
  }

  constructor(private settingsService: SettingsService,
    private toastService: ToastService) { }

  ngOnInit() {
    this.primaryEmailControl.setValue(this.userOverview.email);
    const altInfo = this.userOverview.alternate_contact_information;
    if (altInfo) {
      if (altInfo.email) {
        this.alternateEmailControl.setValue(this.userOverview.alternate_contact_information.email);
      }
      this.initialUser = cloneDeep(this.userOverview);
    } else {
      this.setAlternateContact();
    }
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  getUpdatedEmail(isAlternate?: boolean, removeValue?: boolean) {
    const baseProperty = isAlternate ? this.userOverview.alternate_contact_information : this.userOverview;
    return {
      email: (removeValue && isAlternate) ? null : baseProperty.email,
      isAlternate
    };
  }

  getUpdatedPhone(isAlternate?: boolean, removeValue?: boolean) {
    const baseProperty = isAlternate ? this.userOverview.alternate_contact_information : this.userOverview;
    return {
      isAlternate,
      phoneNumber: removeValue ? null : baseProperty.phone_number,
      phoneType: baseProperty.phone_type
    };
  }

  isEdited(propName: string, subPropName?: string) {
    if (subPropName) {
      return this.userOverview[propName][subPropName] !== this.initialUser[propName][subPropName];
    } else {
      return this.userOverview[propName] !== this.initialUser[propName];
    }
  }

  phoneValid(property: IUserOverview | IContactSettings) {
    return property.phone_number && property.phone_number.length > 10 && property.phone_type;
  }

  reset(propName: string, subPropName?: string) {
    if (subPropName) {
      this.userOverview[propName][subPropName] = this.initialUser[propName][subPropName];
    } else {
      this.userOverview[propName] = this.initialUser[propName];
    }
  }

  resetUser(updatedUser: IUserOverview) {
    this.userOverview = updatedUser;
    if (!this.userOverview.alternate_contact_information) {
      this.setAlternateContact();
    } else {
      this.initialUser = cloneDeep(this.userOverview);
    }
  }

  setAlternateContact() {
    this.userOverview.alternate_contact_information = {
      email: null,
      id: null,
      is_phone_verified: null,
      phone_number: null,
      phone_type: null,
      phone_verification_code: null
    };
    this.initialUser = cloneDeep(this.userOverview);
  }

  setPhone(phone: string, isAlternate: boolean) {
    if (phone) {
      const hasValue = (phone && phone.length > 0);
      if (phone.length && phone.charAt(0) !== `+`) {
        this.toastService.open(`Country code required.`);
        return;
      }
      this.updatePhone(isAlternate, hasValue);
    }
  }

  updateEmail(isAlternate: boolean, hasValue: boolean = true) {
    const updatedEmail: IContactEmail = this.getUpdatedEmail(isAlternate, !hasValue);
    if (updatedEmail.email && updatedEmail.email.length) {
      this.settingsService.updateEmail(this.userOverview.id, updatedEmail)
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe(
          response => {
            this.resetUser(response);
            this.toastService.open(`${isAlternate ? `Alternate` : `Main`} email address saved.`);
          },
          () => this.toastService.open(`Can't update email settings. Please try again.`)
        );
    }
  }

  updatePhone(isAlternate: boolean, hasValue: boolean = true) {
    if (hasValue
      && (this.phoneValid(this.userOverview)
        || (isAlternate
          && !this.phoneValid(this.userOverview.alternate_contact_information)))) {
      return;
    }
    const updatedPhone: IContactPhone = this.getUpdatedPhone(isAlternate, !hasValue);
    if (updatedPhone.phoneNumber && updatedPhone.phoneNumber.length) {
      this.settingsService.updatePhone(this.userOverview.id, updatedPhone)
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe(
          response => {
            this.resetUser(response);
            this.toastService.open(`${isAlternate ? `Alternate` : `Main`} phone number/type saved.`);
          },
          () => this.toastService.open(`Can't update phone settings. Please try again.`)
        );
    }
  }

  updateNotificationSettings() {
    this.settingsService.updateNotificationSettings(this.userOverview)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(
        response => this.resetUser(response),
        () => this.toastService.open(`Can't update notification settings. Please try again.`)
      );
  }

  verifyPhone() {
    const verificationInfo: IPhoneVerification = {
      phoneNumber: this.userOverview.phone_number,
      verificationCode: this.verificationCode
    };
    this.settingsService.verifyPhone(this.userOverview.id, verificationInfo)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(
        response => {
          this.resetUser(response);
          this.verificationCode = null;
          this.toastService.open(`Phone number verified.`);
        },
        () => this.toastService.open(`Can't verify phone number. Please try again.`)
      );
  }

}
