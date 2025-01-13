import { Component, HostListener, OnInit, ViewChild } from '@angular/core';
import { PgSidenavComponent } from '../pg-sidenav/pg-sidenav.component';

@Component({
  selector: 'app-main-layout',
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.scss']
})
export class MainLayoutComponent implements OnInit {
  public width: number = window.innerWidth;

  @ViewChild(PgSidenavComponent) sidenav: PgSidenavComponent;

  ngOnInit(): void {
    this.width = window.innerWidth;
  }

  @HostListener('window:resize', ['$event.target.innerWidth'])
  onResize(width: number) {
    this.width = width;
    if (this.sidenav) {
      this.sidenav.width = width;
    }
  }

  closeSidenavOnClickOutside() {
    if (this.width <= 728 && this.sidenav.isOpen) {
      this.sidenav.isOpen = false;
    }
  }

  toggleSidenav() {
    this.sidenav.toggleSidenav();
  }
}
