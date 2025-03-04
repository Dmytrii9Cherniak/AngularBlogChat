import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { UserProfileService } from '../../../services/user.profile.service';
import { UserProfile } from '../../../models/profile/full.user.profile.data.model';

@Component({
  selector: 'app-user-details-info',
  templateUrl: './user-details-info.component.html',
  styleUrls: ['./user-details-info.component.scss']
})
export class UserDetailsInfoComponent implements OnInit {
  public user$: Observable<UserProfile>;

  constructor(
    private route: ActivatedRoute,
    private userProfileService: UserProfileService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const userId = this.route.snapshot.paramMap.get('id');
    console.log(userId);
    if (userId) {
      this.user$ = this.userProfileService.getOtherUserProfileInfo(
        Number(userId)
      );
    }
  }

  navigateToChat(userId: number, username: string): void {
    this.router.navigate(['/chat'], {
      queryParams: { userId: userId, username: username }
    });
  }
}
