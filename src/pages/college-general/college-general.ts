import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { CollegeTabsService } from '@nte/services/college-tabs.service';
import { CollegeService } from '@nte/services/college.service';

@Component({
  selector: `college-general`,
  templateUrl: `college-general.html`
})
export class CollegeGeneralPage {
  get college() {
    return this.collegeTabsService.activeCollege;
  }

  get details() {
    return this.college ? this.college.details : null;
  }

  get diversityChart() {
    if (this.details
      && this.details.undergrad_white
      && this.details.undergrad_asian
      && this.details.undergrad_hispanic
      && this.details.undergrad_black) {
      const diversityOther = 100 - +this.details.undergrad_white - +this.details.undergrad_asian
        - +this.details.undergrad_hispanic - +this.details.undergrad_black;
      const diversityPercents = [
        this.details.undergrad_white,
        this.details.undergrad_asian,
        this.details.undergrad_hispanic,
        this.details.undergrad_black,
        diversityOther
      ];
      return {
        colors: [
          `#3692cc`,
          `#1b1464`,
          `#93278f`,
          `#f7931e`,
          `#22b573`
        ],
        names: [
          `White`,
          `Asian`,
          `Hispanic`,
          `Black`,
          `Other`
        ],
        values: this.getDiversityValues(diversityPercents)
      };
    } else {
      return null;
    }
  }

  get maleFemaleChart() {
    if (this.details
      && this.details.female_enrollment
      && this.details.male_enrollment) {
      return {
        colors: [
          `#3692cc`,
          `#1b1464`
        ],
        names: [
          `Female`,
          `Male`
        ],
        values: [
          this.details.female_enrollment,
          this.details.male_enrollment
        ]
      };
    } else {
      return null;
    }
  }

  constructor(
    public collegeService: CollegeService,
    public collegeTabsService: CollegeTabsService,
    public route: ActivatedRoute,
    public router: Router) { }

  public getDiversityValues(percents: any) {
    const vals = [];
    percents.forEach(percent => {
      const val = percent * .1 * this.details.undergrad_population;
      vals.push(val);
    });
    return vals;
  }

}
