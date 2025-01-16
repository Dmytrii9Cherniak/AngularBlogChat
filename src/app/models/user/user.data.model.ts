export class UserDataModel {
  avatar: string;
  nickname: string;
  email: string;
  role: string;
  behavior_points: number;
  gender: string;
  birthday: string | null;
  phone_number: string | null;
  country: string;
  time_zones: string;
  status: string;
  job_title: string;
  two_factor_method: string;
  socials: {
    telegram: string | null;
    linkedin: string | null;
    github: string | null;
    instagram: string | null;
    skype: string | null;
    discord: string | null;
    website: string | null;
    facebook: string | null;
    youtube: string | null;
    business_email: string | null;
  };
  friends: any[]; // Масив друзів (можливо, потрібно створити окрему модель)
  hobbies: string[];
  education: any[]; // Масив освітніх досягнень
  certificates: any[]; // Масив сертифікатів
  work_experience: any[]; // Масив робочого досвіду
  reactions: any[]; // Масив реакцій
  id: number;
  username: string;
}
