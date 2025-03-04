import { Project } from '../project/different.project.list.model';

export class NewAnnouncementModel {
  id?: number;
  title?: string;
  description?: string;
  project?: Project;
  updated_at?: string;
  created_at?: string;
  job_titles?: string[];
  technologies?: string[];
  owner?: number;
  [key: string]: any;

  constructor(
    title?: string,
    description?: string,
    job_titles?: string[],
    technologies?: string[],
    project?: Project
  ) {
    this.title = title;
    this.description = description;
    this.job_titles = job_titles;
    this.technologies = technologies;
    this.project = project;
  }
}
