import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { ComponentsModule } from '@nte/components/components.module';
import { PromptComponent } from '@nte/components/prompt/prompt';
import { PromptScholarshipComponent } from '@nte/components/prompt/prompt-scholarship';
import { PromptSelectComponent } from '@nte/components/prompt/prompt-select';
import { PromptTestDatesComponent } from '@nte/components/prompt/prompt-test-dates';

const components = [
  PromptScholarshipComponent,
  PromptSelectComponent,
  PromptTestDatesComponent,
  PromptComponent
];

@NgModule({
  declarations: components,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    ComponentsModule
  ],
  exports: components,
  providers: [],
})
export class PromptModule { }
