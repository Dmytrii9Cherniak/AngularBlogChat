export class CreateProjectModel {
  constructor(
    public name: string,
    public description: string,
    public technologies: string[]
  ) {}
}
