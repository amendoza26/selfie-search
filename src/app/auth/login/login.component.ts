import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="login-container">
      <div class="spinner"></div>
      <p>Iniciando sesión...</p>
    </div>
  `,
  styles: [`
    .login-container {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      height: 100vh;
    }
    .spinner {
      width: 50px;
      height: 50px;
      border: 4px solid #f3f3f3;
      border-top: 4px solid #3498db;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `]
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
      console.error('❌ No se recibió token');
      this.redirectToHolding();
    }
  }

  authenticateWithToken(token: string): void {
    const platformId = 21; // ID de Selfie en la BD

    this.authService.loginWithToken(token, platformId).subscribe({
      next: (response) => {
        if (response.success) {
          console.log('✅ Autenticación exitosa');

          // Guardar en localStorage
          localStorage.setItem('selfie-token', response.data.token);
          localStorage.setItem('selfie-user', JSON.stringify(response.data.user));
          localStorage.setItem('selfie-modules', JSON.stringify(response.data.modules));

          // Redirigir al admin
          this.router.navigate(['/admin/registros']);
        }
      },
      error: (error) => {
        console.error('❌ Error en autenticación:', error);
        alert('Error al iniciar sesión. Redirigiendo...');
        this.redirectToHolding();
      }
    });
  }

  private redirectToHolding(): void {
    // window.location.href = 'http://localhost:4200';
    window.location.href = 'https://holding.gruporedsalud.com';
  }
}
