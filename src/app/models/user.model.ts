export class User {
  public avatar: string;
  public email: string;
  public id: number;
  public name: string;
  public type: string;

  constructor(user: any) {
    this.avatar = user.profile_photo || user.photo_url || user.photoUrl || null;
    this.email = user.email || null;
    this.id = user.id || null;
    this.name = user.name || user.full_name || user.fullName || user.get_full_name || null;
    this.type = user.stakeholder_type || user.stakeholderType || null;
  }
}
