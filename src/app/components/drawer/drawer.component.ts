import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../services/auth.service';

interface Module {
  id: number;
  name: string;
  views: View[];
}

interface View {
  id: number;
  name: string;
}

@Component({
  selector: 'app-drawer',
  standalone: true,
  imports: [
    CommonModule,
    MatExpansionModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './drawer.component.html',
  styleUrls: ['./drawer.component.scss']
})
export class DrawerComponent implements OnInit {
  @Input() modulos: Module[] = [];
  @Input() user: any = null;
  @Output() toggleDrawer = new EventEmitter<void>();

  isOpen = true;
  panelOpenState = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    console.log('📦 Módulos en drawer:', this.modulos);
  }

  /**
   * Toggle del drawer
   */
  toggle(): void {
    this.isOpen = !this.isOpen;
    this.toggleDrawer.emit();
  }

  /**
   * Navegar a una vista según el módulo
   */
  navigateTo(moduleName: string, viewName: string): void {
    console.log(`🔄 Navegando a: ${moduleName} > ${viewName}`);

    // Por ahora, como solo tienes una vista (registros)
    // todas las rutas van al mismo lugar
    this.router.navigate(['/registros']);

    // Cuando tengas más vistas, usa switch como en Global:
    // switch (moduleName) {
    //   case 'Reportes':
    //     switch (viewName) {
    //       case 'Registros Selfie':
    //         this.router.navigate(['/registros']);
    //         break;
    //       case 'Dashboard':
    //         this.router.navigate(['/dashboard']);
    //         break;
    //     }
    //     break;
    // }
  }

  /**
   * Ir al home/dashboard
   */
  goHome(): void {
    this.router.navigate(['/']);
  }

  /**
   * Cerrar sesión
   */
  logout(): void {
    const token = this.authService.getToken();

    if (!token) {
      this.clearAndRedirect();
      return;
    }

    console.log('🔴 Cerrando sesión desde drawer...');

    this.authService.logout(token).subscribe({
      next: (response) => {
        if (response.success) {
          console.log('✅ Sesión cerrada correctamente');
        }
        this.clearAndRedirect();
      },
      error: (error) => {
        console.error('❌ Error al cerrar sesión:', error);
        this.clearAndRedirect();
      }
    });
  }

  /**
   * Limpiar storage y redirigir al holding
   */
  private clearAndRedirect(): void {
    this.authService.clearSession();

    // Producción:
    // window.location.href = 'https://holding.gruporedsalud.com';

    // Desarrollo:
    window.location.href = 'http://localhost:4200';
  }

  /**
   * Obtener ícono del módulo (puedes personalizarlo)
   */
  getModuleIcon(moduleName: string): string {
    const icons: { [key: string]: string } = {
      'Reportes': 'assessment',
      'Administración': 'settings',
      'Usuarios': 'people',
      'Dashboard': 'dashboard',
      'default': 'folder'
    };

    return icons[moduleName] || icons['default'];
  }

  /**
   * Clase CSS según estado del drawer
   */
  get drawerClass(): string {
    return this.isOpen ? 'opened' : 'closed';
  }
}
