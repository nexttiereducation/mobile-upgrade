import { Component } from '@angular/core';
import { Events } from '@ionic/angular';

import { ChatService } from '@nte/components/chat/chat.service';
import { MessageService } from '@nte/services/message.service';

@Component({
  selector: `chat-toolbar`,
  templateUrl: `chat-toolbar.html`
})
export class ChatToolbarComponent {
  constructor(public events: Events,
    public chatService: ChatService,
    public messageService: MessageService) { }

}
