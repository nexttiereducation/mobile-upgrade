import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Events, ToastController } from '@ionic/angular';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { BackEndPrompt } from '@nte/models/back-end-prompt.model';
import { CustomTestDate } from '@nte/models/custom-test-date.model';
import { PromptTestDatesOptions } from '@nte/models/prompt-test-dates-options.model';
import { Prompt } from '@nte/models/prompt.model';
import { DatetimeService } from '@nte/services/datetime.service';
import { PromptService } from '@nte/services/prompt.service';

@Component({
  selector: `prompt-test-dates`,
  templateUrl: `prompt-test-dates.html`
})
export class PromptTestDatesComponent implements OnInit, OnDestroy {
  @Input() public newPrompt: Prompt<string[]>;
  @Input() public prompt: BackEndPrompt<PromptTestDatesOptions>;

  public addDate: string = `Add local test dates`;
  public customDatesArray: FormArray;
  public datePickerOptions: any;
  public knownDatesArray: FormArray;
  public maxYear: number;
  public minYear: number;
  public noneOption: string = `I am not taking it`;
  public simplifiedForm: boolean = false;
  public testPromptForm: FormGroup;

  private ngUnsubscribe: Subject<any> = new Subject();

  get choices() {
    return this.prompt.options.choices;
  }

  get customDateControls(): AbstractControl[] {
    return this.customDates.controls;
  }

  get customDates(): FormArray {
    return this.testPromptForm.get(`customDatesArray`) as FormArray;
  }

  get isTakingTest(): FormControl {
    return this.testPromptForm.get(`isTakingTest`) as FormControl;
  }

  get knownDateControls(): AbstractControl[] {
    return this.knownDates.controls;
  }

  get knownDates(): FormArray {
    return this.testPromptForm.get(`knownDatesArray`) as FormArray;
  }

  get lastChoiceSelected(): boolean {
    return this.choices[this.choices.length - 1].isChosen;
  }

  constructor(private datetimeService: DatetimeService,
    private events: Events,
    private formBuilder: FormBuilder,
    private promptService: PromptService,
    private toastCtrl: ToastController) {
    this.maxYear = this.datetimeService.maxYear();
    this.minYear = this.datetimeService.minYear();
    this.datePickerOptions = this.datetimeService.pickerOptions;
  }

  ngOnInit() {
    const noneOptionIndex = this.choices.findIndex(c => c.value === this.noneOption);
    this.prompt.options.choices.splice(noneOptionIndex, 1);
    this.buildForm();
    this.setCustomDeadlines([new CustomTestDate({})]);
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  public addCustomDeadline() {
    this.customDates.push(this.formBuilder.group(new CustomTestDate({})));
  }

  public checkForm() {
    if (!this.isTakingTest.value) {
      this.dontRequireSelectedDates();
    } else {
      this.requireSelectedDates();
    }
  }

  public dontRequireSelectedDates() {
    this.testPromptForm.setControl(
      `selectedDates`,
      new FormControl(this.mapDates(this.knownDatesArray.value))
    );
  }

  public mapDates(dates: any) {
    const selectedDates = dates.filter(d => d.checked).map(d => d.date);
    return selectedDates.length ? selectedDates : null;
  }

  public markSelected(choice: any) {
    choice.isChosen = !choice.isChosen;
  }

  public removeCustomDate(index: number) {
    this.customDates.removeAt(index);
    this.testPromptForm.setControl(`customDatesArray`, this.customDates);
  }

  public requireSelectedDates() {
    this.testPromptForm.setControl(
      `selectedDates`,
      new FormControl(
        this.mapDates(this.knownDatesArray.value),
        Validators.required
      )
    );
  }

  public setCustomDeadlines(deadlines: any[]) {
    const deadlinesFGs = deadlines.map(d => this.formBuilder.group(d));
    const deadlineFormArray = this.formBuilder.array(deadlinesFGs);
    this.testPromptForm.setControl(`customDatesArray`, deadlineFormArray);
  }

  public submit() {
    if (!this.isTakingTest.value) {
      this.newPrompt.choice = [`0`];
    } else {
      this.formatDateOptions();
    }
    this.promptService.submitNewPrompt(this.newPrompt)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(
        () => {
          this.newPrompt.custom_deadlines = [``];
          this.events.publish(`promptSubmitted`, {
            successMessage: `Test dates saved`
          });
        },
        () => this.showErrorToast()
      );
  }

  private buildForm() {
    this.customDatesArray = this.formBuilder.array([]);
    this.knownDatesArray = new FormArray(
      this.prompt.options.choices.map(date => {
        return new FormGroup({
          checked: new FormControl(false),
          date: new FormControl(date)
        });
      })
    );

    this.testPromptForm = this.formBuilder.group({
      customDatesArray: this.customDatesArray,
      isTakingTest: true,
      knownDatesArray: this.knownDatesArray,
      selectedDates: new FormControl(
        this.mapDates(this.knownDatesArray.value),
        Validators.required
      )
    });
    this.knownDatesArray.valueChanges
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(v => this.testPromptForm.controls.selectedDates.setValue(this.mapDates(v)));
  }

  private formatCustomDateOptions() {
    this.newPrompt.choice.push(`0`);
    this.newPrompt.custom_deadlines = [];
    this.customDates.controls.forEach((dateGroup: any) => {
      this.newPrompt.custom_deadlines.push(dateGroup.controls.date.value);
    });
  }

  private formatDateOptions() {
    if (this.knownDates) {
      this.knownDates.controls.forEach((control: any) => {
        const checkedAndOptionControls = control.controls;
        if (checkedAndOptionControls.checked.value) {
          if (checkedAndOptionControls.date.value.id === 0) {
            this.formatCustomDateOptions();
          } else {
            this.newPrompt.choice.push(checkedAndOptionControls.date.value.id);
          }
        }
      });
    }
  }

  private async showErrorToast() {
    const toast = await this.toastCtrl.create({
      duration: 3000,
      message: `An error has occurred, please try again.`
    });
    toast.present();
  }
}
