import { Component, ElementRef, OnInit, HostListener } from '@angular/core';
import { SidenavService } from '../../../services/sidenav.service';
import { Observable } from 'rxjs';
import { AuthService } from '../../../services/auth.service';
import { UserProfileService } from '../../../services/user.profile.service';
import { UserDataModel } from '../../../models/user/user.data.model';

@Component({
  selector: 'app-pg-sidenav',
  templateUrl: './pg-sidenav.component.html',
  styleUrls: ['./pg-sidenav.component.scss']
})
export class PgSidenavComponent implements OnInit {
  public isSidenavOpen: Observable<boolean>;
  public width: number = window.innerWidth;
  public isAuthenticated: Observable<boolean>;
  public userProfileData: UserDataModel | null;

  constructor(
    private sidenavService: SidenavService,
    private el: ElementRef,
    private authService: AuthService,
    private userProfileService: UserProfileService
  ) {}

  ngOnInit() {
    this.setInitialState();
    this.isSidenavOpen = this.sidenavService.isOpen$;

    this.isAuthenticated = this.authService.isAuthenticated$;
    this.userProfileService.userProfileData.subscribe((value) => {
      this.userProfileData = value;
    });
  }

  setInitialState() {
    if (window.innerWidth > 768) {
      this.sidenavService.closeSidenav(this.el.nativeElement);
    } else {
      this.sidenavService.closeSidenav(this.el.nativeElement);
    }
  }

  toggleSidenav() {
    this.sidenavService.toggleSidenav(this.el.nativeElement);
  }

  closeSidenav() {
    this.sidenavService.closeSidenav(this.el.nativeElement);
  }

  @HostListener('mouseenter')
  onMouseEnter() {
    if (window.innerWidth > 768) {
      this.sidenavService.openSidenav(this.el.nativeElement);
    }
  }

  @HostListener('mouseleave')
  onMouseLeave() {
    if (window.innerWidth > 768) {
      this.sidenavService.closeSidenav(this.el.nativeElement);
    }
  }

  @HostListener('window:resize', ['$event.target.innerWidth'])
  onResize(width: number) {
    this.setInitialState();
    this.width = width;
  }

  public logout(): void {
    this.authService.logout();
  }
}
