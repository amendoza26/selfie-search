import { Component, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { FormsModule } from '@angular/forms';
import { CommonModule, DatePipe } from '@angular/common';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { HttpClient } from '@angular/common/http';
import { inject } from '@angular/core';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatInputModule,
    MatFormFieldModule,
    MatSortModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  providers: [DatePipe]
})
export class AppComponent {
  constructor(private http: HttpClient, private datePipe: DatePipe) {}

  dateFrom: Date | null = null;
  dateTo: Date | null = null;
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
  displayedColumns: string[] = ['med_fechreg', 'cplatf_cupon', 'tpdoc_desc', 'cont_numdoc', 'fullName', 'cont_sexo', 'edad', 'celular', 'talla', 'peso', 'hipertenso', 'medicina', 'medicion', 'presion1', 'presion2', 'frec_cardiaca', 'frec_respiratoria', 'saturacion', 'variabilidad', 'estres', 'actividad', 'sueno', 'metabolismo', 'salud', 'equilibrio', 'relajacion'];

  originalData: any[] = [];
  dataSource = new MatTableDataSource<any>(this.originalData);

  @ViewChild(MatSort) sort!: MatSort

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
  }

  fetchData(from: string, to: string) {
    const url = `https://selfie-api-dnrr.onrender.com/api/selfie?from=${from}&to=${to}`;
    this.http.get<any[]>(url).subscribe(data => {
      this.originalData = data;
      this.dataSource.data = data;
      this.dataSource.sort = this.sort;
    });
  }

  applyDateRangeFilter() {
    if (!this.dateFrom || !this.dateTo) return;
  
    const from = this.formatDate(this.dateFrom);
    const to = this.formatDate(this.dateTo);
  
    this.fetchData(from, to); // usa tu método reutilizable
  }

  formatDate(date: Date): string {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${year}-${month}-${day}`;
  }
  
  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value.trim().toLowerCase();
    this.dataSource.filter = filterValue;
  }

  formatDateToLocal(dateString: string): string {
    const date = new Date(dateString);
    return this.datePipe.transform(date, 'dd/MM/yyyy HH:mm:ss') || '';
  }
  
}
