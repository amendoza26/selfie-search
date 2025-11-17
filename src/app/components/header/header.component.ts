import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule
  ],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {
  @Input() user: any = null;
  @Input() pageTitle: string = 'Selfie';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  /**
   * Cerrar sesión
   */
  logout(): void {
    const token = this.authService.getToken();

    if (!token) {
      this.clearAndRedirect();
      return;
    }

    this.authService.logout(token).subscribe({
      next: (response) => {
        if (response.success) {
          console.log('✅ Sesión cerrada');
        }
        this.clearAndRedirect();
      },
      error: () => {
        this.clearAndRedirect();
      }
    });
  }

  /**
   * Limpiar y redirigir
   */
  private clearAndRedirect(): void {
    this.authService.clearSession();
    // window.location.href = 'http://localhost:4200';
    //Producción:
    window.location.href = 'https://holding.gruporedsalud.com';
  }

  /**
   * Ir al perfil (implementar después)
   */
  goToProfile(): void {
    console.log('Ir a perfil');
    // this.router.navigate(['/perfil']);
  }
}
