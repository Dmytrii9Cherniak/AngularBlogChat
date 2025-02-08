export class CreateProjectInvite {
  public receiver: number;
  public expires_at: string;
  public description: string;

  constructor(receiver: number, expires_at: string, description: string) {
    this.receiver = receiver;
    this.expires_at = expires_at;
    this.description = description;
  }
}
