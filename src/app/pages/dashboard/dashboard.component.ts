import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { DashboardService } from '../../core/services/dashboard.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="space-y-8 animate-fade-in">
      
      <!-- Header del Dashboard -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 class="text-3xl font-extrabold text-white tracking-tight">
            Hola, <span class="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">{{ user()?.nombre || 'Administrador' }}</span> 👋
          </h1>
          <p class="text-sm text-slate-400 mt-1">
            Resumen operativo y rendimiento del sistema de ventas en tiempo real.
          </p>
        </div>
        
        <div class="flex items-center gap-3">
          <a
            routerLink="/admin/productos/nuevo"
            class="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-600/30 hover:shadow-indigo-600/50 hover:-translate-y-0.5 transition-all cursor-pointer"
          >
            <i class="fas fa-plus text-xs"></i>
            <span>Agregar Producto</span>
          </a>

          <button
            (click)="refresh()"
            [disabled]="isLoading()"
            class="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-semibold text-slate-300 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer disabled:opacity-50"
          >
            <i class="fas fa-arrows-rotate" [class.fa-spin]="isLoading()"></i>
            <span>Actualizar</span>
          </button>
        </div>
      </div>

      <!-- Estado de Carga / Spinner inicial -->
      @if (isLoading() && !metrics()) {
        <div class="py-20 flex flex-col items-center justify-center gap-3">
          <i class="fas fa-spinner fa-spin text-3xl text-indigo-500"></i>
          <span class="text-sm font-medium text-slate-400">Cargando métricas del sistema...</span>
        </div>
      }

      @if (metrics(); as data) {
        <!-- Grid 4 Tarjetas de Métricas -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <!-- Tarjeta 1: Ventas Hoy -->
          <div class="bg-slate-900/90 border border-slate-800/90 rounded-3xl p-6 shadow-sm hover:border-indigo-500/40 hover:-translate-y-1 transition-all duration-200">
            <div class="flex items-center justify-between mb-4">
              <span class="text-xs font-bold uppercase tracking-wider text-slate-400">Ventas de Hoy</span>
              <div class="w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center text-lg">
                <i class="fas fa-cash-register"></i>
              </div>
            </div>
            <div class="text-3xl font-black text-white tracking-tight mb-1">
              \${{ data.sales.ventasHoyMonto | number:'1.2-2' }}
            </div>
            <div class="text-xs text-slate-400">
              <span class="text-indigo-400 font-semibold">{{ data.sales.ventasHoyCnt }}</span> transacciones hoy
            </div>
          </div>

          <!-- Tarjeta 2: Ventas del Mes -->
          <div class="bg-slate-900/90 border border-slate-800/90 rounded-3xl p-6 shadow-sm hover:border-emerald-500/40 hover:-translate-y-1 transition-all duration-200">
            <div class="flex items-center justify-between mb-4">
              <span class="text-xs font-bold uppercase tracking-wider text-slate-400">Ventas del Mes</span>
              <div class="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center text-lg">
                <i class="fas fa-chart-line"></i>
              </div>
            </div>
            <div class="text-3xl font-black text-emerald-400 tracking-tight mb-1">
              \${{ data.sales.ventasMesMonto | number:'1.2-2' }}
            </div>
            <div class="text-xs text-slate-400">
              <span class="text-emerald-400 font-semibold">{{ data.sales.ventasMesCnt }}</span> acumuladas
            </div>
          </div>

          <!-- Tarjeta 3: Total Productos -->
          <div class="bg-slate-900/90 border border-slate-800/90 rounded-3xl p-6 shadow-sm hover:border-amber-500/40 hover:-translate-y-1 transition-all duration-200">
            <div class="flex items-center justify-between mb-4">
              <span class="text-xs font-bold uppercase tracking-wider text-slate-400">Productos Registrados</span>
              <div class="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center text-lg">
                <i class="fas fa-boxes-stacked"></i>
              </div>
            </div>
            <div class="text-3xl font-black text-white tracking-tight mb-1">
              {{ data.inventory.totalProductos }}
            </div>
            <div class="text-xs text-slate-400">
              <span class="text-amber-400 font-semibold">{{ data.inventory.stockTotal }}</span> unidades en stock
            </div>
          </div>

          <!-- Tarjeta 4: Stock Bajo -->
          <div class="bg-slate-900/90 border border-slate-800/90 rounded-3xl p-6 shadow-sm hover:border-rose-500/40 hover:-translate-y-1 transition-all duration-200">
            <div class="flex items-center justify-between mb-4">
              <span class="text-xs font-bold uppercase tracking-wider text-slate-400">Stock Crítico</span>
              <div class="w-10 h-10 rounded-2xl bg-rose-500/10 text-rose-400 flex items-center justify-center text-lg">
                <i class="fas fa-triangle-exclamation"></i>
              </div>
            </div>
            <div class="text-3xl font-black text-rose-400 tracking-tight mb-1">
              {{ data.inventory.stockBajo }}
            </div>
            <div class="text-xs text-slate-400">
              Productos con stock ≤ 5
            </div>
          </div>
        </div>

        <!-- Gráfica de Tendencia de 7 Días -->
        <div class="bg-slate-900/90 border border-slate-800/90 rounded-3xl p-6 sm:p-8 shadow-sm">
          <div class="flex items-center justify-between mb-6">
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center text-sm">
                <i class="fas fa-chart-area"></i>
              </div>
              <h2 class="text-lg font-bold text-white">Tendencia de Ventas (Últimos 7 días)</h2>
            </div>
            <span class="text-xs font-semibold text-slate-400">Monto Diario</span>
          </div>

          <!-- Gráfica de Barras Visual con Tailwind -->
          <div class="grid grid-cols-7 gap-2 sm:gap-4 items-end h-52 pt-6 border-b border-slate-800 pb-2">
            @for (label of data.chart.labels; track $index) {
              <div class="flex flex-col items-center gap-2 h-full justify-end group">
                <div class="text-[11px] font-bold text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity">
                  \${{ data.chart.montos[$index] | number:'1.0-0' }}
                </div>
                <!-- Barra -->
                <div
                  class="w-full max-w-[48px] bg-gradient-to-t from-indigo-600 to-indigo-400 rounded-t-xl transition-all duration-500 group-hover:from-indigo-500 group-hover:to-indigo-300 shadow-lg shadow-indigo-600/20 min-h-[8px]"
                  [style.height.%]="getBarHeight(data.chart.montos[$index], data.chart.montos)"
                ></div>
                <!-- Etiqueta Día -->
                <span class="text-[11px] font-semibold text-slate-400 group-hover:text-white transition-colors">
                  {{ label }}
                </span>
              </div>
            }
          </div>
        </div>

        <!-- Tablas: Top Productos & Últimas Ventas -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-7">
          
          <!-- Top 5 Productos Más Vendidos -->
          <div class="bg-slate-900/90 border border-slate-800/90 rounded-3xl p-6 sm:p-8 shadow-sm">
            <div class="flex items-center gap-3 mb-6">
              <div class="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center text-sm">
                <i class="fas fa-trophy"></i>
              </div>
              <h2 class="text-lg font-bold text-white">Top 5 Productos Más Vendidos</h2>
            </div>

            <div class="overflow-x-auto">
              <table class="w-full text-left text-sm">
                <thead>
                  <tr class="border-b border-slate-800 text-xs uppercase tracking-wider text-slate-400">
                    <th class="pb-3 font-semibold">Producto</th>
                    <th class="pb-3 font-semibold text-center">Unidades</th>
                    <th class="pb-3 font-semibold text-right">Ingresos</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-800/60">
                  @if (data.topProducts.length > 0) {
                    @for (prod of data.topProducts; track prod.nombre_producto) {
                      <tr class="hover:bg-slate-800/30 transition-colors">
                        <td class="py-3.5 font-medium text-slate-200">{{ prod.nombre_producto }}</td>
                        <td class="py-3.5 text-center">
                          <span class="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                            {{ prod.unidades }} uds
                          </span>
                        </td>
                        <td class="py-3.5 text-right font-bold text-emerald-400">
                          \${{ prod.ingresos | number:'1.2-2' }}
                        </td>
                      </tr>
                    }
                  } @else {
                    <tr>
                      <td colspan="3" class="py-8 text-center text-slate-500 text-sm">
                        No se registran ventas recientes.
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </div>

          <!-- Últimas Transacciones Registradas -->
          <div class="bg-slate-900/90 border border-slate-800/90 rounded-3xl p-6 sm:p-8 shadow-sm">
            <div class="flex items-center gap-3 mb-6">
              <div class="w-8 h-8 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center text-sm">
                <i class="fas fa-clock"></i>
              </div>
              <h2 class="text-lg font-bold text-white">Últimas Transacciones Registradas</h2>
            </div>

            <div class="overflow-x-auto">
              <table class="w-full text-left text-sm">
                <thead>
                  <tr class="border-b border-slate-800 text-xs uppercase tracking-wider text-slate-400">
                    <th class="pb-3 font-semibold">Folio</th>
                    <th class="pb-3 font-semibold">Fecha / Hora</th>
                    <th class="pb-3 font-semibold text-right">Monto</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-800/60">
                  @if (data.recentSales.length > 0) {
                    @for (venta of data.recentSales; track venta.folio) {
                      <tr class="hover:bg-slate-800/30 transition-colors">
                        <td class="py-3.5">
                          <code class="px-2 py-0.5 rounded-md bg-slate-950 text-indigo-300 border border-slate-800 text-xs font-mono">
                            #{{ venta.folio }}
                          </code>
                        </td>
                        <td class="py-3.5 text-xs text-slate-400">
                          {{ venta.fecha_venta | date:'dd/MM/yyyy HH:mm' }}
                        </td>
                        <td class="py-3.5 text-right font-bold text-emerald-400">
                          \${{ venta.total | number:'1.2-2' }}
                        </td>
                      </tr>
                    }
                  } @else {
                    <tr>
                      <td colspan="3" class="py-8 text-center text-slate-500 text-sm">
                        No hay transacciones registradas.
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </div>

        </div>
      }
    </div>
  `
})
export class DashboardComponent implements OnInit {
  get user() {
    return this.authService.currentUser;
  }

  get metrics() {
    return this.dashboardService.metrics;
  }

  get isLoading() {
    return this.dashboardService.isLoading;
  }

  constructor(
    private authService: AuthService,
    private dashboardService: DashboardService
  ) {}

  ngOnInit(): void {
    this.dashboardService.loadMetrics();
  }

  refresh(): void {
    this.dashboardService.loadMetrics();
  }

  getBarHeight(value: number, allValues: number[]): number {
    const max = Math.max(...allValues, 1);
    if (value === 0) return 5;
    return Math.max(Math.round((value / max) * 100), 10);
  }
}
