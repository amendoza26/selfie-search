import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router } from '@angular/router';
import { DrawerComponent } from '../components/drawer/drawer.component';
import { HeaderComponent } from '../components/header/header.component';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    DrawerComponent,
    HeaderComponent
  ],
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss']
})
export class AdminComponent implements OnInit {
  user: any = null;
  pageTitle: any = null;
  modules: any[] = [];
  isDrawerOpen = true;
  isLoading = true;

  constructor(private router: Router) {}

  ngOnInit() {
    // Cargar datos del localStorage
    this.loadUserData();
  }

  /**
   * Cargar datos de usuario desde localStorage
   */
  private loadUserData() {
    try {
      const userStr = localStorage.getItem('selfie-user');
      const modulesStr = localStorage.getItem('selfie-modules');
      const token = localStorage.getItem('selfie-token');

      if (!token || !userStr) {
        console.error('❌ No hay sesión activa');
        this.redirectToHolding();
        return;
      }

      this.user = JSON.parse(userStr);
      this.modules = modulesStr ? JSON.parse(modulesStr) : [];
      this.isLoading = false;

      console.log('✅ Datos de usuario cargados:', this.user);
      console.log('📦 Módulos disponibles:', this.modules);
    } catch (error) {
      console.error('❌ Error cargando datos:', error);
      this.redirectToHolding();
    }
  }

  /**
   * Toggle del drawer
   */
  onDrawerToggle(): void {
    this.isDrawerOpen = !this.isDrawerOpen;
  }

  /**
   * Redirigir al holding si no hay sesión
   */
  private redirectToHolding(): void {
    // Producción:
    window.location.href = 'https://holding.gruporedsalud.com';

    // Desarrollo:
    // window.location.href = 'http://localhost:4200';
  }
}
