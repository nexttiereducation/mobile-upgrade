import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Events, ToastController } from '@ionic/angular';
import { Subscription } from 'rxjs/Subscription';

import { BackEndPrompt } from '@nte/models/back-end-prompt.model';
import { CustomTestDate } from '@nte/models/custom-test-date.model';
import { PromptTestDatesOptions } from '@nte/models/prompt-test-dates-options.model';
import { Prompt } from '@nte/models/prompt.model';
import { DatetimeProvider } from '@nte/services/datetime.service';
import { PromptProvider } from '@nte/services/prompt.service';

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

  private knownDatesChangeSub: Subscription;

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
    const choices = this.prompt.options.choices;
    return choices[choices.length - 1].isChosen;
  }

  constructor(
    private events: Events,
    private datetimeProvider: DatetimeProvider,
    private formBuilder: FormBuilder,
    private promptProvider: PromptProvider,
    private toastCtrl: ToastController
  ) {
    this.maxYear = this.datetimeProvider.maxYear();
    this.minYear = this.datetimeProvider.minYear();
    this.datePickerOptions = this.datetimeProvider.pickerOptions;
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

  ngOnDestroy() {
    if (this.knownDatesChangeSub) {
      this.knownDatesChangeSub.unsubscribe();
    }
  }

  ngOnInit() {
    const noneOptionIndex = this.prompt.options.choices.findIndex(
      c => c.value === this.noneOption
    );
    this.prompt.options.choices.splice(noneOptionIndex, 1);
    this.buildForm();
    this.setCustomDeadlines([new CustomTestDate({})]);
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
    this.promptProvider.submitNewPrompt(this.newPrompt).subscribe(
      () => {
        this.newPrompt.custom_deadlines = [``];
        this.events.publish(`promptSubmitted`, {
          successMessage: `Test dates saved`
        });
      },
      () => {
        this.toastCtrl
          .create({
            duration: 3000,
            message: `An error has occurred, please try again.`
          })
          .present();
      }
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
    this.knownDatesChangeSub = this.knownDatesArray.valueChanges.subscribe(
      val => {
        this.testPromptForm.controls.selectedDates.setValue(this.mapDates(val));
      }
    );
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
}
