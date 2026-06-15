import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-price',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './price.component.html',
  styleUrls: ['./price.component.scss'],
})
export class PriceComponent {
  readonly amount = input.required<number>();
  readonly size = input<'sm' | 'md' | 'lg'>('md');

  protected sizeClass(): string {
    return `price--${this.size()}`;
  }

  protected formattedPrice(): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
    }).format(this.amount());
  }
}
