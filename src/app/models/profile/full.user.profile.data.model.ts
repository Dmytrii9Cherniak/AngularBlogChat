import { Socials } from './socials.profile.info.model';
import { Friend } from './profile.friend.model';
import { Project } from '../project/different.project.list.model';
import { Jobs } from './user.jobs.model';
import { Technology } from './user.technology.model';
import { UserEducationModel } from './user.education.model';

export interface UserProfile {
  id: number;
  username: string;
  avatar: string;
  nickname: string;
  about_me: string | null;
  technologies: Technology[];
  business_email: string;
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
  friends: Friend[];
  hobbies: string[];
  education: UserEducationModel[];
  certificates: string[];
  jobs: Jobs[];
  reactions: string[];
  projects: Project[];
  [key: string]: any;
}
