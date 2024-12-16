import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UsersService } from '../../../services/users.service';
import { Observable } from 'rxjs';
import { DifferentUserDetailsInfoModel } from '../../../models/user/different.user.details.info.model';

@Component({
  selector: 'app-user-details-info',
  templateUrl: './user-details-info.component.html',
  styleUrls: ['./user-details-info.component.scss']
})
export class UserDetailsInfoComponent implements OnInit {
  public user$: Observable<DifferentUserDetailsInfoModel>;

  constructor(
    private route: ActivatedRoute,
    private usersService: UsersService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const userId = this.route.snapshot.paramMap.get('id');
    if (userId) {
      this.user$ = this.usersService.getDifferentUser(userId);
    }
  }

  navigateToChat(userId: number, username: string): void {
    this.router.navigate(['/chat'], {
      queryParams: { userId, username: username }
    });
  }
}
