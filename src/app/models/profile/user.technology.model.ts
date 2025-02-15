export class Technology {
  id?: number;
  name?: string;
  description?: string | null;

  constructor(id: number, name: string, description: string) {
    this.id = id;
    this.name = name;
    this.description = description;
  }
}
