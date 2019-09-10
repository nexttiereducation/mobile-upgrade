import { Component } from '@angular/core';
import { App, IonicPage, NavController } from '@ionic/angular';
import { Subject } from 'rxjs';

import { NOTIFICATION_SETTING_SECTIONS } from '@nte/constants/settings-notification.constants';
import { extendedProfileCopy } from '@nte/constants/stakeholder.constants';
import { ConnectionService } from '@nte/services/connection.service';
import { LinkService } from '@nte/services/link.service';
import { MessageService } from '@nte/services/message.service';
import { MixpanelService } from '@nte/services/mixpanel.service';
import { StakeholderService } from '@nte/services/stakeholder.service';
import { UrlService } from '@nte/services/url.service';
import { LoginPage } from './../login/login';

@IonicPage({
  name: `profile-page`
})
@Component({
  selector: `profile`,
  templateUrl: `profile.html`
})
export class ProfilePage {
  public extendedProfileCopy: string = extendedProfileCopy;
  public sections: any[] = NOTIFICATION_SETTING_SECTIONS;
  public userOverview;

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
    public navCtrl: NavController,
    public stakeholderService: StakeholderService,
    private app: App,
    private connectionService: ConnectionService,
    private mixpanel: MixpanelService,
    private urlService: UrlService) { }

  ionViewDidLoad() {
    this.stakeholderService.getOverview()
      .takeUntil(this.ngUnsubscribe)
      .subscribe(user => this.userOverview = user);
  }

  ionViewDidEnter() {
    this.mixpanel.event(`navigated_to-Profile`);
  }

  ionViewDidLeave() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  logout() {
    this.stakeholderService.logoutSuccess
      .takeUntil(this.ngUnsubscribe)
      .subscribe(
        () => {
          this.connectionService.clear();
          this.mixpanel.event(`logout`);
          this.app.getRootNavs()[0].setRoot(LoginPage);
        }
      );
    this.stakeholderService.logout();
  }

}
