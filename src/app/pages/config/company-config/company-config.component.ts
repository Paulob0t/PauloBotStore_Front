import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CompanyConfigService } from '../../../core/services/company-config.service';
import { UpdateCompanyConfigRequest } from '../../../api/models';

@Component({
  selector: 'app-company-config',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-8 animate-fade-in max-w-7xl mx-auto">
      
      <!-- Header Superior -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 flex items-center justify-center text-2xl shadow-lg shadow-indigo-600/20">
            <i class="fas fa-building"></i>
          </div>
          <div>
            <h1 class="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Configuración de Empresa
            </h1>
            <p class="text-xs sm:text-sm text-slate-400 mt-1">
              Personalización de datos fiscales, comerciales y formato del ticket de venta.
            </p>
          </div>
        </div>

        <div class="flex items-center gap-3">
          <button
            type="button"
            (click)="saveConfig()"
            [disabled]="isSaving() || !form.nombre_empresa.trim()"
            class="inline-flex items-center gap-2 px-6 py-3 rounded-2xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-600/30 hover:shadow-indigo-600/50 hover:-translate-y-0.5 transition-all cursor-pointer disabled:opacity-50"
          >
            @if (isSaving()) {
              <i class="fas fa-spinner fa-spin"></i>
              <span>Guardando...</span>
            } @else {
              <i class="fas fa-save"></i>
              <span>Guardar Cambios</span>
            }
          </button>

          <button
            type="button"
            (click)="resetForm()"
            [disabled]="isLoading() || isSaving()"
            class="inline-flex items-center gap-2 px-4 py-3 rounded-2xl text-xs font-semibold text-slate-300 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer disabled:opacity-50"
            title="Restaurar valores originales"
          >
            <i class="fas fa-arrows-rotate" [class.fa-spin]="isLoading()"></i>
            <span class="hidden sm:inline">Recargar</span>
          </button>
        </div>
      </div>

      <!-- Alertas de Estado -->
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

      <!-- Contenido Principal en 2 Columnas -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        <!-- Columna Izquierda: Formulario de Datos (7 columnas) -->
        <div class="lg:col-span-7 bg-slate-900/90 border border-slate-800/90 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          <div class="border-b border-slate-800 pb-4">
            <h2 class="text-base font-bold text-white flex items-center gap-2">
              <i class="fas fa-sliders text-indigo-400"></i>
              <span>Datos Comerciales y Fiscales</span>
            </h2>
            <p class="text-xs text-slate-400 mt-0.5">
              Esta información se reflejará en el encabezado y pie de todos los comprobantes emitidos.
            </p>
          </div>

          <div class="space-y-5">
            <!-- Nombre de la Empresa -->
            <div>
              <label for="nombreEmpresa" class="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                Nombre de la Empresa / Marca <span class="text-rose-400">*</span>
              </label>
              <div class="relative">
                <span class="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500 pointer-events-none">
                  <i class="fas fa-store"></i>
                </span>
                <input
                  id="nombreEmpresa"
                  type="text"
                  [(ngModel)]="form.nombre_empresa"
                  placeholder="Ej: PauloBot Store"
                  class="w-full pl-10 pr-4 py-3 bg-slate-950/60 border border-slate-800 rounded-2xl text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-semibold"
                />
              </div>
            </div>

            <!-- RFC & Teléfono -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label for="rfcInput" class="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                  RFC / Identificación Fiscal
                </label>
                <div class="relative">
                  <span class="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500 pointer-events-none">
                    <i class="fas fa-id-card"></i>
                  </span>
                  <input
                    id="rfcInput"
                    type="text"
                    [(ngModel)]="form.rfc"
                    placeholder="XAXX010101000"
                    maxlength="15"
                    class="w-full pl-10 pr-4 py-3 bg-slate-950/60 border border-slate-800 rounded-2xl text-slate-100 placeholder-slate-500 text-sm uppercase focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-mono"
                  />
                </div>
              </div>

              <div>
                <label for="telefonoInput" class="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                  Teléfono de Contacto
                </label>
                <div class="relative">
                  <span class="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500 pointer-events-none">
                    <i class="fas fa-phone"></i>
                  </span>
                  <input
                    id="telefonoInput"
                    type="text"
                    [(ngModel)]="form.telefono"
                    placeholder="477-123-4567"
                    class="w-full pl-10 pr-4 py-3 bg-slate-950/60 border border-slate-800 rounded-2xl text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                  />
                </div>
              </div>
            </div>

            <!-- Dirección -->
            <div>
              <label for="direccionInput" class="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                Dirección Comercial
              </label>
              <div class="relative">
                <span class="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500 pointer-events-none">
                  <i class="fas fa-location-dot"></i>
                </span>
                <input
                  id="direccionInput"
                  type="text"
                  [(ngModel)]="form.direccion"
                  placeholder="Calle Principal #123, Col. Centro"
                  class="w-full pl-10 pr-4 py-3 bg-slate-950/60 border border-slate-800 rounded-2xl text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                />
              </div>
            </div>

            <!-- Ciudad & Estado -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label for="ciudadInput" class="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                  Ciudad
                </label>
                <input
                  id="ciudadInput"
                  type="text"
                  [(ngModel)]="form.ciudad"
                  placeholder="León"
                  class="w-full px-4 py-3 bg-slate-950/60 border border-slate-800 rounded-2xl text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                />
              </div>

              <div>
                <label for="estadoInput" class="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                  Estado
                </label>
                <input
                  id="estadoInput"
                  type="text"
                  [(ngModel)]="form.estado"
                  placeholder="Guanajuato"
                  class="w-full px-4 py-3 bg-slate-950/60 border border-slate-800 rounded-2xl text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                />
              </div>
            </div>

            <!-- Email & Website -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label for="emailInput" class="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                  Correo Electrónico
                </label>
                <div class="relative">
                  <span class="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500 pointer-events-none">
                    <i class="fas fa-envelope"></i>
                  </span>
                  <input
                    id="emailInput"
                    type="email"
                    [(ngModel)]="form.email"
                    placeholder="contacto@paulobot.store"
                    class="w-full pl-10 pr-4 py-3 bg-slate-950/60 border border-slate-800 rounded-2xl text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                  />
                </div>
              </div>

              <div>
                <label for="websiteInput" class="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                  Sitio Web
                </label>
                <div class="relative">
                  <span class="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500 pointer-events-none">
                    <i class="fas fa-globe"></i>
                  </span>
                  <input
                    id="websiteInput"
                    type="text"
                    [(ngModel)]="form.website"
                    placeholder="https://paulobot.store"
                    class="w-full pl-10 pr-4 py-3 bg-slate-950/60 border border-slate-800 rounded-2xl text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                  />
                </div>
              </div>
            </div>

            <!-- Leyenda de Pie de Ticket -->
            <div>
              <label for="mensajeTicketInput" class="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                Mensaje al Pie del Ticket
              </label>
              <textarea
                id="mensajeTicketInput"
                rows="2"
                [(ngModel)]="form.mensaje_ticket"
                placeholder="¡GRACIAS POR SU COMPRA! VUELVA PRONTO"
                class="w-full px-4 py-3 bg-slate-950/60 border border-slate-800 rounded-2xl text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-sans"
              ></textarea>
            </div>
          </div>
        </div>

        <!-- Columna Derecha: Live Ticket Thermal Preview (5 columnas) -->
        <div class="lg:col-span-5 space-y-4 sticky top-28">
          <div class="flex items-center justify-between px-1">
            <span class="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <i class="fas fa-receipt text-amber-400"></i>
              <span>Vista Previa del Ticket Térmico</span>
            </span>
            <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
              80mm Formato POS
            </span>
          </div>

          <!-- Ticket POS Simulador -->
          <div class="bg-amber-50/95 text-slate-900 rounded-3xl p-6 sm:p-7 font-mono shadow-2xl border border-amber-200/40 relative overflow-hidden">
            <!-- Dientes de corte de papel simulados arriba -->
            <div class="absolute -top-1.5 left-0 right-0 flex justify-between overflow-hidden opacity-60">
              <span class="text-xs font-mono text-slate-950 tracking-widest select-none">▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲</span>
            </div>

            <!-- Encabezado del Ticket -->
            <div class="text-center space-y-1 pb-3">
              <div class="text-base font-black tracking-tight uppercase text-slate-950">
                {{ form.nombre_empresa || 'PAULOBOT STORE' }}
              </div>
              @if (form.rfc) {
                <div class="text-[11px] text-slate-700 font-semibold">RFC: {{ form.rfc }}</div>
              }
              @if (form.direccion) {
                <div class="text-[11px] text-slate-700">{{ form.direccion }}</div>
              }
              @if (form.ciudad || form.estado) {
                <div class="text-[11px] text-slate-700">
                  {{ form.ciudad }} {{ form.estado ? ', ' + form.estado : '' }}
                </div>
              }
              @if (form.telefono) {
                <div class="text-[11px] text-slate-700">TEL: {{ form.telefono }}</div>
              }
              @if (form.website) {
                <div class="text-[10px] text-slate-600 underline">{{ form.website }}</div>
              }
            </div>

            <!-- Línea Punteada -->
            <div class="border-t border-dashed border-slate-400 my-2"></div>

            <!-- Datos de Transacción Simulada -->
            <div class="text-[11px] space-y-0.5 text-slate-700">
              <div class="flex justify-between">
                <span>FOLIO: #VENTA-20260903-01</span>
                <span>CAJA: 01</span>
              </div>
              <div class="flex justify-between text-[10px] text-slate-600">
                <span>FECHA: {{ currentDate | date:'dd/MM/yyyy HH:mm' }}</span>
                <span>ATENDIÓ: ADMIN</span>
              </div>
            </div>

            <!-- Línea Punteada -->
            <div class="border-t border-dashed border-slate-400 my-2"></div>

            <!-- Items de Venta Ejemplo -->
            <div class="space-y-1 text-xs">
              <div class="flex justify-between items-start">
                <span class="font-bold">1x Coca Cola 600ml</span>
                <span>$25.00</span>
              </div>
              <div class="flex justify-between items-start">
                <span class="font-bold">2x Maruchan Pollo</span>
                <span>$36.00</span>
              </div>
            </div>

            <!-- Línea Punteada -->
            <div class="border-t border-dashed border-slate-400 my-2"></div>

            <!-- Totales -->
            <div class="space-y-0.5 text-xs text-slate-800">
              <div class="flex justify-between text-[11px]">
                <span>SUBTOTAL:</span>
                <span>$52.59</span>
              </div>
              <div class="flex justify-between text-[11px]">
                <span>IVA (16%):</span>
                <span>$8.41</span>
              </div>
              <div class="flex justify-between font-black text-sm text-slate-950 pt-1">
                <span>TOTAL:</span>
                <span>$61.00</span>
              </div>
              <div class="flex justify-between text-[10px] text-slate-600 pt-0.5">
                <span>MÉTODO DE PAGO:</span>
                <span class="font-bold">EFECTIVO</span>
              </div>
            </div>

            <!-- Línea Punteada -->
            <div class="border-t border-dashed border-slate-400 my-3"></div>

            <!-- Pie de Ticket y Leyenda Personalizada -->
            <div class="text-center space-y-2">
              <div class="text-[11px] font-bold uppercase tracking-wider text-slate-900">
                {{ form.mensaje_ticket || '¡GRACIAS POR SU COMPRA!' }}
              </div>
              <div class="text-[9px] text-slate-500">
                Conservar este comprobante para cualquier aclaración.
              </div>
              <div class="pt-1 text-[8px] text-slate-400 tracking-widest">
                *** SISTEMA VENDINGBOX / PAULOBOT ***
              </div>
            </div>

            <!-- Dientes de corte de papel simulados abajo -->
            <div class="absolute -bottom-1.5 left-0 right-0 flex justify-between overflow-hidden opacity-60">
              <span class="text-xs font-mono text-slate-950 tracking-widest select-none">▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  `
})
export class CompanyConfigComponent implements OnInit {
  currentDate = new Date();

  form: UpdateCompanyConfigRequest = {
    nombre_empresa: 'PauloBot Store',
    direccion: '',
    ciudad: '',
    estado: '',
    telefono: '',
    rfc: '',
    email: '',
    website: '',
    mensaje_ticket: '¡GRACIAS POR SU COMPRA!'
  };

  alertMessage = signal<string | null>(null);
  alertType = signal<'success' | 'error'>('success');

  get isLoading() {
    return this.configService.isLoading;
  }

  get isSaving() {
    return this.configService.isSaving;
  }

  constructor(private configService: CompanyConfigService) {}

  ngOnInit(): void {
    this.resetForm();
  }

  async resetForm(): Promise<void> {
    const cfg = await this.configService.loadConfig();
    if (cfg) {
      this.form = {
        nombre_empresa: cfg.nombre_empresa || 'PauloBot Store',
        direccion: cfg.direccion || '',
        ciudad: cfg.ciudad || '',
        estado: cfg.estado || '',
        telefono: cfg.telefono || '',
        rfc: cfg.rfc || '',
        email: cfg.email || '',
        website: cfg.website || '',
        mensaje_ticket: cfg.mensaje_ticket || '¡GRACIAS POR SU COMPRA!'
      };
    }
  }

  async saveConfig(): Promise<void> {
    if (!this.form.nombre_empresa.trim()) return;

    try {
      await this.configService.saveConfig({
        ...this.form,
        nombre_empresa: this.form.nombre_empresa.trim(),
        rfc: this.form.rfc ? this.form.rfc.toUpperCase().trim() : undefined
      });
      this.alertType.set('success');
      this.alertMessage.set('Configuración de empresa guardada exitosamente.');
    } catch (err: any) {
      this.alertType.set('error');
      this.alertMessage.set(err.message || 'Error al guardar la configuración.');
    }
  }
}
