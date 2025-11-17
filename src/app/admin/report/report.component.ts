import { Component, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule, DatePipe } from '@angular/common';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { HttpClient } from '@angular/common/http';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { FormControl } from '@angular/forms';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatTableModule,
    MatInputModule,
    MatFormFieldModule,
    MatSortModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatPaginatorModule,
    MatAutocompleteModule
  ],
  templateUrl: './report.component.html',
  styleUrls: ['./report.component.scss'],
  providers: [DatePipe]
})
export class ReportComponent {
// Estado de autenticación
  isAuthenticated = false;
  isLoading = true;
  user: any = null;
  token: string | null = null;
  modules: any[] = [];

  // Datos de la tabla
  dateFrom: Date | null = null;
  dateTo: Date | null = null;
  originalData: any[] = [];
  dataSource = new MatTableDataSource<any>(this.originalData);

  clienteControl = new FormControl('');
  clientes: string[] = [];
  filteredClientes!: Observable<string[]>;

  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  columnHeaders: { [key: string]: string } = {
    med_fechreg: 'FECHA REGISTRO',
    cplatf_cupon: 'CUPON',
    tpdoc_desc: 'TIPO DOC',
    cont_numdoc: 'NUM DOC',
    fullName: 'NOMBRE COMPLETO',
    cont_sexo: 'GENERO',
    edad: 'EDAD',
    celular: 'CELULAR',
    talla: 'TALLA',
    peso: 'PESO',
    hipertenso: 'ES HIPERTENSO?',
    medicina: 'TOMA MEDICACION?',
    medicion: 'medicion',
    presion1: 'presion1',
    presion2: 'presion2',
    frec_cardiaca: 'frec_cardiaca',
    frec_respiratoria: 'frec_respiratoria',
    saturacion: 'saturacion',
    variabilidad: 'variabilidad',
    estres: 'estres',
    actividad: 'actividad',
    sueno: 'sueno',
    metabolismo: 'metabolismo',
    salud: 'salud',
    equilibrio: 'equilibrio',
    relajacion: 'relajacion',
  };

  displayedColumns: string[] = [
    'med_fechreg', 'cplatf_cupon', 'tpdoc_desc', 'cont_numdoc',
    'fullName', 'cont_sexo', 'edad', 'celular', 'talla', 'peso',
    'hipertenso', 'medicina', 'medicion', 'presion1', 'presion2',
    'frec_cardiaca', 'frec_respiratoria', 'saturacion', 'variabilidad',
    'estres', 'actividad', 'sueno', 'metabolismo', 'salud',
    'equilibrio', 'relajacion'
  ];

  constructor(
    private http: HttpClient,
    private datePipe: DatePipe,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    // Verificar si viene del holding con token en la URL
    this.route.params.subscribe(params => {
      const tokenFromUrl = params['token'];

      if (tokenFromUrl) {
        console.log('🔑 Token recibido desde Holding');
        this.authenticateWithHoldingToken(tokenFromUrl);
      } else {
        // Verificar si ya hay una sesión activa
        this.checkExistingSession();
      }
    });
  }

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;

    // Configurar el paginador en español (opcional)
    if (this.paginator) {
      this.paginator.pageSize = 10;
      this.paginator._intl.itemsPerPageLabel = 'Elementos por página:';
      this.paginator._intl.nextPageLabel = 'Página siguiente';
      this.paginator._intl.previousPageLabel = 'Página anterior';
      this.paginator._intl.firstPageLabel = 'Primera página';
      this.paginator._intl.lastPageLabel = 'Última página';
      this.paginator._intl.getRangeLabel = (page: number, pageSize: number, length: number) => {
        if (length === 0 || pageSize === 0) {
          return `0 de ${length}`;
        }
        length = Math.max(length, 0);
        const startIndex = page * pageSize;
        const endIndex = startIndex < length ?
          Math.min(startIndex + pageSize, length) :
          startIndex + pageSize;
        return `${startIndex + 1} - ${endIndex} de ${length}`;
      };
    }
  }

  /**
   * Autenticar con el token del holding
   */
  authenticateWithHoldingToken(holdingToken: string) {
    const platformId = 4; // ID de la plataforma Selfie en tu BD

    this.authService.loginWithToken(holdingToken, platformId).subscribe({
      next: (response) => {
        if (response.success) {
          console.log('✅ Autenticación exitosa');

          // Guardar datos en localStorage
          this.token = response.data.token;
          this.user = response.data.user;
          this.modules = response.data.modules;

          localStorage.setItem('selfie-token', this.token!);
          localStorage.setItem('selfie-user', JSON.stringify(this.user));
          localStorage.setItem('selfie-modules', JSON.stringify(this.modules));

          this.isAuthenticated = true;
          this.isLoading = false;

          // Limpiar la URL del token
          window.history.replaceState({}, '', '/');
        }
      },
      error: (error) => {
        console.error('❌ Error en autenticación:', error);
        this.isLoading = false;
        alert('Error al autenticar. Redirigiendo al Holding...');
        this.redirectToHolding();
      }
    });
  }

  /**
   * Verificar si existe una sesión activa
   */
  checkExistingSession() {
    this.token = localStorage.getItem('selfie-token');
    const userStr = localStorage.getItem('selfie-user');
    const modulesStr = localStorage.getItem('selfie-modules');

    if (this.token && userStr) {
      console.log('✅ Sesión existente encontrada');
      this.user = JSON.parse(userStr);
      this.modules = modulesStr ? JSON.parse(modulesStr) : [];
      this.isAuthenticated = true;
      this.isLoading = false;
    } else {
      console.log('❌ No hay sesión activa');
      this.isLoading = false;
      this.redirectToHolding();
    }
  }

  /**
   * Aplicar filtro por rango de fechas
   */
  applyDateRangeFilter() {
    if (!this.dateFrom || !this.dateTo) {
      alert('Por favor selecciona ambas fechas');
      return;
    }

    const from = this.formatDate(this.dateFrom);
    const to = this.formatDate(this.dateTo);

    this.fetchData(from, to);
  }

  /**
   * Obtener datos del backend
   */
  fetchData(from: string, to: string) {
    if (!this.token) {
      alert('No hay sesión activa. Por favor inicia sesión desde el Holding.');
      this.redirectToHolding();
      return;
    }

    // const url = 'http://127.0.0.1:5001/api/selfie/registros-selfie';
    // En producción:
    const url = 'https://api-servicio.gruporedsalud.com/api/selfie/obtener-mediciones';

    const body = {
      fecha_inicio: from,
      fecha_fin: to
    };

    const headers = {
      Authorization: `Bearer ${this.token}`
    };

    this.http.post<any[]>(url, body, { headers }).subscribe({
      next: (data) => {
        console.log('✅ Datos obtenidos:', data.length, 'registros');
        this.originalData = data;
        this.dataSource.data = data;
        this.dataSource.sort = this.sort;
        this.dataSource.paginator = this.paginator;
        this.extractUniqueClientes(data);
      },
      error: (err) => {
        console.error('❌ Error al obtener registros:', err);

        if (err.status === 401 || err.status === 403) {
          alert('Tu sesión ha expirado. Serás redirigido al Holding.');
          this.logout();
        } else {
          alert('Error al obtener los datos. Por favor intenta de nuevo.');
        }
      },
    });
  }

  /**
   * Aplicar filtro de búsqueda en la tabla
   */
  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value.trim().toLowerCase();
    this.dataSource.filter = filterValue;
  }

  /**
   * Formatear fecha para enviar al backend
   */
  formatDate(date: Date): string {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${year}-${month}-${day}`;
  }

  /**
   * Formatear fecha para mostrar en la tabla
   */
  formatDateToLocal(dateString: string): string {
    const date = new Date(dateString);
    return this.datePipe.transform(date, 'dd/MM/yyyy') || '';
  }

  /**
   * Cerrar sesión
   */
  logout() {
    if (!this.token) {
      this.clearSessionAndRedirect();
      return;
    }

    console.log('🔴 Cerrando sesión...');

    this.authService.logout(this.token).subscribe({
      next: (response) => {
        if (response.success) {
          console.log('✅ Sesión cerrada en el servidor');
        }
        this.clearSessionAndRedirect();
      },
      error: (error) => {
        console.error('❌ Error al cerrar sesión:', error);
        // Aún así limpiar la sesión local
        this.clearSessionAndRedirect();
      }
    });
  }

  /**
   * Limpiar sesión local y redirigir
   */
  private clearSessionAndRedirect() {
    localStorage.removeItem('selfie-token');
    localStorage.removeItem('selfie-user');
    localStorage.removeItem('selfie-modules');

    this.token = null;
    this.user = null;
    this.modules = [];
    this.isAuthenticated = false;

    this.redirectToHolding();
  }

  // redirect holding
  private redirectToHolding() {
    // prod:
    window.location.href = 'https://holding.gruporedsalud.com';

    // dev:
    // window.location.href = 'http://localhost:4200';
  }

  /**
   * Exportar datos a Excel (opcional)
   */
  exportToExcel() {
    // Implementar exportación si lo necesitas
    console.log('Exportar a Excel');
  }
  extractUniqueClientes(data: any[]) {
    // Extraer todos los nombres y eliminar duplicados
    const nombresSet = new Set<string>();
    data.forEach(item => {
      if (item.fullName) {
        nombresSet.add(item.fullName);
      }
    });

    // Convertir a array y ordenar alfabéticamente
    this.clientes = Array.from(nombresSet).sort();

    // Configurar el filtro del autocomplete
    this.filteredClientes = this.clienteControl.valueChanges.pipe(
      startWith(''),
      map(value => this._filterClientes(value || ''))
    );
  }

  /**
   * Filtrar clientes según lo que se escribe
   */
  private _filterClientes(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.clientes.filter(cliente =>
      cliente.toLowerCase().includes(filterValue)
    );
  }

  /**
   * Cuando se selecciona un cliente del dropdown
   */
  onClienteSelected(cliente: string) {
    console.log('Cliente seleccionado:', cliente);

    // Filtrar la tabla por el cliente seleccionado
    this.dataSource.filter = cliente.trim().toLowerCase();
  }

  /**
   * Limpiar filtro de cliente
   */
  clearClienteFilter() {
    this.clienteControl.setValue('');
    this.dataSource.filter = '';
  }
}
