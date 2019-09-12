import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Events, ToastController } from '@ionic/angular';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { BackEndPrompt } from '@nte/models/back-end-prompt.model';
import { PromptSelectOptions } from '@nte/models/prompt-select-options.model';
import { Prompt } from '@nte/models/prompt.model';
import { PromptService } from '@nte/services/prompt.service';

@Component({
  selector: `prompt-select`,
  templateUrl: `prompt-select.html`
})
export class PromptSelectComponent implements OnInit, OnDestroy {
  @Input() institution: number;
  @Input() newPrompt: Prompt<string[]>;
  @Input() prompt: BackEndPrompt<PromptSelectOptions>;

  public chosenOption: any[] = [];
  public promptCompleted: boolean = false;
  private ngUnsubscribe: Subject<any> = new Subject();

  constructor(private events: Events,
    private promptService: PromptService,
    private toastCtrl: ToastController) { }

  ngOnInit() {
    this.newPrompt.institution = this.institution;
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  public onOptionChange(value: string) {
    if (value && !this.promptCompleted) {
      this.events.publish(`fakeTaskStatusChange`, `C`);
      this.promptCompleted = true;
    }
  }

  public submitNewPrompt() {
    this.newPrompt.choice = this.chosenOption;
    this.promptService.submitNewPrompt(this.newPrompt)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(
        () => this.events.publish(`promptSubmitted`, { successMessage: `Decision saved` }),
        () => this.showErrorToast()
      );
  }

  private async showErrorToast() {
    const toast = await this.toastCtrl.create({
            duration: 3000,
            message: `An error has occurred, please try again`
          });
          toast.present();
  }

}
