import {
  Component,
  ContentChild,
  EventEmitter,
  Input,
  Output,
  TemplateRef
} from '@angular/core';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-modal-wrapper',
  templateUrl: './modal-wrapper.component.html',
  styleUrls: ['./modal-wrapper.component.scss'],
  animations: [
    trigger('modalAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(-50px)' }),
        animate(
          '300ms ease-out',
          style({ opacity: 1, transform: 'translateY(0)' })
        )
      ]),
      transition(':leave', [
        animate(
          '300ms ease-in',
          style({ opacity: 0, transform: 'translateY(-50px)' })
        )
      ])
    ])
  ]
})
export class ModalWrapperComponent {
  @Input() isModalShow: boolean = false;

  @ContentChild('modalHeader') modalHeader: TemplateRef<void>;
  @ContentChild('modalBody') modalBody: TemplateRef<void>;
  @ContentChild('modalFooter') modalFooter: TemplateRef<void>;

  @Output() modalVisibleChange = new EventEmitter<boolean>();

  public hideModalWindow(): void {
    this.isModalShow = false;
    this.modalVisibleChange.emit(this.isModalShow);
  }
}
