import { Technology } from './technology.model';

export class CreateProjectModel {
  constructor(
    public name: string,
    public description: string,
    public technologies: Technology[]
  ) {}
}
