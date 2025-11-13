import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiUrl; // http://127.0.0.1:5001/api/selfie

  constructor(private http: HttpClient) {}

  loginWithToken(token: string, platformId: number): Observable<any> {
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
    return localStorage.getItem('token');
  }

  clearSession(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('modules');
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }
}
