import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { ChatBodyComponent } from '@nte/components/chat/body/chat-body';
import { ChatService } from '@nte/components/chat/chat.service';
import { ChatInputComponent } from '@nte/components/chat/input/chat-input';
import { ChatToolbarComponent } from '@nte/components/chat/toolbar/chat-toolbar';
import { ComponentsModule } from '@nte/components/components.module';
import { PipesModule } from '@nte/pipes/pipes.module';

const components = [
  ChatBodyComponent,
  ChatToolbarComponent,
  ChatInputComponent
];

@NgModule({
  declarations: components,
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ComponentsModule,
    PipesModule
  ],
  exports: components,
  providers: [ChatService]
})
export class ChatModule { }
