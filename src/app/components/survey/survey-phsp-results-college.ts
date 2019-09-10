import { Component, Input, OnInit } from '@angular/core';
import { Events } from '@ionic/angular';

@Component({
  selector: `survey-phsp-results-college`,
  templateUrl: `survey-phsp-results-college.html`
})
export class SurveyPhspResultsCollegeComponent implements OnInit {
  @Input() public surveyResults: any;
  @Input() public taskIsComplete: boolean;

  public collegeCharts: any = {};
  public planDisplayValues = {
    four_year: `4 year`,
    two_year: `2 year`
  };
  public scholarshipChart: any;

  constructor(private events: Events) { }

  ngOnInit() {
    const chartData = this.surveyResults.results;
    this.collegeCharts = {
      accepted: {
        colors: [
          `#30B982`,
          `#e1e1e1`
        ],
        values: [
          chartData.percentage_institutions_accepted,
          (100 - chartData.percentage_institutions_accepted)
        ]
      },
      declined: {
        colors: [
          `#F63B07`,
          `#e1e1e1`
        ],
        values: [
          chartData.percentage_institutions_declined,
          (100 - chartData.percentage_institutions_declined)
        ]
      },
      pending: {
        colors: [
          `#3692CC`,
          `#e1e1e1`
        ],
        values: [
          chartData.percentage_institutions_deferred + chartData.percentage_institutions_waitlisted,
          (100 - chartData.percentage_institutions_deferred + chartData.percentage_institutions_waitlisted)
        ]
      },
      waiting: {
        colors: [
          `#717273`,
          `#e1e1e1`
        ],
        values: [
          chartData.percentage_institutions_waiting,
          (100 - chartData.percentage_institutions_waiting)
        ]
      }
    };
    this.scholarshipChart = {
      colors: [
        `#30B982`,
        `#e1e1e1`
      ],
      values: [
        chartData.percentage_scholarships_won,
        (100 - chartData.percentage_scholarships_won)
      ]
    };
  }

  public previousPage() {
    this.events.publish(`previousPage`);
  }

  public surveyComplete() {
    this.events.publish(`surveyComplete`);
  }

}
