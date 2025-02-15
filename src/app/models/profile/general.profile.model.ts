export class GeneralProfileModel {
  avatar?: string;
  gender?: string;
  country?: string;
  about_me?: string;
  username?: string;
  birthday?: string;
  time_zones?: string;
  technologies?: string[];
  phone_number?: string;
  business_email?: string;

  constructor(
    avatar?: string,
    gender?: string,
    country?: string,
    about_me?: string,
    username?: string,
    birthday?: string,
    time_zones?: string,
    technologies?: string[],
    phone_number?: string,
    business_email?: string
  ) {
    this.avatar = avatar;
    this.gender = gender;
    this.country = country;
    this.about_me = about_me;
    this.username = username;
    this.birthday = birthday;
    this.time_zones = time_zones;
    this.technologies = technologies;
    this.phone_number = phone_number;
    this.business_email = business_email;
  }
}
