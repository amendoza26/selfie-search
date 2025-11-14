import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = "https://api-servicio.gruporedsalud.com/api/selfie"; // http://127.0.0.1:5001/api/selfie

  constructor(private http: HttpClient) {}

  loginWithToken(token: string, platformId: number): Observable<any> {
    console.log("token enviado:", token);
    console.log("platformId enviado:", platformId);
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

    const body = {
      plataforma_id: platformId
    };

    return this.http.post(`${this.apiUrl}/login`, body, { headers });
  }

  logout(token: string): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

    return this.http.put(
      `${this.apiUrl}/logout`,
      {},
      { headers }
    ).pipe(map((data) => data));
  }

  // Métodos auxiliares
  getToken(): string | null {
    return localStorage.getItem('selfie-token');
  }

  clearSession(): void {
    localStorage.removeItem('selfie-token');
    localStorage.removeItem('selfie-user');
    localStorage.removeItem('selfie-modules');
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }
}
