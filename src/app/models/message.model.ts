import { IMessageUser } from './message-user.interface';

export class Message {
  public author: IMessageUser;
  public body: string;
  public created_on: Date;
  public id: number;
  public recipient: IMessageUser;

  constructor(message: any) {
    this.author = message.author;
    this.body = message.body;
    this.created_on = new Date(message.created_on);
    this.id = message.id;
    this.recipient = message.recipient;
  }
}
