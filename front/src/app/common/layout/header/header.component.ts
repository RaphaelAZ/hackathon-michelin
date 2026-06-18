import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';


import { AuthStore } from '../../../core/stores/auth.store';

@Component({
  selector: 'app-header',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent {
  protected readonly authStore = inject(AuthStore);

  protected readonly currentUser = computed(() => this.authStore.user());

  protected logout(): void {
    this.authStore.logout();
  }
}
