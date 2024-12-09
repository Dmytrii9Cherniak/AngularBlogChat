import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { fromEvent, Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  private subscription: Subscription | null = null;
  private lastViewportWidth: number | null = null;
  private resizeFrame: number | null = null;

  constructor(private router: Router) {}

  ngOnInit(): void {
    // Відстежуємо зміну маршруту
    this.subscription = this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.fixViewportWidth();
      }
    });

    // Відстежуємо зміну розміру та зміну орієнтації
    this.subscription.add(
      fromEvent(window, 'resize').subscribe(() =>
        this.debouncedViewportWidthUpdate()
      )
    );

    this.subscription.add(
      fromEvent(window, 'orientationchange').subscribe(() =>
        this.fixViewportWidth()
      )
    );

    // Встановлюємо ширину при завантаженні сторінки
    this.fixViewportWidth();
  }

  ngOnDestroy(): void {
    if (this.subscription) this.subscription.unsubscribe();
    if (this.resizeFrame) cancelAnimationFrame(this.resizeFrame);
  }

  /**
   * Викликається тільки якщо розмір екрану змінився
   */
  debouncedViewportWidthUpdate(): void {
    if (this.resizeFrame) cancelAnimationFrame(this.resizeFrame);
    this.resizeFrame = requestAnimationFrame(() => this.fixViewportWidth());
  }

  /**
   * Фіксуємо ширину для всіх елементів
   */
  fixViewportWidth(): void {
    const viewportWidth = window.innerWidth;

    // Якщо ширина не змінилася, не оновлюємо стилі
    if (this.lastViewportWidth === viewportWidth) return;
    this.lastViewportWidth = viewportWidth;

    document.documentElement.style.width = `${viewportWidth}px`;
    document.body.style.width = `${viewportWidth}px`;

    const elements = document.querySelectorAll<HTMLElement>(
      '.app, app-header, .content, .container, router-outlet'
    );
    elements.forEach((element) => {
      element.style.width = `${viewportWidth}px`;
    });

    console.log('Viewport width updated to:', viewportWidth);
  }
}
