import { Component } from '@angular/core';
import { IonicPage, NavController } from '@ionic/angular';

import { MixpanelService } from '@nte/services/mixpanel.service';
import { StakeholderService } from '@nte/services/stakeholder.service';
import { RegisterSchoolPage } from './../register-school/register-school';
import { RegisterStudentsPage } from './../register-students/register-students';

@IonicPage({
  name: `register-year-page`
})
@Component({
  selector: `register-year`,
  templateUrl: `register-year.html`
})
export class RegisterYearPage {
  public graduationYearOptions;
  public parentOption: any;

  constructor(public navCtrl: NavController,
    public stakeholderService: StakeholderService,
    private mixpanel: MixpanelService) {
    this.parentOption = {
      isParent: true,
      year: null
    };
  }

  public getGraduationYearOptions() {
    const gradYearOptionsSub = this.stakeholderService.getGraduationYearOptions()
      .subscribe(
        (response) => this.graduationYearOptions = response,
        (err) => console.error(err),
        () => gradYearOptionsSub.unsubscribe()
      );
  }

  public ionViewDidLoad() {
    this.getGraduationYearOptions();
  }

  public next() {
    if (this.stakeholderService.newUser.graduation) {
      this.navCtrl.push(RegisterSchoolPage);
    } else {
      this.navCtrl.push(RegisterStudentsPage);
    }
  }

  public setGraduationYear(option: any) {
    const stakeholderType = option.isParent ? `Parent` : `Student`;
    this.mixpanel.event(`sign_up_user_type_selected`, { stakeholder_type: stakeholderType });
    this.stakeholderService.newUser.stakeholder_type = stakeholderType;
    if (option.isParent) {
      this.stakeholderService.newUser.graduation = null;
    } else {
      this.mixpanel.event(`sign_up_grad_year_selected`, { graduation_year: option.year });
      this.stakeholderService.newUser.graduation = option;
    }
  }
}
