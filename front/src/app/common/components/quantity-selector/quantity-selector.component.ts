import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

import { ButtonComponent } from '../button/button.component';

@Component({
  selector: 'app-quantity-selector',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ButtonComponent],
  templateUrl: './quantity-selector.component.html',
  styleUrls: ['./quantity-selector.component.scss'],
})
export class QuantitySelectorComponent {
  readonly value = input(1);
  readonly min = input(1);
  readonly max = input(99);
  readonly label = input('Quantité');

  readonly valueChange = output<number>();

  protected decrement(): void {
    if (this.value() > this.min()) {
      this.valueChange.emit(this.value() - 1);
    }
  }

  protected increment(): void {
    if (this.value() < this.max()) {
      this.valueChange.emit(this.value() + 1);
    }
  }
}
