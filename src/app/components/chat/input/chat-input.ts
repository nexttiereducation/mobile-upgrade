import { Component, EventEmitter, Output, ViewEncapsulation } from '@angular/core';
import { Events } from '@ionic/angular';

import { ChatService } from '@nte/components/chat/chat.service';
import { MessageService } from '@nte/services/message.service';

@Component({
  selector: `chat-input`,
  templateUrl: `chat-input.html`,
  styleUrls: [`chat-input.scss`],
  encapsulation: ViewEncapsulation.None
})
export class ChatInputComponent {
  @Output() send: EventEmitter<string> = new EventEmitter();

  constructor(public events: Events,
    public chatService: ChatService,
    public messageService: MessageService) { }

  public submit(msg: string) {
    this.send.emit(msg);
    this.chatService.newMessage = '';
  }

}
