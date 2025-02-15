export class Socials {
  [key: string]: string | null; // ✅ Додаємо index signature
  telegram: string | null;
  linkedin: string | null;
  github: string | null;
  instagram: string | null;
  skype: string | null;
  discord: string | null;
  website: string | null;
  facebook: string | null;
  youtube: string | null;

  constructor(
    telegram?: string,
    linkedin?: string,
    github?: string,
    instagram?: string,
    skype?: string,
    discord?: string,
    website?: string,
    facebook?: string,
    youtube?: string
  ) {
    this.telegram = telegram || null;
    this.linkedin = linkedin || null;
    this.github = github || null;
    this.instagram = instagram || null;
    this.skype = skype || null;
    this.discord = discord || null;
    this.website = website || null;
    this.facebook = facebook || null;
    this.youtube = youtube || null;
  }
}
