import { IConnectionItemUser } from '@nte/interfaces/connection.interface';

export interface IInvite {
  created: string;
  id: number;
  invite_email: string;
  invite_token: string;
  invite_type: string;
  user: IConnectionItemUser;
}
