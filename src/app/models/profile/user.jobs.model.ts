export class Jobs {
  id?: number;
  company?: {
    id?: number;
    name?: string;
    photo?: string;
    description?: string;
  };
  position?: string;
  started_at?: string;
  ended_at?: string;
  description?: string;

  constructor(
    id?: number,
    company?: {
      id?: number;
      name?: string;
      photo?: string;
      description?: string;
    },
    position?: string,
    started_at?: string,
    ended_at?: string,
    description?: string
  ) {
    this.id = id;
    this.company = company ?? {};
    this.position = position ?? '';
    this.started_at = started_at ?? '';
    this.ended_at = ended_at ?? '';
    this.description = description ?? '';
  }
}
