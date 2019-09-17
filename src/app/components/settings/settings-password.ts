import { Component, Input, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { IUserOverview } from '@nte/interfaces/user-overview.interface';
import { StakeholderService } from '@nte/services/stakeholder.service';
import { ToastService } from '@nte/services/toast.service';

@Component({
  selector: `password-settings`,
  templateUrl: `settings-password.html`
})
export class PasswordSettingsComponent implements OnDestroy {
  @Input() canEdit: boolean;
  @Input() userOverview: IUserOverview;

  public confirmedPassword: string;
  public currentPassword: string;
  public newPassword: string;

  private ngUnsubscribe: Subject<any> = new Subject();

  get formIncomplete() {
    return !this.confirmedPassword || !this.currentPassword || !this.newPassword;
  }

  constructor(private stakeholderService: StakeholderService,
    private toastService: ToastService) { }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  public resetPassword(ev?: any) {
    // ev.value = form values
    // ev.valid = form passes validation
    if (this.newPassword !== this.confirmedPassword) {
      this.toastService.open(`The passwords entered do not match. Please try again!`);
    } else if (this.newPassword.length < 8) {
      this.toastService.open(`Your password must be at least 8 characters long`);
    } else {
      this.stakeholderService.changePassword(this.currentPassword, this.newPassword, this.confirmedPassword)
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe(
          () => this.toastService.open(`Password successfully changed`),
          error => this.toastService.open(`${JSON.parse(error._body)}.detail`)
        );
    }
  }

}
