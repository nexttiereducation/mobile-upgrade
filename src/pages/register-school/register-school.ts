import { Component } from '@angular/core';
import { IonicPage, NavController } from '@ionic/angular';

import { IHighSchool } from '@nte/models/high-school.interface';
import { MixpanelService } from '@nte/services/mixpanel.service';
import { StakeholderService } from '@nte/services/stakeholder.service';
import { RegisterFormPage } from './../register-form/register-form';

@IonicPage({
  name: `register-school-page`
})
@Component({
  selector: `register-school`,
  templateUrl: `register-school.html`
})
export class RegisterSchoolPage {
  public selectedHighSchool: IHighSchool;

  constructor(public navCtrl: NavController,
    private mixpanel: MixpanelService,
    private stakeholderService: StakeholderService) { }

  public next() {
    this.navCtrl.push(RegisterFormPage);
  }

  public onHighSchoolChanged(school: IHighSchool) {
    if (school && school.id) {
      this.selectedHighSchool = school;
    } else {
      this.selectedHighSchool = null;
    }
  }

  public saveSchool() {
    this.mixpanel.event(`sign_up_select_school`, { school_name: this.selectedHighSchool.name });
    this.stakeholderService.newUser.highschool = this.selectedHighSchool.id;
    this.stakeholderService.newUser.highschool_name = this.selectedHighSchool.name;
    this.next();
  }

  public skip() {
    this.mixpanel.event(`sign_up_select_school_skipped`);
    this.next();
  }
}
