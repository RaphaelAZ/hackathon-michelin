import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'app-card',
    '[class.app-card--interactive]': 'interactive()',
    '[class.app-card--padding-none]': 'padding() === "none"',
  },
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss'],
})
export class CardComponent {
  readonly title = input<string>();
  readonly interactive = input(false);
  readonly padding = input<'default' | 'none'>('default');
}
