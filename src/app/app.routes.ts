import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { AdminComponent } from './admin/admin.component';

export const routes: Routes = [
  // Login desde holding
  {
    path: 'auth/login/:token',
    component: LoginComponent
  },

  // Rutas admin (con wrapper que tiene drawer + header)
  {
    path: 'admin',
    component: AdminComponent,  // ← El wrapper
    children: [
      {
        path: 'registros',
        loadComponent: () => import('./admin/report/report.component')
          .then(m => m.ReportComponent)
      },
      // Futuras rutas:
      // {
      //   path: 'dashboard',
      //   loadComponent: () => import('./admin/dashboard/dashboard.component')
      //     .then(m => m.DashboardComponent)
      // },
      {
        path: '',
        redirectTo: 'registros',
        pathMatch: 'full'
      }
    ]
  },

  // Ruta por defecto
  {
    path: '',
    redirectTo: '/admin/registros',
    pathMatch: 'full'
  },

  // 404
  {
    path: '**',
    redirectTo: '/admin/registros'
  }
];
