export interface IPendingConnection {
  created: Date;
  id: number;
  invite_email: string;
  invite_token: string;
  invite_type: string;
  stakeholder?: any;
}
