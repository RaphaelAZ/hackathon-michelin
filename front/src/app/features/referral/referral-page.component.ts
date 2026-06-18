import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';

import { ButtonComponent } from '../../common/components/button/button.component';
import { ReferralDashboard } from '../../core/models/referral.model';
import { ReferralService } from '../../core/services/referral.service';

@Component({
  selector: 'app-referral-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DatePipe, ButtonComponent],
  templateUrl: './referral-page.component.html',
  styleUrls: ['./referral-page.component.scss'],
})
export class ReferralPageComponent {
  private readonly referralService = inject(ReferralService);

  protected readonly dashboard = signal<ReferralDashboard | null>(null);
  protected readonly isLoading = signal(true);
  protected readonly error = signal('');
  protected readonly copied = signal(false);
  protected readonly referralCode = computed(() => this.dashboard()?.referralCode ?? '');
  protected readonly sponsoredUsers = computed(() => this.dashboard()?.sponsoredUsers ?? []);
  protected readonly sponsoredUsersCount = computed(() => this.sponsoredUsers().length);

  constructor() {
    this.loadDashboard();
  }

  protected loadDashboard(): void {
    this.isLoading.set(true);
    this.error.set('');
    this.referralService.getDashboard().subscribe({
      next: (dashboard) => {
        this.dashboard.set(dashboard);
        this.isLoading.set(false);
      },
      error: () => {
        this.error.set('Impossible de charger vos informations de parrainage pour le moment.');
        this.isLoading.set(false);
      },
    });
  }

  protected copyCode(): void {
    const code = this.referralCode();
    if (!code) {
      return;
    }

    void navigator.clipboard.writeText(code).then(() => {
      this.copied.set(true);
      setTimeout(() => this.copied.set(false), 2000);
    });
  }
}
