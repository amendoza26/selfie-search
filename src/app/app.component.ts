import { Component, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
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
})
export class AppComponent {
  http = inject(HttpClient);


  dateFrom: Date | null = null;
  dateTo: Date | null = null;
  columnHeaders: { [key: string]: string } = {
    nombre_cliente: 'Nombre completo',
    estado_escaner: 'Estado escáner',
    edad: 'Edad',
    genero: 'Género',
    peso: 'Peso (kg)',
    celular: 'Teléfono',
    correo: 'Correo electrónico',
    fecha_registro: 'Fecha de registro',
    empresa: 'Empresa',
    plataforma: 'Plataforma',
    presion_sanguinea: 'Presión sanguínea',
    frecuencia_cardiaca: 'Frec. cardíaca',
    hr_kpi_saturacion_oxigeno: 'Saturación O₂',
    frecuencia_respiratoria: 'Frec. respiratoria',
    translate_presion: 'Estado presión',
    estado_medicacion: 'Medicación'
  };
  displayedColumns: string[] = ['nombre_cliente', 'estado_escaner', 'edad', 'genero', 'peso','celular','correo','fecha_registro','empresa','plataforma','presion_sanguinea','frecuencia_cardiaca','hr_kpi_saturacion_oxigeno','frecuencia_respiratoria','translate_presion','estado_medicacion'];

  originalData: any[] = [];
  dataSource = new MatTableDataSource<any>(this.originalData);

  @ViewChild(MatSort) sort!: MatSort

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
  }

  fetchData(from: string, to: string) {
    const url = `http://https://selfie-api-dnrr.onrender.com/api/selfie?from=${from}&to=${to}`;
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
  
  
}
