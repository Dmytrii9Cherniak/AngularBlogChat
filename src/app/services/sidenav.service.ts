import { Injectable, Renderer2, RendererFactory2 } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SidenavService {
  private renderer: Renderer2;
  private isOpen = new BehaviorSubject<boolean>(false);
  isOpen$ = this.isOpen.asObservable();

  constructor(rendererFactory: RendererFactory2) {
    this.renderer = rendererFactory.createRenderer(null, null);
  }

  toggleSidenav(element: HTMLElement) {
    const newState = !this.isOpen.value;
    this.isOpen.next(newState);
    this.applyStyles(element, newState);
  }

  closeSidenav(element: HTMLElement) {
    this.isOpen.next(false);
    this.applyStyles(element, false);
  }

  openSidenav(element: HTMLElement) {
    this.isOpen.next(true);
    this.applyStyles(element, true);
  }

  private applyStyles(element: HTMLElement, isOpen: boolean) {
    const isMobile = window.innerWidth <= 768;

    if (isMobile) {
      this.renderer.setStyle(
        element,
        'transform',
        isOpen ? 'translateX(0)' : 'translateX(-100%)'
      );
      this.renderer.setStyle(element, 'width', '100%');
    } else {
      this.renderer.setStyle(element, 'transform', 'translateX(0)');
      this.renderer.setStyle(element, 'width', isOpen ? '250px' : '70px');
    }
  }
}
