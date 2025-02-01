import {
  Component,
  HostListener,
  HostBinding,
  Input,
  Output,
  EventEmitter
} from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { UserProfileService } from '../../../services/user.profile.service';
import { Observable } from 'rxjs';
import { UserDataModel } from '../../../models/user/user.data.model';

@Component({
  selector: 'app-pg-sidenav',
  templateUrl: './pg-sidenav.component.html',
  styleUrls: ['./pg-sidenav.component.scss']
})
export class PgSidenavComponent {
  public isAuthenticated: Observable<boolean>;
  public userProfileData: UserDataModel | null;
  public width: number = window.innerWidth;

  @Input() isFullyExpanded = false;
  @Output() toggleSidebarEvent = new EventEmitter<boolean>();

  @HostBinding('class.open') get isOpen() {
    return this.isFullyExpanded;
  }

  constructor(
    private authService: AuthService,
    private userProfileService: UserProfileService
  ) {}

  ngOnInit() {
    this.isAuthenticated = this.authService.isAuthenticated$;
    this.userProfileService.userProfileData.subscribe((value) => {
      this.userProfileData = value;
    });
  }

  @HostListener('mouseenter')
  onMouseEnter() {
    if (this.width >= 768) {
      this.isFullyExpanded = true;
      this.toggleSidebarEvent.emit(this.isFullyExpanded);
    }
  }

  @HostListener('mouseleave')
  onMouseLeave() {
    if (this.width >= 768 && this.width === window.innerWidth) {
      this.isFullyExpanded = false;
      this.toggleSidebarEvent.emit(this.isFullyExpanded);
    }
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.width = event.target.innerWidth;
    if (this.width < 768) {
      this.isFullyExpanded = false;
    }
  }

  closeSidebar() {
    this.isFullyExpanded = false;
    this.toggleSidebarEvent.emit(this.isFullyExpanded);
  }

  getAvatarUrl(): string {
    return this.userProfileData?.avatar
      ? `/assets/${this.userProfileData.avatar}`
      : 'assets/images/no_profile_avatar.png';
  }

  onImageError(event: Event) {
    const imgElement = event.target as HTMLImageElement;
    imgElement.src = 'assets/images/no_profile_avatar.png';
  }

  logout() {
    this.authService.logout();
  }
}
