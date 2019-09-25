import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Platform } from '@ionic/angular';
import { join, padStart, split } from 'lodash';

import { CollegeService } from '@nte/services/college.service';
import { LinkService } from '@nte/services/link.service';

@Component({
  selector: `college-application`,
  templateUrl: `college-application.html`,
  styleUrls: [
    `./../college-details.scss`,
    `college-application.scss`
  ],
  encapsulation: ViewEncapsulation.None
})
export class CollegeApplicationComponent implements OnInit {
  public importanceValues: any;

  get college() {
    return this.collegeService.active;
  }
  get college$() {
    return this.collegeService.active$;
  }

  get details() {
    return this.college ? this.college.details : null;
  }

  constructor(
    public collegeService: CollegeService,
    public linkService: LinkService,
    public platform: Platform,
    public route: ActivatedRoute,
    public router: Router) { }

  ngOnInit() {
    this.setupDates();
  }

  private setupDates() {
    if (this.details && this.details.financial_aid_deadlines.length) {
      const deadlines = [];
      this.details.financial_aid_deadlines.forEach(d => {
        let deadlineDate = d;
        if (d.indexOf(`-`) > -1) {
          const deadlineYMD = split(d, `-`); // '2016-1-5' ==> ['2016', '1', '5']
          deadlineYMD[1] = padStart(deadlineYMD[1], 2, `0`);
          deadlineYMD[2] = padStart(deadlineYMD[2], 2, `0`);
          deadlineDate = join(deadlineYMD, `-`);
        }
        deadlines.push(deadlineDate);
      });
      this.college.details.financial_aid_deadlines = deadlines;
    }
  }

}
