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
    <div class="space-y-6 animate-fade-in">
      
      <!-- Header del Dashboard -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 class="text-2xl font-semibold text-white tracking-tight">
            Hola, {{ user()?.nombre || 'Administrador' }}
          </h1>
          <p class="text-xs text-slate-400 mt-1 font-normal">
            Resumen operativo y métricas de ventas en tiempo real
          </p>
        </div>
        
        <div class="flex items-center gap-2.5">
          <a
            routerLink="/admin/productos/nuevo"
            class="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium text-slate-900 bg-slate-100 hover:bg-white transition-colors cursor-pointer"
          >
            <i class="fas fa-plus text-[11px]"></i>
            <span>Nuevo Producto</span>
          </a>

          <button
            (click)="refresh()"
            [disabled]="isLoading()"
            class="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium text-slate-300 bg-[#0d111a] hover:bg-slate-800 border border-slate-800 transition-colors cursor-pointer disabled:opacity-40"
          >
            <i class="fas fa-arrows-rotate text-[11px]" [class.fa-spin]="isLoading()"></i>
            <span>Actualizar</span>
          </button>
        </div>
      </div>

      <!-- Estado de Carga / Spinner inicial -->
      @if (isLoading() && !metrics()) {
        <div class="py-20 flex flex-col items-center justify-center gap-2.5">
          <i class="fas fa-spinner fa-spin text-xl text-slate-400"></i>
          <span class="text-xs font-normal text-slate-500">Cargando métricas del sistema...</span>
        </div>
      }

      @if (metrics(); as data) {
        <!-- Grid 4 Tarjetas de Métricas -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <!-- Tarjeta 1: Ventas Hoy -->
          <div class="bg-[#111622] border border-slate-800/90 rounded-2xl p-5">
            <div class="flex items-center justify-between mb-3">
              <span class="text-xs font-medium text-slate-400">Ventas Hoy</span>
              <div class="w-8 h-8 rounded-lg bg-slate-800/80 border border-slate-700/60 text-slate-300 flex items-center justify-center text-xs">
                <i class="fas fa-cash-register"></i>
              </div>
            </div>
            <div class="text-2xl font-semibold text-white tracking-tight mb-1">
              \${{ data.sales.ventasHoyMonto | number:'1.2-2' }}
            </div>
            <div class="text-xs text-slate-500">
              <span class="text-slate-300 font-medium">{{ data.sales.ventasHoyCnt }}</span> transacciones hoy
            </div>
          </div>

          <!-- Tarjeta 2: Ventas del Mes -->
          <div class="bg-[#111622] border border-slate-800/90 rounded-2xl p-5">
            <div class="flex items-center justify-between mb-3">
              <span class="text-xs font-medium text-slate-400">Ventas del Mes</span>
              <div class="w-8 h-8 rounded-lg bg-slate-800/80 border border-slate-700/60 text-slate-300 flex items-center justify-center text-xs">
                <i class="fas fa-chart-line"></i>
              </div>
            </div>
            <div class="text-2xl font-semibold text-white tracking-tight mb-1">
              \${{ data.sales.ventasMesMonto | number:'1.2-2' }}
            </div>
            <div class="text-xs text-slate-500">
              <span class="text-slate-300 font-medium">{{ data.sales.ventasMesCnt }}</span> acumuladas
            </div>
          </div>

          <!-- Tarjeta 3: Total Productos -->
          <div class="bg-[#111622] border border-slate-800/90 rounded-2xl p-5">
            <div class="flex items-center justify-between mb-3">
              <span class="text-xs font-medium text-slate-400">Total Productos</span>
              <div class="w-8 h-8 rounded-lg bg-slate-800/80 border border-slate-700/60 text-slate-300 flex items-center justify-center text-xs">
                <i class="fas fa-boxes-stacked"></i>
              </div>
            </div>
            <div class="text-2xl font-semibold text-white tracking-tight mb-1">
              {{ data.inventory.totalProductos }}
            </div>
            <div class="text-xs text-slate-500">
              <span class="text-slate-300 font-medium">{{ data.inventory.stockTotal }}</span> unidades en stock
            </div>
          </div>

          <!-- Tarjeta 4: Stock Bajo -->
          <div class="bg-[#111622] border border-slate-800/90 rounded-2xl p-5">
            <div class="flex items-center justify-between mb-3">
              <span class="text-xs font-medium text-slate-400">Stock Crítico</span>
              <div class="w-8 h-8 rounded-lg bg-slate-800/80 border border-slate-700/60 text-red-400 flex items-center justify-center text-xs">
                <i class="fas fa-triangle-exclamation"></i>
              </div>
            </div>
            <div class="text-2xl font-semibold text-red-400 tracking-tight mb-1">
              {{ data.inventory.stockBajo }}
            </div>
            <div class="text-xs text-slate-500">
              Productos con stock ≤ 5
            </div>
          </div>
        </div>

        <!-- Gráfica de Tendencia de 7 Días -->
        <div class="bg-[#111622] border border-slate-800/90 rounded-2xl p-5 sm:p-6">
          <div class="flex items-center justify-between mb-6">
            <div class="flex items-center gap-2.5">
              <div class="w-7 h-7 rounded-lg bg-slate-800 border border-slate-700/60 text-slate-300 flex items-center justify-center text-xs">
                <i class="fas fa-chart-simple"></i>
              </div>
              <h2 class="text-sm font-semibold text-white">Tendencia de Ventas (Últimos 7 días)</h2>
            </div>
            <span class="text-xs text-slate-500">Monto diario en MXN</span>
          </div>

          <!-- Gráfica de Barras Limpia y Minimalista -->
          <div class="grid grid-cols-7 gap-2 sm:gap-4 items-end h-48 pt-4 border-b border-slate-800/80 pb-2">
            @for (label of data.chart.labels; track $index) {
              <div class="flex flex-col items-center gap-2 h-full justify-end group">
                <div class="text-[10px] font-medium text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                  \${{ data.chart.montos[$index] | number:'1.0-0' }}
                </div>
                <!-- Barra Minimalista -->
                <div
                  class="w-full max-w-[40px] bg-slate-700 hover:bg-slate-500 rounded-t-md transition-all duration-300 min-h-[6px]"
                  [style.height.%]="getBarHeight(data.chart.montos[$index], data.chart.montos)"
                ></div>
                <!-- Etiqueta Día -->
                <span class="text-[10px] font-medium text-slate-500 group-hover:text-slate-300 transition-colors">
                  {{ label }}
                </span>
              </div>
            }
          </div>
        </div>

        <!-- Tablas: Top Productos & Últimas Ventas -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-5">
          
          <!-- Top 5 Productos Más Vendidos -->
          <div class="bg-[#111622] border border-slate-800/90 rounded-2xl p-5 sm:p-6">
            <div class="flex items-center gap-2.5 mb-5">
              <div class="w-7 h-7 rounded-lg bg-slate-800 border border-slate-700/60 text-slate-300 flex items-center justify-center text-xs">
                <i class="fas fa-trophy"></i>
              </div>
              <h2 class="text-sm font-semibold text-white">Top 5 Productos Más Vendidos</h2>
            </div>

            <div class="overflow-x-auto">
              <table class="w-full text-left text-xs">
                <thead>
                  <tr class="border-b border-slate-800/80 text-[11px] uppercase tracking-wider text-slate-500">
                    <th class="pb-2.5 font-medium">Producto</th>
                    <th class="pb-2.5 font-medium text-center">Uds</th>
                    <th class="pb-2.5 font-medium text-right">Ingresos</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-800/40">
                  @if (data.topProducts.length > 0) {
                    @for (prod of data.topProducts; track prod.nombre_producto) {
                      <tr class="hover:bg-slate-800/30 transition-colors">
                        <td class="py-3 font-medium text-slate-300">{{ prod.nombre_producto }}</td>
                        <td class="py-3 text-center">
                          <span class="px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-800 text-slate-300 border border-slate-700/60">
                            {{ prod.unidades }} uds
                          </span>
                        </td>
                        <td class="py-3 text-right font-medium text-slate-200">
                          \${{ prod.ingresos | number:'1.2-2' }}
                        </td>
                      </tr>
                    }
                  } @else {
                    <tr>
                      <td colspan="3" class="py-6 text-center text-slate-500 text-xs">
                        No se registran ventas recientes.
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </div>

          <!-- Últimas Transacciones Registradas -->
          <div class="bg-[#111622] border border-slate-800/90 rounded-2xl p-5 sm:p-6">
            <div class="flex items-center gap-2.5 mb-5">
              <div class="w-7 h-7 rounded-lg bg-slate-800 border border-slate-700/60 text-slate-300 flex items-center justify-center text-xs">
                <i class="fas fa-clock"></i>
              </div>
              <h2 class="text-sm font-semibold text-white">Últimas Transacciones</h2>
            </div>

            <div class="overflow-x-auto">
              <table class="w-full text-left text-xs">
                <thead>
                  <tr class="border-b border-slate-800/80 text-[11px] uppercase tracking-wider text-slate-500">
                    <th class="pb-2.5 font-medium">Folio</th>
                    <th class="pb-2.5 font-medium">Fecha / Hora</th>
                    <th class="pb-2.5 font-medium text-right">Monto</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-800/40">
                  @if (data.recentSales.length > 0) {
                    @for (venta of data.recentSales; track venta.folio) {
                      <tr class="hover:bg-slate-800/30 transition-colors">
                        <td class="py-3">
                          <code class="px-1.5 py-0.5 rounded bg-[#0a0d14] text-slate-300 border border-slate-800 text-[11px] font-mono">
                            #{{ venta.folio }}
                          </code>
                        </td>
                        <td class="py-3 text-slate-400 text-[11px]">
                          {{ venta.fecha_venta | date:'dd/MM/yyyy HH:mm' }}
                        </td>
                        <td class="py-3 text-right font-medium text-slate-200">
                          \${{ venta.total | number:'1.2-2' }}
                        </td>
                      </tr>
                    }
                  } @else {
                    <tr>
                      <td colspan="3" class="py-6 text-center text-slate-500 text-xs">
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
