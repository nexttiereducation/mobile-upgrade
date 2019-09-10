import { Component, Input, OnInit } from '@angular/core';
import { Events, ToastController } from '@ionic/angular';

import { BackEndPrompt } from '@nte/models/back-end-prompt.model';
import { PromptSelectOptions } from '@nte/models/prompt-select-options.model';
import { Prompt } from '@nte/models/prompt.model';
import { PromptProvider } from '@nte/services/prompt.service';

@Component({
  selector: `prompt-select`,
  templateUrl: `prompt-select.html`
})
export class PromptSelectComponent implements OnInit {

  public chosenOption = [];
  @Input() public institution: number;
  @Input() public newPrompt: Prompt<string[]>;
  @Input() public prompt: BackEndPrompt<PromptSelectOptions>;
  public promptCompleted: boolean = false;

  constructor(private events: Events,
    private promptProvider: PromptProvider,
    private toastCtrl: ToastController) { }

  ngOnInit() {
    this.newPrompt.institution = this.institution;
  }

  public onOptionChange(value: string) {
    if (value && !this.promptCompleted) {
      this.events.publish(`fakeTaskStatusChange`, `C`);
      this.promptCompleted = true;
    }
  }

  public submitNewPrompt() {
    this.newPrompt.choice = this.chosenOption;
    this.promptProvider.submitNewPrompt(this.newPrompt)
      .subscribe(
        () => {
          this.events.publish(`promptSubmitted`, { successMessage: `Decision saved` });
        },
        () => {
          const toast = this.toastCtrl.create({
            duration: 3000,
            message: `An error has occurred, please try again`
          });
          toast.present();
        }
      );
  }

}
