import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Events } from '@ionic/angular';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { ISavedScholarship, IScholarship } from '@nte/interfaces/scholarship.interface';
import { IScholarshipStatusItem, ScholarshipStatusItem } from '@nte/interfaces/status-item.interface';
import { ScholarshipService } from '@nte/services/scholarship.service';

@Component({
  selector: `survey-phsp-scholarships`,
  templateUrl: `survey-phsp-scholarships.html`
})
export class SurveyPhspScholarshipsComponent implements OnInit, OnDestroy {
  @Input() list: IScholarshipStatusItem[];
  @Input() startOnLastSlide: boolean;

  public scholarshipResults: IScholarship[];

  private ngUnsubscribe: Subject<any> = new Subject();

  constructor(private events: Events,
    private scholarshipService: ScholarshipService) { }

  ngOnInit() {
    this.events
      .subscribe(`search`, query => this.onSearch(query));
    if (!this.list) {
      this.scholarshipService.studentScholarships
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe(
          (scholarships: ISavedScholarship[]) => {
            this.list = this.formatScholarships(scholarships);
          },
          err => console.error(err)
        );
    }
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }


  public formatScholarships(scholarships: ISavedScholarship[]) {
    return scholarships.map(t => {
      if (t.decision === `NA`) {
        t.amount_awarded = 0;
      }
      return new ScholarshipStatusItem(t);
    });
  }

  public onSearch(query: string) {
    this.scholarshipService.searchScholarships(`?search=${query}`)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(response => this.scholarshipResults = response);
  }

}
