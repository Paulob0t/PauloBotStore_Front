import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MovementService } from '../../../core/services/movement.service';
import { MovementItemDto, SaleDetailsResponseDto } from '../../../api/models';

@Component({
  selector: 'app-movement-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-8 animate-fade-in max-w-7xl mx-auto">
      
      <!-- Header de la Página -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 rounded-2xl bg-emerald-600/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center text-2xl shadow-lg shadow-emerald-600/20">
            <i class="fas fa-money-bill-transfer"></i>
          </div>
          <div>
            <h1 class="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Consulta de Movimientos
            </h1>
            <p class="text-xs sm:text-sm text-slate-400 mt-1">
              Historial general de ventas, transacciones y detalle desglosado de cobros.
            </p>
          </div>
        </div>

        <div class="flex items-center gap-3">
          <button
            (click)="refresh()"
            [disabled]="isLoading()"
            class="inline-flex items-center gap-2 px-4 py-3 rounded-2xl text-xs font-semibold text-slate-300 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer disabled:opacity-50"
            title="Recargar movimientos"
          >
            <i class="fas fa-arrows-rotate" [class.fa-spin]="isLoading()"></i>
            <span class="hidden sm:inline">Actualizar</span>
          </button>
        </div>
      </div>

      <!-- Grid 4 Mini Stats KPI -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <!-- Total Ventas -->
        <div class="bg-slate-900/90 border border-slate-800/90 rounded-3xl p-6 shadow-sm flex items-center gap-4">
          <div class="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center text-xl shrink-0">
            <i class="fas fa-receipt"></i>
          </div>
          <div>
            <div class="text-2xl font-black text-white tracking-tight">{{ totalVentas() }}</div>
            <div class="text-xs text-slate-400">Total Transacciones</div>
          </div>
        </div>

        <!-- Ingresos Totales -->
        <div class="bg-slate-900/90 border border-slate-800/90 rounded-3xl p-6 shadow-sm flex items-center gap-4">
          <div class="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center text-xl shrink-0">
            <i class="fas fa-sack-dollar"></i>
          </div>
          <div>
            <div class="text-2xl font-black text-emerald-400 tracking-tight">
              \${{ totalIngresos() | number:'1.2-2' }}
            </div>
            <div class="text-xs text-slate-400">Ingresos Totales Acumulados</div>
          </div>
        </div>

        <!-- Ventas de Hoy -->
        <div class="bg-slate-900/90 border border-slate-800/90 rounded-3xl p-6 shadow-sm flex items-center gap-4">
          <div class="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center text-xl shrink-0">
            <i class="fas fa-calendar-day"></i>
          </div>
          <div>
            <div class="text-2xl font-black text-amber-400 tracking-tight">{{ ventasHoy() }}</div>
            <div class="text-xs text-slate-400">Ventas Registradas Hoy</div>
          </div>
        </div>

        <!-- Promedio por Venta -->
        <div class="bg-slate-900/90 border border-slate-800/90 rounded-3xl p-6 shadow-sm flex items-center gap-4">
          <div class="w-12 h-12 rounded-2xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center text-xl shrink-0">
            <i class="fas fa-chart-simple"></i>
          </div>
          <div>
            <div class="text-2xl font-black text-cyan-400 tracking-tight">
              \${{ promedioVenta() | number:'1.2-2' }}
            </div>
            <div class="text-xs text-slate-400">Ticket Promedio</div>
          </div>
        </div>
      </div>

      <!-- Tarjeta Principal de Tabla con Buscador y Filtro -->
      <div class="bg-slate-900/90 border border-slate-800/90 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        
        <!-- Barra de Búsqueda y Filtros -->
        <div class="flex flex-col sm:flex-row gap-4 justify-between items-stretch sm:items-center">
          <div class="relative flex-1 max-w-md">
            <span class="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500 pointer-events-none">
              <i class="fas fa-magnifying-glass"></i>
            </span>
            <input
              type="text"
              [(ngModel)]="searchQuery"
              (ngModelChange)="onSearchChange($event)"
              placeholder="Buscar por folio, notas, usuario..."
              class="w-full pl-10 pr-4 py-3 bg-slate-950/60 border border-slate-800 rounded-2xl text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
            />
          </div>

          <!-- Filtro por Método de Pago -->
          <div class="flex items-center gap-3">
            <select
              [(ngModel)]="selectedPayment"
              (ngModelChange)="onPaymentFilterChange($event)"
              class="px-4 py-3 bg-slate-950/60 border border-slate-800 rounded-2xl text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all cursor-pointer"
            >
              <option [ngValue]="null">Todos los Métodos de Pago</option>
              <option value="efectivo">Efectivo</option>
              <option value="tarjeta">Tarjeta (Débito/Crédito)</option>
            </select>
          </div>
        </div>

        <!-- Tabla de Movimientos -->
        <div class="overflow-x-auto">
          <table class="w-full text-left text-sm">
            <thead>
              <tr class="border-b border-slate-800 text-xs uppercase tracking-wider text-slate-400">
                <th class="pb-3.5 font-semibold">Folio</th>
                <th class="pb-3.5 font-semibold">Fecha / Hora</th>
                <th class="pb-3.5 font-semibold">Usuario</th>
                <th class="pb-3.5 font-semibold">Notas</th>
                <th class="pb-3.5 font-semibold text-center">Método de Pago</th>
                <th class="pb-3.5 font-semibold text-right">Total</th>
                <th class="pb-3.5 font-semibold text-right">Acción</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-800/60">
              @if (isLoading() && movements().length === 0) {
                <tr>
                  <td colspan="7" class="py-12 text-center text-slate-400">
                    <i class="fas fa-spinner fa-spin text-2xl text-emerald-500 mb-2"></i>
                    <p class="text-xs">Cargando transacciones...</p>
                  </td>
                </tr>
              } @else if (movements().length > 0) {
                @for (m of movements(); track m.id_comanda) {
                  <tr class="hover:bg-slate-800/30 transition-colors">
                    <!-- Folio -->
                    <td class="py-4">
                      <code class="px-2.5 py-1 rounded-md bg-slate-950 text-indigo-300 border border-slate-800 text-xs font-mono font-semibold">
                        #{{ m.folio }}
                      </code>
                    </td>

                    <!-- Fecha -->
                    <td class="py-4 text-xs text-slate-300 whitespace-nowrap">
                      {{ m.fecha_venta | date:'dd/MM/yyyy HH:mm' }}
                    </td>

                    <!-- Usuario -->
                    <td class="py-4 text-xs font-medium text-slate-300">
                      <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-400">
                        <i class="fas fa-user-circle text-xs text-indigo-400"></i>
                        {{ m.nombre_usuario || 'Admin' }}
                      </span>
                    </td>

                    <!-- Notas -->
                    <td class="py-4 text-xs text-slate-400 max-w-xs truncate">
                      {{ m.notas || 'Venta de mostrador' }}
                    </td>

                    <!-- Método de Pago -->
                    <td class="py-4 text-center">
                      @if (isEfectivo(m)) {
                        <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          <i class="fas fa-money-bill-wave text-[10px]"></i> Efectivo
                        </span>
                      } @else {
                        <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                          <i class="fas fa-credit-card text-[10px]"></i> {{ getTarjetaLabel(m) }}
                        </span>
                      }
                    </td>

                    <!-- Total -->
                    <td class="py-4 text-right">
                      <span class="font-bold text-emerald-400 text-base">
                        \${{ m.total | number:'1.2-2' }}
                      </span>
                    </td>

                    <!-- Acción -->
                    <td class="py-4 text-right">
                      <button
                        type="button"
                        (click)="viewDetails(m.id_comanda)"
                        class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-emerald-500/40 text-slate-300 hover:text-emerald-400 hover:bg-emerald-500/10 transition-all text-xs font-medium cursor-pointer"
                        title="Ver productos del ticket"
                      >
                        <i class="fas fa-eye text-xs"></i>
                        <span>Ver</span>
                      </button>
                    </td>
                  </tr>
                }
              } @else {
                <tr>
                  <td colspan="7" class="py-12 text-center text-slate-500">
                    <i class="fas fa-receipt text-3xl mb-2 text-slate-600 block"></i>
                    No se encontraron movimientos registrados con los filtros seleccionados.
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>

      </div>

      <!-- Modal de Detalle de Venta -->
      @if (selectedDetail(); as ticket) {
        <div class="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div class="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] flex flex-col">
            
            <!-- Header Modal -->
            <div class="flex items-start justify-between pb-4 border-b border-slate-800 shrink-0">
              <div>
                <div class="flex items-center gap-2">
                  <span class="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center text-sm border border-emerald-500/20">
                    <i class="fas fa-receipt"></i>
                  </span>
                  <h3 class="text-xl font-bold text-white">Detalle de Venta</h3>
                </div>
                <div class="text-xs text-slate-400 mt-1 font-mono">
                  Folio: <strong class="text-indigo-400">#{{ ticket.folio }}</strong> | Fecha: {{ ticket.fecha_venta | date:'dd/MM/yyyy HH:mm' }}
                </div>
              </div>
              <button (click)="closeDetailModal()" class="text-slate-400 hover:text-white cursor-pointer p-1">
                <i class="fas fa-xmark text-lg"></i>
              </button>
            </div>

            <!-- Tabla de Productos del Ticket -->
            <div class="overflow-y-auto flex-1 pr-1">
              <table class="w-full text-left text-xs sm:text-sm">
                <thead>
                  <tr class="border-b border-slate-800 text-[11px] uppercase tracking-wider text-slate-400">
                    <th class="pb-3 font-semibold">Producto</th>
                    <th class="pb-3 font-semibold text-center">Cant.</th>
                    <th class="pb-3 font-semibold text-right">P. Unit</th>
                    <th class="pb-3 font-semibold text-right">Subtotal</th>
                    <th class="pb-3 font-semibold text-right">Total</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-800/60">
                  @for (prod of ticket.productos; track prod.id_detalle) {
                    <tr class="hover:bg-slate-800/20 transition-colors">
                      <td class="py-3">
                        <div class="font-bold text-slate-200">{{ prod.nombre_producto }}</div>
                        @if (prod.sku) {
                          <div class="text-[10px] text-slate-500 font-mono">SKU: {{ prod.sku }}</div>
                        }
                      </td>
                      <td class="py-3 text-center">
                        <span class="px-2 py-0.5 rounded-md bg-slate-950 text-slate-300 border border-slate-800 font-semibold text-xs">
                          {{ prod.cantidad }}
                        </span>
                      </td>
                      <td class="py-3 text-right text-slate-300">
                        \${{ prod.precio_unitario | number:'1.2-2' }}
                      </td>
                      <td class="py-3 text-right text-slate-300">
                        \${{ prod.subtotal | number:'1.2-2' }}
                      </td>
                      <td class="py-3 text-right font-bold text-emerald-400">
                        \${{ prod.total | number:'1.2-2' }}
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>

            <!-- Total General del Ticket -->
            <div class="pt-4 border-t border-slate-800 flex items-center justify-between shrink-0">
              <div class="text-xs text-slate-400">
                Método de Pago: <strong class="text-slate-200">{{ ticket.metodo_pago }}</strong>
              </div>
              <div class="text-right">
                <span class="text-xs uppercase font-bold text-slate-400 mr-2">Total General:</span>
                <span class="text-2xl font-black text-emerald-400 tracking-tight">
                  \${{ ticket.total | number:'1.2-2' }}
                </span>
              </div>
            </div>

            <!-- Botón Cerrar -->
            <div class="flex justify-end pt-2 shrink-0">
              <button
                type="button"
                (click)="closeDetailModal()"
                class="px-5 py-2.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors cursor-pointer"
              >
                Cerrar Detalle
              </button>
            </div>

          </div>
        </div>
      }

    </div>
  `
})
export class MovementListComponent implements OnInit {
  searchQuery = '';
  selectedPayment: string | null = null;

  get movements() {
    return this.movementService.filteredMovements;
  }

  get totalVentas() {
    return this.movementService.totalVentasCount;
  }

  get totalIngresos() {
    return this.movementService.totalIngresosAmount;
  }

  get ventasHoy() {
    return this.movementService.ventasHoyCount;
  }

  get promedioVenta() {
    return this.movementService.promedioVentaAmount;
  }

  get selectedDetail() {
    return this.movementService.selectedDetail;
  }

  get isLoading() {
    return this.movementService.isLoading;
  }

  constructor(private movementService: MovementService) {}

  ngOnInit(): void {
    this.refresh();
  }

  refresh(): void {
    this.movementService.loadMovements();
  }

  onSearchChange(val: string): void {
    this.movementService.setSearchQuery(val);
  }

  onPaymentFilterChange(val: string | null): void {
    this.movementService.setPaymentFilter(val);
  }

  viewDetails(idComanda: number): void {
    this.movementService.loadDetail(idComanda);
  }

  closeDetailModal(): void {
    this.movementService.clearSelectedDetail();
  }

  isEfectivo(m: MovementItemDto): boolean {
    return m.tipo_pago === 2 || m.metodo_pago.toLowerCase().includes('efectivo');
  }

  getTarjetaLabel(m: MovementItemDto): string {
    if (m.tipo_tarjeta === 1) return 'Tarjeta Débito';
    if (m.tipo_tarjeta === 2) return 'Tarjeta Crédito';
    return m.metodo_pago || 'Tarjeta';
  }
}
