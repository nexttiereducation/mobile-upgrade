import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { IHighSchool } from '@nte/interfaces/high-school.interface';
import { RegisterFormPage } from '@nte/pages/register-form/register-form';
import { MixpanelService } from '@nte/services/mixpanel.service';
import { StakeholderService } from '@nte/services/stakeholder.service';

@Component({
  selector: `register-school`,
  templateUrl: `register-school.html`,
  styleUrls: [`register-school.scss`]
})
export class RegisterSchoolPage {
  public selectedHighSchool: IHighSchool;

  constructor(public router: Router,
    private mixpanel: MixpanelService,
    private stakeholderService: StakeholderService) { }

  public next() {
    this.router.navigate([RegisterFormPage]);
  }

  public onHighSchoolChanged(school: IHighSchool) {
    if (school && school.id) {
      this.selectedHighSchool = school;
    } else {
      this.selectedHighSchool = null;
    }
  }

  public saveSchool() {
    this.mixpanel.event(`sign_up_select_school`, {
      school_name: this.selectedHighSchool.name
    });
    this.stakeholderService.newUser.highschool = this.selectedHighSchool.id;
    this.stakeholderService.newUser.highschool_name = this.selectedHighSchool.name;
    this.next();
  }

  public skip() {
    this.mixpanel.event(`sign_up_select_school_skipped`);
    this.next();
  }
}
