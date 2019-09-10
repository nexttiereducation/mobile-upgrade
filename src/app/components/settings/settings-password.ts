import { Component, Input, OnDestroy } from '@angular/core';
import { ToastController } from '@ionic/angular';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { IUserOverview } from '@nte/interfaces/user-overview.interface';
import { StakeholderProvider } from '@nte/services/stakeholder.service';

@Component({
  selector: `password-settings`,
  templateUrl: `settings-password.html`
})
export class PasswordSettingsComponent implements OnDestroy {
  @Input() canEdit: boolean;
  @Input() currentUser: IUserOverview;

  public confirmedPassword: string;
  public currentPassword: string;
  public newPassword: string;

  private ngUnsubscribe: Subject<any> = new Subject();

  get formIncomplete() {
    return !this.confirmedPassword || !this.currentPassword || !this.newPassword;
  }

  constructor(private stakeholderService: StakeholderProvider,
    private toastCtrl: ToastController) { }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  resetPassword() {
    if (this.newPassword !== this.confirmedPassword) {
      this.toastCtrl.create({ message: `The passwords entered do not match. Please try again!` }).present();
    } else if (this.newPassword.length < 8) {
      this.toastCtrl.create({ message: `Your password must be at least 8 characters long` }).present();
    } else {
      this.stakeholderService.changePassword(this.currentPassword, this.newPassword, this.confirmedPassword)
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe(
          () => this.toastCtrl.create({ message: `Password successfully changed` }).present(),
          error => this.toastCtrl.create({ message: JSON.parse(error._body).detail }).present()
        );
    }
  }

}
