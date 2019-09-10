import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, Platform } from '@ionic/angular';
import { join, padStart, split } from 'lodash';

import { CollegeService } from '@nte/services/college.service';
import { LinkService } from '@nte/services/link.service';

@IonicPage({
  name: `college-application-page`
})
@Component({
  selector: `college-application`,
  templateUrl: `college-application.html`
})
export class CollegeApplicationPage {
  public college: any;
  public importanceValues: any;

  constructor(public collegeService: CollegeService,
    public linkService: LinkService,
    public navCtrl: NavController,
    public params: NavParams,
    public platform: Platform) {
    this.college = params.data;
    this.setupDates();
  }

  private setupDates() {
    if (this.college.details.financial_aid_deadlines.length) {
      const deadlines = [];
      for (let i = 0, deadline; deadline = this.college.details.financial_aid_deadlines[i]; i++) {
        let deadlineDate = deadline;
        if (deadline.indexOf(`-`) > -1) {
          const deadlineYMD = split(deadline, `-`); // '2016-1-5' ==> ['2016', '1', '5']
          deadlineYMD[1] = padStart(deadlineYMD[1], 2, `0`);
          deadlineYMD[2] = padStart(deadlineYMD[2], 2, `0`);
          deadlineDate = join(deadlineYMD, `-`);
        }
        deadlines.push(deadlineDate);
      }
      this.college.details.financial_aid_deadlines = deadlines;
    }
  }

}
