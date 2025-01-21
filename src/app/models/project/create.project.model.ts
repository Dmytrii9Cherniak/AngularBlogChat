import { Technology } from './technology.model';

export class Project {
  constructor(
    public name: string,
    public description: string,
    public technologies: Technology[]
  ) {}
}
