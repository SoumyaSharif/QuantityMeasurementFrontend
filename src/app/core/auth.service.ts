import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';

export interface User {
  name: string;
  email: string;
  password: string;
  mobile: string;
}

export interface SessionUser {
  name: string;
  email: string;
  mobile: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly usersKey = 'qm_users';
  private readonly sessionKey = 'qm_session';
  private readonly router = inject(Router);

  getUsers(): User[] {
    return JSON.parse(localStorage.getItem(this.usersKey) || '[]');
  }

  getSession(): SessionUser | null {
    return JSON.parse(localStorage.getItem(this.sessionKey) || 'null');
  }

  isLoggedIn(): boolean {
    return !!this.getSession();
  }

  login(email: string, password: string): SessionUser | null {
    const user = this.getUsers().find((item) => item.email === email && item.password === password);
    if (!user) {
      return null;
    }

    const session = { name: user.name, email: user.email, mobile: user.mobile };
    this.setSession(session);
    return session;
  }

  signup(payload: User): { ok: boolean; error?: string } {
    const users = this.getUsers();
    if (users.some((item) => item.email === payload.email)) {
      return { ok: false, error: 'This email is already registered.' };
    }

    users.push(payload);
    localStorage.setItem(this.usersKey, JSON.stringify(users));
    this.setSession({ name: payload.name, email: payload.email, mobile: payload.mobile });
    return { ok: true };
  }

  logout(): void {
    localStorage.removeItem(this.sessionKey);
    void this.router.navigate(['/login']);
  }

  private setSession(user: SessionUser): void {
    localStorage.setItem(this.sessionKey, JSON.stringify(user));
  }
}
