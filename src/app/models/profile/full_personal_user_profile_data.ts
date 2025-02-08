import { Project } from '../project/different.project.list.model';
import { FriendModel } from '../user/friends.model';

export interface Socials {
  telegram: string | null;
  linkedin: string | null;
  github: string | null;
  instagram: string | null;
  skype: string | null;
  discord: string | null;
  website: string | null;
  facebook: string | null;
  youtube: string | null;
  business_email: string;
}

export interface PersonalUserInfo {
  id: number;
  username: string;
  avatar: string;
  nickname: string;
  email: string;
  role: string;
  behavior_points: number;
  gender: string;
  birthday: string | null;
  phone_number: string;
  country: string;
  time_zones: string;
  status: string;
  job_title: string;
  two_factor_method: string;
  socials: Socials;
  friends: FriendModel[];
  hobbies: string[];
  education: string[];
  certificates: string[];
  work_experience: string[];
  reactions: string[];
  projects: Project[];
}
