import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { Observable } from 'rxjs';
import { UserService } from '../../../services/user.service';
import { UserDataModel } from '../../../models/user/user.data.model';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent implements OnInit {
  public isAuthenticated: Observable<boolean>;
  public userProfileData: Observable<UserDataModel | null>;

  constructor(
    private authService: AuthService,
    private userService: UserService
  ) {}

  ngOnInit() {
    this.isAuthenticated = this.authService.isAuthenticated$;
    this.userProfileData = this.userService.userProfileData;
  }

  logout(): void {
    this.authService.logout();
  }
}
