export class UserCertificatesModel {
  id: string | null;
  title: string | null;
  photo: File | null;
  organization: string | null;
  issued_at: string | null;
  description: string | null;

  constructor(
    id: string | null = null,
    title: string | null = null,
    photo: File | null = null,
    organization: string | null = null,
    issued_at: string | null = null,
    description: string | null = null
  ) {
    this.id = id;
    this.title = title;
    this.photo = photo;
    this.organization = organization;
    this.issued_at = issued_at;
    this.description = description;
  }
}
