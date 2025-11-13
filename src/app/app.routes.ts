import { Routes } from '@angular/router';
import { AppComponent } from './app.component';

export const routes: Routes = [
  {
    path: 'auth/login/:token',
    component: AppComponent
  },
  {
    path: '',
    component: AppComponent
  },
  {
    path: '**',
    redirectTo: ''
  }
];
