import { Component } from '@angular/core';
import { IonicPage, NavController } from '@ionic/angular';

import { EnvironmentService } from '@nte/services/environment.service';
import { MixpanelService } from '@nte/services/mixpanel.service';
import { LoginPage } from './../login/login';
import { RegisterYearPage } from './../register-year/register-year';

@IonicPage({
  name: `landing-page`,
  priority: `off`
})
@Component({
  selector: `landing`,
  templateUrl: `landing.html`
})
export class LandingPage {
  // private loginSub: Subscription;

  constructor(public navCtrl: NavController,
    public environmentService: EnvironmentService,
    private mixpanel: MixpanelService
    // , private stakeholderService: StakeholderService,
    // private storage: Storage
  ) { }

  public goToLogin() {
    this.navCtrl.push(LoginPage);
  }

  public goToRegistration() {
    this.mixpanel.event(`navigated_to-Register`);
    this.navCtrl.push(RegisterYearPage);
  }

  public ionViewDidLoad() {
    this.mixpanel.event(`$app_open`);
    // this.storage.get(`ls.stakeholder`).then(
    //   (stakeholder) => {
    //     this.loginSub = this.stakeholderService.loginSuccess.subscribe(() => {
    //       this.navCtrl.setRoot(TabsPage);
    //       this.loginSub.unsubscribe();
    //     });
    //     if (stakeholder) {
    //       this.storage.get(`ls.token`).then(
    //         (token) => {
    //           if (token && token.length) {
    //             const currentUser = JSON.parse(stakeholder);
    //             const data = {
    //               id: currentUser.id,
    //               token
    //             };
    //             this.stakeholderService.setStakeholder(data, true);
    //           }
    //         }
    //       );
    //     }
    //   }
    // );
  }
}
