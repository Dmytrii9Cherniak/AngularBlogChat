import {
  Component,
  HostBinding,
  HostListener,
  Input,
  OnInit
} from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { Observable } from 'rxjs';
import { UserDataModel } from '../../../models/user/user.data.model';
import { UserService } from '../../../services/user.service';

@Component({
  selector: 'app-pg-sidenav',
  templateUrl: './pg-sidenav.component.html',
  styleUrls: ['./pg-sidenav.component.scss']
})
export class PgSidenavComponent implements OnInit {
  @HostBinding('class.open') isOpen = false; // Відкрито (мобільний)
  @HostBinding('class.collapsed') isCollapsed = true; // Згорнуто (десктоп)
  @Input() width: number = window.innerWidth; // Ширина екрана

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

  toggleSidenav() {
    if (this.width <= 728) {
      this.isOpen = !this.isOpen; // Логіка для мобільних
    }
  }

  @HostListener('mouseenter')
  onMouseEnter() {
    if (this.width > 728) {
      this.isCollapsed = false; // Відкриття на десктопі
    }
  }

  @HostListener('mouseleave')
  onMouseLeave() {
    if (this.width > 728) {
      this.isCollapsed = true; // Закриття на десктопі
    }
  }

  logout(): void {
    this.authService.logout();
  }
}
