import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

import { CollegeService } from '@nte/services/college.service';

@IonicPage({
  name: `college-general-page`
})
@Component({
  selector: `college-general`,
  templateUrl: `college-general.html`
})
export class CollegeGeneralPage {
  public college: any;
  public diversityChart: any;
  public maleFemaleChart: any;

  constructor(public navCtrl: NavController,
    public params: NavParams,
    public collegeService: CollegeService) {
    this.college = params.data;
    this.setupMaleFemaleChart();
    this.setupDiversityChart();
  }

  public getDiversityValues(percents: any) {
    const vals = [];
    for (let i = 0; i < percents.length; i++) {
      const val = percents[i] * .1 * this.college.details.undergrad_population;
      vals.push(val);
    }
    return vals;
  }

  public setupDiversityChart() {
    if (this.college.details.undergrad_white && this.college.details.undergrad_asian &&
      this.college.details.undergrad_hispanic && this.college.details.undergrad_black) {
      const diversityOther = 100 - +this.college.details.undergrad_white - +this.college.details.undergrad_asian
        - +this.college.details.undergrad_hispanic - +this.college.details.undergrad_black;
      const diversityPercents = [
        this.college.details.undergrad_white,
        this.college.details.undergrad_asian,
        this.college.details.undergrad_hispanic,
        this.college.details.undergrad_black,
        diversityOther
      ];
      this.diversityChart = {
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
    }
  }

  public setupMaleFemaleChart() {
    if (this.college.details.female_enrollment && this.college.details.male_enrollment) {
      this.maleFemaleChart = {
        colors: [
          `#3692cc`,
          `#1b1464`
        ],
        names: [
          `Female`,
          `Male`
        ],
        values: [
          this.college.details.female_enrollment,
          this.college.details.male_enrollment
        ]
      };
    }
  }

}
