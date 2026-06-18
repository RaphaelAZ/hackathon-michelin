import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import {
  FieldTree,
  FormField,
  email,
  form,
  maxLength,
  minLength,
  pattern,
  required,
  submit,
} from '@angular/forms/signals';
import { RouterLink } from '@angular/router';

import { ButtonComponent } from '../../common/components/button/button.component';
import { FormFieldComponent } from '../../common/components/form-field/form-field.component';
import { AuthStore } from '../../core/stores/auth.store';

type AuthTab = 'login' | 'register';

@Component({
  selector: 'app-auth-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormField, FormFieldComponent, ButtonComponent, RouterLink],
  templateUrl: './auth-page.component.html',
  styleUrls: ['./auth-page.component.scss'],
})
export class AuthPageComponent {
  protected readonly authStore = inject(AuthStore);
  protected readonly activeTab = signal<AuthTab>('login');
  protected readonly passwordMismatch = signal(false);

  // ── Login ──────────────────────────────────────────────────────────────────
  private readonly loginModel = signal({ email: '', password: '' });
  protected readonly loginForm = form(this.loginModel, (sp) => {
    required(sp.email, { message: "L'email est requis" });
    email(sp.email, { message: 'Adresse email invalide' });
    required(sp.password, { message: 'Le mot de passe est requis' });
    minLength(sp.password, 8, { message: 'Minimum 8 caractères' });
  });

  // ── Register ───────────────────────────────────────────────────────────────
  private readonly registerModel = signal({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    referralCode: '',
  });
  protected readonly registerForm = form(this.registerModel, (sp) => {
    required(sp.firstName, { message: 'Le prénom est requis' });
    required(sp.lastName, { message: 'Le nom est requis' });
    required(sp.email, { message: "L'email est requis" });
    email(sp.email, { message: 'Adresse email invalide' });
    required(sp.password, { message: 'Le mot de passe est requis' });
    minLength(sp.password, 8, { message: 'Minimum 8 caractères' });
    required(sp.confirmPassword, { message: 'Veuillez confirmer le mot de passe' });
    minLength(sp.referralCode, 8, { message: 'Le code de parrainage doit contenir 8 caractères' });
    maxLength(sp.referralCode, 8, { message: 'Le code de parrainage doit contenir 8 caractères' });
    pattern(sp.referralCode, /^[A-Za-z0-9]*$/, {
      message: 'Le code de parrainage ne peut contenir que lettres et chiffres',
    });
  });

  protected fieldError(field: FieldTree<string, string | number>): string {
    const state = field();
    if (state.invalid() && state.touched()) {
      const errors = state.errors();
      if (errors.length > 0) return errors[0].message ?? 'Champ invalide';
      return 'Champ invalide';
    }
    return '';
  }

  protected switchTab(tab: AuthTab): void {
    this.activeTab.set(tab);
    this.passwordMismatch.set(false);
  }

  protected onReferralCodeInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const normalized = input.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8);
    input.value = normalized;
    this.registerModel.update((current) => ({ ...current, referralCode: normalized }));
  }

  protected onLoginSubmit(event: Event): void {
    event.preventDefault();
    void submit(this.loginForm, async () => {
      const { email, password } = this.loginModel();
      this.authStore.login({ email, password });
      return null;
    });
  }

  protected onRegisterSubmit(event: Event): void {
    event.preventDefault();
    const model = this.registerModel();
    if (model.password !== model.confirmPassword) {
      this.passwordMismatch.set(true);
      return;
    }
    this.passwordMismatch.set(false);
    void submit(this.registerForm, async () => {
      const { firstName, lastName, email, password, referralCode } = this.registerModel();
      this.authStore.register({
        name: `${firstName} ${lastName}`.trim(),
        email,
        password,
        referral_code: referralCode.trim() ? referralCode.trim().toUpperCase() : undefined,
      });
      return null;
    });
  }
}
