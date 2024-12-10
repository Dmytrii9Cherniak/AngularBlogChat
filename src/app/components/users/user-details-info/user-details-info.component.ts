import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UsersService } from '../../../services/users.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-user-details-info',
  templateUrl: './user-details-info.component.html',
  styleUrls: ['./user-details-info.component.scss']
})
export class UserDetailsInfoComponent implements OnInit {
  public user$: Observable<any>;

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

  navigateToChat(userId: string, nickname: string): void {
    this.router.navigate(['/chat'], {
      queryParams: { userId, userNickname: nickname }
    });
  }
}
