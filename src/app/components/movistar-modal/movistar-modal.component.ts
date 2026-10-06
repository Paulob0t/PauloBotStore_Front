import { Component, EventEmitter, OnInit, Output, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  DigitalServicesService,
  MovistarPackage,
  MovistarPackagesResponse,
  MovistarRechargeResult
} from '../../core/services/digital-services.service';

@Component({
  selector: 'app-movistar-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 sm:p-6 animate-fade-in font-sans">
      
      <!-- Backdrop -->
      <div
        (click)="closeModal()"
        class="fixed inset-0 bg-slate-950/85 backdrop-blur-sm transition-opacity"
      ></div>

      <!-- Contenedor del Modal Kiosco -->
      <div class="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden z-10 my-8">
        
        <!-- Header con Identidad Movistar -->
        <div class="bg-gradient-to-r from-sky-950 via-slate-900 to-slate-900 p-6 border-b border-slate-800 flex items-center justify-between">
          <div class="flex items-center gap-3.5">
            <div class="w-12 h-12 rounded-2xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center p-2 shadow-inner">
              <img src="/assets/images/services/movistar.png" alt="Movistar" class="w-full h-full object-contain" />
            </div>
            <div>
              <div class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-400 text-[10px] font-black uppercase tracking-wider">
                <span class="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse"></span>
                Recargas en Línea
              </div>
              <h2 class="text-xl font-black text-white tracking-tight">Recargas Movistar</h2>
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

        <!-- Cuerpo del Modal -->
        <div class="p-6 sm:p-8 space-y-6">

          <!-- Error Alert -->
          @if (errorMessage()) {
            <div class="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-3 animate-fade-in">
              <i class="fas fa-circle-exclamation text-base text-rose-400 shrink-0"></i>
              <span>{{ errorMessage() }}</span>
            </div>
          }

          <!-- PASO 1: Ingreso de Número Celular -->
          @if (currentStep() === 'phone') {
            <div class="space-y-5">
              <div>
                <label class="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Número Celular Movistar (10 dígitos)
                </label>
                <div class="relative">
                  <input
                    type="tel"
                    inputmode="numeric"
                    [(ngModel)]="phoneNumber"
                    (input)="onPhoneInput()"
                    placeholder="Ej. 5512345678"
                    maxlength="10"
                    class="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 rounded-2xl px-4 py-3.5 text-white font-mono text-xl tracking-widest outline-none transition-all placeholder:text-slate-600 shadow-inner"
                  />
                  @if (phoneNumber().length > 0) {
                    <button
                      type="button"
                      (click)="clearPhone()"
                      class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white p-1 text-sm"
                    >
                      <i class="fas fa-circle-xmark"></i>
                    </button>
                  }
                </div>
                <div class="flex justify-between text-[11px] text-slate-500 mt-1.5">
                  <span>Introduce tu número celular a 10 dígitos.</span>
                  <span [class.text-sky-400]="phoneNumber().length === 10" class="font-mono font-bold">
                    {{ phoneNumber().length }}/10
                  </span>
                </div>
              </div>

              <!-- Teclado Numérico Kiosco -->
              <div class="grid grid-cols-3 gap-2 pt-2">
                @for (key of keypadKeys; track key) {
                  <button
                    type="button"
                    (click)="pressKey(key)"
                    class="py-3 rounded-2xl bg-slate-950 border border-slate-800 hover:border-sky-500/40 hover:bg-slate-800/80 text-white font-mono text-lg font-black active:scale-95 transition-all shadow-sm cursor-pointer"
                  >
                    @if (key === 'del') {
                      <i class="fas fa-delete-left text-sm text-slate-400"></i>
                    } @else {
                      {{ key }}
                    }
                  </button>
                }
              </div>

              <!-- Botón Continuar -->
              <div class="pt-3">
                <button
                  type="button"
                  (click)="goToPackages()"
                  [disabled]="phoneNumber().length !== 10"
                  class="w-full py-4 px-6 rounded-2xl bg-sky-600 hover:bg-sky-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black text-sm uppercase tracking-wider shadow-lg shadow-sky-600/30 hover:shadow-sky-600/50 hover:-translate-y-0.5 transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>Seleccionar Paquete / Monto</span>
                  <i class="fas fa-arrow-right text-xs"></i>
                </button>
              </div>
            </div>
          }

          <!-- PASO 2: Selección de Paquete (Tiempo Aire / Datos) -->
          @if (currentStep() === 'package') {
            <div class="space-y-5">
              
              <!-- Teléfono activo bar -->
              <div class="flex items-center justify-between p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
                <div class="flex items-center gap-2.5">
                  <div class="w-7 h-7 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center text-xs">
                    <i class="fas fa-mobile-screen"></i>
                  </div>
                  <span class="text-sm font-mono font-bold text-white tracking-wider">{{ phoneNumber() }}</span>
                </div>
                <button
                  type="button"
                  (click)="currentStep.set('phone')"
                  class="text-xs text-sky-400 hover:underline font-bold"
                >
                  Cambiar
                </button>
              </div>

              <!-- Pestañas de Categoría -->
              <div class="flex gap-2 p-1 rounded-2xl bg-slate-950 border border-slate-800">
                <button
                  type="button"
                  (click)="activeTab.set('tiempo_aire')"
                  [class.bg-sky-600]="activeTab() === 'tiempo_aire'"
                  [class.text-white]="activeTab() === 'tiempo_aire'"
                  [class.text-slate-400]="activeTab() !== 'tiempo_aire'"
                  class="flex-1 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all cursor-pointer"
                >
                  Tiempo Aire
                </button>
                <button
                  type="button"
                  (click)="activeTab.set('datos')"
                  [class.bg-sky-600]="activeTab() === 'datos'"
                  [class.text-white]="activeTab() === 'datos'"
                  [class.text-slate-400]="activeTab() !== 'datos'"
                  class="flex-1 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all cursor-pointer"
                >
                  Paquetes Internet
                </button>
              </div>

              <!-- Grid de Paquetes -->
              <div class="max-h-64 overflow-y-auto pr-1 grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                @for (pkg of currentPackages(); track pkg.sku) {
                  <button
                    type="button"
                    (click)="selectPackage(pkg)"
                    [class.border-sky-500]="selectedPackage()?.sku === pkg.sku"
                    [class.bg-sky-500-10]="selectedPackage()?.sku === pkg.sku"
                    class="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 hover:border-slate-700 text-left transition-all cursor-pointer flex flex-col justify-between gap-2 active:scale-95"
                  >
                    <div>
                      <div class="text-lg font-mono font-black text-white">\${{ pkg.amount }}</div>
                      <div class="text-[11px] font-bold text-sky-400 line-clamp-1">{{ pkg.name }}</div>
                    </div>
                    @if (pkg.beneficio) {
                      <div class="text-[10px] text-slate-400 line-clamp-2 leading-tight">{{ pkg.beneficio }}</div>
                    } @else if (pkg.vigencia) {
                      <div class="text-[10px] text-slate-400">Vigencia: {{ pkg.vigencia }}</div>
                    }
                  </button>
                }
              </div>

              <!-- Selector de Método de Pago y Total -->
              @if (selectedPackage()) {
                <div class="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 pt-3">
                  <div class="flex justify-between items-center text-xs">
                    <span class="text-slate-400">Total a Pagar (Sin comisión):</span>
                    <span class="text-base font-mono font-black text-emerald-400">\${{ selectedPackage()?.amount?.toFixed(2) }}</span>
                  </div>

                  <!-- Métodos de Pago -->
                  <div class="grid grid-cols-2 gap-2 pt-1">
                    <button
                      type="button"
                      (click)="selectedMethod.set('cash')"
                      [class.border-sky-500]="selectedMethod() === 'cash'"
                      class="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-left flex items-center gap-2 cursor-pointer"
                    >
                      <i class="fas fa-money-bill text-emerald-400"></i>
                      <span class="text-xs font-bold text-white">Efectivo</span>
                    </button>
                    <button
                      type="button"
                      (click)="selectedMethod.set('card')"
                      [class.border-sky-500]="selectedMethod() === 'card'"
                      class="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-left flex items-center gap-2 cursor-pointer"
                    >
                      <i class="fas fa-credit-card text-sky-400"></i>
                      <span class="text-xs font-bold text-white">Tarjeta</span>
                    </button>
                  </div>

                  <button
                    type="button"
                    (click)="pagarRecarga()"
                    [disabled]="isPaying()"
                    class="w-full py-3.5 rounded-2xl bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-sky-600/30 transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    @if (isPaying()) {
                      <i class="fas fa-spinner fa-spin"></i>
                      <span>Procesando Recarga...</span>
                    } @else {
                      <i class="fas fa-bolt"></i>
                      <span>Recargar \${{ selectedPackage()?.amount }} Ahora</span>
                    }
                  </button>
                </div>
              }

            </div>
          }

          <!-- PASO 3: Éxito y Ticket -->
          @if (currentStep() === 'success' && rechargeResult()) {
            <div class="space-y-6 text-center animate-fade-in">
              
              <div class="w-16 h-16 rounded-3xl bg-sky-500/20 text-sky-400 border border-sky-500/30 mx-auto flex items-center justify-center text-3xl shadow-xl shadow-sky-500/10">
                <i class="fas fa-check"></i>
              </div>

              <div class="space-y-1">
                <h3 class="text-xl font-black text-white">¡Recarga Movistar Exitosa!</h3>
                <p class="text-xs text-slate-400">El saldo o paquete ha sido abonado a tu línea.</p>
              </div>

              <!-- Ticket Digital -->
              <div class="p-5 rounded-2xl bg-slate-950 border border-slate-800 text-left font-mono space-y-3 text-xs shadow-inner">
                <div class="flex justify-between items-center border-b border-dashed border-slate-800 pb-2.5">
                  <span class="text-slate-400">Folio Transacción</span>
                  <span class="text-sky-400 font-bold">{{ rechargeResult()?.folio }}</span>
                </div>
                <div class="flex justify-between text-slate-400">
                  <span>Número Celular</span>
                  <span class="text-white">{{ rechargeResult()?.phone_number }}</span>
                </div>
                <div class="flex justify-between text-slate-400">
                  <span>Monto Recargado</span>
                  <span class="text-white">\${{ rechargeResult()?.amount?.toFixed(2) }}</span>
                </div>
                <div class="flex justify-between text-slate-400">
                  <span>Comisión</span>
                  <span class="text-emerald-400 font-bold">GRATIS ($0.00)</span>
                </div>
                <div class="flex justify-between text-white font-bold border-t border-dashed border-slate-800 pt-2 text-sm">
                  <span class="text-sky-400">Total Pagado</span>
                  <span class="text-sky-400">\${{ rechargeResult()?.total?.toFixed(2) }}</span>
                </div>
                <div class="flex justify-between text-[11px] text-slate-500 pt-1">
                  <span>Fecha</span>
                  <span>{{ rechargeResult()?.date }}</span>
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
                  class="flex-1 py-3.5 rounded-2xl bg-sky-600 hover:bg-sky-500 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-sky-600/30 transition-all cursor-pointer"
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
    .bg-sky-500-10 {
      background-color: rgba(1, 157, 244, 0.1);
    }
  `]
})
export class MovistarModalComponent implements OnInit {
  @Output() close = new EventEmitter<void>();

  private digitalServices = inject(DigitalServicesService);

  currentStep = signal<'phone' | 'package' | 'success'>('phone');
  phoneNumber = signal<string>('');
  activeTab = signal<'tiempo_aire' | 'datos'>('tiempo_aire');

  packages = signal<MovistarPackagesResponse>({ tiempo_aire: [], datos: [] });
  selectedPackage = signal<MovistarPackage | null>(null);
  selectedMethod = signal<'cash' | 'card'>('cash');

  isPaying = signal<boolean>(false);
  errorMessage = signal<string | null>(null);
  rechargeResult = signal<MovistarRechargeResult | null>(null);

  readonly keypadKeys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', 'del'];

  currentPackages = () => {
    return this.activeTab() === 'tiempo_aire'
      ? this.packages().tiempo_aire
      : this.packages().datos;
  };

  async ngOnInit(): Promise<void> {
    try {
      const pkgs = await this.digitalServices.getMovistarPackages();
      if (pkgs) {
        this.packages.set(pkgs);
      }
    } catch (e) {
      console.error('Error cargando paquetes Movistar:', e);
    }
  }

  onPhoneInput(): void {
    const clean = this.phoneNumber().replace(/\D/g, '').slice(0, 10);
    this.phoneNumber.set(clean);
  }

  pressKey(key: string): void {
    if (key === 'del') {
      const curr = this.phoneNumber();
      if (curr.length > 0) this.phoneNumber.set(curr.slice(0, -1));
    } else {
      if (this.phoneNumber().length < 10) {
        this.phoneNumber.set(this.phoneNumber() + key);
      }
    }
  }

  clearPhone(): void {
    this.phoneNumber.set('');
  }

  goToPackages(): void {
    if (this.phoneNumber().length === 10) {
      this.errorMessage.set(null);
      this.currentStep.set('package');
    }
  }

  selectPackage(pkg: MovistarPackage): void {
    this.selectedPackage.set(pkg);
  }

  async pagarRecarga(): Promise<void> {
    const pkg = this.selectedPackage();
    if (!pkg) return;

    this.errorMessage.set(null);
    this.isPaying.set(true);

    try {
      const res = await this.digitalServices.rechargeMovistar(
        this.phoneNumber(),
        pkg.sku,
        pkg.amount,
        this.selectedMethod()
      );

      if (res && res.success) {
        this.rechargeResult.set(res);
        this.currentStep.set('success');
      } else {
        this.errorMessage.set(res?.message || 'Error al procesar la recarga.');
      }
    } catch (e: any) {
      this.errorMessage.set(e?.error?.message || e?.message || 'Error de conexión al procesar recarga.');
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
