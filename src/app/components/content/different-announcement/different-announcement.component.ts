import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AnnouncementsService } from '../../../services/announcements.service';
import { NewAnnouncementModel } from '../../../models/announcements/new.announcement.model';

@Component({
  selector: 'app-different-announcement',
  templateUrl: './different-announcement.component.html',
  styleUrls: ['./different-announcement.component.scss']
})
export class DifferentAnnouncementComponent implements OnInit {
  public announcement: NewAnnouncementModel;
  public isLoading: boolean = true;

  constructor(
    private announcementsService: AnnouncementsService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      const id = params['id'];
      if (id) {
        this.getProjectAnnouncement(id);
      }
    });
  }

  private getProjectAnnouncement(id: string): void {
    this.announcementsService.getDifferentAnnouncement(id).subscribe({
      next: (announcement) => {
        this.announcement = announcement;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }
}
