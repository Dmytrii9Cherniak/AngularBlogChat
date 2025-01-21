import { BehaviorSubject } from 'rxjs';

export class ModalManager {
  private modalStates: { [key: string]: boolean } = {};
  private modalStateSubject: BehaviorSubject<{ [key: string]: boolean }> =
    new BehaviorSubject(this.modalStates);

  public modalState$ = this.modalStateSubject.asObservable();

  public openModal(modalName: string): void {
    this.modalStates[modalName] = true;
    this.modalStateSubject.next(this.modalStates);
  }

  public closeModal(modalName: string): void {
    this.modalStates[modalName] = false;
    this.modalStateSubject.next(this.modalStates);
  }

  public handleModalVisibilityChange(
    modalName: string,
    isVisible: boolean
  ): void {
    this.modalStates[modalName] = isVisible;
    this.modalStateSubject.next(this.modalStates);
  }

  public isModalVisible(modalName: string): boolean {
    return this.modalStates[modalName] || false;
  }
}
