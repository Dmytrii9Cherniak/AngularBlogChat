export interface Technology {
  id: number;
  name: string;
  description: string | null;
}

export interface User {
  id: number;
  nickname: string;
  email: string;
  avatar: string;
}

export interface Creator {
  id: number;
  nickname: string;
  email: string;
  avatar: string;
}

export interface Project {
  id: number;
  name: string;
  description: string;
  technologies: Technology[];
  users: User[];
  creator: Creator;
}
