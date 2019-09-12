import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { NOTIFICATION_SETTING_SECTIONS } from '@nte/constants/settings-notification.constants';
import { extendedProfileCopy } from '@nte/constants/stakeholder.constants';
import { ConnectionService } from '@nte/services/connection.service';
import { LinkService } from '@nte/services/link.service';
import { MessageService } from '@nte/services/message.service';
import { MixpanelService } from '@nte/services/mixpanel.service';
import { StakeholderService } from '@nte/services/stakeholder.service';
import { UrlService } from '@nte/services/url.service';

@Component({
  selector: `profile`,
  templateUrl: `profile.html`
})
export class ProfilePage implements OnInit, OnDestroy {
  public extendedProfileCopy: string = extendedProfileCopy;
  public sections: any[] = NOTIFICATION_SETTING_SECTIONS;
  public userOverview: any;

  private ngUnsubscribe: Subject<any> = new Subject();

  get externalProfileUrl() {
    return `${this.urlService.getDomain()}edu/#/external-profile/${this.user.authToken}/${this.user.id}`;
  }

  get profilePhoto() {
    if (this.user) {
      return this.user.profile_photo || this.user.photo_url || this.user.photoUrl;
    } else {
      return null;
    }
  }

  get user() {
    return this.stakeholderService.stakeholder;
  }

  constructor(public linkService: LinkService,
    public messageService: MessageService,
    public router: Router,
    public stakeholderService: StakeholderService,
    private connectionService: ConnectionService,
    private mixpanel: MixpanelService,
    private urlService: UrlService) { }

  ngOnInit() {
    this.stakeholderService.getOverview()
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(overview => this.userOverview = overview);
    this.mixpanel.event(`navigated_to-Profile`);
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  public logout() {
    this.stakeholderService.logoutSuccess
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(
        () => {
          this.connectionService.clear();
          this.mixpanel.event(`logout`);
          this.router.navigate(['login']);
        }
      );
    this.stakeholderService.logout();
  }

}
