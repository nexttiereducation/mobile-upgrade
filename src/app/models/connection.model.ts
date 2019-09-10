import { User } from '@nte/models/user.model';

export class Connection extends User {
  public get_full_name: string;
  public graduation_year: number;
  public isSelected?: boolean;
  public profile_photo: string;
  public stakeholder_type: string;

  constructor(user: any) {
    super(user);
  }
}
