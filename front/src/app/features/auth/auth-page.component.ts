import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import {
  FieldTree,
  FormField,
  email,
  form,
  minLength,
  required,
  submit,
} from '@angular/forms/signals';
import { RouterLink } from '@angular/router';

import { ButtonComponent } from '../../common/components/button/button.component';
import { FormFieldComponent } from '../../common/components/form-field/form-field.component';

type AuthTab = 'login' | 'register';

@Component({
  selector: 'app-auth-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormField, FormFieldComponent, ButtonComponent, RouterLink],
  templateUrl: './auth-page.component.html',
  styleUrls: ['./auth-page.component.scss'],
})
export class AuthPageComponent {
  protected readonly activeTab = signal<AuthTab>('login');
  protected readonly loginSuccess = signal(false);
  protected readonly registerSuccess = signal(false);
  protected readonly passwordMismatch = signal(false);
  protected readonly isSubmitting = signal(false);

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
  });
  protected readonly registerForm = form(this.registerModel, (sp) => {
    required(sp.firstName, { message: 'Le prénom est requis' });
    required(sp.lastName, { message: 'Le nom est requis' });
    required(sp.email, { message: "L'email est requis" });
    email(sp.email, { message: 'Adresse email invalide' });
    required(sp.password, { message: 'Le mot de passe est requis' });
    minLength(sp.password, 8, { message: 'Minimum 8 caractères' });
    required(sp.confirmPassword, { message: 'Veuillez confirmer le mot de passe' });
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

  protected onLoginSubmit(event: Event): void {
    event.preventDefault();
    this.isSubmitting.set(true);
    void submit(this.loginForm, async () => {
      // TODO: connect to auth service
      this.loginSuccess.set(true);
      this.isSubmitting.set(false);
      return null;
    }).finally(() => this.isSubmitting.set(false));
  }

  protected onRegisterSubmit(event: Event): void {
    event.preventDefault();
    const model = this.registerModel();
    if (model.password !== model.confirmPassword) {
      this.passwordMismatch.set(true);
      return;
    }
    this.passwordMismatch.set(false);
    this.isSubmitting.set(true);
    void submit(this.registerForm, async () => {
      // TODO: connect to auth service
      this.registerSuccess.set(true);
      this.isSubmitting.set(false);
      return null;
    }).finally(() => this.isSubmitting.set(false));
  }
}
