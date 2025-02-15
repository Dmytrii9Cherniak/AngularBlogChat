export class UserEducationModel {
  id?: number;
  university?: string;
  specialty?: string;
  started_at?: string; // Формат YYYY-MM-DD
  ended_at?: string; // Формат YYYY-MM-DD

  constructor(
    id?: number,
    university?: string,
    specialty?: string,
    started_at?: string,
    ended_at?: string
  ) {
    this.id = id;
    this.university = university;
    this.specialty = specialty;
    this.started_at = started_at;
    this.ended_at = ended_at;
  }
}
