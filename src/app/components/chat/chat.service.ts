import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class ChatService {
  public messageType: string;
  public status: any;
  public subtitle: string = ``;
  public taskTracker?: any;
  public toolbarColor: string;

  private _newMessage: BehaviorSubject<any> = new BehaviorSubject(null);
  private _scrollToBottom: BehaviorSubject<boolean> = new BehaviorSubject(null);

  get changeEvent() {
    return `${this.messageType}Change`;
  }
  get moreEvent() {
    return `More${this.messageType[0].toUpperCase() + this.messageType.slice(1)}s`;
  }

  get inputPlaceholder() {
    return `Write a ${this.messageType}...`;
  }

  get newMessage() {
    return this._newMessage.getValue();
  }
  set newMessage(newMessage: any) {
    this._newMessage.next(newMessage);
  }
  get newMessage$() {
    return this._newMessage.asObservable();
  }

  set scrollToBottom(scrollToBottom: boolean) {
    this._scrollToBottom.next(scrollToBottom);
  }
  get scrollToBottom$() {
    return this._scrollToBottom.asObservable();
  }

}
