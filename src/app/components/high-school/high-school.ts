import { Component, EventEmitter, Input, OnDestroy, Output } from '@angular/core';
import { Events } from '@ionic/angular';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { IHighSchool } from '@nte/interfaces/high-school.interface';
import { HighSchoolService } from '@nte/services/high-school.service';

@Component({
  selector: `high-school`,
  templateUrl: `high-school.html`,
  styleUrls: [`high-school.scss`]
})
export class HighSchoolComponent implements OnDestroy {
  @Input() isNewUser: boolean;
  @Input() isPrompt: boolean;

  @Output() highSchoolChanged = new EventEmitter<IHighSchool>();

  public highSchools: IHighSchool[];
  public searchValue: string;
  public selectedHighSchool: IHighSchool;

  private nameQueryParam: string = `name=`;
  private ngUnsubscribe: Subject<any> = new Subject();
  private zipCodeQueryParam: string = `zipcode=`;

  constructor(private events: Events,
    private highSchoolService: HighSchoolService) { }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  public closeKeyboard() {
    // this.keyboard.close();
  }

  public deselectHighSchool() {
    delete this.selectedHighSchool;
    this.isPrompt ? this.events.publish(`fakeTaskStatusChange`, `ST`) : this.highSchoolChanged.emit();
  }

  public saveHighSchool() {
    this.highSchoolService.updateHighSchool(this.selectedHighSchool.id)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(() => {
        delete this.selectedHighSchool;
        if (this.isPrompt) {
          this.events.publish(`promptSubmitted`, { successMessage: `High School added` });
        }
      });
  }

  public search() {
    const query = this.createSearchQuery();
    this.highSchoolService.searchSchools(query, this.isNewUser)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((response) => {
        this.highSchools = response;
      });
  }

  public selectSchool(school: IHighSchool) {
    this.selectedHighSchool = school;
    this.clearResults();
    this.isPrompt ? this.events.publish(`fakeTaskStatusChange`, `C`) : this.highSchoolChanged.emit(school);
  }

  private clearResults() {
    this.highSchools = [];
  }

  private createSearchQuery() {
    let query = `?`;
    if (/\d/.test(this.searchValue)) {
      query += (this.zipCodeQueryParam + this.searchValue);
    } else {
      query += (this.nameQueryParam + this.searchValue);
    }
    return query;
  }
}
