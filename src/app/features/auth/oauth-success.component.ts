import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-oauth-success',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="oauth-success">
      <h2>Login Successful!</h2>
      <p>Redirecting to dashboard...</p>
    </div>
  `,
  styles: [`
    .oauth-success {
      padding: 4rem 2rem;
      text-align: center;
      max-width: 40rem;
      margin: 0 auto;
    }
    h2 { color: var(--ink); margin-bottom: 1rem; }
  `]
})
export class OAuthSuccessComponent implements OnInit {
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const token = params['token'];
      if (token) {
        this.authService.setSessionFromJwt(token);
        setTimeout(() => this.router.navigate(['/dashboard']), 1500);
      } else {
        this.router.navigate(['/login']);
      }
    });
  }
}
