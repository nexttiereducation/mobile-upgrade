import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Events } from '@ionic/angular';

import { IHighSchool } from '@nte/models/high-school.interface';
import { HighSchoolProvider } from '@nte/services/high-school.service';
import { KeyboardProvider } from '@nte/services/keyboard.service';

@Component({
  selector: `high-school`,
  templateUrl: `high-school.html`
})
export class HighSchoolComponent {
  @Output() public highSchoolChanged = new EventEmitter<IHighSchool>();

  public highSchools: IHighSchool[];
  @Input() public isNewUser: boolean;
  @Input() public isPrompt: boolean;
  public searchValue: string;
  public selectedHighSchool: IHighSchool;

  private nameQueryParam = `name=`;
  private zipCodeQueryParam = `zipcode=`;

  constructor(private events: Events,
    private highSchoolProvider: HighSchoolProvider,
    private keyboard: KeyboardProvider) { }

  public closeKeyboard() {
    this.keyboard.close();
  }

  public deselectHighSchool() {
    delete this.selectedHighSchool;
    this.isPrompt ? this.events.publish(`fakeTaskStatusChange`, `ST`) : this.highSchoolChanged.emit();
  }

  public saveHighSchool() {
    this.highSchoolProvider.updateHighSchool(this.selectedHighSchool.id)
      .subscribe(() => {
        delete this.selectedHighSchool;
        if (this.isPrompt) {
          this.events.publish(`promptSubmitted`, { successMessage: `High School added` });
        }
      });
  }

  public search() {
    const query = this.createSearchQuery();
    this.highSchoolProvider.searchSchools(query, this.isNewUser)
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
