import { Component, Input, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/internal/operators/takeUntil';

import { ToastService } from './../../services/toast.service';
import { NOTIFICATION_SETTING_SECTIONS } from '@nte/constants/settings-notification.constants';
import { IUserOverview } from '@nte/interfaces/user-overview.interface';
import { SettingsService } from '@nte/services/settings.service';
import { StakeholderService } from '@nte/services/stakeholder.service';

@Component({
  selector: `notification-settings`,
  templateUrl: `settings-notification.html`
})
export class NotificationSettingsComponent implements OnDestroy {
  @Input() canEdit: boolean;
  @Input() userOverview: IUserOverview;

  public sections: any[] = NOTIFICATION_SETTING_SECTIONS;

  private ngUnsubscribe: Subject<any> = new Subject();

  get user() {
    return this.stakeholderService.stakeholder;
  }

  constructor(private settingsService: SettingsService,
    private stakeholderService: StakeholderService,
    private toastService: ToastService) { }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  setAllValues(section: any, newValue: boolean) {
    section.fields.forEach(field => this.userOverview.notification_settings.push[field.key] = newValue);
    this.updateSettings();
  }

  showAllOn(section: any) {
    const settings = this.userOverview.notification_settings;
    let showAll = false;
    section.fields.forEach(field => {
      // if (!settings.email[category] || !settings.push[category]) {
      if (!settings.push[field.key]) {
        showAll = true;
      }
    });
    return showAll;
  }

  updateSettings() {
    setTimeout(
      () => {
        console.log(this.userOverview);
        this.settingsService.updateNotificationSettings(this.userOverview)
          .pipe(takeUntil(this.ngUnsubscribe))
          .subscribe(
            response => {
              this.userOverview = response;
              this.toastService.open(`Notification preferences saved.`);
            },
            () => {
              this.toastService.open(`Can't update notification settings. Please try again.`);
            }
          );
      },
      200);
  }
}
