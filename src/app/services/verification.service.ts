import { Injectable } from '@angular/core';
import { BehaviorSubject, interval } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class VerificationService {
  private timerSubject = new BehaviorSubject<string>('0:00');
  public timer$ = this.timerSubject.asObservable();
  private timerSubscription: any = null;

  startTimer(duration: number, onExpire: () => void): void {
    const endTime = Date.now() + duration;
    sessionStorage.setItem('verificationTimer', endTime.toString());

    this.timerSubscription = interval(1000).subscribe(() => {
      const currentTime = Date.now();
      const remainingTime = Math.max(0, endTime - currentTime);

      if (remainingTime <= 0) {
        this.timerSubject.next('0:00');
        sessionStorage.removeItem('verificationTimer');
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
    const savedEndTime = sessionStorage.getItem('confirmationTimer');
    return savedEndTime ? Number(savedEndTime) : null;
  }

  hasRegistrationData(): boolean {
    return !!sessionStorage.getItem('registrationData');
  }

  isTimerValid(): boolean {
    const endTime = this.getSavedTimer();
    return endTime ? endTime - Date.now() > 0 : false;
  }
}
