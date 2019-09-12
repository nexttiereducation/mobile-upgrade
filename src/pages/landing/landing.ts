import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { LoginPage } from '@nte/pages/login/login';
import { RegisterYearPage } from '@nte/pages/register-year/register-year';
import { EnvironmentService } from '@nte/services/environment.service';
import { MixpanelService } from '@nte/services/mixpanel.service';

@Component({
  selector: `landing`,
  templateUrl: `landing.html`,
  styleUrls: [`landing.scss`]
})
export class LandingPage implements OnInit {
  // private loginSub: Subscription;

  constructor(public router: Router,
    public environmentService: EnvironmentService,
    private mixpanel: MixpanelService
    // , private stakeholderService: StakeholderService,
    // private storage: Storage
  ) { }

  ngOnInit() {
    this.mixpanel.event(`$app_open`);
    // this.storage.get(`ls.stakeholder`).then(
    //   (stakeholder) => {
    //     this.loginSub = this.stakeholderService.loginSuccess.subscribe(() => {
    //       this.router.setRoot(TabsPage);
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

  public goToLogin() {
    this.router.navigate([LoginPage]);
  }

  public goToRegistration() {
    this.mixpanel.event(`navigated_to-Register`);
    this.router.navigate([RegisterYearPage]);
  }

}
