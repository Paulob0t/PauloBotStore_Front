import { Component, EventEmitter, Input, OnInit, Output, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CartService, CheckoutResult } from '../../core/services/cart.service';

type CheckoutStep = 'review' | 'payment_card' | 'payment_cash' | 'processing' | 'ticket';

@Component({
  selector: 'app-checkout-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 sm:p-6 animate-fade-in font-sans">
      
      <!-- Backdrop -->
      <div
        (click)="step() !== 'processing' ? closeModal() : null"
        class="fixed inset-0 bg-slate-950/85 backdrop-blur-sm transition-opacity"
      ></div>

      <!-- Contenedor Principal del Modal -->
      <div class="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden z-10 my-8 flex flex-col max-h-[92vh]">
        
        <!-- Header -->
        <div class="bg-gradient-to-r from-indigo-950 via-slate-900 to-slate-900 p-5 sm:p-6 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div class="flex items-center gap-3.5">
            <div class="w-12 h-12 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400 text-xl shadow-inner">
              @switch (step()) {
                @case ('review') { <i class="fas fa-shopping-cart"></i> }
                @case ('payment_card') { <i class="fas fa-credit-card text-sky-400"></i> }
                @case ('payment_cash') { <i class="fas fa-coins text-amber-400"></i> }
                @case ('processing') { <i class="fas fa-spinner fa-spin text-indigo-400"></i> }
                @case ('ticket') { <i class="fas fa-receipt text-emerald-400"></i> }
              }
            </div>
            <div>
              <div class="text-[10px] font-bold uppercase tracking-wider text-indigo-400">
                @switch (step()) {
                  @case ('review') { <span>Revisión de Pedido</span> }
                  @case ('payment_card') { <span>Terminal de Tarjeta</span> }
                  @case ('payment_cash') { <span>Dispensador de Efectivo</span> }
                  @case ('processing') { <span>Procesando Venta</span> }
                  @case ('ticket') { <span>Comprobante Digital</span> }
                }
              </div>
              <h2 class="text-xl font-black text-white tracking-tight">
                @switch (step()) {
                  @case ('review') { <span>Tu Carrito de Compra</span> }
                  @case ('payment_card') { <span>Pago con Tarjeta Bancaria</span> }
                  @case ('payment_cash') { <span>Pago en Efectivo (Monedas y Billetes)</span> }
                  @case ('processing') { <span>Despachando Productos...</span> }
                  @case ('ticket') { <span>¡Compra Completada!</span> }
                }
              </h2>
            </div>
          </div>

          @if (step() !== 'processing') {
            <button
              type="button"
              (click)="closeModal()"
              class="w-10 h-10 rounded-2xl text-slate-400 hover:text-white hover:bg-slate-800 flex items-center justify-center transition-colors cursor-pointer"
            >
              <i class="fas fa-xmark text-lg"></i>
            </button>
          }
        </div>

        <!-- Cuerpo Dinámico según el Step -->
        <div class="p-6 overflow-y-auto space-y-6 flex-1">
          
          <!-- ============================================== -->
          <!-- STEP 1: REVISIÓN DEL CARRITO                    -->
          <!-- ============================================== -->
          @if (step() === 'review') {
            @if (cartItems().length === 0) {
              <div class="py-16 text-center text-slate-500">
                <i class="fas fa-shopping-basket text-5xl mb-3 block text-slate-600"></i>
                <h3 class="text-lg font-bold text-slate-300">El carrito está vacío</h3>
                <p class="text-xs text-slate-500 mt-1">Agrega productos desde la tienda para proceder al pago.</p>
              </div>
            } @else {
              <!-- Lista de Productos -->
              <div class="space-y-3">
                @for (item of cartItems(); track item.id_producto) {
                  <div class="p-3.5 sm:p-4 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-center justify-between gap-4">
                    <!-- Imagen -->
                    <div class="w-14 h-14 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center shrink-0 p-1">
                      @if (item.tiene_imagen === 1) {
                        <img [src]="getProductImageUrl(item.id_producto)" [alt]="item.nombre_producto" class="w-full h-full object-contain pointer-events-none" />
                      } @else {
                        <i class="fas fa-box text-slate-600"></i>
                      }
                    </div>

                    <!-- Datos -->
                    <div class="flex-1 min-w-0">
                      <h4 class="text-sm font-bold text-white truncate">{{ item.nombre_producto }}</h4>
                      <div class="flex items-center gap-2 mt-0.5">
                        <span class="text-xs font-mono font-bold text-emerald-400">
                          {{ item.precio_final | currency:'MXN':'symbol':'1.2-2' }}
                        </span>
                        @if (item.descuento_unitario > 0) {
                          <span class="text-[11px] font-mono text-slate-500 line-through">
                            {{ item.precio | currency:'MXN':'symbol':'1.2-2' }}
                          </span>
                          <span class="text-[9px] px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-400 font-black">
                            -{{ item.descuento_unitario | currency:'MXN':'symbol':'1.0-0' }}
                          </span>
                        }
                      </div>
                    </div>

                    <!-- Controles Cantidad -->
                    <div class="flex items-center gap-2">
                      <button
                        type="button"
                        (click)="cartService.updateQuantity(item.id_producto, item.cantidad - 1)"
                        class="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center text-xs cursor-pointer"
                      >
                        -
                      </button>
                      <span class="text-xs font-mono font-bold text-white w-6 text-center">
                        {{ item.cantidad }}
                      </span>
                      <button
                        type="button"
                        (click)="cartService.updateQuantity(item.id_producto, item.cantidad + 1)"
                        class="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center text-xs cursor-pointer"
                      >
                        +
                      </button>
                    </div>

                    <!-- Subtotal del producto y Botón Eliminar -->
                    <div class="text-right shrink-0">
                      <div class="text-xs font-mono font-black text-white">
                        {{ (item.precio_final * item.cantidad) | currency:'MXN':'symbol':'1.2-2' }}
                      </div>
                      <button
                        type="button"
                        (click)="cartService.removeItem(item.id_producto)"
                        class="text-[10px] text-slate-500 hover:text-rose-400 transition-colors mt-0.5"
                      >
                        Quitar
                      </button>
                    </div>
                  </div>
                }
              </div>

              <!-- Desglose de Totales -->
              <div class="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 text-sm">
                <div class="flex justify-between text-slate-400 text-xs">
                  <span>Subtotal original:</span>
                  <span class="font-mono">{{ cartService.originalSubtotal() | currency:'MXN':'symbol':'1.2-2' }}</span>
                </div>
                @if (cartService.totalSavings() > 0) {
                  <div class="flex justify-between text-emerald-400 text-xs font-bold">
                    <span>Ahorro en Descuentos:</span>
                    <span class="font-mono">-{{ cartService.totalSavings() | currency:'MXN':'symbol':'1.2-2' }}</span>
                  </div>
                }
                <div class="pt-2 border-t border-slate-800 flex justify-between items-center text-white">
                  <span class="font-bold text-base">Total a Pagar:</span>
                  <span class="font-black text-2xl font-mono text-amber-400">
                    {{ cartService.subtotal() | currency:'MXN':'symbol':'1.2-2' }}
                  </span>
                </div>
              </div>

              <!-- Selector de Métodos de Pago -->
              <div class="space-y-3 pt-2">
                <div class="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Selecciona Método de Pago en la Máquina:
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <!-- Botón Tarjeta -->
                  <button
                    type="button"
                    (click)="goToCardPayment()"
                    class="p-4 rounded-2xl bg-gradient-to-br from-indigo-900/60 to-slate-900 hover:from-indigo-800/80 hover:to-slate-800 border border-indigo-500/40 hover:border-indigo-400 text-left transition-all cursor-pointer shadow-lg group hover:scale-[1.02]"
                  >
                    <div class="flex items-center justify-between mb-2">
                      <div class="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-lg group-hover:bg-indigo-500 group-hover:text-white transition-colors">
                        <i class="fas fa-credit-card"></i>
                      </div>
                      <span class="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-bold uppercase">
                        Sin Contacto / Chip
                      </span>
                    </div>
                    <div class="font-black text-white text-base">Pagar con Tarjeta</div>
                    <p class="text-xs text-slate-400 mt-0.5">Débito, Crédito o Apple/Google Pay</p>
                  </button>

                  <!-- Botón Efectivo -->
                  <button
                    type="button"
                    (click)="goToCashPayment()"
                    class="p-4 rounded-2xl bg-gradient-to-br from-emerald-900/60 to-slate-900 hover:from-emerald-800/80 hover:to-slate-800 border border-emerald-500/40 hover:border-emerald-400 text-left transition-all cursor-pointer shadow-lg group hover:scale-[1.02]"
                  >
                    <div class="flex items-center justify-between mb-2">
                      <div class="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-lg group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                        <i class="fas fa-coins"></i>
                      </div>
                      <span class="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold uppercase">
                        Dispensador Activo
                      </span>
                    </div>
                    <div class="font-black text-white text-base">Pagar en Efectivo</div>
                    <p class="text-xs text-slate-400 mt-0.5">Monedas y billetes con cambio automático</p>
                  </button>
                </div>
              </div>
            }
          }

          <!-- ============================================== -->
          <!-- STEP 2: PAGO CON TARJETA BANCARIA              -->
          <!-- ============================================== -->
          @if (step() === 'payment_card') {
            <div class="space-y-6 text-center py-4">
              <!-- Terminal Gráfica -->
              <div class="w-64 mx-auto p-6 rounded-3xl bg-slate-950 border-2 border-indigo-500/40 shadow-2xl shadow-indigo-950/50 space-y-4">
                <div class="flex items-center justify-between text-xs text-slate-500 border-b border-slate-800 pb-2">
                  <span class="flex items-center gap-1.5"><i class="fas fa-wifi text-indigo-400 animate-pulse"></i> Terminal Smart</span>
                  <span class="text-[10px] text-emerald-400 font-bold">ONLINE</span>
                </div>

                <div class="py-3">
                  <div class="text-[11px] uppercase tracking-wider text-slate-400">Total a Cobrar</div>
                  <div class="text-3xl font-black font-mono text-white mt-1">
                    {{ cartService.subtotal() | currency:'MXN':'symbol':'1.2-2' }}
                  </div>
                </div>

                <!-- Animación de Tarjeta -->
                <div class="py-4 flex justify-center">
                  <div class="w-24 h-16 rounded-xl bg-gradient-to-tr from-sky-600 via-indigo-600 to-purple-600 p-2 shadow-lg animate-bounce flex flex-col justify-between text-left text-[8px] text-white font-mono">
                    <i class="fas fa-microchip text-amber-300 text-xs"></i>
                    <div>•••• 4242</div>
                  </div>
                </div>

                <div class="text-xs text-slate-400 font-medium">
                  Acerca tu tarjeta al lector o inserta el chip
                </div>
              </div>

              <div class="space-y-3 max-w-md mx-auto">
                <button
                  type="button"
                  (click)="processCardPayment()"
                  class="w-full py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-sm shadow-xl shadow-indigo-600/30 transition-all cursor-pointer hover:scale-[1.02] flex items-center justify-center gap-2.5"
                >
                  <i class="fas fa-check-circle"></i>
                  <span>Simular Aprobación de Tarjeta</span>
                </button>

                <button
                  type="button"
                  (click)="step.set('review')"
                  class="text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  <i class="fas fa-arrow-left me-1"></i> Volver a Métodos de Pago
                </button>
              </div>
            </div>
          }

          <!-- ============================================== -->
          <!-- STEP 3: PAGO EN EFECTIVO & DISPENSADOR          -->
          <!-- ============================================== -->
          @if (step() === 'payment_cash') {
            <div class="space-y-6">
              <!-- Pantalla de Calculadora de Efectivo -->
              <div class="p-6 rounded-3xl bg-slate-950 border border-slate-800 space-y-4">
                <div class="grid grid-cols-2 gap-4 pb-4 border-b border-slate-800/80">
                  <div>
                    <div class="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total a Pagar</div>
                    <div class="text-2xl font-black font-mono text-white mt-1">
                      {{ cartService.subtotal() | currency:'MXN':'symbol':'1.2-2' }}
                    </div>
                  </div>
                  <div class="text-right">
                    <div class="text-[10px] font-bold uppercase tracking-wider text-slate-400">Dinero Ingresado</div>
                    <div class="text-2xl font-black font-mono text-emerald-400 mt-1">
                      {{ cashReceived() | currency:'MXN':'symbol':'1.2-2' }}
                    </div>
                  </div>
                </div>

                <!-- Estado de la Diferencia / Cambio -->
                <div class="p-4 rounded-2xl flex items-center justify-between"
                  [class.bg-rose-500-10]="cashDifference() < 0"
                  [class.border-rose-500-30]="cashDifference() < 0"
                  [class.bg-emerald-500-10]="cashDifference() >= 0"
                  [class.border-emerald-500-30]="cashDifference() >= 0"
                  class="border"
                >
                  <div class="flex items-center gap-2.5">
                    @if (cashDifference() < 0) {
                      <i class="fas fa-triangle-exclamation text-rose-400 text-lg"></i>
                      <div>
                        <div class="text-xs font-bold text-rose-400">Falta por Ingresar</div>
                        <div class="text-[11px] text-slate-400">Inserta más monedas o billetes en la ranura</div>
                      </div>
                    } @else if (cashDifference() === 0) {
                      <i class="fas fa-check-circle text-emerald-400 text-lg"></i>
                      <div>
                        <div class="text-xs font-bold text-emerald-400">Monto Exacto</div>
                        <div class="text-[11px] text-slate-400">No se requiere dispensar cambio</div>
                      </div>
                    } @else {
                      <i class="fas fa-coins text-amber-400 text-lg"></i>
                      <div>
                        <div class="text-xs font-bold text-amber-400">Cambio a Devolver</div>
                        <div class="text-[11px] text-slate-400">Se dispensará en monedas de la máquina</div>
                      </div>
                    }
                  </div>

                  <div class="text-xl font-black font-mono"
                    [class.text-rose-400]="cashDifference() < 0"
                    [class.text-emerald-400]="cashDifference() === 0"
                    [class.text-amber-400]="cashDifference() > 0"
                  >
                    {{ Math.abs(cashDifference()) | currency:'MXN':'symbol':'1.2-2' }}
                  </div>
                </div>

                <!-- Desglose de monedas a dispensar si hay cambio -->
                @if (cashDifference() > 0) {
                  <div class="pt-2">
                    <div class="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                      Desglose de Monedas del Dispensador:
                    </div>
                    <div class="flex flex-wrap gap-2">
                      @for (c of getCoinsBreakdown(cashDifference()); track c.denom) {
                        <span class="px-3 py-1.5 rounded-xl bg-slate-900 border border-amber-500/30 text-amber-300 font-mono text-xs font-bold flex items-center gap-2">
                          <span>\${{ c.denom }}</span>
                          <span class="text-slate-400">×{{ c.qty }}</span>
                          <span class="text-[10px] text-slate-500">(\${{ c.total }})</span>
                        </span>
                      }
                    </div>
                  </div>
                }
              </div>

              <!-- Botones de inserción rápida de billetes/monedas (Simulador Kiosco) -->
              <div class="space-y-3">
                <div class="flex justify-between items-center">
                  <span class="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Insertar Dinero (Simular Monedero/Billetero):
                  </span>
                  <button
                    type="button"
                    (click)="cashReceived.set(0)"
                    class="text-[11px] text-slate-500 hover:text-rose-400 transition-colors cursor-pointer"
                  >
                    Limpiar
                  </button>
                </div>

                <div class="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  <button
                    type="button"
                    (click)="addCash(10)"
                    class="py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold text-xs border border-slate-700 transition-all cursor-pointer active:scale-95"
                  >
                    +$10
                  </button>
                  <button
                    type="button"
                    (click)="addCash(20)"
                    class="py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold text-xs border border-slate-700 transition-all cursor-pointer active:scale-95"
                  >
                    +$20
                  </button>
                  <button
                    type="button"
                    (click)="addCash(50)"
                    class="py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold text-xs border border-slate-700 transition-all cursor-pointer active:scale-95"
                  >
                    +$50
                  </button>
                  <button
                    type="button"
                    (click)="addCash(100)"
                    class="py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold text-xs border border-slate-700 transition-all cursor-pointer active:scale-95"
                  >
                    +$100
                  </button>
                  <button
                    type="button"
                    (click)="addCash(200)"
                    class="py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold text-xs border border-slate-700 transition-all cursor-pointer active:scale-95"
                  >
                    +$200
                  </button>
                  <button
                    type="button"
                    (click)="addCash(500)"
                    class="py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold text-xs border border-slate-700 transition-all cursor-pointer active:scale-95"
                  >
                    +$500
                  </button>
                </div>
              </div>

              <!-- Botones de Acción -->
              <div class="space-y-3 pt-2">
                <button
                  type="button"
                  [disabled]="cashDifference() < 0"
                  (click)="processCashPayment()"
                  [class.opacity-50]="cashDifference() < 0"
                  [class.cursor-not-allowed]="cashDifference() < 0"
                  class="w-full py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm shadow-xl shadow-emerald-600/30 transition-all cursor-pointer flex items-center justify-center gap-2.5"
                >
                  <i class="fas fa-check-double"></i>
                  <span>Confirmar Pago en Efectivo y Despachar</span>
                </button>

                <div class="text-center">
                  <button
                    type="button"
                    (click)="step.set('review')"
                    class="text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
                  >
                    <i class="fas fa-arrow-left me-1"></i> Volver a Métodos de Pago
                  </button>
                </div>
              </div>
            </div>
          }

          <!-- ============================================== -->
          <!-- STEP 4: PROCESANDO & DESPACHANDO               -->
          <!-- ============================================== -->
          @if (step() === 'processing') {
            <div class="py-16 text-center space-y-6">
              <div class="w-20 h-20 mx-auto rounded-3xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400 text-3xl shadow-inner">
                <i class="fas fa-spinner fa-spin"></i>
              </div>

              <div class="space-y-2 max-w-sm mx-auto">
                <h3 class="text-xl font-black text-white">Procesando Venta...</h3>
                <p class="text-xs text-slate-400">
                  Activando motores de la máquina y registrando salida de inventario...
                </p>
              </div>

              <!-- Progress bar animada -->
              <div class="w-64 mx-auto h-2 rounded-full bg-slate-800 overflow-hidden">
                <div class="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 animate-pulse rounded-full w-3/4"></div>
              </div>
            </div>
          }

          <!-- ============================================== -->
          <!-- STEP 5: TICKET DIGITAL & FINALIZACIÓN          -->
          <!-- ============================================== -->
          @if (step() === 'ticket' && checkoutResult()) {
            <div class="space-y-6">
              
              <!-- Recibo imprimible -->
              <div class="p-6 rounded-3xl bg-slate-950 border border-slate-800 text-slate-300 font-mono text-xs space-y-4 shadow-inner" id="print-ticket-area">
                <!-- Membrete -->
                <div class="text-center border-b border-dashed border-slate-800 pb-4 space-y-1">
                  <h3 class="text-base font-black text-white uppercase">{{ checkoutResult()!.ticket_data.empresa.nombre_empresa }}</h3>
                  <div class="text-[11px] text-slate-400">{{ checkoutResult()!.ticket_data.empresa.direccion }}</div>
                  <div class="text-[10px] text-slate-500">RFC: {{ checkoutResult()!.ticket_data.empresa.rfc }}</div>
                  <div class="text-[10px] text-slate-500">Tel: {{ checkoutResult()!.ticket_data.empresa.telefono }}</div>
                </div>

                <!-- Datos de Folio y Fecha -->
                <div class="flex justify-between text-[11px] text-slate-400 border-b border-dashed border-slate-800 pb-3">
                  <div>
                    <div>FOLIO: <strong class="text-white">{{ checkoutResult()!.folio }}</strong></div>
                    <div>CAJERO: {{ checkoutResult()!.ticket_data.cajero }}</div>
                  </div>
                  <div class="text-right">
                    <div>FECHA: {{ checkoutResult()!.ticket_data.fecha }}</div>
                    <div>MÉTODO: <strong class="text-emerald-400">{{ checkoutResult()!.metodo_pago }}</strong></div>
                  </div>
                </div>

                <!-- Tabla de Productos -->
                <div class="space-y-2 border-b border-dashed border-slate-800 pb-4">
                  <div class="text-[10px] font-bold text-slate-500 flex justify-between uppercase">
                    <span>Cant / Producto / Slot</span>
                    <span>Importe</span>
                  </div>

                  @for (prod of checkoutResult()!.ticket_data.productos; track prod.id_producto) {
                    <div class="flex justify-between items-start text-[11px]">
                      <div>
                        <span class="text-white font-bold">{{ prod.cantidad }}x</span>
                        <span class="text-slate-300 ml-1.5">{{ prod.nombre }}</span>
                        <span class="text-[10px] text-indigo-400 ml-1">[{{ prod.ubicacion }}]</span>
                      </div>
                      <div class="text-white font-bold">
                        {{ prod.subtotal | currency:'MXN':'symbol':'1.2-2' }}
                      </div>
                    </div>
                  }
                </div>

                <!-- Totales -->
                <div class="space-y-1 text-xs pt-1 border-b border-dashed border-slate-800 pb-4">
                  <div class="flex justify-between text-slate-400">
                    <span>Subtotal:</span>
                    <span>{{ checkoutResult()!.subtotal | currency:'MXN':'symbol':'1.2-2' }}</span>
                  </div>
                  @if (checkoutResult()!.descuento > 0) {
                    <div class="flex justify-between text-emerald-400 font-bold">
                      <span>Descuento Aplicado:</span>
                      <span>-{{ checkoutResult()!.descuento | currency:'MXN':'symbol':'1.2-2' }}</span>
                    </div>
                  }
                  <div class="flex justify-between text-slate-400 text-[10px]">
                    <span>IVA (16% Incluido):</span>
                    <span>{{ checkoutResult()!.iva | currency:'MXN':'symbol':'1.2-2' }}</span>
                  </div>
                  <div class="flex justify-between text-white font-black text-sm pt-2">
                    <span>TOTAL:</span>
                    <span class="text-amber-400 font-bold">{{ checkoutResult()!.total | currency:'MXN':'symbol':'1.2-2' }}</span>
                  </div>
                  <div class="flex justify-between text-slate-400 text-[11px] pt-1">
                    <span>Monto Pagado:</span>
                    <span>{{ checkoutResult()!.monto_pagado | currency:'MXN':'symbol':'1.2-2' }}</span>
                  </div>
                  <div class="flex justify-between text-emerald-400 font-bold text-[11px]">
                    <span>Cambio Entregado:</span>
                    <span>{{ checkoutResult()!.cambio | currency:'MXN':'symbol':'1.2-2' }}</span>
                  </div>
                </div>

                <!-- Despachos por Hardware / Bandejas -->
                <div class="pt-2">
                  <div class="text-[10px] font-bold uppercase text-slate-500 mb-2 flex items-center gap-1.5">
                    <i class="fas fa-microchip text-indigo-400"></i> Despacho en Bandejas:
                  </div>
                  <div class="space-y-1">
                    @for (d of checkoutResult()!.despachos; track d.id_despacho) {
                      <div class="flex justify-between items-center text-[10px] px-2.5 py-1 rounded bg-slate-900 border border-slate-800">
                        <span class="text-white font-bold">{{ d.producto }} ({{ d.cantidad }} pz)</span>
                        <span class="text-emerald-400 font-bold flex items-center gap-1">
                          <i class="fas fa-check-circle text-[9px]"></i> Bandeja {{ d.ubicacion }}
                        </span>
                      </div>
                    }
                  </div>
                </div>

                <!-- Pie de Ticket -->
                <div class="text-center text-[10px] text-slate-500 pt-2 border-t border-dashed border-slate-800">
                  {{ checkoutResult()!.ticket_data.empresa.mensaje_ticket || '¡GRACIAS POR SU COMPRA!' }}
                </div>
              </div>

              <!-- Acciones del Ticket -->
              <div class="flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  (click)="printTicket()"
                  class="flex-1 py-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-slate-700 transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <i class="fas fa-print text-indigo-400"></i>
                  <span>Imprimir Ticket</span>
                </button>

                <button
                  type="button"
                  (click)="finishPurchase()"
                  class="flex-1 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs shadow-xl shadow-indigo-600/30 transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <i class="fas fa-check"></i>
                  <span>Finalizar y Retirar Productos</span>
                </button>
              </div>

            </div>
          }

        </div>

      </div>

    </div>
  `,
  styles: [`
    .bg-rose-500-10 {
      background-color: rgba(244, 63, 94, 0.1);
    }
    .border-rose-500-30 {
      border-color: rgba(244, 63, 94, 0.3);
    }
    .bg-emerald-500-10 {
      background-color: rgba(16, 185, 129, 0.1);
    }
    .border-emerald-500-30 {
      border-color: rgba(16, 185, 129, 0.3);
    }
    @media print {
      body * {
        visibility: hidden;
      }
      #print-ticket-area, #print-ticket-area * {
        visibility: visible;
      }
      #print-ticket-area {
        position: absolute;
        left: 0;
        top: 0;
        width: 80mm;
        color: black !important;
        background: white !important;
        border: none !important;
      }
    }
  `]
})
export class CheckoutModalComponent implements OnInit {
  @Input() initialStep: CheckoutStep = 'review';
  @Output() close = new EventEmitter<void>();

  public cartService = inject(CartService);

  step = signal<CheckoutStep>('review');
  readonly cartItems = this.cartService.items;

  ngOnInit(): void {
    if (this.initialStep) {
      this.step.set(this.initialStep);
    }
  }

  // Manejo de Efectivo
  cashReceived = signal<number>(0);
  checkoutResult = signal<CheckoutResult | null>(null);

  readonly Math = Math;

  cashDifference = computed(() => {
    const total = this.cartService.subtotal();
    return this.cashReceived() - total;
  });

  goToCardPayment(): void {
    this.step.set('payment_card');
  }

  goToCashPayment(): void {
    this.cashReceived.set(0);
    this.step.set('payment_cash');
  }

  addCash(amount: number): void {
    this.cashReceived.update(curr => curr + amount);
  }

  getCoinsBreakdown(changeAmount: number): Array<{ denom: number; qty: number; total: number }> {
    let change = Math.round(changeAmount);
    const denoms = [10, 5, 2, 1];
    const breakdown: Array<{ denom: number; qty: number; total: number }> = [];

    for (const d of denoms) {
      if (change >= d) {
        const qty = Math.floor(change / d);
        breakdown.push({ denom: d, qty, total: qty * d });
        change %= d;
      }
    }

    return breakdown;
  }

  async processCardPayment(): Promise<void> {
    this.step.set('processing');
    try {
      // Simular latencia de terminal bancaria de 1.2 segundos
      await new Promise(r => setTimeout(r, 1200));

      const result = await this.cartService.checkoutSale({
        metodo_pago: 'Tarjeta',
        tipo_pago: 1,
        tipo_tarjeta: 1,
        monto_pagado: this.cartService.subtotal(),
        cambio: 0
      });

      this.checkoutResult.set(result);
      this.step.set('ticket');
    } catch (e: any) {
      alert(e.message || 'Error procesando cobro con tarjeta');
      this.step.set('payment_card');
    }
  }

  async processCashPayment(): Promise<void> {
    if (this.cashDifference() < 0) return;

    this.step.set('processing');
    try {
      // Simular latencia de dispensador de 1.0 segundos
      await new Promise(r => setTimeout(r, 1000));

      const result = await this.cartService.checkoutSale({
        metodo_pago: 'Efectivo',
        tipo_pago: 0,
        monto_pagado: this.cashReceived(),
        cambio: Math.max(0, this.cashDifference())
      });

      this.checkoutResult.set(result);
      this.step.set('ticket');
    } catch (e: any) {
      alert(e.message || 'Error al procesar el pago en efectivo');
      this.step.set('payment_cash');
    }
  }

  printTicket(): void {
    window.print();
  }

  finishPurchase(): void {
    this.cartService.clear();
    this.closeModal();
  }

  closeModal(): void {
    this.close.emit();
  }

  getProductImageUrl(productId: number): string {
    return `http://localhost:8000/api/v1/products/${productId}/image`;
  }
}
