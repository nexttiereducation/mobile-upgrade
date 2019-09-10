import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Events } from '@ionic/angular';
import { Subscription } from 'rxjs/Subscription';

import { ISavedScholarship, IScholarship } from '@nte/models/scholarship.interface';
import { IScholarshipStatusItem, ScholarshipStatusItem } from '@nte/models/status-item.interface';
import { ScholarshipProvider } from '@nte/services/scholarship.service';

@Component({
  selector: `survey-phsp-scholarships`,
  templateUrl: `survey-phsp-scholarships.html`
})
export class SurveyPhspScholarshipsComponent implements OnInit, OnDestroy {
  @Input() public list: IScholarshipStatusItem[];
  @Input() public startOnLastSlide: boolean;

  public scholarshipResults: IScholarship[];

  private listSub: Subscription;
  private searchSub: Subscription;

  constructor(private events: Events,
    private scholarshipProvider: ScholarshipProvider) { }

  ngOnInit() {
    this.events.subscribe(`search`, (query) => this.onSearch(query));
    if (!this.list) {
      this.listSub = this.scholarshipProvider.studentScholarships
        .subscribe(
          (scholarships) => {
            this.list = this.formatScholarships(scholarships);
          },
          err => console.error(err)
        );
    }
  }

  ngOnDestroy() {
    if (this.listSub) {
      this.listSub.unsubscribe();
    }
    if (this.searchSub) {
      this.searchSub.unsubscribe();
    }
  }


  public formatScholarships(scholarships: ISavedScholarship[]) {
    return scholarships.map((scholarshipTracker) => {
      if (scholarshipTracker.decision === `NA`) {
        scholarshipTracker.amount_awarded = 0;
      }
      return new ScholarshipStatusItem(scholarshipTracker);
    });
  }

  public onSearch(query: string) {
    this.searchSub = this.scholarshipProvider.searchScholarships(`?search=${query}`)
      .subscribe((response) => {
        this.scholarshipResults = response;
      });
  }

}
