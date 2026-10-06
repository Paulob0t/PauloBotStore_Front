import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CashRegisterService } from '../../core/services/cash-register.service';
import { CashRegisterCutDto, CashRegisterMovementDto } from '../../api/models';

@Component({
  selector: 'app-cash-register',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-8 animate-fade-in max-w-7xl mx-auto">
      
      <!-- Header Superior -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 rounded-2xl bg-amber-600/20 border border-amber-500/30 text-amber-400 flex items-center justify-center text-2xl shadow-lg shadow-amber-600/20">
            <i class="fas fa-cash-register"></i>
          </div>
          <div>
            <div class="flex items-center gap-3">
              <h1 class="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Cortes de Caja
              </h1>
              @if (isCajaActiva()) {
                <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span> Caja Abierta
                </span>
              } @else {
                <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                  <span class="w-2 h-2 rounded-full bg-rose-400"></span> Caja Cerrada
                </span>
              }
            </div>
            <p class="text-xs sm:text-sm text-slate-400 mt-1">
              Control de apertura de jornada, arqueo de valores, movimientos de turno y cortes.
            </p>
          </div>
        </div>

        <div class="flex items-center flex-wrap gap-2.5">
          @if (!isCajaActiva()) {
            <button
              type="button"
              (click)="openStartModal()"
              class="inline-flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 shadow-lg shadow-emerald-600/30 hover:shadow-emerald-600/50 hover:-translate-y-0.5 transition-all cursor-pointer"
            >
              <i class="fas fa-play"></i>
              <span>Iniciar Jornada</span>
            </button>
          } @else {
            <button
              type="button"
              (click)="openAddMovementModal()"
              class="inline-flex items-center gap-2 px-4 py-3 rounded-2xl text-xs font-semibold text-slate-200 bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-slate-600 transition-all cursor-pointer"
            >
              <i class="fas fa-plus-minus text-amber-400"></i>
              <span>Movimiento</span>
            </button>

            <button
              type="button"
              (click)="openCloseModal()"
              class="inline-flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 shadow-lg shadow-rose-600/30 hover:shadow-rose-600/50 hover:-translate-y-0.5 transition-all cursor-pointer"
            >
              <i class="fas fa-stop"></i>
              <span>Cerrar Caja / Corte</span>
            </button>
          }

          <button
            type="button"
            (click)="openConfigModal()"
            class="w-10 h-10 rounded-2xl text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 flex items-center justify-center transition-all cursor-pointer"
            title="Configuración de Caja"
          >
            <i class="fas fa-gear text-sm"></i>
          </button>

          <button
            (click)="refresh()"
            [disabled]="isLoading()"
            class="w-10 h-10 rounded-2xl text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 flex items-center justify-center transition-all cursor-pointer disabled:opacity-50"
            title="Recargar datos"
          >
            <i class="fas fa-arrows-rotate text-sm" [class.fa-spin]="isLoading()"></i>
          </button>
        </div>
      </div>

      <!-- Alertas de Notificación -->
      @if (alertMessage()) {
        <div
          class="p-4 rounded-2xl text-sm flex items-start justify-between gap-3 animate-fade-in"
          [ngClass]="alertType() === 'success' ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300' : 'bg-rose-500/10 border border-rose-500/30 text-rose-300'"
        >
          <div class="flex items-center gap-3 font-medium">
            <i class="fas" [ngClass]="alertType() === 'success' ? 'fa-circle-check text-emerald-400' : 'fa-circle-exclamation text-rose-400'"></i>
            <span>{{ alertMessage() }}</span>
          </div>
          <button (click)="alertMessage.set(null)" class="text-slate-400 hover:text-white cursor-pointer">
            <i class="fas fa-xmark"></i>
          </button>
        </div>
      }

      <!-- Panel de Turno Activo (Cuando la caja está abierta) -->
      @if (isCajaActiva() && corteActual(); as corte) {
        <div class="space-y-6">
          <div class="flex items-center justify-between">
            <h2 class="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <i class="fas fa-chart-line text-emerald-400"></i>
              <span>Turno Activo (#{{ corte.id }})</span>
            </h2>
            <span class="text-xs text-slate-400 font-mono">
              Iniciado: {{ corte.fecha }} a las {{ corte.hora }} por {{ corte.nombre_usuario || 'Admin' }}
            </span>
          </div>

          <!-- Grid 4 Mini KPIs del Turno en Vivo -->
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <!-- Fondo Inicial -->
            <div class="bg-slate-900/90 border border-slate-800/90 rounded-3xl p-6 shadow-sm flex items-center gap-4">
              <div class="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center text-xl shrink-0">
                <i class="fas fa-vault"></i>
              </div>
              <div>
                <div class="text-2xl font-black text-white tracking-tight">
                  \${{ corte.monto_inicial | number:'1.2-2' }}
                </div>
                <div class="text-xs text-slate-400">Fondo Inicial de Apertura</div>
              </div>
            </div>

            <!-- Total Ingresos -->
            <div class="bg-slate-900/90 border border-slate-800/90 rounded-3xl p-6 shadow-sm flex items-center gap-4">
              <div class="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center text-xl shrink-0">
                <i class="fas fa-arrow-trend-up"></i>
              </div>
              <div>
                <div class="text-2xl font-black text-emerald-400 tracking-tight">
                  +\${{ (totales()?.total_ingresos || 0) | number:'1.2-2' }}
                </div>
                <div class="text-xs text-slate-400">
                  {{ totales()?.num_ingresos || 0 }} Ingresos (Ventas/Extras)
                </div>
              </div>
            </div>

            <!-- Total Egresos -->
            <div class="bg-slate-900/90 border border-slate-800/90 rounded-3xl p-6 shadow-sm flex items-center gap-4">
              <div class="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-400 flex items-center justify-center text-xl shrink-0">
                <i class="fas fa-arrow-trend-down"></i>
              </div>
              <div>
                <div class="text-2xl font-black text-rose-400 tracking-tight">
                  -\${{ (totales()?.total_egresos || 0) | number:'1.2-2' }}
                </div>
                <div class="text-xs text-slate-400">
                  {{ totales()?.num_egresos || 0 }} Egresos / Retiros
                </div>
              </div>
            </div>

            <!-- Monto Esperado en Caja -->
            <div class="bg-gradient-to-br from-indigo-900/40 via-slate-900 to-slate-900 border border-indigo-500/30 rounded-3xl p-6 shadow-sm flex items-center gap-4">
              <div class="w-12 h-12 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-xl shrink-0">
                <i class="fas fa-cash-register"></i>
              </div>
              <div>
                <div class="text-2xl font-black text-indigo-300 tracking-tight">
                  \${{ (totales()?.monto_esperado || corte.monto_inicial) | number:'1.2-2' }}
                </div>
                <div class="text-xs text-indigo-200/70">Monto Teórico Esperado</div>
              </div>
            </div>
          </div>

          <!-- Tabla de Movimientos del Turno Actual -->
          <div class="bg-slate-900/90 border border-slate-800/90 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
            <div class="flex items-center justify-between">
              <h3 class="text-base font-bold text-white flex items-center gap-2">
                <i class="fas fa-list-check text-indigo-400"></i>
                <span>Movimientos del Turno en Curso</span>
              </h3>
              <span class="text-xs text-slate-400">{{ movimientosTurno().length }} registros</span>
            </div>

            <div class="overflow-x-auto">
              <table class="w-full text-left text-sm">
                <thead>
                  <tr class="border-b border-slate-800 text-xs uppercase tracking-wider text-slate-400">
                    <th class="pb-3.5 font-semibold">Hora</th>
                    <th class="pb-3.5 font-semibold">Tipo</th>
                    <th class="pb-3.5 font-semibold">Concepto</th>
                    <th class="pb-3.5 font-semibold">Método</th>
                    <th class="pb-3.5 font-semibold text-right">Monto</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-800/60">
                  @if (movimientosTurno().length === 0) {
                    <tr>
                      <td colspan="5" class="py-8 text-center text-slate-500 text-xs">
                        No hay movimientos registrados en este turno aún.
                      </td>
                    </tr>
                  } @else {
                    @for (m of movimientosTurno(); track m.id) {
                      <tr class="hover:bg-slate-800/30 transition-colors">
                        <td class="py-3 text-xs text-slate-400 font-mono whitespace-nowrap">
                          {{ m.fecha_hora | date:'HH:mm:ss' }}
                        </td>
                        <td class="py-3">
                          @if (m.tipo_movimiento === 'apertura') {
                            <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                              Apertura
                            </span>
                          } @else if (m.tipo_movimiento === 'ingreso') {
                            <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                              + Ingreso
                            </span>
                          } @else if (m.tipo_movimiento === 'egreso') {
                            <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                              - Egreso
                            </span>
                          }
                        </td>
                        <td class="py-3 text-xs text-slate-200">
                          <div class="font-medium">{{ m.concepto }}</div>
                          @if (m.notas) {
                            <div class="text-[11px] text-slate-500">{{ m.notas }}</div>
                          }
                        </td>
                        <td class="py-3 text-xs text-slate-400">
                          {{ m.metodo_pago }}
                        </td>
                        <td class="py-3 text-right font-bold"
                          [ngClass]="m.tipo_movimiento === 'egreso' ? 'text-rose-400' : 'text-emerald-400'">
                          {{ m.tipo_movimiento === 'egreso' ? '-' : '+' }}\${{ m.monto | number:'1.2-2' }}
                        </td>
                      </tr>
                    }
                  }
                </tbody>
              </table>
            </div>
          </div>
        </div>
      } @else {
        <!-- Banner cuando la caja está cerrada -->
        <div class="bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-8 sm:p-12 text-center space-y-4 shadow-xl">
          <div class="w-16 h-16 rounded-3xl bg-amber-500/10 text-amber-400 flex items-center justify-center text-3xl mx-auto border border-amber-500/20">
            <i class="fas fa-lock"></i>
          </div>
          <div class="max-w-md mx-auto">
            <h3 class="text-xl font-bold text-white">No hay ninguna jornada activa</h3>
            <p class="text-xs sm:text-sm text-slate-400 mt-2">
              Inicia una nueva apertura de caja indicando el fondo inicial de efectivo para comenzar a registrar cobros y movimientos.
            </p>
          </div>
          <div>
            <button
              type="button"
              (click)="openStartModal()"
              class="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-xl shadow-indigo-600/30 hover:shadow-indigo-600/50 hover:-translate-y-0.5 transition-all cursor-pointer"
            >
              <i class="fas fa-play text-xs"></i>
              <span>Iniciar Jornada Ahora</span>
            </button>
          </div>
        </div>
      }

      <!-- Historial de Cortes de Caja Anteriores -->
      <div class="bg-slate-900/90 border border-slate-800/90 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        <div class="flex items-center justify-between">
          <div>
            <h3 class="text-base font-bold text-white flex items-center gap-2">
              <i class="fas fa-clock-rotate-left text-amber-400"></i>
              <span>Historial de Cortes Realizados</span>
            </h3>
            <p class="text-xs text-slate-400 mt-0.5">
              Cortes de turno cerrados con balances y diferencias.
            </p>
          </div>
          <span class="text-xs text-slate-400">{{ history().length }} cortes archivados</span>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left text-sm">
            <thead>
              <tr class="border-b border-slate-800 text-xs uppercase tracking-wider text-slate-400">
                <th class="pb-3.5 font-semibold">Corte</th>
                <th class="pb-3.5 font-semibold">Fecha / Hora</th>
                <th class="pb-3.5 font-semibold">Fondo Inicial</th>
                <th class="pb-3.5 font-semibold">Ingresos</th>
                <th class="pb-3.5 font-semibold">Egresos</th>
                <th class="pb-3.5 font-semibold">Total Declarado</th>
                <th class="pb-3.5 font-semibold text-center">Diferencia</th>
                <th class="pb-3.5 font-semibold text-right">Detalle</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-800/60">
              @if (isLoading() && history().length === 0) {
                <tr>
                  <td colspan="8" class="py-12 text-center text-slate-400">
                    <i class="fas fa-spinner fa-spin text-2xl text-amber-500 mb-2"></i>
                    <p class="text-xs">Cargando historial de cortes...</p>
                  </td>
                </tr>
              } @else if (history().length > 0) {
                @for (h of history(); track h.id) {
                  <tr class="hover:bg-slate-800/30 transition-colors">
                    <!-- Folio ID -->
                    <td class="py-4">
                      <code class="px-2 py-0.5 rounded-md bg-slate-950 text-indigo-300 border border-slate-800 text-xs font-mono font-semibold">
                        #CORTE-{{ h.id }}
                      </code>
                    </td>

                    <!-- Fecha -->
                    <td class="py-4 text-xs text-slate-300 whitespace-nowrap">
                      {{ h.fecha }} {{ h.hora }}
                    </td>

                    <!-- Fondo Inicial -->
                    <td class="py-4 text-xs text-slate-300">
                      \${{ h.monto_inicial | number:'1.2-2' }}
                    </td>

                    <!-- Total Ingresos -->
                    <td class="py-4 text-xs font-semibold text-emerald-400">
                      +\${{ (h.total_ingresos || 0) | number:'1.2-2' }}
                    </td>

                    <!-- Total Egresos -->
                    <td class="py-4 text-xs font-semibold text-rose-400">
                      -\${{ (h.total_egresos || 0) | number:'1.2-2' }}
                    </td>

                    <!-- Monto Declarado -->
                    <td class="py-4 text-xs font-bold text-white">
                      \${{ (h.monto_final || 0) | number:'1.2-2' }}
                    </td>

                    <!-- Diferencia -->
                    <td class="py-4 text-center">
                      @if ((h.diferencia || 0) === 0) {
                        <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          $0.00
                        </span>
                      } @else if ((h.diferencia || 0) > 0) {
                        <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          + \${{ h.diferencia | number:'1.2-2' }}
                        </span>
                      } @else {
                        <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                          \${{ h.diferencia | number:'1.2-2' }}
                        </span>
                      }
                    </td>

                    <!-- Detalle -->
                    <td class="py-4 text-right">
                      <button
                        type="button"
                        (click)="viewCutDetail(h.id)"
                        class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-amber-500/40 text-slate-300 hover:text-amber-400 hover:bg-amber-500/10 transition-all text-xs font-medium cursor-pointer"
                        title="Ver balance y movimientos del corte"
                      >
                        <i class="fas fa-eye text-xs"></i>
                        <span>Ver</span>
                      </button>
                    </td>
                  </tr>
                }
              } @else {
                <tr>
                  <td colspan="8" class="py-12 text-center text-slate-500">
                    <i class="fas fa-clock-rotate-left text-3xl mb-2 text-slate-600 block"></i>
                    Aún no hay cortes de caja archivados en el historial.
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>

      <!-- Modal Iniciar Jornada / Abrir Caja -->
      @if (showStartModal()) {
        <div class="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div class="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl space-y-6">
            <div class="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 class="text-lg font-bold text-white flex items-center gap-2">
                <i class="fas fa-play text-emerald-400"></i>
                <span>Iniciar Jornada / Apertura</span>
              </h3>
              <button (click)="showStartModal.set(false)" class="text-slate-400 hover:text-white cursor-pointer">
                <i class="fas fa-xmark"></i>
              </button>
            </div>

            <div class="space-y-4">
              <div>
                <label for="montoInicialInput" class="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                  Fondo Inicial de Caja <span class="text-rose-400">*</span>
                </label>
                <div class="relative">
                  <span class="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500 text-sm">$</span>
                  <input
                    id="montoInicialInput"
                    type="number"
                    step="0.01"
                    min="0"
                    [(ngModel)]="openMontoInicial"
                    placeholder="100.00"
                    class="w-full pl-8 pr-4 py-3 bg-slate-950/60 border border-slate-800 rounded-2xl text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                  />
                </div>
              </div>

              <div>
                <label for="openNotasInput" class="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                  Notas de Apertura
                </label>
                <textarea
                  id="openNotasInput"
                  rows="2"
                  [(ngModel)]="openNotas"
                  placeholder="Ej: Cambio en monedas de $1, $2, $5 y $10"
                  class="w-full px-4 py-3 bg-slate-950/60 border border-slate-800 rounded-2xl text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                ></textarea>
              </div>
            </div>

            <div class="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                (click)="showStartModal.set(false)"
                class="px-5 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                (click)="confirmOpenCaja()"
                [disabled]="isLoading() || openMontoInicial < 0"
                class="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 transition-colors cursor-pointer shadow-lg shadow-emerald-600/30"
              >
                @if (isLoading()) {
                  <i class="fas fa-spinner fa-spin mr-1"></i> Abriendo...
                } @else {
                  <i class="fas fa-check mr-1"></i> Abrir Caja
                }
              </button>
            </div>
          </div>
        </div>
      }

      <!-- Modal Cerrar Caja / Arqueo -->
      @if (showCloseModal()) {
        <div class="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div class="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl space-y-6">
            <div class="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 class="text-lg font-bold text-white flex items-center gap-2">
                <i class="fas fa-cash-register text-rose-400"></i>
                <span>Cerrar Caja / Arqueo</span>
              </h3>
              <button (click)="showCloseModal.set(false)" class="text-slate-400 hover:text-white cursor-pointer">
                <i class="fas fa-xmark"></i>
              </button>
            </div>

            <!-- Resumen Teórico -->
            <div class="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 space-y-2 text-xs">
              <div class="flex justify-between text-slate-400">
                <span>Fondo Inicial:</span>
                <span class="text-slate-200">\${{ (corteActual()?.monto_inicial || 0) | number:'1.2-2' }}</span>
              </div>
              <div class="flex justify-between text-slate-400">
                <span>Total Ingresos:</span>
                <span class="text-emerald-400">+\${{ (totales()?.total_ingresos || 0) | number:'1.2-2' }}</span>
              </div>
              <div class="flex justify-between text-slate-400">
                <span>Total Egresos:</span>
                <span class="text-rose-400">-\${{ (totales()?.total_egresos || 0) | number:'1.2-2' }}</span>
              </div>
              <div class="pt-2 border-t border-slate-800 flex justify-between font-bold text-sm">
                <span class="text-slate-200">Monto Teórico Esperado:</span>
                <span class="text-indigo-400">\${{ (totales()?.monto_esperado || 0) | number:'1.2-2' }}</span>
              </div>
            </div>

            <div class="space-y-4">
              <div>
                <label for="closeMontoFinalInput" class="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                  Efectivo Físico Contado en Caja <span class="text-rose-400">*</span>
                </label>
                <div class="relative">
                  <span class="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500 text-sm">$</span>
                  <input
                    id="closeMontoFinalInput"
                    type="number"
                    step="0.01"
                    min="0"
                    [(ngModel)]="closeMontoFinal"
                    placeholder="Monto contado físicamente"
                    class="w-full pl-8 pr-4 py-3 bg-slate-950/60 border border-slate-800 rounded-2xl text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-all font-bold"
                  />
                </div>
              </div>

              <!-- Cálculo de Diferencia en tiempo real -->
              @if (closeMontoFinal !== null && closeMontoFinal >= 0) {
                <div class="p-3 rounded-xl border flex items-center justify-between text-xs"
                  [ngClass]="getDiferenciaCalculada() === 0 ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : getDiferenciaCalculada() > 0 ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400' : 'bg-rose-500/10 border-rose-500/30 text-rose-400'">
                  <span class="font-bold">
                    {{ getDiferenciaCalculada() === 0 ? 'Cuadre Perfecto:' : getDiferenciaCalculada() > 0 ? 'Sobrante:' : 'Faltante:' }}
                  </span>
                  <span class="font-bold text-sm">
                    {{ getDiferenciaCalculada() > 0 ? '+' : '' }}\${{ getDiferenciaCalculada() | number:'1.2-2' }}
                  </span>
                </div>
              }

              <div>
                <label for="closeNotasInput" class="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                  Notas de Cierre
                </label>
                <textarea
                  id="closeNotasInput"
                  rows="2"
                  [(ngModel)]="closeNotas"
                  placeholder="Observaciones de cierre"
                  class="w-full px-4 py-3 bg-slate-950/60 border border-slate-800 rounded-2xl text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-all"
                ></textarea>
              </div>
            </div>

            <div class="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                (click)="showCloseModal.set(false)"
                class="px-5 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                (click)="confirmCloseCaja()"
                [disabled]="isLoading() || closeMontoFinal === null || closeMontoFinal < 0"
                class="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 disabled:opacity-50 transition-colors cursor-pointer shadow-lg shadow-rose-600/30"
              >
                @if (isLoading()) {
                  <i class="fas fa-spinner fa-spin mr-1"></i> Cerrando...
                } @else {
                  <i class="fas fa-stop mr-1"></i> Finalizar Corte
                }
              </button>
            </div>
          </div>
        </div>
      }

      <!-- Modal Movimiento Manual de Caja -->
      @if (showMovementModal()) {
        <div class="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div class="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl space-y-6">
            <div class="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 class="text-lg font-bold text-white flex items-center gap-2">
                <i class="fas fa-money-bill-transfer text-amber-400"></i>
                <span>Movimiento Extraordinario</span>
              </h3>
              <button (click)="showMovementModal.set(false)" class="text-slate-400 hover:text-white cursor-pointer">
                <i class="fas fa-xmark"></i>
              </button>
            </div>

            <div class="space-y-4">
              <div>
                <label class="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                  Tipo de Operación
                </label>
                <div class="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    (click)="movementTipo = 'ingreso'"
                    class="py-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center justify-center gap-2"
                    [ngClass]="movementTipo === 'ingreso' ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' : 'bg-slate-950 border-slate-800 text-slate-400'"
                  >
                    <i class="fas fa-arrow-down"></i> Ingreso
                  </button>
                  <button
                    type="button"
                    (click)="movementTipo = 'egreso'"
                    class="py-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center justify-center gap-2"
                    [ngClass]="movementTipo === 'egreso' ? 'bg-rose-500/20 border-rose-500 text-rose-400' : 'bg-slate-950 border-slate-800 text-slate-400'"
                  >
                    <i class="fas fa-arrow-up"></i> Egreso / Retiro
                  </button>
                </div>
              </div>

              <div>
                <label for="movementConceptoInput" class="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                  Concepto <span class="text-rose-400">*</span>
                </label>
                <input
                  id="movementConceptoInput"
                  type="text"
                  [(ngModel)]="movementConcepto"
                  placeholder="Ej: Cambio de monedas, Pago a repartidor"
                  class="w-full px-4 py-3 bg-slate-950/60 border border-slate-800 rounded-2xl text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
                />
              </div>

              <div>
                <label for="movementMontoInput" class="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                  Monto <span class="text-rose-400">*</span>
                </label>
                <div class="relative">
                  <span class="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500 text-sm">$</span>
                  <input
                    id="movementMontoInput"
                    type="number"
                    step="0.01"
                    min="0.01"
                    [(ngModel)]="movementMonto"
                    placeholder="50.00"
                    class="w-full pl-8 pr-4 py-3 bg-slate-950/60 border border-slate-800 rounded-2xl text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all font-bold"
                  />
                </div>
              </div>
            </div>

            <div class="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                (click)="showMovementModal.set(false)"
                class="px-5 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                (click)="confirmAddMovement()"
                [disabled]="isLoading() || !movementConcepto.trim() || movementMonto <= 0"
                class="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-amber-600 hover:bg-amber-500 disabled:opacity-50 transition-colors cursor-pointer shadow-lg shadow-amber-600/30"
              >
                @if (isLoading()) {
                  <i class="fas fa-spinner fa-spin mr-1"></i> Guardando...
                } @else {
                  <i class="fas fa-save mr-1"></i> Registrar
                }
              </button>
            </div>
          </div>
        </div>
      }

      <!-- Modal Configuración de Caja -->
      @if (showConfigModal()) {
        <div class="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div class="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl space-y-6">
            <div class="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 class="text-lg font-bold text-white flex items-center gap-2">
                <i class="fas fa-gear text-indigo-400"></i>
                <span>Parámetros de Caja</span>
              </h3>
              <button (click)="showConfigModal.set(false)" class="text-slate-400 hover:text-white cursor-pointer">
                <i class="fas fa-xmark"></i>
              </button>
            </div>

            <div class="space-y-4">
              <div class="flex items-center justify-between p-3 rounded-2xl bg-slate-950/60 border border-slate-800">
                <div>
                  <div class="text-xs font-bold text-slate-200">Corte Automático</div>
                  <div class="text-[10px] text-slate-400">Cierre programado del sistema</div>
                </div>
                <input
                  type="checkbox"
                  [(ngModel)]="cfgHabilitado"
                  class="w-5 h-5 rounded text-indigo-600 bg-slate-900 border-slate-700 cursor-pointer"
                />
              </div>

              <div>
                <label for="cfgHoraInput" class="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                  Hora de Corte Automático
                </label>
                <input
                  id="cfgHoraInput"
                  type="time"
                  step="1"
                  [(ngModel)]="cfgHora"
                  class="w-full px-4 py-3 bg-slate-950/60 border border-slate-800 rounded-2xl text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all cursor-pointer"
                />
              </div>

              <div>
                <label for="cfgMontoInput" class="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                  Fondo Inicial por Defecto ($)
                </label>
                <input
                  id="cfgMontoInput"
                  type="number"
                  step="0.01"
                  min="0"
                  [(ngModel)]="cfgMontoDefault"
                  class="w-full px-4 py-3 bg-slate-950/60 border border-slate-800 rounded-2xl text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                />
              </div>
            </div>

            <div class="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                (click)="showConfigModal.set(false)"
                class="px-5 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                (click)="confirmSaveConfig()"
                [disabled]="isLoading()"
                class="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 transition-colors cursor-pointer shadow-lg shadow-indigo-600/30"
              >
                Guardar Configuración
              </button>
            </div>
          </div>
        </div>
      }

      <!-- Modal Detalle Histórico de Corte -->
      @if (selectedCutDetail(); as detail) {
        <div class="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div class="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] flex flex-col">
            <div class="flex items-start justify-between pb-4 border-b border-slate-800 shrink-0">
              <div>
                <div class="flex items-center gap-2">
                  <span class="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center text-sm border border-amber-500/20">
                    <i class="fas fa-receipt"></i>
                  </span>
                  <h3 class="text-xl font-bold text-white">Detalle de Corte #{{ detail.corte.id }}</h3>
                </div>
                <div class="text-xs text-slate-400 mt-1 font-mono">
                  Fecha: {{ detail.corte.fecha }} {{ detail.corte.hora }} | Cajero: {{ detail.corte.nombre_usuario }}
                </div>
              </div>
              <button (click)="cashRegisterService.clearSelectedDetail()" class="text-slate-400 hover:text-white cursor-pointer p-1">
                <i class="fas fa-xmark text-lg"></i>
              </button>
            </div>

            <!-- Resumen de Balance del Corte -->
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs shrink-0">
              <div class="p-3 rounded-2xl bg-slate-950/60 border border-slate-800">
                <div class="text-slate-400">Fondo Inicial</div>
                <div class="text-sm font-bold text-white mt-0.5">\${{ detail.corte.monto_inicial | number:'1.2-2' }}</div>
              </div>
              <div class="p-3 rounded-2xl bg-slate-950/60 border border-slate-800">
                <div class="text-slate-400">Ingresos</div>
                <div class="text-sm font-bold text-emerald-400 mt-0.5">+\${{ (detail.corte.total_ingresos || 0) | number:'1.2-2' }}</div>
              </div>
              <div class="p-3 rounded-2xl bg-slate-950/60 border border-slate-800">
                <div class="text-slate-400">Egresos</div>
                <div class="text-sm font-bold text-rose-400 mt-0.5">-\${{ (detail.corte.total_egresos || 0) | number:'1.2-2' }}</div>
              </div>
              <div class="p-3 rounded-2xl bg-slate-950/60 border border-slate-800">
                <div class="text-slate-400">Total Declarado</div>
                <div class="text-sm font-bold text-indigo-400 mt-0.5">\${{ (detail.corte.monto_final || 0) | number:'1.2-2' }}</div>
              </div>
            </div>

            <!-- Movimientos del corte -->
            <div class="overflow-y-auto flex-1 pr-1 space-y-2">
              <h4 class="text-xs font-bold uppercase tracking-wider text-slate-400">Movimientos Registrados</h4>
              <table class="w-full text-left text-xs">
                <thead>
                  <tr class="border-b border-slate-800 text-[10px] uppercase text-slate-500">
                    <th class="pb-2 font-semibold">Hora</th>
                    <th class="pb-2 font-semibold">Tipo</th>
                    <th class="pb-2 font-semibold">Concepto</th>
                    <th class="pb-2 font-semibold text-right">Monto</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-800/60">
                  @for (m of detail.movimientos; track m.id) {
                    <tr>
                      <td class="py-2 text-slate-400 font-mono">{{ m.fecha_hora | date:'HH:mm:ss' }}</td>
                      <td class="py-2 capitalize text-slate-300">{{ m.tipo_movimiento }}</td>
                      <td class="py-2 text-slate-200">{{ m.concepto }}</td>
                      <td class="py-2 text-right font-bold"
                        [ngClass]="m.tipo_movimiento === 'egreso' ? 'text-rose-400' : 'text-emerald-400'">
                        \${{ m.monto | number:'1.2-2' }}
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>

            <div class="flex justify-end pt-2 shrink-0">
              <button
                type="button"
                (click)="cashRegisterService.clearSelectedDetail()"
                class="px-5 py-2.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      }

    </div>
  `
})
export class CashRegisterComponent implements OnInit {
  showStartModal = signal<boolean>(false);
  showCloseModal = signal<boolean>(false);
  showMovementModal = signal<boolean>(false);
  showConfigModal = signal<boolean>(false);

  openMontoInicial = 100;
  openNotas = '';

  closeMontoFinal: number | null = null;
  closeNotas = '';

  movementTipo: 'ingreso' | 'egreso' = 'ingreso';
  movementConcepto = '';
  movementMonto = 0;

  cfgHabilitado = true;
  cfgHora = '23:59:00';
  cfgMontoDefault = 100;

  alertMessage = signal<string | null>(null);
  alertType = signal<'success' | 'error'>('success');

  get isCajaActiva() {
    return this.cashRegisterService.isCajaActiva;
  }

  get corteActual() {
    return this.cashRegisterService.corteActual;
  }

  get totales() {
    return this.cashRegisterService.totales;
  }

  get config() {
    return this.cashRegisterService.config;
  }

  get movimientosTurno() {
    return this.cashRegisterService.movimientosTurno;
  }

  get history() {
    return this.cashRegisterService.history;
  }

  get selectedCutDetail() {
    return this.cashRegisterService.selectedCutDetail;
  }

  get isLoading() {
    return this.cashRegisterService.isLoading;
  }

  constructor(public cashRegisterService: CashRegisterService) {}

  ngOnInit(): void {
    this.refresh();
  }

  refresh(): void {
    this.cashRegisterService.loadStatus().then(status => {
      if (status?.config) {
        this.cfgHabilitado = status.config.corte_automatico_habilitado;
        this.cfgHora = status.config.hora_corte_automatico;
        this.cfgMontoDefault = status.config.monto_inicial_default;
        this.openMontoInicial = status.config.monto_inicial_default;
      }
    });
    this.cashRegisterService.loadHistory();
  }

  openStartModal(): void {
    this.openMontoInicial = this.config()?.monto_inicial_default || 100;
    this.openNotas = '';
    this.showStartModal.set(true);
  }

  openCloseModal(): void {
    const esperado = this.totales()?.monto_esperado || this.corteActual()?.monto_inicial || 0;
    this.closeMontoFinal = esperado;
    this.closeNotas = '';
    this.showCloseModal.set(true);
  }

  openAddMovementModal(): void {
    this.movementTipo = 'egreso';
    this.movementConcepto = '';
    this.movementMonto = 0;
    this.showMovementModal.set(true);
  }

  openConfigModal(): void {
    if (this.config()) {
      this.cfgHabilitado = this.config()!.corte_automatico_habilitado;
      this.cfgHora = this.config()!.hora_corte_automatico;
      this.cfgMontoDefault = this.config()!.monto_inicial_default;
    }
    this.showConfigModal.set(true);
  }

  getDiferenciaCalculada(): number {
    const esperado = this.totales()?.monto_esperado || this.corteActual()?.monto_inicial || 0;
    return (this.closeMontoFinal || 0) - esperado;
  }

  async confirmOpenCaja(): Promise<void> {
    try {
      const res = await this.cashRegisterService.openCaja({
        monto_inicial: this.openMontoInicial,
        notas: this.openNotas.trim() || undefined
      });
      this.alertType.set('success');
      this.alertMessage.set(res.message || 'Caja iniciada exitosamente.');
      this.showStartModal.set(false);
    } catch (err: any) {
      this.alertType.set('error');
      this.alertMessage.set(err.message || 'Error al iniciar caja.');
    }
  }

  async confirmCloseCaja(): Promise<void> {
    if (this.closeMontoFinal === null || this.closeMontoFinal < 0) return;

    try {
      const res = await this.cashRegisterService.closeCaja({
        monto_final: this.closeMontoFinal,
        notas: this.closeNotas.trim() || undefined
      });
      this.alertType.set('success');
      this.alertMessage.set(res.message || 'Caja cerrada exitosamente.');
      this.showCloseModal.set(false);
    } catch (err: any) {
      this.alertType.set('error');
      this.alertMessage.set(err.message || 'Error al cerrar caja.');
    }
  }

  async confirmAddMovement(): Promise<void> {
    if (!this.movementConcepto.trim() || this.movementMonto <= 0) return;

    try {
      const res = await this.cashRegisterService.addMovement({
        tipo_movimiento: this.movementTipo,
        concepto: this.movementConcepto.trim(),
        monto: this.movementMonto
      });
      this.alertType.set('success');
      this.alertMessage.set(res.message || 'Movimiento registrado.');
      this.showMovementModal.set(false);
    } catch (err: any) {
      this.alertType.set('error');
      this.alertMessage.set(err.message || 'Error al registrar movimiento.');
    }
  }

  async confirmSaveConfig(): Promise<void> {
    try {
      const res = await this.cashRegisterService.updateConfig({
        corte_automatico_habilitado: this.cfgHabilitado,
        hora_corte_automatico: this.cfgHora,
        monto_inicial_default: this.cfgMontoDefault
      });
      this.alertType.set('success');
      this.alertMessage.set(res.message || 'Configuración actualizada.');
      this.showConfigModal.set(false);
    } catch (err: any) {
      this.alertType.set('error');
      this.alertMessage.set(err.message || 'Error al actualizar configuración.');
    }
  }

  viewCutDetail(id: number): void {
    this.cashRegisterService.loadCutDetail(id);
  }
}
