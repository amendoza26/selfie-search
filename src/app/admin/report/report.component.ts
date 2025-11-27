import { Component, HostListener, ViewChild } from '@angular/core';
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
import { MatSelect } from '@angular/material/select';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

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
    MatAutocompleteModule,
    MatSelect
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

  selectedPlatform: string | null = 'Todos';
  selectedCupon: string | null = 'Todos';
  platforms: string[] = [];
  showPlatformList = false;
  cupons: string[] = [];
  showCuponList = false;

  searchTerm: string = '';

  pageSize = 10;
  pageSizeOptions = [10, 25, 50, 100];

  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  columnHeaders: { [key: string]: string } = {
    med_fechreg_fecha: 'Fecha de Registro',
    med_fechreg_hora: 'Hora de Registro',
    platf_nomplatf: 'Cliente',
    cplatf_cupon: 'Cupón',
    tpdoc_desc: 'Tipo Doc.',
    cont_numdoc: 'N° Doc.',
    fullName: 'Nombre Completo',
    cont_sexo: 'Género',
    edad: 'Edad',
    celular: 'Celular',
    talla: 'Talla',
    peso: 'Peso',
    hipertenso: '¿Es hipertenso?',
    medicina: '¿Toma medicación?',
    medicion: 'Medición',
    presion: 'Presión Arterial (mmgh)',
    frec_cardiaca: 'Frecuencia cardíaca (bpm)',
    saturacion: 'Saturación (%)',
    frec_respiratoria: 'Frecuencia respiratoria (rpm)',
    variabilidad: 'Variabilidad',
    estres: 'Estrés',
    actividad: 'Actividad',
    sueno: 'Sueño',
    metabolismo: 'Metabolismo',
    salud: 'Salud',
    equilibrio: 'Equilibrio',
    relajacion: 'Relajación',
  };

  displayedColumns: string[] = [
    'med_fechreg_fecha','med_fechreg_hora', 'platf_nomplatf', 'cplatf_cupon', 'tpdoc_desc', 'cont_numdoc',
    'fullName', 'cont_sexo', 'edad', 'celular', 'talla', 'peso',
    'hipertenso', 'medicina', 'medicion', 'presion',
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
    this.dataSource.filterPredicate = (data: any, filter: string) => {
      // Filtrar por cliente
      const clienteMatch = this.selectedPlatform && this.selectedPlatform !== 'Todos'
        ? data.platf_nomplatf === this.selectedPlatform
        : true;

      // Filtrar por cupon
      const cuponMatch = this.selectedCupon && this.selectedCupon !== 'Todos'
        ? data.cplatf_cupon === this.selectedCupon
        : true;

      // Filtrar por búsqueda en cualquier columna
      const searchMatch = this.searchTerm
        ? Object.values(data).some(value =>
            String(value).toLowerCase().includes(this.searchTerm.toLowerCase())
          )
        : true;

      return clienteMatch && cuponMatch && searchMatch;
    };
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

    const url = 'https://api-servicio.gruporedsalud.com/api/selfie/obtener-mediciones';
    const body = { fecha_inicio: from, fecha_fin: to };
    const headers = { Authorization: `Bearer ${this.token}` };

    this.http.post<any[]>(url, body, { headers }).subscribe({
      next: (data) => {
        console.log('✅ Datos obtenidos:', data.length, 'registros');

        this.originalData = data;
        this.dataSource.data = data;

        // Actualizar listas
        this.extractUniquePlataformas(data);
        this.extractUniqueCupones(data, this.selectedPlatform);

        // Volver a aplicar filtro si no es "Todos"
        if (this.selectedPlatform && this.selectedPlatform !== 'Todos') {
          this.dataSource.filter = this.selectedPlatform.toLowerCase();
        } else {
          this.dataSource.filter = '';
        }

        if (this.selectedCupon && this.selectedCupon !== 'Todos') {
          this.dataSource.filter = this.selectedCupon.toLowerCase();
        }

        this.dataSource.sort = this.sort;
        this.dataSource.paginator = this.paginator;
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
    this.searchTerm = (event.target as HTMLInputElement).value.trim().toLowerCase();
    this.dataSource.filter = Math.random().toString();
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
  if (!dateString) return '';
  const date = new Date(dateString);
  return isNaN(date.getTime())
    ? ''
    : this.datePipe.transform(date, 'dd/MM/yyyy') || '';
}

formatHourToLocal(dateString: string): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  return isNaN(date.getTime())
    ? ''
    : this.datePipe.transform(date, 'HH:mm:ss') || '';
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
    window.location.href = 'https://holding.gruporedsalud.com';
    // window.location.href = 'http://localhost:4200';
  }

  onClienteSelected(cliente: string) {
    console.log('Cliente seleccionado:', cliente);

    this.dataSource.filter = cliente.trim().toLowerCase();
  }

  extractUniquePlataformas(data: any[]) {
    const set = new Set<string>();
    data.forEach(item => {
      if (item.platf_nomplatf) set.add(item.platf_nomplatf);
    });
    this.platforms = ['Todos', ...Array.from(set).sort()];
  }

  selectPlatform(cliente: string) {
    this.selectedPlatform = cliente;
    this.showPlatformList = false;

    // Reconstruir cupones solo de ese cliente
    this.extractUniqueCupones(this.originalData, cliente);

    // Reset cupon a "Todos"
    this.selectedCupon = 'Todos';

    // 🔹 Forzar actualización del filtro
    this.dataSource.filter = Math.random().toString();
  }

  toggleDropdown() {
    this.showPlatformList = !this.showPlatformList;
  }
  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event) {
    const target = event.target as HTMLElement;

    if (!target.closest('.platform-wrapper')) {
      this.showPlatformList = false;
      this.showCuponList = false;
    }
  }

  changePageSize(size: number) {
    this.pageSize = size;
    this.paginator.pageSize = size;
    this.dataSource.paginator = this.paginator;
  }
  extractUniqueCupones(data: any[], clienteFilter: string | null = null) {
    const set = new Set<string>();
    data.forEach(item => {
      if (item.cplatf_cupon) {
        // Si hay filtro de cliente, solo cupones de ese cliente
        if (!clienteFilter || clienteFilter === 'Todos' || item.platf_nomplatf === clienteFilter) {
          set.add(item.cplatf_cupon);
        }
      }
    });
    this.cupons = ['Todos', ...Array.from(set).sort()];
  }

  selectCupon(c: string) {
    this.selectedCupon = c;
    this.showCuponList = false;

    this.dataSource.filter = Math.random().toString();
  }

  toggleCuponDropdown() {
    this.showCuponList = !this.showCuponList;
  }

  exportToExcel() {
    // Tomamos solo los datos filtrados que se ven en la tabla
    const dataToExport = this.dataSource.filteredData.map(row => {
      return {
        Fecha: this.formatDateToLocal(row.med_fechreg),
        Hora: this.formatHourToLocal(row.med_fechreg),
        Cliente: row.platf_nomplatf,
        Cupon: row.cplatf_cupon,
        TipoDocumento: row.tpdoc_desc,
        NroDocumento: row.cont_numdoc,
        NombreCompleto: row.fullName,
        Sexo: row.cont_sexo,
        Edad: row.edad,
        Celular: row.celular,
        Talla: row.talla,
        Peso: row.peso,
        Hipertenso: row.hipertenso,
        Medicina: row.medicina,
        Medicion: row.medicion,
        Presion1: row.presion1,
        Presion2: row.presion2,
        FrecuenciaCardiaca: row.frec_cardiaca,
        Saturacion: row.saturacion,
        Estrés: row.estres,
        Actividad: row.actividad,
        Sueño: row.sueno,
        Metabolismo: row.metabolismo,
        Salud: row.salud,
        Equilibrio: row.equilibrio,
        Relajacion: row.relajacion
      };
    });

    // Crear hoja de Excel
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(dataToExport);

    // Crear libro
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Mediciones');

    // Guardar archivo
    XLSX.writeFile(wb, 'mediciones.xlsx');
  }

}
