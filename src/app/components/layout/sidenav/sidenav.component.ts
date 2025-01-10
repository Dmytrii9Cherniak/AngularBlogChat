import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-sidenav',
  templateUrl: './sidenav.component.html',
  styleUrls: ['./sidenav.component.scss']
})
export class SidenavComponent {
  isCollapsed = false;

  @Output() toggle = new EventEmitter<boolean>();
  menuItems = [
    'Home',
    'Projects',
    'Calendar',
    'Settings',
    'Logout',
    'Home',
    'Projects',
    'Calendar',
    'Settings',
    'Home',
    'Projects',
    'Calendar',
    'Settings',
    'Home',
    'Projects',
    'Calendar',
    'Settings',
    'Home',
    'Projects',
    'Calendar',
    'Settings',
    'Home',
    'Projects',
    'Calendar',
    'Settings',
    'Home',
    'Projects',
    'Calendar',
    'Settings',
    'Home',
    'Projects',
    'Calendar',
    'Settings'
  ];

  toggleSidenav() {
    this.isCollapsed = !this.isCollapsed;
    this.toggle.emit(this.isCollapsed);
  }
}
