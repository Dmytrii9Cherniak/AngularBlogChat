import { Component, HostListener } from '@angular/core';

@Component({
  selector: 'app-main-layout',
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.scss']
})
export class MainLayoutComponent {
  isFullyExpanded = false;
  width: number = window.innerWidth;

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.width = event.target.innerWidth;
    if (this.width < 768) {
      this.isFullyExpanded = false;
    }
  }

  toggleSidebar() {
    this.isFullyExpanded = !this.isFullyExpanded;
  }
}
