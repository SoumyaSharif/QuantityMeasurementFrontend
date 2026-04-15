import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-auth-page',
  imports: [CommonModule, FormsModule],
  templateUrl: './auth-page.component.html',
  styleUrl: './auth-page.component.css'
})
export class AuthPageComponent {
  activeTab: 'login' | 'signup' = 'login';
  loginError = '';
  signupError = '';

  loginForm = {
    email: '',
    password: ''
  };

  signupForm = {
    name: '',
    email: '',
    password: '',
    mobile: ''
  };

  showLoginPassword = false;
  showSignupPassword = false;
  invalidFields = new Set<string>();

  constructor(
    private readonly authService: AuthService,
    private readonly router: Router
  ) {}

  switchTab(tab: 'login' | 'signup'): void {
    this.activeTab = tab;
    this.loginError = '';
    this.signupError = '';
    this.invalidFields.clear();
  }

  togglePassword(target: 'login' | 'signup'): void {
    if (target === 'login') {
      this.showLoginPassword = !this.showLoginPassword;
      return;
    }

    this.showSignupPassword = !this.showSignupPassword;
  }

  validateSignupPassword(): boolean {
    return this.signupForm.password.length > 0 && this.signupForm.password.length < 6;
  }

  validateMobile(): boolean {
    return this.signupForm.mobile.length > 0 && !/^\d{10}$/.test(this.signupForm.mobile);
  }

  doLogin(): void {
    this.loginError = '';
    this.invalidFields.clear();

    if (!this.loginForm.email.trim()) {
      this.markInvalid('loginEmail');
      this.loginError = 'Please enter your email.';
      return;
    }

    if (!this.loginForm.password) {
      this.markInvalid('loginPassword');
      this.loginError = 'Please enter your password.';
      return;
    }

    const session = this.authService.login(this.loginForm.email.trim(), this.loginForm.password);
    if (!session) {
      this.markInvalid('loginEmail');
      this.markInvalid('loginPassword');
      this.loginError = 'Invalid email or password.';
      return;
    }

    void this.router.navigate(['/dashboard']);
  }

  doSignup(): void {
    this.signupError = '';
    this.invalidFields.clear();

    if (!this.signupForm.name.trim()) {
      this.markInvalid('signupName');
      this.signupError = 'Please enter your full name.';
      return;
    }

    if (!this.signupForm.email.trim()) {
      this.markInvalid('signupEmail');
      this.signupError = 'Please enter your email.';
      return;
    }

    if (!this.signupForm.password) {
      this.markInvalid('signupPassword');
      this.signupError = 'Please enter a password.';
      return;
    }

    if (this.signupForm.password.length < 6) {
      this.markInvalid('signupPassword');
      this.signupError = 'Password must be at least 6 characters.';
      return;
    }

    if (!/^\d{10}$/.test(this.signupForm.mobile.trim())) {
      this.markInvalid('signupMobile');
      this.signupError = 'Enter a valid 10-digit mobile number.';
      return;
    }

    const result = this.authService.signup({
      name: this.signupForm.name.trim(),
      email: this.signupForm.email.trim(),
      password: this.signupForm.password,
      mobile: this.signupForm.mobile.trim()
    });

    if (!result.ok) {
      this.markInvalid('signupEmail');
      this.signupError = result.error || 'Unable to create account.';
      return;
    }

    void this.router.navigate(['/dashboard']);
  }

  clearFieldError(field: string): void {
    this.invalidFields.delete(field);
  }

  isInvalid(field: string): boolean {
    return this.invalidFields.has(field);
  }

  eyeIcon(isVisible: boolean): string {
    return isVisible
      ? `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"></path>
          <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"></path>
          <line x1="1" y1="1" x2="23" y2="23"></line>
        </svg>`
      : `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
          <circle cx="12" cy="12" r="3"></circle>
        </svg>`;
  }

  googleLogin(): void {
    window.location.href = 'http://localhost:8080/oauth2/authorization/google';
  }

  private markInvalid(field: string): void {
    this.invalidFields.add(field);
  }
}
