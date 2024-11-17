import { BehaviorSubject, interval, Subscription } from 'rxjs';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ForgotPasswordService {
  private timerSubject = new BehaviorSubject<string>('0:00');
  public timer$ = this.timerSubject.asObservable();
  private timerSubscription: Subscription | null = null;
  private attemptKey = 'forgotPasswordAttempts';

  createTimer(duration: number): void {
    const endTime = Date.now() + duration;
    localStorage.setItem('forgotPasswordTimer', endTime.toString());
  }

  startTimer(duration: number, onExpire: () => void): void {
    this.createTimer(duration);

    const currentTime = Date.now();
    const remainingTime = Math.max(0, this.getSavedTimer()! - currentTime);
    const minutes = Math.floor(remainingTime / 60000);
    const seconds = Math.floor((remainingTime % 60000) / 1000);

    this.timerSubject.next(`${minutes}:${seconds < 10 ? '0' : ''}${seconds}`);

    this.timerSubscription = interval(1000).subscribe(() => {
      const currentTime = Date.now();
      const remainingTime = Math.max(0, this.getSavedTimer()! - currentTime);

      if (remainingTime <= 0) {
        this.timerSubject.next('0:00');
        localStorage.removeItem('forgotPasswordTimer');
        this.stopTimer();
        onExpire();
      } else {
        const minutes = Math.floor(remainingTime / 60000);
        const seconds = Math.floor((remainingTime % 60000) / 1000);
        this.timerSubject.next(
          `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`
        );
      }
    });
  }

  stopTimer(): void {
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
      this.timerSubscription = null;
    }
  }

  getSavedTimer(): number | null {
    const savedEndTime = localStorage.getItem('forgotPasswordTimer');
    return savedEndTime ? Number(savedEndTime) : null;
  }

  clearStorage(): void {
    localStorage.removeItem('forgotPasswordTimer');
    localStorage.removeItem('forgotPasswordData');
    localStorage.removeItem(this.attemptKey);
  }

  hasForgotPasswordData(): boolean {
    return !!localStorage.getItem('forgotPasswordData');
  }

  isTimerValid(): boolean {
    const endTime = this.getSavedTimer();
    return endTime ? endTime - Date.now() > 0 : false;
  }

  resetAttempts(): void {
    localStorage.setItem(this.attemptKey, '0');
  }

  incrementAttempts(): void {
    const currentAttempts = this.getAttempts();
    localStorage.setItem(this.attemptKey, (currentAttempts + 1).toString());
  }

  getAttempts(): number {
    return Number(localStorage.getItem(this.attemptKey)) || 0;
  }

  hasExceededMaxAttempts(maxAttempts: number): boolean {
    return this.getAttempts() >= maxAttempts;
  }
}