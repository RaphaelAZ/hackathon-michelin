import { ChangeDetectionStrategy, Component, inject, input, output } from '@angular/core';
import { Router } from '@angular/router';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'app-button',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'app-button-host',
    '[class.app-button-host--block]': 'fullWidth()',
  },
  templateUrl: './button.component.html',
  styleUrls: ['./button.component.scss'],
})
export class ButtonComponent {
  private readonly router = inject(Router);

  readonly variant = input<ButtonVariant>('primary');
  readonly size = input<ButtonSize>('md');
  readonly type = input<'button' | 'submit' | 'reset'>('button');
  readonly disabled = input(false);
  readonly fullWidth = input(false);
  readonly routerLink = input<string | string[]>();

  readonly clicked = output<MouseEvent>();

  protected buttonClasses(): string {
    return `btn--${this.variant()} btn--${this.size()}`;
  }

  protected onClick(event: MouseEvent): void {
    if (this.disabled()) {
      event.preventDefault();
      return;
    }

    const link = this.routerLink();
    if (link) {
      event.preventDefault();
      const commands = Array.isArray(link) ? link : [link];
      void this.router.navigate(commands);
    }

    this.clicked.emit(event);
  }
}
