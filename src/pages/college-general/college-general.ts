import { Component, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { CollegeService } from '@nte/services/college.service';

@Component({
  selector: `college-general`,
  templateUrl: `college-general.html`,
  encapsulation: ViewEncapsulation.None
})
export class CollegeGeneralPage {
  get college() {
    return this.collegeService.active;
  }
  get college$() {
    return this.collegeService.active$;
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
          `#003f5c`,
          `#58508d`,
          `#bc5090`,
          `#ff6361`,
          `#ffa600`
        ],
        series: {
          names: [
            `White`,
            `Asian`,
            `Hispanic`,
            `Black`,
            `Other`
          ],
          values: [...diversityPercents].map((p: number) => p * .1 * this.details.undergrad_population)
        }
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
        series: {
          names: [
            `Female`,
            `Male`
          ],
          values: [
            this.details.female_enrollment,
            this.details.male_enrollment
          ]
        }
      };
    } else {
      return null;
    }
  }

  constructor(
    public collegeService: CollegeService,
    public route: ActivatedRoute,
    public router: Router) { }

}
