import { Component, OnInit } from '@angular/core';
import { NotificationsService } from '../../../services/notifications.service';
import { ProjectsService } from '../../../services/projects.service';
import { NotificationSection } from '../../../models/notifications/nofification_section_model';

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.scss']
})
export class NotificationsComponent implements OnInit {
  public notificationsData: NotificationSection[] = [];

  constructor(
    private notificationService: NotificationsService,
    private projectService: ProjectsService
  ) {}

  ngOnInit(): void {
    this.notificationService.getAllNotifications().subscribe({
      next: (response) => {
        if (response && typeof response === 'object' && 'content' in response) {
          const content = response.content as Record<string, unknown>;
          this.notificationsData = Object.entries(content)
            .filter(([_, value]) => Array.isArray(value))
            .map(([key, values]) => ({
              key,
              values: values as Record<string, unknown>[]
            }));
        }
      },
      error: () => {
        console.error('Failed to load notifications');
      }
    });
  }

  acceptOrDeclineProjectOffer(offerCode: string, choice: string) {
    this.projectService.responseProjectInvite(offerCode, choice).subscribe({});
  }

  deleteNotification(id: number) {
    this.notificationService.deleteCertainNotification(id).subscribe({
      next: () => {
        this.notificationsData = this.notificationsData
          .map((section) => ({
            key: section.key,
            values: section.values.filter((item) => item['id'] !== id)
          }))
          .filter((section) => section.values.length > 0);
      },
      error: () => {
        console.error(`Failed to delete notification with id: ${id}`);
      }
    });
  }

  protected readonly Number = Number;
}
