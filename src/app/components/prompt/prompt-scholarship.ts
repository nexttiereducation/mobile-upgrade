import { Component, Input, OnInit } from '@angular/core';
import { Events, ToastController } from '@ionic/angular';

import { BackEndPrompt } from '@nte/models/back-end-prompt.model';
import { Prompt } from '@nte/models/prompt.model';
import { YesNoOptions } from '@nte/models/yes-no-options.model';
import { PromptProvider } from '@nte/services/prompt.service';

@Component({
  selector: `prompt-scholarship`,
  templateUrl: `prompt-scholarship.html`
})
export class PromptScholarshipComponent implements OnInit {
  @Input() public chosenOptions: string[];
  @Input() public newPrompt: Prompt<string>;
  @Input() public prompt: BackEndPrompt<YesNoOptions>;

  public promptCompleted: boolean = false;
  @Input() public scholarshipId: number;

  constructor(
    private events: Events,
    private promptService: PromptProvider,
    private toastCtrl: ToastController
  ) { }

  ngOnInit() {
    this.newPrompt.scholarship = this.scholarshipId;
  }

  public onOptionChange(_event: Event) {
    if (
      (this.newPrompt.amount_awarded && this.newPrompt.amount_awarded.length) ||
      this.newPrompt.choice === `Not Awarded`
    ) {
      this.events.publish(`fakeTaskStatusChange`, `C`);
      this.promptCompleted = true;
    } else if (this.promptCompleted) {
      this.events.publish(`fakeTaskStatusChange`, `ST`);
      this.promptCompleted = false;
    }
  }

  public submitNewPrompt() {
    this.promptService.submitNewPrompt(this.newPrompt).subscribe(
      () => {
        this.events.publish(`promptSubmitted`, {
          successMessage: `Scholarship decision saved`
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
}
