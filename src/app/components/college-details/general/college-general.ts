import { Component, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { CollegeService } from '@nte/services/college.service';

@Component({
  selector: `college-general`,
  templateUrl: `college-general.html`,
  styleUrls: [`./../college-details.scss`],
  encapsulation: ViewEncapsulation.None
})
export class CollegeGeneralComponent {
  get college() {
    return this.collegeService.active;
  }
  get college$() {
    return this.collegeService.active$;
  }

  get description() {
    if (this.details && this.details.mission_statement) {
      const regex: RegExp = /\.\n(\w)/g;
      return this.details.mission_statement.replace(regex, `.\n\n$1`);
    }
  }

  get details() {
    return this.college ? this.college.details : null;
  }

  get diversityChart() {
    if (this.details
      && (this.details.undergrad_white > -1
        || this.details.undergrad_asian > -1
        || this.details.undergrad_hispanic > -1
        || this.details.undergrad_black > -1)) {
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
        labels: [
          `White`,
          `Asian`,
          `Hispanic`,
          `Black`,
          `Other`
        ],
        values: [...diversityPercents].map((p: number) => Math.floor((p / 100) * this.details.undergrad_population))
      };
    } else {
      return null;
    }
  }

  get gradUnderChart() {
    if (this.details
      && this.details.undergrad_population > -1
      && this.details.grad_population > -1) {
      return {
        colors: [
          `#3692cc`,
          `#1b1464`
        ],
        labels: [
          `Undergrads`,
          `Grads`
        ],
        values: [
          this.details.undergrad_population,
          this.details.grad_population
        ]
      };
    } else {
      return null;
    }
  }

  get maleFemaleChart() {
    if (this.details
      && this.details.undergrad_women > -1
      && this.details.undergrad_men > -1) {
      return {
        colors: [
          `#0097a7`,
          `#26c6da`
        ],
        labels: [
          `Female`,
          `Male`
        ],
        values: [
          this.details.undergrad_women,
          this.details.undergrad_men
        ]
      };
    } else {
      return null;
    }
  }

  get settingType() {
    if (this.college && this.college.school_setting) {
      const regex = new RegExp(/\:\s\w+/g);
      return this.college.school_setting.replace(regex, '');
    } else {
      return '';
    }
  }

  constructor(
    public collegeService: CollegeService,
    public route: ActivatedRoute,
    public router: Router) { }

}
