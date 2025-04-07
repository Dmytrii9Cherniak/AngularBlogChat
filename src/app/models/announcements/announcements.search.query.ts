export class AnnouncementsSearchQuery {
  title: string = '';
  technologies: string = '';
  job_title: string = '';

  getQueryParams(): string {
    const queryParams: string[] = [];

    if (this.title.trim()) {
      queryParams.push(`title=${encodeURIComponent(this.title.trim())}`);
    }

    if (this.technologies.trim()) {
      queryParams.push(
        `technologies=${encodeURIComponent(this.technologies.trim())}`
      );
    }

    if (this.job_title.trim()) {
      queryParams.push(
        `job_title=${encodeURIComponent(this.job_title.trim())}`
      );
    }

    return queryParams.length ? `?${queryParams.join('&')}` : '';
  }
}
