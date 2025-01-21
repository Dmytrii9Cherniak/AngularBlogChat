import { Component, OnInit } from '@angular/core';
import { NotificationsService } from '../../../services/notifications.service';

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.component.html',
  styleUrl: './notifications.component.scss'
})
export class NotificationsComponent implements OnInit {

  constructor(private notificationService: NotificationsService) {}

  ngOnInit() {
    this.notificationService.getAllNotifications().subscribe({
      next: (value) => {
        console.log(value);
      }
    })
  }
}
