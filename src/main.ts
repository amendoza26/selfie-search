import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { RootComponent } from './app/root.component';
import { routes } from './app/app.routes';
import { provideHttpClient } from '@angular/common/http';

bootstrapApplication(RootComponent, {
  providers: [provideRouter(routes), provideHttpClient()],
}).catch((err) => console.error(err));
