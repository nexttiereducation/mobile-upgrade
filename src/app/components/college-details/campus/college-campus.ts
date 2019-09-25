import { animate, state, style, transition, trigger } from '@angular/animations';
import { Component, ViewEncapsulation } from '@angular/core';

import { CollegeService } from '@nte/services/college.service';
import { CollegesService } from '@nte/services/colleges.service';

@Component({
  selector: `college-campus`,
  templateUrl: `college-campus.html`,
  styleUrls: [
    `./../college-details.scss`,
    `college-campus.scss`
  ],
  animations: [
    trigger(`mapState`, [
      state(`ready`,
        style({ opacity: 1 })
      ),
      state(`loading`,
        style({ opacity: 0 })
      ),
      transition(`* => *`, [
        animate(`6s 6s ease-in-out`)
        // cubic-bezier(0.4,0.0,0.2,1)
      ])
    ])
  ],
  encapsulation: ViewEncapsulation.None
})
export class CollegeCampusComponent {
  get college() {
    return this.collegeService.active;
  }
  get college$() {
    return this.collegeService.active$;
  }

  get details() {
    if (this.college && this.college.details) {
      return this.college.details;
    } else {
      return {};
    }
  }

  get fraternityChart() {
    if (this.details.percent_in_fraternity) {
      return {
        label: `Join a fraternity`,
        value: this.details.percent_in_fraternity
      };
    } else {
      return null;
    }
  }

  get liveOnCampusChart() {
    if (this.details.freshman_perecent_on_campus) {
      return {
        label: `Live on campus`,
        value: this.details.freshman_perecent_on_campus
      };
    } else {
      return null;
    }
  }

  get outOfStateChart() {
    if (this.details.percentage_fresh_out) {
      return {
        label: `From out-of-state`,
        value: this.details.percentage_fresh_out
      };
    } else {
      return null;
    }
  }

  get sororityChart() {
    if (this.details.percent_in_sorority) {
      return {
        label: `Join a sorority`,
        value: this.details.percent_in_sorority
      };
    } else {
      return null;
    }
  }

  get workOnCampusChart() {
    if (this.details.percent_working_students) {
      return {
        label: `Work on campus`,
        value: this.details.percent_working_students
      };
    } else {
      return null;
    }
  }

  constructor(public collegeService: CollegeService,
    public collegesService: CollegesService) { }

}
