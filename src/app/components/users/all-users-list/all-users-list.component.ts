import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { UsersService } from '../../../services/users.service';
import { AuthService } from '../../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-all-users-list',
  templateUrl: './all-users-list.component.html',
  styleUrls: ['./all-users-list.component.scss']
})
export class AllUsersListComponent implements OnInit {
  public allUsersList: Observable<any>;
  public isAuthenticated: Observable<boolean>;

  constructor(
    private usersService: UsersService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.isAuthenticated = this.authService.isAuthenticated$;
    this.allUsersList = this.usersService.getAllUsers();
  }

  navigateToChat(user: any): void {
    this.router.navigate(['/chat'], {
      queryParams: { userId: user.id, userNickname: user.nickname }
    });
  }

  // navigateToChat(user: any): void {
  //   this.router.navigate(['/chat'], {
  //     queryParams: { userId: user.id, userNickname: user.nickname }
  //   });
  // }

  navigateToUserInfo(user: any): void {
    this.router.navigate(['/users', user.id]);
  }
}
