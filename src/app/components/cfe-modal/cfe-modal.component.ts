import { Component, EventEmitter, Output, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DigitalServicesService, CfeCheckResult, CfePayResult } from '../../core/services/digital-services.service';

@Component({
  selector: 'app-cfe-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 sm:p-6 animate-fade-in font-sans">
      
      <!-- Fondo oscuro backdrop -->
      <div
        (click)="closeModal()"
        class="fixed inset-0 bg-slate-950/85 backdrop-blur-sm transition-opacity"
      ></div>

      <!-- Contenedor del Modal Kiosco -->
      <div class="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden z-10 my-8">
        
        <!-- Header con Identidad CFE -->
        <div class="bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-900 p-6 border-b border-slate-800 flex items-center justify-between">
          <div class="flex items-center gap-3.5">
            <div class="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center p-2 shadow-inner">
              <img src="/assets/images/services/cfe.png" alt="CFE" class="w-full h-full object-contain" />
            </div>
            <div>
              <div class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-wider">
                <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                Servicio en Línea
              </div>
              <h2 class="text-xl font-black text-white tracking-tight">Pago de Luz CFE</h2>
            </div>
          </div>

          <button
            type="button"
            (click)="closeModal()"
            class="w-10 h-10 rounded-2xl text-slate-400 hover:text-white hover:bg-slate-800 flex items-center justify-center transition-colors cursor-pointer"
          >
            <i class="fas fa-xmark text-lg"></i>
          </button>
        </div>

        <!-- Cuerpo del Modal según el Paso -->
        <div class="p-6 sm:p-8 space-y-6">

          <!-- Mensaje de Error si ocurre -->
          @if (errorMessage()) {
            <div class="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-3 animate-fade-in">
              <i class="fas fa-circle-exclamation text-base text-rose-400 shrink-0"></i>
              <span>{{ errorMessage() }}</span>
            </div>
          }

          <!-- PASO 1: Consulta de Número de Servicio -->
          @if (currentStep() === 'input') {
            <div class="space-y-5">
              <div>
                <label class="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Número de Servicio CFE
                </label>
                <div class="relative">
                  <input
                    type="text"
                    inputmode="numeric"
                    [(ngModel)]="serviceNumber"
                    (input)="onNumberInput()"
                    placeholder="Ej. 012345678901 (12 dígitos)"
                    maxlength="30"
                    class="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-2xl px-4 py-3.5 text-white font-mono text-lg tracking-widest outline-none transition-all placeholder:text-slate-600 shadow-inner"
                  />
                  @if (serviceNumber().length > 0) {
                    <button
                      type="button"
                      (click)="clearNumber()"
                      class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white p-1 text-sm"
                    >
                      <i class="fas fa-circle-xmark"></i>
                    </button>
                  }
                </div>
                <p class="text-[11px] text-slate-500 mt-1.5 flex items-center gap-1.5">
                  <i class="fas fa-circle-info text-emerald-400"></i>
                  Encuentra este número en la parte superior o sobre el código de barras de tu recibo.
                </p>
              </div>

              <!-- Teclado Numérico Táctil Rápido para Kiosco -->
              <div class="grid grid-cols-3 gap-2 pt-2">
                @for (key of keypadKeys; track key) {
                  <button
                    type="button"
                    (click)="pressKey(key)"
                    class="py-3 rounded-2xl bg-slate-950 border border-slate-800 hover:border-emerald-500/40 hover:bg-slate-800/80 text-white font-mono text-lg font-black active:scale-95 transition-all shadow-sm cursor-pointer"
                  >
                    @if (key === 'del') {
                      <i class="fas fa-delete-left text-sm text-slate-400"></i>
                    } @else {
                      {{ key }}
                    }
                  </button>
                }
              </div>

              <!-- Botón Consultar Recibo -->
              <div class="pt-3">
                <button
                  type="button"
                  (click)="consultarRecibo()"
                  [disabled]="isConsulting() || serviceNumber().length < 10"
                  class="w-full py-4 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black text-sm uppercase tracking-wider shadow-lg shadow-emerald-600/30 hover:shadow-emerald-600/50 hover:-translate-y-0.5 transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  @if (isConsulting()) {
                    <i class="fas fa-spinner fa-spin text-base"></i>
                    <span>Consultando con CFE...</span>
                  } @else {
                    <i class="fas fa-magnifying-glass text-sm"></i>
                    <span>Consultar Adeudo y Pagar</span>
                  }
                </button>
              </div>
            </div>
          }

          <!-- PASO 2: Confirmación de Adeudo y Selección de Pago -->
          @if (currentStep() === 'confirm' && checkResult()) {
            <div class="space-y-6">
              
              <!-- Tarjeta Resumen Recibo -->
              <div class="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
                <div class="flex items-center justify-between border-b border-slate-800/80 pb-3">
                  <div>
                    <div class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Número de Servicio</div>
                    <div class="text-sm font-mono font-bold text-emerald-400">{{ checkResult()?.service_number }}</div>
                  </div>
                  <div class="text-right">
                    <div class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Titular</div>
                    <div class="text-xs font-bold text-white">{{ checkResult()?.titular }}</div>
                  </div>
                </div>

                <!-- Campo Editable de Monto a Pagar -->
                <div class="space-y-2 pt-1">
                  <div class="flex items-center justify-between">
                    <label class="text-xs font-bold text-slate-300 uppercase tracking-wider">
                      Monto de tu Recibo CFE ($)
                    </label>
                    <span class="text-[10px] text-emerald-400 font-semibold">
                      <i class="fas fa-pen text-[9px] mr-1"></i>Puedes ajustarlo según tu recibo
                    </span>
                  </div>

                  <div class="relative">
                    <span class="absolute left-4 top-1/2 -translate-y-1/2 font-mono text-xl font-black text-slate-500">$</span>
                    <input
                      type="number"
                      step="0.50"
                      min="1"
                      [(ngModel)]="customAmount"
                      class="w-full bg-slate-900 border border-slate-700 focus:border-emerald-500 rounded-2xl pl-9 pr-4 py-3 text-white font-mono text-xl font-black outline-none transition-all shadow-inner"
                      placeholder="0.00"
                    />
                  </div>

                  <!-- Botones de Acceso Rápido de Monto -->
                  <div class="flex gap-1.5 pt-1">
                    @for (preset of [100, 200, 350, 500, 800]; track preset) {
                      <button
                        type="button"
                        (click)="setPresetAmount(preset)"
                        class="flex-1 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-[11px] font-mono font-bold text-slate-300 hover:text-white border border-slate-700 transition-all cursor-pointer"
                      >
                        \${{ preset }}
                      </button>
                    }
                  </div>
                </div>

                <!-- Desglose de Totales -->
                <div class="space-y-2 text-xs pt-3 border-t border-slate-800/80">
                  <div class="flex justify-between text-slate-400">
                    <span>Importe del Recibo</span>
                    <span class="font-mono text-white font-bold">{{ customAmount() | currency:'MXN':'symbol':'1.2-2' }}</span>
                  </div>
                  <div class="flex justify-between text-slate-400">
                    <span>Comisión de Servicio Kiosco</span>
                    <span class="font-mono text-amber-400 font-bold">+{{ commission | currency:'MXN':'symbol':'1.2-2' }}</span>
                  </div>
                  <div class="flex justify-between text-sm font-bold text-white pt-2 border-t border-slate-800">
                    <span class="text-emerald-400">Total a Pagar</span>
                    <span class="font-mono text-emerald-400 text-lg">{{ computedTotal() | currency:'MXN':'symbol':'1.2-2' }}</span>
                  </div>
                </div>
              </div>

              <!-- Selector Método de Pago -->
              <div>
                <label class="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2.5">
                  Método de Pago
                </label>
                <div class="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    (click)="selectedMethod.set('cash')"
                    [class.border-emerald-500]="selectedMethod() === 'cash'"
                    [class.bg-emerald-500-10]="selectedMethod() === 'cash'"
                    class="p-4 rounded-2xl bg-slate-950 border border-slate-800 hover:border-slate-700 text-left transition-all cursor-pointer flex flex-col justify-between gap-3"
                  >
                    <div class="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-sm font-bold">
                      <i class="fas fa-money-bill-wave"></i>
                    </div>
                    <div>
                      <div class="text-xs font-bold text-white">Efectivo / Monedero</div>
                      <div class="text-[10px] text-slate-400">Dispensador de billetes</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    (click)="selectedMethod.set('card')"
                    [class.border-emerald-500]="selectedMethod() === 'card'"
                    [class.bg-emerald-500-10]="selectedMethod() === 'card'"
                    class="p-4 rounded-2xl bg-slate-950 border border-slate-800 hover:border-slate-700 text-left transition-all cursor-pointer flex flex-col justify-between gap-3"
                  >
                    <div class="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-sm font-bold">
                      <i class="fas fa-credit-card"></i>
                    </div>
                    <div>
                      <div class="text-xs font-bold text-white">Tarjeta Bancaria</div>
                      <div class="text-[10px] text-slate-400">Terminal Mercado Pago Point</div>
                    </div>
                  </button>
                </div>
              </div>

              <!-- Acciones Paso 2 -->
              <div class="flex gap-3 pt-2">
                <button
                  type="button"
                  (click)="currentStep.set('input')"
                  class="flex-1 py-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
                >
                  Regresar
                </button>
                <button
                  type="button"
                  (click)="pagarRecibo()"
                  [disabled]="isPaying() || customAmount() <= 0"
                  class="flex-[2] py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-emerald-600/30 transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  @if (isPaying()) {
                    <i class="fas fa-spinner fa-spin text-sm"></i>
                    <span>Procesando Pago...</span>
                  } @else {
                    <i class="fas fa-bolt text-amber-400"></i>
                    <span>Pagar {{ computedTotal() | currency:'MXN':'symbol':'1.2-2' }}</span>
                  }
                </button>
              </div>

            </div>
          }

          <!-- PASO 3: Ticket Digital & Éxito -->
          @if (currentStep() === 'success' && payResult()) {
            <div class="space-y-6 text-center animate-fade-in">
              
              <div class="w-16 h-16 rounded-3xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 mx-auto flex items-center justify-center text-3xl shadow-xl shadow-emerald-500/10">
                <i class="fas fa-check"></i>
              </div>

              <div class="space-y-1">
                <h3 class="text-xl font-black text-white">¡Pago CFE Exitoso!</h3>
                <p class="text-xs text-slate-400">Tu recibo de electricidad ha sido liquidado correctamente.</p>
              </div>

              <!-- Ticket Digital Estilizado -->
              <div class="p-5 rounded-2xl bg-slate-950 border border-slate-800 text-left font-mono space-y-3 text-xs shadow-inner">
                <div class="flex justify-between items-center border-b border-dashed border-slate-800 pb-2.5">
                  <span class="text-slate-400">Folio Transacción</span>
                  <span class="text-emerald-400 font-bold">{{ payResult()?.folio }}</span>
                </div>
                <div class="flex justify-between text-slate-400">
                  <span>No. Servicio CFE</span>
                  <span class="text-white">{{ payResult()?.service_number }}</span>
                </div>
                <div class="flex justify-between text-slate-400">
                  <span>Importe Servicio</span>
                  <span class="text-white">{{ payResult()?.amount | currency:'MXN':'symbol':'1.2-2' }}</span>
                </div>
                <div class="flex justify-between text-slate-400">
                  <span>Comisión Kiosco</span>
                  <span class="text-white">{{ payResult()?.commission | currency:'MXN':'symbol':'1.2-2' }}</span>
                </div>
                <div class="flex justify-between text-white font-bold border-t border-dashed border-slate-800 pt-2 text-sm">
                  <span class="text-emerald-400">Total Cobrado</span>
                  <span class="text-emerald-400">{{ payResult()?.total | currency:'MXN':'symbol':'1.2-2' }}</span>
                </div>
                <div class="flex justify-between text-[11px] text-slate-500 pt-1">
                  <span>Fecha</span>
                  <span>{{ payResult()?.date }}</span>
                </div>
              </div>

              <!-- Botones Finales -->
              <div class="flex gap-3 pt-2">
                <button
                  type="button"
                  (click)="printTicket()"
                  class="flex-1 py-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <i class="fas fa-print"></i>
                  <span>Imprimir Ticket</span>
                </button>
                <button
                  type="button"
                  (click)="closeModal()"
                  class="flex-1 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-emerald-600/30 transition-all cursor-pointer"
                >
                  Finalizar
                </button>
              </div>

            </div>
          }

        </div>

      </div>

    </div>
  `,
  styles: [`
    .bg-emerald-500-10 {
      background-color: rgba(16, 185, 129, 0.1);
    }
  `]
})
export class CfeModalComponent {
  @Output() close = new EventEmitter<void>();

  private digitalServices = inject(DigitalServicesService);

  currentStep = signal<'input' | 'confirm' | 'success'>('input');
  serviceNumber = signal<string>('');
  customAmount = signal<number>(185);
  readonly commission = 12.00;

  selectedMethod = signal<'cash' | 'card'>('cash');

  isConsulting = signal<boolean>(false);
  isPaying = signal<boolean>(false);
  errorMessage = signal<string | null>(null);

  checkResult = signal<CfeCheckResult | null>(null);
  payResult = signal<CfePayResult | null>(null);

  readonly keypadKeys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '00', 'del'];

  computedTotal = computed(() => {
    const amt = Number(this.customAmount()) || 0;
    return amt > 0 ? amt + this.commission : 0;
  });

  onNumberInput(): void {
    const clean = this.serviceNumber().replace(/\D/g, '');
    this.serviceNumber.set(clean);
  }

  pressKey(key: string): void {
    if (key === 'del') {
      const current = this.serviceNumber();
      if (current.length > 0) {
        this.serviceNumber.set(current.slice(0, -1));
      }
    } else {
      if (this.serviceNumber().length < 30) {
        this.serviceNumber.set(this.serviceNumber() + key);
      }
    }
  }

  clearNumber(): void {
    this.serviceNumber.set('');
  }

  setPresetAmount(amount: number): void {
    this.customAmount.set(amount);
  }

  async consultarRecibo(): Promise<void> {
    this.errorMessage.set(null);
    this.isConsulting.set(true);

    try {
      const res = await this.digitalServices.checkCfeBalance(this.serviceNumber());
      if (res && res.success) {
        this.checkResult.set(res);
        this.customAmount.set(res.amount > 0 ? res.amount : 185);
        this.currentStep.set('confirm');
      } else {
        this.errorMessage.set('No se pudo encontrar adeudo para este número de servicio.');
      }
    } catch (e: any) {
      this.errorMessage.set(e?.error?.message || e?.message || 'Error al consultar recibo CFE.');
    } finally {
      this.isConsulting.set(false);
    }
  }

  async pagarRecibo(): Promise<void> {
    const check = this.checkResult();
    const amountToPay = Number(this.customAmount());
    if (!check || amountToPay <= 0) return;

    this.errorMessage.set(null);
    this.isPaying.set(true);

    try {
      const res = await this.digitalServices.payCfe(
        check.service_number,
        amountToPay,
        this.selectedMethod()
      );

      if (res && res.success) {
        this.payResult.set(res);
        this.currentStep.set('success');
      } else {
        this.errorMessage.set(res?.message || 'Error al procesar el pago.');
      }
    } catch (e: any) {
      this.errorMessage.set(e?.error?.message || e?.message || 'Error de conexión al procesar pago CFE.');
    } finally {
      this.isPaying.set(false);
    }
  }

  printTicket(): void {
    window.print();
  }

  closeModal(): void {
    this.close.emit();
  }
}
