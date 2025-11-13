import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule],
  template: `<p>Iniciando sesión...</p>`
})
export class LoginComponent implements OnInit {
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const token = this.route.snapshot.paramMap.get('token');

    if (token) {
      this.authenticateWithToken(token);
    } else {
      this.router.navigate(['/error']);
    }
  }

  authenticateWithToken(token: string): void {
    const platformId = 4; // ID de la plataforma Selfie en tu DB

    this.authService.loginWithToken(token, platformId).subscribe({
      next: (response) => {
        if (response.success) {
          // Guardar en localStorage
          localStorage.setItem('token', response.data.token);
          localStorage.setItem('user', JSON.stringify(response.data.user));
          localStorage.setItem('modules', JSON.stringify(response.data.modules));

          // Redirigir al dashboard
          this.router.navigate(['/dashboard']);
        }
      },
      error: (error) => {
        console.error('Error en autenticación:', error);
        this.router.navigate(['/error']);
      }
    });
  }
}
