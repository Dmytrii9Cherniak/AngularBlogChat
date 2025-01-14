import {
  Component,
  AfterViewInit,
  ViewChild,
  HostListener
} from '@angular/core';
import { PgSidenavComponent } from '../pg-sidenav/pg-sidenav.component';

@Component({
  selector: 'app-main-layout',
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.scss']
})
export class MainLayoutComponent implements AfterViewInit {
  public width: number = window.innerWidth;

  @ViewChild(PgSidenavComponent) sidenav: PgSidenavComponent;

  ngAfterViewInit() {
    this.sidenav.setInitialState();
  }

  toggleSidenav() {
    if (this.sidenav) {
      this.sidenav.toggleSidenav();
    }
  }

  @HostListener('window:resize', ['$event.target.innerWidth'])
  onResize(width: number) {
    this.width = width;
    if (width <= 768) {
      this.sidenav.closeSidenav();
    }
  }
}
