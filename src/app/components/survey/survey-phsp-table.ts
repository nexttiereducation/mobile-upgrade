import { Component, Input, OnChanges, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { Events, Slides } from '@ionic/angular';
import { pick } from 'lodash';

import { DECISION_OPTIONS } from '@nte/constants/phsp-form.constants';
import {
  CollegeStatusItem,
  ICollegeStatusItem,
  IScholarshipStatusItem,
  ScholarshipStatusItem
} from '@nte/models/status-item.interface';
import { SurveyProvider } from '@nte/services/survey.service';

@Component({
  selector: `survey-phsp-table`,
  templateUrl: `survey-phsp-table.html`
})
export class SurveyPhspTableComponent implements OnInit, OnChanges {
  @ViewChild(`phspSlider`) public phspSlider: Slides;

  @Input() public category: string;
  @Input() public list: (IScholarshipStatusItem | ICollegeStatusItem)[];
  @Input() public searchResults: any[];
  @Input() public startOnLastSlide: boolean;

  public addingItem: boolean = false;
  public decisionOptions = DECISION_OPTIONS;
  public initialListLength: number;
  public initialSlideIndex: number = 0;
  public isCollege: boolean;
  public phspTableForm: FormGroup;
  public searchQuery: string;
  public slideIndex: number;
  public viewingConfirmation: boolean;

  get currentSlideFormInvalid(): boolean {
    if (!this.slideIndex) {
      this.slideIndex = 0;
    }
    const currentSlideForm = this.items.controls[this.slideIndex] as FormGroup;
    if (currentSlideForm) {
      this.phspSlider.lockSwipeToNext(currentSlideForm.invalid);
      return currentSlideForm.invalid;
    } else {
      this.phspSlider.lockSwipeToNext(false);
      return false;
    }
  }

  get items(): FormArray {
    return this.phspTableForm.get(`items`) as FormArray;
  }

  constructor(
    private events: Events,
    private fb: FormBuilder,
    private surveyProvider: SurveyProvider
  ) {
    this.createForm();
  }

  ngOnInit() {
    this.isCollege = this.category === `college`;
    if (this.list) {
      this.setItems();
    } else {
      this.list = [];
    }
    if (this.startOnLastSlide) {
      const lastSlideIndex = this.phspSlider.length();
      this.initialSlideIndex = lastSlideIndex;
    }
    this.phspSlider.enableKeyboardControl(false);
    this.phspSlider.keyboardControl = false;
  }

  ngOnChanges(changes: any) {
    if (changes.searchResults && !this.phspSlider.isEnd()) {
      this.searchResults = [];
    }
  }

  public addItem(selection: any) {
    let item: any = pick(selection, [`name`, `id`, `photo_url`]);
    if (this.isCollege) {
      item = new CollegeStatusItem(item);
    } else {
      item = new ScholarshipStatusItem(item);
    }
    this.items.push(this.fb.group(item));
    this.updateList();
    this.onClear();
    this.phspSlider.update();
  }

  public createForm() {
    this.phspTableForm = this.fb.group({
      items: this.fb.array([])
    });
  }

  public getItemControlValue(
    itemIndex: number,
    controlName: string = `isActive`
  ) {
    const itemFg = this.items.controls[itemIndex] as FormGroup;
    return itemFg.controls[controlName].value;
  }

  public goToNextPage() {
    this.updateList();
    this.events.publish(`changeSurveyPage`, {
      direction: `next`,
      page: this.category
    });
    if (this.isCollege) {
      this.surveyProvider.setCollegeStatusSectionValidity(true);
    } else {
      this.surveyProvider.setScholarshipStatusSectionValidity(true);
    }
  }

  public goToNextSlide() {
    this.updateList();
    if (this.slideIndex === this.phspSlider.length() - 2) {
      this.phspSlider.slideTo(this.phspSlider.length() - 1);
    } else {
      this.phspSlider.slideNext();
    }
  }

  public goToPrevPage() {
    this.updateList();
    this.events.publish(`changeSurveyPage`, {
      direction: `previous`,
      page: this.category
    });
  }

  public goToPrevSlide() {
    this.updateList();
    this.phspSlider.slidePrev();
  }

  public onClear() {
    this.searchResults = [];
    this.searchQuery = ``;
  }

  public onSearch(event: Event) {
    event.preventDefault();
    this.events.publish(`search`, this.searchQuery);
  }

  public setItems() {
    const itemFGs = this.list.map(item => {
      let control;
      if (this.isCollege) {
        control = new CollegeStatusItem(item);
      } else {
        control = new ScholarshipStatusItem(item);
      }
      return this.fb.group(control);
    });
    const itemFormArray = this.fb.array(itemFGs);
    this.phspTableForm.setControl(`items`, itemFormArray);
  }

  public slideChanged() {
    this.slideIndex = this.phspSlider.getActiveIndex();
  }

  public toggleApplyStatus(itemIndex: number) {
    const didNotApply = this.items.value[itemIndex].isActive;
    const status = didNotApply ? `I` : null;
    const decision = didNotApply ? `DNA` : null;
    const itemGroup = this.items.controls[itemIndex] as FormGroup;
    itemGroup.controls.status.patchValue(status);
    itemGroup.controls.amount_awarded.patchValue(null);
    itemGroup.controls.decision.patchValue(decision);
  }

  public toggleWaitlistedDeferred(itemIndex: number, property: string) {
    const otherProperty = property === `waitlisted` ? `deferred` : `waitlisted`;
    if (this.items.value[itemIndex][otherProperty]) {
      const itemGroup = this.items.controls[itemIndex] as FormGroup;
      itemGroup.controls[otherProperty].patchValue(false);
    }
  }

  public updateList() {
    if (this.phspTableForm.controls.items.value.length) {
      this.list = this.items.value;
      const event = this.isCollege
        ? `collegeListUpdated`
        : `scholarshipListUpdated`;
      this.events.publish(event, this.list);
    }
  }
}
