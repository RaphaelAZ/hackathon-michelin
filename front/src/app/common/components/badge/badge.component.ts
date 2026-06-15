import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export type BadgeVariant = 'default' | 'yellow' | 'success' | 'error';

@Component({
  selector: 'app-badge',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './badge.component.html',
  styleUrls: ['./badge.component.scss'],
})
export class BadgeComponent {
  readonly variant = input<BadgeVariant>('default');

  protected badgeClasses(): string {
    return `badge--${this.variant()}`;
  }
}
