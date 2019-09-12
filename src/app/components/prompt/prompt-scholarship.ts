import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Events, ToastController } from '@ionic/angular';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { BackEndPrompt } from '@nte/models/back-end-prompt.model';
import { Prompt } from '@nte/models/prompt.model';
import { YesNoOptions } from '@nte/models/yes-no-options.model';
import { PromptService } from '@nte/services/prompt.service';

@Component({
  selector: `prompt-scholarship`,
  templateUrl: `prompt-scholarship.html`
})
export class PromptScholarshipComponent implements OnInit, OnDestroy {
  @Input() chosenOptions: string[];
  @Input() newPrompt: Prompt<string>;
  @Input() prompt: BackEndPrompt<YesNoOptions>;
  @Input() scholarshipId: number;

  public promptCompleted: boolean = false;

  private ngUnsubscribe: Subject<any> = new Subject();

  constructor(
    private events: Events,
    private promptService: PromptService,
    private toastCtrl: ToastController
  ) { }

  ngOnInit() {
    this.newPrompt.scholarship = this.scholarshipId;
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  public onOptionChange(_event: Event) {
    if ((this.newPrompt.amount_awarded && this.newPrompt.amount_awarded.length)
      || this.newPrompt.choice === `Not Awarded`) {
      this.events.publish(`fakeTaskStatusChange`, `C`);
      this.promptCompleted = true;
    } else if (this.promptCompleted) {
      this.events.publish(`fakeTaskStatusChange`, `ST`);
      this.promptCompleted = false;
    }
  }

  public submitNewPrompt() {
    this.promptService.submitNewPrompt(this.newPrompt)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(
        () => {
          this.events.publish(`promptSubmitted`, {
            successMessage: `Scholarship decision saved`
          });
        },
        () => this.showErrorToast()
      );
  }

  private async showErrorToast() {
    const toast = await this.toastCtrl.create({
      duration: 3000,
      message: `An error has occurred, please try again.`
    });
    toast.present();
  }
}
