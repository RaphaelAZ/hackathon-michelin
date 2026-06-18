import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

import { ButtonComponent } from '../button/button.component';

export interface DealerInfo {
  name: string;
  address: string;
  city: string;
  distance: string;
  phone: string;
  hours: string;
  services: string[];
}

@Component({
  selector: 'app-dealer-modal',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ButtonComponent],
  templateUrl: './dealer-modal.component.html',
  styleUrls: ['./dealer-modal.component.scss'],
  host: {
    '(document:keydown.escape)': 'close()',
  },
})
export class DealerModalComponent {
  readonly open = input(false);
  readonly title = input('Trouver un revendeur');
  readonly dealers = input<DealerInfo[]>([]);
  readonly loading = input(false);
  readonly error = input<string>('');

  readonly closed = output<void>();
  readonly retry = output<void>();

  protected close(): void {
    this.closed.emit();
  }

  protected onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.close();
    }
  }

  protected retryLoad(): void {
    this.retry.emit();
  }
}