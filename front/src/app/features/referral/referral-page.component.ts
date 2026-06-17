import { ChangeDetectionStrategy, Component, signal } from '@angular/core';

import { ButtonComponent } from '../../common/components/button/button.component';

@Component({
  selector: 'app-referral-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ButtonComponent],
  templateUrl: './referral-page.component.html',
  styleUrls: ['./referral-page.component.scss'],
})
export class ReferralPageComponent {
  protected readonly referralCode = signal('MICHELIN-XXXX-2026');
  protected readonly copied = signal(false);

  protected copyCode(): void {
    void navigator.clipboard.writeText(this.referralCode()).then(() => {
      this.copied.set(true);
      setTimeout(() => this.copied.set(false), 2000);
    });
  }
}
