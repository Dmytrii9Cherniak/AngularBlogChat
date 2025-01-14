import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { Observable } from 'rxjs';
import { UserService } from '../../../services/user.service';
import { UserDataModel } from '../../../models/user/user.data.model';
import { SidenavService } from '../../../services/sidenav.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent implements OnInit {
  @Output() toggleMenu = new EventEmitter<void>();

  public isAuthenticated: Observable<boolean>;
  public userProfileData: Observable<UserDataModel | null>;

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private sidenavService: SidenavService
  ) {}

  ngOnInit() {
    this.isAuthenticated = this.authService.isAuthenticated$;
    this.userProfileData = this.userService.userProfileData;
  }

  logout(): void {
    this.authService.logout();
  }

  onMenuClick() {
    const sidenav = document.querySelector('app-pg-sidenav') as HTMLElement;
    if (sidenav) {
      this.sidenavService.toggleSidenav(sidenav);
    }
  }
}
