import { Component, HostBinding, HostListener, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-pg-sidenav',
  templateUrl: './pg-sidenav.component.html',
  styleUrls: ['./pg-sidenav.component.scss']
})
export class PgSidenavComponent implements OnInit {
  @HostBinding('class.open') isOpen = false;
  public width: number = window.innerWidth;

  ngOnInit() {
    this.setInitialSidenavState();
  }

  setInitialSidenavState() {
    if (this.width > 728) {
      this.isOpen = false; // Згорнутий стан на десктопі
    }
  }

  @HostListener('window:resize', ['$event.target.innerWidth'])
  onResize(width: number) {
    this.width = width;
  }

  toggleSidenav() {
    this.isOpen = !this.isOpen;
  }

  @HostListener('mouseenter')
  onMouseEnter() {
    if (this.width > 728) {
      this.isOpen = true;
    }
  }

  @HostListener('mouseleave')
  onMouseLeave() {
    if (this.width > 728) {
      this.isOpen = false;
    }
  }
}
