import { Project, User } from './project/different.project.list.model';

export class ReviewUserModel {
  id?: number;
  reaction?: string;
  review?: string;
  project?: Project;
  university?: string;
  company?: string;
  user?: User;
  profile?: number;

  constructor(data: Partial<ReviewUserModel> = {}) {
    this.id = data.id;
    this.reaction = data.reaction;
    this.review = data.review;
    this.project = data.project || undefined;
    this.university = data.university || undefined;
    this.company = data.company || undefined;
    this.user = data.user;
    this.profile = data.profile;
  }
}

// import { Project, User } from './project/different.project.list.model';
//
// export class ReviewUserModel {
//   id?: number;
//   reaction?: string;
//   review?: string;
//   project?: Project;
//   university?: string;
//   company?: string;
//   user?: User;
//   profile?: number;
//
//   constructor(
//     id?: number,
//     reaction?: string,
//     review?: string,
//     project?: Project,
//     university?: string,
//     company?: string,
//     user?: User,
//     profile?: number
//   ) {
//     this.id = id;
//     this.reaction = reaction;
//     this.review = review;
//     this.project = project;
//     this.university = university;
//     this.company = company;
//     this.user = user;
//     this.profile = profile;
//   }
// }
