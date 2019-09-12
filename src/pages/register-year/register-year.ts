import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { RegisterSchoolPage } from '@nte/pages/register-school/register-school';
import { RegisterStudentsPage } from '@nte/pages/register-students/register-students';
import { MixpanelService } from '@nte/services/mixpanel.service';
import { StakeholderService } from '@nte/services/stakeholder.service';

@Component({
  selector: `register-year`,
  templateUrl: `register-year.html`,
  styleUrls: [`register-year.scss`]
})
export class RegisterYearPage implements OnInit, OnDestroy {
  public graduationYearOptions;
  public parentOption: any;

  private ngUnsubscribe: Subject<any> = new Subject();

  constructor(public router: Router,
    public stakeholderService: StakeholderService,
    private mixpanel: MixpanelService) {
    this.parentOption = {
      isParent: true,
      year: null
    };
  }

  ngOnInit() {
    this.getGraduationYearOptions();
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  public getGraduationYearOptions() {
    this.stakeholderService.getGraduationYearOptions()
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(
        (response) => this.graduationYearOptions = response,
        (err) => console.error(err)
      );
  }

  public next() {
    if (this.stakeholderService.newUser.graduation) {
      this.router.navigate([RegisterSchoolPage]);
    } else {
      this.router.navigate([RegisterStudentsPage]);
    }
  }

  public setGraduationYear(option: any) {
    const stakeholderType = option.isParent ? `Parent` : `Student`;
    this.mixpanel.event(
      `sign_up_user_type_selected`,
      { stakeholder_type: stakeholderType }
    );
    this.stakeholderService.newUser.stakeholder_type = stakeholderType;
    if (option.isParent) {
      this.stakeholderService.newUser.graduation = null;
    } else {
      this.mixpanel.event(
        `sign_up_grad_year_selected`,
        { graduation_year: option.year }
      );
      this.stakeholderService.newUser.graduation = option;
    }
  }
}
