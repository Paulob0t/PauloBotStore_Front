import {
  Component,
  ElementRef,
  OnInit,
  ViewChild,
  signal,
  computed,
  OnDestroy,
  inject,
  HostListener
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ProductService } from '../../core/services/product.service';
import { CategoryService } from '../../core/services/category.service';
import { CartService } from '../../core/services/cart.service';
import { DigitalServicesService, ServiceProvider } from '../../core/services/digital-services.service';
import { CfeModalComponent } from '../../components/cfe-modal/cfe-modal.component';
import { MovistarModalComponent } from '../../components/movistar-modal/movistar-modal.component';
import { AllCategoriesModalComponent } from '../../components/all-categories-modal/all-categories-modal.component';
import { CheckoutModalComponent } from '../../components/checkout-modal/checkout-modal.component';
import { ProductDto, CategoryDto } from '../../api/models';

@Component({
  selector: 'app-store',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    CfeModalComponent,
    MovistarModalComponent,
    AllCategoriesModalComponent,
    CheckoutModalComponent
  ],
  template: `
    <div class="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      
      <!-- Navbar Superior de la Tienda -->
      <header class="sticky top-0 z-40 bg-slate-900/95 border-b border-slate-800 shadow-md shadow-black/30">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex items-center justify-between h-20">
            
            <!-- Logo & Identidad de Marca -->
            <a routerLink="/" class="flex items-center gap-3.5 group">
              <div class="w-11 h-11 bg-gradient-to-br from-indigo-500 via-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center text-white text-xl shadow-lg shadow-indigo-600/30 group-hover:scale-105 group-hover:shadow-indigo-600/50 transition-all duration-300">
                <i class="fas fa-robot"></i>
              </div>
              <div>
                <div class="text-xl sm:text-2xl font-black text-white tracking-tight leading-none">
                  PauloBot <span class="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">Store</span>
                </div>
                <div class="text-[10px] font-bold uppercase tracking-wider text-slate-400 mt-1 flex items-center gap-1.5">
                  <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  Vending Machine 24/7
                </div>
              </div>
            </a>

            <!-- Acciones Derecha: Inicio, Admin & Carrito -->
            <div class="flex items-center gap-3 sm:gap-4">
              <a
                routerLink="/"
                class="hidden sm:inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-all"
              >
                <i class="fas fa-house text-indigo-400"></i>
                <span>Inicio</span>
              </a>

              <a
                href="#catalogo"
                (click)="scrollToCatalog($event)"
                class="hidden md:inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold text-indigo-300 hover:text-white bg-indigo-950/60 hover:bg-indigo-900 border border-indigo-500/30 transition-all cursor-pointer"
              >
                <i class="fas fa-boxes-stacked text-indigo-400"></i>
                <span>Catálogo</span>
              </a>

              <a
                routerLink="/admin"
                class="hidden sm:inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-all"
              >
                <i class="fas fa-shield-halved text-indigo-400"></i>
                <span>Panel Admin</span>
              </a>

              <!-- Botón Carrito con Contador Reactivo -->
              <button
                type="button"
                (click)="toggleCartDrawer()"
                class="relative inline-flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 hover:shadow-indigo-600/50 hover:-translate-y-0.5 transition-all cursor-pointer"
              >
                <i class="fas fa-shopping-cart text-sm"></i>
                <span class="hidden sm:inline">Carrito</span>
                <span class="px-2 py-0.5 rounded-full bg-white text-indigo-700 text-xs font-black shadow-inner">
                  {{ cartItemsCount() }}
                </span>
                @if (cartSubtotal() > 0) {
                  <span class="hidden md:inline font-mono border-l border-indigo-400/40 pl-2">
                    {{ cartSubtotal() | currency:'MXN':'symbol':'1.2-2' }}
                  </span>
                }
              </button>
            </div>

          </div>
        </div>
      </header>

      <!-- Toast Flotante de Notificaciones -->
      @if (toastMessage()) {
        <div class="fixed bottom-6 right-6 z-50 bg-slate-900 border border-slate-700 text-white px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 animate-fade-in font-medium text-sm">
          <i class="fas fa-info-circle text-indigo-400 text-lg"></i>
          <span>{{ toastMessage() }}</span>
        </div>
      }

      <!-- Modal de CFE (Pago de Luz) -->
      @if (showCfeModal()) {
        <app-cfe-modal (close)="showCfeModal.set(false)" />
      }

      <!-- Modal de Movistar (Recargas Telefónicas y Datos) -->
      @if (showMovistarModal()) {
        <app-movistar-modal (close)="showMovistarModal.set(false)" />
      }

      <!-- Modal de Todas las Categorías -->
      @if (showAllCategoriesModal()) {
        <app-all-categories-modal
          [categories]="categories()"
          (close)="showAllCategoriesModal.set(false)"
          (selectCategory)="onSelectCategoryFromModal($event)"
        />
      }

      <!-- Modal de Checkout & Pago Kiosco -->
      @if (showCheckoutModal()) {
        <app-checkout-modal
          [initialStep]="checkoutInitialStep()"
          (close)="showCheckoutModal.set(false)"
        />
      }

      <!-- Contenido Principal -->
      <main class="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-16">
        
        <!-- Hero Banner Promocional -->
        <section class="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-900 border border-indigo-500/20 p-8 sm:p-12 shadow-xl">
          <div class="relative z-10 max-w-2xl space-y-4">
            <div class="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-xs font-bold uppercase tracking-wider">
              <i class="fas fa-bolt text-amber-400"></i> Despacho Inteligente & Servicios 24/7
            </div>
            <h1 class="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
              Snacks, Bebidas & Pago de Servicios
            </h1>
            <p class="text-sm sm:text-base text-slate-300 leading-relaxed">
              Disfruta de tus productos favoritos y paga recibos como CFE o recargas telefónicas de manera rápida, segura y automatizada.
            </p>
            <div class="pt-2 flex flex-wrap gap-3">
              <a
                href="#catalogo"
                (click)="scrollToCatalog($event)"
                class="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs shadow-lg shadow-indigo-600/30 hover:shadow-indigo-600/50 hover:-translate-y-0.5 transition-all cursor-pointer"
              >
                <i class="fas fa-boxes-stacked"></i>
                <span>Explorar Catálogo Completo ({{ allProducts().length }} productos)</span>
              </a>
            </div>
          </div>
        </section>

        <!-- SECCIÓN 1: Carrusel de Servicios Digitales & Recargas (¡NUEVO MÓDULO!) -->
        <section class="space-y-6">
          <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <div class="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-1">
                <i class="fas fa-receipt text-emerald-400"></i> Pagos & Tiempo Aire
                <span class="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                  <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> Kiosco Digital
                </span>
              </div>
              <h2 class="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Servicios Digitales
              </h2>
            </div>

            <!-- Botones de Control Manual -->
            <div class="flex items-center gap-2 self-end sm:self-auto">
              <button
                type="button"
                (click)="prevService()"
                class="w-10 h-10 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 hover:bg-slate-800 text-slate-300 hover:text-white flex items-center justify-center transition-all cursor-pointer shadow-sm active:scale-95"
                title="Anterior"
              >
                <i class="fas fa-chevron-left text-sm"></i>
              </button>
              <button
                type="button"
                (click)="nextService()"
                class="w-10 h-10 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 hover:bg-slate-800 text-slate-300 hover:text-white flex items-center justify-center transition-all cursor-pointer shadow-sm active:scale-95"
                title="Siguiente"
              >
                <i class="fas fa-chevron-right text-sm"></i>
              </button>
            </div>
          </div>

          <!-- Pista del Carrusel de Servicios -->
          @if (isLoadingServices()) {
            <div class="py-16 text-center text-slate-500">
              <i class="fas fa-spinner fa-spin text-3xl text-emerald-500 mb-3"></i>
              <p class="text-sm">Cargando servicios disponibles...</p>
            </div>
          } @else if (services().length > 0) {
            <div
              (mouseenter)="pauseServices()"
              (mouseleave)="resumeServices()"
              (touchstart)="pauseServices()"
              (touchend)="resumeServices()"
              class="relative overflow-hidden w-full py-2"
            >
              <!-- Track Desplazable con GPU Transform -->
              <div
                class="flex gap-6 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform"
                [style.transform]="'translate3d(' + -servicesOffset() + 'px, 0, 0)'"
              >
                @for (service of services(); track service.id) {
                  <div
                    (click)="onServiceClick(service)"
                    [class.border-emerald-500-60]="service.disponible"
                    [class.hover:border-emerald-400]="service.disponible"
                    [class.hover:shadow-emerald-500-10]="service.disponible"
                    class="w-72 sm:w-80 shrink-0 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-lg transition-all duration-300 flex flex-col justify-between group cursor-pointer hover:-translate-y-1 select-none"
                  >
                    
                    <div class="space-y-4">
                      <!-- Header de la Tarjeta con Logo y Badge -->
                      <div class="flex items-center justify-between">
                        <div class="w-16 h-16 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center p-3 shadow-inner group-hover:scale-105 transition-transform duration-300">
                          <img
                            [src]="service.imagen"
                            [alt]="service.nombre"
                            class="w-full h-full object-contain pointer-events-none"
                            decoding="async"
                          />
                        </div>

                        <span
                          [class.bg-emerald-500-20]="service.disponible"
                          [class.border-emerald-500-30]="service.disponible"
                          [class.text-emerald-400]="service.disponible"
                          [class.bg-slate-800]="!service.disponible"
                          [class.border-slate-700]="!service.disponible"
                          [class.text-slate-400]="!service.disponible"
                          class="px-2.5 py-1 rounded-xl border text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 shadow-sm"
                        >
                          @if (service.disponible) {
                            <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                          }
                          {{ service.badge }}
                        </span>
                      </div>

                      <!-- Información del Servicio -->
                      <div>
                        <div class="text-[11px] font-bold text-emerald-400 uppercase tracking-wider mb-1">
                          {{ service.subtitulo }}
                        </div>
                        <h3 class="text-xl font-black text-white group-hover:text-emerald-300 transition-colors">
                          {{ service.nombre }}
                        </h3>
                        <p class="text-xs text-slate-400 mt-1 line-clamp-2 min-h-[2rem]">
                          {{ service.descripcion }}
                        </p>
                      </div>
                    </div>

                    <!-- Footer de la Tarjeta: Botón de Acción -->
                    <div class="pt-5 border-t border-slate-800 mt-4 flex items-center justify-between">
                      <div class="text-xs text-slate-400">
                        @if (service.comision > 0) {
                          <span>Comisión: <strong class="text-amber-400 font-mono">+{{ service.comision | currency:'MXN':'symbol':'1.2-2' }}</strong></span>
                        } @else {
                          <span class="text-emerald-400 font-bold">Sin Comisión</span>
                        }
                      </div>

                      <button
                        type="button"
                        [class.bg-emerald-600]="service.disponible"
                        [class.hover:bg-emerald-500]="service.disponible"
                        [class.text-white]="service.disponible"
                        [class.bg-slate-800]="!service.disponible"
                        [class.text-slate-500]="!service.disponible"
                        class="inline-flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs shadow-md transition-all cursor-pointer group-hover:scale-105"
                      >
                        @if (service.disponible) {
                          <i class="fas" [class.fa-bolt]="service.id === 'cfe'" [class.fa-mobile-screen-button]="service.id === 'movistar'"></i>
                          <span>{{ service.id === 'movistar' ? 'Recargar' : 'Pagar Recibo' }}</span>
                        } @else {
                          <span>Pronto</span>
                        }
                      </button>
                    </div>

                  </div>
                }
              </div>
            </div>

            <!-- Dots Indicadores de Servicios -->
            @if (servicesDotsCount() > 1) {
              <div class="flex justify-center items-center gap-2 pt-2">
                @for (dot of [].constructor(servicesDotsCount()); track $index) {
                  <button
                    type="button"
                    (click)="goToServiceSlide($index)"
                    [class.bg-emerald-500]="$index === servicesSlideIndex()"
                    [class.w-7]="$index === servicesSlideIndex()"
                    [class.bg-slate-700]="$index !== servicesSlideIndex()"
                    [class.w-2.5]="$index !== servicesSlideIndex()"
                    class="h-2.5 rounded-full transition-all duration-300 cursor-pointer"
                    [title]="'Ir a grupo ' + ($index + 1)"
                  ></button>
                }
              </div>
            }
          }
        </section>

        <!-- SECCIÓN 2: Carrusel de Productos Destacados (GPU-Accelerated 60 FPS) -->
        <section class="space-y-6">
          <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <div class="flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-1">
                <i class="fas fa-fire text-amber-400"></i> Selección Especial
                <span class="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1">
                  <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> 60 FPS GPU
                </span>
              </div>
              <h2 class="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Productos Destacados
              </h2>
            </div>

            <!-- Botones de Control Manual -->
            <div class="flex items-center gap-2 self-end sm:self-auto">
              <button
                type="button"
                (click)="prevFeatured()"
                class="w-10 h-10 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 hover:bg-slate-800 text-slate-300 hover:text-white flex items-center justify-center transition-all cursor-pointer shadow-sm active:scale-95"
                title="Anterior"
              >
                <i class="fas fa-chevron-left text-sm"></i>
              </button>
              <button
                type="button"
                (click)="nextFeatured()"
                class="w-10 h-10 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 hover:bg-slate-800 text-slate-300 hover:text-white flex items-center justify-center transition-all cursor-pointer shadow-sm active:scale-95"
                title="Siguiente"
              >
                <i class="fas fa-chevron-right text-sm"></i>
              </button>
            </div>
          </div>

          <!-- Pista del Carrusel de Productos -->
          @if (isLoadingFeatured()) {
            <div class="py-16 text-center text-slate-500">
              <i class="fas fa-spinner fa-spin text-3xl text-indigo-500 mb-3"></i>
              <p class="text-sm">Cargando productos destacados...</p>
            </div>
          } @else if (featuredProducts().length > 0) {
            <div
              #featuredWrapper
              (mouseenter)="pauseFeatured()"
              (mouseleave)="resumeFeatured()"
              (touchstart)="pauseFeatured()"
              (touchend)="resumeFeatured()"
              class="relative overflow-hidden w-full py-2"
            >
              <!-- Track Desplazable con GPU Transform -->
              <div
                class="flex gap-6 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform"
                [style.transform]="'translate3d(' + -featuredOffset() + 'px, 0, 0)'"
              >
                @for (product of featuredProducts(); track product.id_producto) {
                  <div class="w-72 sm:w-80 shrink-0 bg-slate-900 border border-slate-800 hover:border-indigo-500/40 rounded-3xl p-5 shadow-lg hover:shadow-indigo-500/10 transition-all duration-300 flex flex-col justify-between group">
                    
                    <!-- Contenedor Imagen y Badges -->
                    <div class="space-y-4">
                      <div class="relative h-48 rounded-2xl bg-slate-950 border border-slate-800/80 overflow-hidden flex items-center justify-center">
                        
                        <!-- Badge Destacado / Orden -->
                        <span class="absolute top-3 left-3 z-10 px-2.5 py-1 rounded-xl bg-slate-900/90 border border-amber-500/30 text-amber-400 text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shadow-md">
                          <i class="fas fa-star text-[9px]"></i> Top #{{ product.orden_destacado || 1 }}
                        </span>

                        <!-- Badge Descuento si aplica -->
                        @if (product.descuento && product.descuento > 0 && product.descuento < product.precio) {
                          <span class="absolute top-3 right-3 z-10 px-2 py-1 rounded-xl bg-slate-900/90 border border-rose-500/30 text-rose-400 text-[10px] font-black uppercase tracking-wider shadow-md">
                            ¡OFERTA!
                          </span>
                        }

                        <!-- Imagen con Miniatura WebP Optimizada -->
                        @if (product.tiene_imagen === 1) {
                          <img
                            [src]="getProductImageUrl(product.id_producto)"
                            [alt]="product.nombre_producto"
                            class="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-300 pointer-events-none"
                            decoding="async"
                            loading="lazy"
                            (error)="onImageError($event)"
                          />
                        } @else {
                          <div class="text-center p-6 text-slate-600">
                            <i class="fas fa-box-open text-4xl mb-2 block text-slate-700"></i>
                            <span class="text-[11px] font-medium text-slate-500">Sin Fotografía</span>
                          </div>
                        }
                      </div>

                      <!-- Datos del Producto -->
                      <div>
                        <div class="text-[11px] font-bold text-indigo-400 uppercase tracking-wider mb-1 truncate">
                          {{ product.nombre_categoria || 'Categoría General' }}
                        </div>
                        <h3 class="text-base font-bold text-white group-hover:text-indigo-300 transition-colors line-clamp-1" [title]="product.nombre_producto">
                          {{ product.nombre_producto }}
                        </h3>
                        @if (product.descripcion) {
                          <p class="text-xs text-slate-400 line-clamp-2 mt-1 min-h-[2rem]">
                            {{ product.descripcion }}
                          </p>
                        }
                      </div>
                    </div>

                    <!-- Precios y Botón Agregar -->
                    <div class="pt-4 border-t border-slate-800 mt-4 flex items-center justify-between gap-3">
                      <div>
                        @if (product.descuento && product.descuento > 0 && product.descuento < product.precio) {
                          <div class="text-xs text-slate-500 line-through font-mono">
                            {{ product.precio | currency:'MXN':'symbol':'1.2-2' }}
                          </div>
                          <div class="text-xl font-black text-emerald-400 font-mono">
                            {{ (product.precio - product.descuento) | currency:'MXN':'symbol':'1.2-2' }}
                          </div>
                        } @else {
                          <div class="text-xl font-black text-white font-mono">
                            {{ product.precio | currency:'MXN':'symbol':'1.2-2' }}
                          </div>
                        }
                      </div>

                      <button
                        type="button"
                        (click)="addToCart(product)"
                        class="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 hover:shadow-indigo-600/50 hover:scale-105 transition-all cursor-pointer shrink-0 active:scale-95"
                      >
                        <i class="fas fa-cart-plus"></i>
                        <span>Agregar</span>
                      </button>
                    </div>

                  </div>
                }
              </div>
            </div>

            <!-- Dots Indicadores -->
            @if (featuredDotsCount() > 1) {
              <div class="flex justify-center items-center gap-2 pt-2">
                @for (dot of [].constructor(featuredDotsCount()); track $index) {
                  <button
                    type="button"
                    (click)="goToFeaturedSlide($index)"
                    [class.bg-indigo-500]="$index === featuredSlideIndex()"
                    [class.w-7]="$index === featuredSlideIndex()"
                    [class.bg-slate-700]="$index !== featuredSlideIndex()"
                    [class.w-2.5]="$index !== featuredSlideIndex()"
                    class="h-2.5 rounded-full transition-all duration-300 cursor-pointer"
                    [title]="'Ir a grupo ' + ($index + 1)"
                  ></button>
                }
              </div>
            }
          } @else {
            <div class="p-8 rounded-3xl bg-slate-900 border border-slate-800 text-center text-slate-400 text-sm">
              No hay productos destacados configurados en este momento.
            </div>
          }
        </section>

        <!-- SECCIÓN 3: Carrusel de Categorías (GPU-Accelerated 60 FPS) -->
        <section class="space-y-6">
          <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <div class="flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-1">
                <i class="fas fa-layer-group text-indigo-400"></i> Catálogo Completo
                <span class="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                  <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> Navegación Fluida
                </span>
              </div>
              <h2 class="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Explora por Categorías
              </h2>
            </div>

            <!-- Botones de Control Manual & Ver Todas -->
            <div class="flex items-center gap-2.5 self-end sm:self-auto">
              <button
                type="button"
                (click)="showAllCategoriesModal.set(true)"
                class="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 hover:text-white text-xs font-bold transition-all cursor-pointer shadow-sm active:scale-95"
              >
                <i class="fas fa-table-cells-large text-xs text-indigo-400"></i>
                <span>Ver Todas ({{ categories().length }})</span>
              </button>
              <button
                type="button"
                (click)="prevCategory()"
                class="w-10 h-10 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 hover:bg-slate-800 text-slate-300 hover:text-white flex items-center justify-center transition-all cursor-pointer shadow-sm active:scale-95"
                title="Anterior"
              >
                <i class="fas fa-chevron-left text-sm"></i>
              </button>
              <button
                type="button"
                (click)="nextCategory()"
                class="w-10 h-10 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 hover:bg-slate-800 text-slate-300 hover:text-white flex items-center justify-center transition-all cursor-pointer shadow-sm active:scale-95"
                title="Siguiente"
              >
                <i class="fas fa-chevron-right text-sm"></i>
              </button>
            </div>
          </div>

          <!-- Pista del Carrusel de Categorías -->
          @if (isLoadingCategories()) {
            <div class="py-16 text-center text-slate-500">
              <i class="fas fa-spinner fa-spin text-3xl text-indigo-500 mb-3"></i>
              <p class="text-sm">Cargando categorías...</p>
            </div>
          } @else if (categories().length > 0) {
            <div
              #categoryWrapper
              (mouseenter)="pauseCategories()"
              (mouseleave)="resumeCategories()"
              (touchstart)="pauseCategories()"
              (touchend)="resumeCategories()"
              class="relative overflow-hidden w-full py-2"
            >
              <!-- Track Desplazable con GPU Transform -->
              <div
                class="flex gap-6 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform"
                [style.transform]="'translate3d(' + -categoryOffset() + 'px, 0, 0)'"
              >
                <!-- TARJETA ESPECIAL: TODAS LAS CATEGORÍAS -->
                <div
                  (click)="showAllCategoriesModal.set(true)"
                  class="w-72 sm:w-80 h-96 shrink-0 relative rounded-3xl overflow-hidden border border-indigo-500/40 hover:border-indigo-400 shadow-xl shadow-indigo-950/30 group cursor-pointer transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-indigo-950 via-slate-900 to-purple-950 flex flex-col justify-between p-6 select-none"
                >
                  <!-- Decoración de fondo -->
                  <div class="absolute -right-6 -top-6 w-36 h-36 bg-indigo-500/10 rounded-full blur-2xl group-hover:bg-indigo-500/20 transition-all"></div>
                  <div class="absolute -left-6 -bottom-6 w-36 h-36 bg-purple-500/10 rounded-full blur-2xl group-hover:bg-purple-500/20 transition-all"></div>

                  <!-- Header tarjeta -->
                  <div class="relative z-10 flex justify-between items-center">
                    <span class="px-3 py-1 rounded-xl bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 text-[11px] font-black uppercase tracking-wider shadow-md flex items-center gap-1.5">
                      <span class="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-ping"></span>
                      Catálogo Completo
                    </span>
                    <div class="w-9 h-9 rounded-xl bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 flex items-center justify-center text-xs group-hover:bg-indigo-500 group-hover:text-white transition-all shadow-md group-hover:scale-110">
                      <i class="fas fa-arrow-up-right-from-square"></i>
                    </div>
                  </div>

                  <!-- Centro: Icono llamativo -->
                  <div class="relative z-10 my-auto text-center py-4">
                    <div class="w-20 h-20 mx-auto rounded-3xl bg-indigo-500/15 border border-indigo-400/30 flex items-center justify-center text-indigo-400 text-3xl shadow-inner group-hover:scale-110 group-hover:bg-indigo-500/25 transition-all duration-300">
                      <i class="fas fa-layer-group"></i>
                    </div>
                    <div class="text-2xl font-black text-white mt-4 tracking-tight">
                      Todas las Categorías
                    </div>
                    <p class="text-xs text-indigo-200/80 mt-1 line-clamp-2">
                      Explora los {{ categories().length }} departamentos con todas sus subcategorías
                    </p>
                  </div>

                  <!-- Footer tarjeta -->
                  <div class="relative z-10 pt-3 border-t border-indigo-500/20 flex items-center justify-between">
                    <span class="text-xs font-bold text-slate-400">
                      {{ categories().length }} categorías
                    </span>
                    <span class="inline-flex items-center gap-1.5 text-xs font-black text-indigo-300 group-hover:text-white group-hover:translate-x-1 transition-all">
                      <span>Explorar</span>
                      <i class="fas fa-arrow-right text-xs"></i>
                    </span>
                  </div>
                </div>

                @for (cat of categories(); track cat.id) {
                  <div
                    (click)="onCategoryClick(cat)"
                    class="w-72 sm:w-80 h-96 shrink-0 relative rounded-3xl overflow-hidden border border-slate-800 hover:border-indigo-500/50 shadow-xl group cursor-pointer transition-all duration-300 hover:-translate-y-1 bg-slate-900"
                  >
                    
                    <!-- Fondo con Imagen Optimizada de Categoría o Gradiente -->
                    @if (cat.tiene_imagen === 1) {
                      <img
                        [src]="getCategoryImageUrl(cat.id)"
                        [alt]="cat.nombre"
                        class="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 pointer-events-none"
                        decoding="async"
                        loading="lazy"
                      />
                    } @else {
                      <div class="absolute inset-0 bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950 flex items-center justify-center">
                        <i class="fas fa-tags text-7xl text-indigo-500/20 group-hover:scale-105 group-hover:text-indigo-500/30 transition-all duration-500"></i>
                      </div>
                    }

                    <!-- Overlay Oscuro Degradado -->
                    <div class="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-transparent"></div>

                    <!-- Contenido Superior: Badge de Subcategorías -->
                    <div class="absolute top-4 left-4 right-4 flex justify-between items-center z-10">
                      <span class="px-3 py-1 rounded-xl bg-slate-900/90 border border-slate-700 text-indigo-300 text-[11px] font-black uppercase tracking-wider shadow-md">
                        {{ (cat.subcategorias?.length || 0) }} Subcategorías
                      </span>
                      <div class="w-8 h-8 rounded-xl bg-slate-900/90 border border-slate-700 text-slate-300 flex items-center justify-center text-xs group-hover:bg-indigo-600 group-hover:text-white transition-colors shadow-md">
                        <i class="fas fa-arrow-up-right-from-square"></i>
                      </div>
                    </div>

                    <!-- Contenido Inferior: Título & Botón -->
                    <div class="absolute bottom-6 left-6 right-6 space-y-3 z-10">
                      <h3 class="text-2xl font-black text-white uppercase tracking-tight leading-tight group-hover:text-indigo-300 transition-colors">
                        {{ cat.nombre }}
                      </h3>

                      @if (cat.subcategorias && cat.subcategorias.length > 0) {
                        <div class="flex flex-wrap gap-1.5 pt-1">
                          @for (sub of cat.subcategorias.slice(0, 3); track sub.id) {
                            <span class="px-2 py-0.5 rounded-lg bg-slate-800/90 border border-slate-700 text-[10px] font-semibold text-slate-300">
                              {{ sub.nombre }}
                            </span>
                          }
                          @if (cat.subcategorias.length > 3) {
                            <span class="px-1.5 py-0.5 rounded-lg bg-slate-800/90 text-[10px] text-slate-400">
                              +{{ cat.subcategorias.length - 3 }}
                            </span>
                          }
                        </div>
                      }

                      <div class="pt-2">
                        <span class="inline-flex items-center gap-2 text-xs font-bold text-indigo-400 group-hover:text-white group-hover:translate-x-1 transition-all">
                          <span>Ver Productos</span>
                          <i class="fas fa-arrow-right text-xs"></i>
                        </span>
                      </div>
                    </div>

                  </div>
                }
              </div>
            </div>

            <!-- Dots Indicadores de Categorías -->
            @if (categoryDotsCount() > 1) {
              <div class="flex justify-center items-center gap-2 pt-2">
                @for (dot of [].constructor(categoryDotsCount()); track $index) {
                  <button
                    type="button"
                    (click)="goToCategorySlide($index)"
                    [class.bg-indigo-500]="$index === categorySlideIndex()"
                    [class.w-7]="$index === categorySlideIndex()"
                    [class.bg-slate-700]="$index !== categorySlideIndex()"
                    [class.w-2.5]="$index !== categorySlideIndex()"
                    class="h-2.5 rounded-full transition-all duration-300 cursor-pointer"
                    [title]="'Ir a grupo ' + ($index + 1)"
                  ></button>
                }
              </div>
            }
          } @else {
            <div class="p-8 rounded-3xl bg-slate-900 border border-slate-800 text-center text-slate-400 text-sm">
              No hay categorías disponibles en este momento.
            </div>
          }
        </section>

        <!-- SECCIÓN 4: Catálogo Completo de Productos -->
        <section id="catalogo" class="space-y-8 scroll-mt-24">
          
          <!-- Encabezado de Sección y Controles -->
          <div class="space-y-6">
            <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <div class="flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-1">
                  <i class="fas fa-boxes-stacked text-indigo-400"></i> Todos los Productos
                  <span class="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    {{ filteredCatalogProducts().length }} disponibles
                  </span>
                </div>
                <h2 class="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  Catálogo Completo
                </h2>
                <p class="text-xs sm:text-sm text-slate-400 mt-1">
                  Explora y agrega directamente a tu carrito cualquier producto de la máquina expendedora.
                </p>
              </div>

              <!-- Filtros de Ordenamiento -->
              <div class="flex items-center gap-2 self-start sm:self-auto">
                <span class="text-xs text-slate-400 hidden sm:inline">Ordenar por:</span>
                <select
                  [value]="catalogSortBy()"
                  (change)="setCatalogSort($any($event.target).value)"
                  class="bg-slate-900 border border-slate-800 focus:border-indigo-500 text-xs text-slate-200 font-bold rounded-2xl px-3.5 py-2.5 outline-none transition-all cursor-pointer"
                >
                  <option value="default">Recomendados</option>
                  <option value="price-asc">Menor Precio</option>
                  <option value="price-desc">Mayor Precio</option>
                  <option value="discount">Mejores Descuentos</option>
                </select>
              </div>
            </div>

            <!-- Barra de Búsqueda Rápida y Filtros -->
            <div class="flex flex-col md:flex-row gap-4">
              <!-- Input de Búsqueda -->
              <div class="relative flex-1">
                <i class="fas fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-sm"></i>
                <input
                  type="text"
                  [value]="searchProductQuery()"
                  (input)="onSearchProductInput($any($event.target).value)"
                  placeholder="Buscar snacks, bebidas, sopas, marcas o código de bandeja..."
                  class="w-full bg-slate-900 border border-slate-800 focus:border-indigo-500 rounded-2xl pl-11 pr-10 py-3.5 text-white text-sm outline-none transition-all placeholder:text-slate-600 shadow-inner"
                />
                @if (searchProductQuery()) {
                  <button
                    type="button"
                    (click)="searchProductQuery.set('')"
                    class="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors cursor-pointer"
                  >
                    <i class="fas fa-xmark text-sm"></i>
                  </button>
                }
              </div>

              <!-- Botón rápido ver categorías -->
              <button
                type="button"
                (click)="showAllCategoriesModal.set(true)"
                class="inline-flex items-center justify-center gap-2 px-4 py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-bold text-slate-300 hover:text-white transition-all cursor-pointer shrink-0"
              >
                <i class="fas fa-layer-group text-indigo-400"></i>
                <span>Ver Departamentos</span>
              </button>
            </div>

            <!-- Chips / Píldoras de Categorías para Filtrado Rápido -->
            <div class="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
              <button
                type="button"
                (click)="selectCatalogCategory(null)"
                [class.bg-indigo-600]="selectedCatalogCategoryId() === null"
                [class.text-white]="selectedCatalogCategoryId() === null"
                [class.bg-slate-900]="selectedCatalogCategoryId() !== null"
                [class.text-slate-400]="selectedCatalogCategoryId() !== null"
                [class.hover:bg-slate-800]="selectedCatalogCategoryId() !== null"
                class="px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border border-slate-800 cursor-pointer shadow-sm"
              >
                Todos ({{ allProducts().length }})
              </button>

              @for (cat of categories(); track cat.id) {
                <button
                  type="button"
                  (click)="selectCatalogCategory(cat.id)"
                  [class.bg-indigo-600]="selectedCatalogCategoryId() === cat.id"
                  [class.text-white]="selectedCatalogCategoryId() === cat.id"
                  [class.bg-slate-900]="selectedCatalogCategoryId() !== cat.id"
                  [class.text-slate-400]="selectedCatalogCategoryId() !== cat.id"
                  [class.hover:bg-slate-800]="selectedCatalogCategoryId() !== cat.id"
                  class="px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border border-slate-800 cursor-pointer shadow-sm flex items-center gap-1.5"
                >
                  <span>{{ cat.nombre }}</span>
                  <span class="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-800/80 text-slate-300">
                    {{ getCategoryProductCount(cat.id) }}
                  </span>
                </button>
              }
            </div>
          </div>

          <!-- Grid de Productos del Catálogo -->
          @if (isLoadingAllProducts()) {
            <div class="py-20 text-center text-slate-500">
              <i class="fas fa-spinner fa-spin text-3xl text-indigo-500 mb-3"></i>
              <p class="text-sm">Cargando catálogo de productos...</p>
            </div>
          } @else if (filteredCatalogProducts().length === 0) {
            <div class="p-12 rounded-3xl bg-slate-900 border border-slate-800 text-center space-y-3">
              <i class="fas fa-search text-4xl text-slate-600 block"></i>
              <h3 class="text-lg font-bold text-white">No se encontraron productos</h3>
              <p class="text-xs text-slate-400 max-w-sm mx-auto">
                No hay artículos que coincidan con "{{ searchProductQuery() }}". Intenta con otro término o limpia los filtros.
              </p>
              <button
                type="button"
                (click)="clearCatalogFilters()"
                class="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all cursor-pointer shadow-md inline-flex items-center gap-2"
              >
                <i class="fas fa-rotate-left"></i> Restablecer Filtros
              </button>
            </div>
          } @else {
            <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              @for (product of filteredCatalogProducts(); track product.id_producto) {
                <div class="bg-slate-900 border border-slate-800 hover:border-indigo-500/50 rounded-3xl p-5 shadow-lg hover:shadow-indigo-500/10 transition-all duration-300 flex flex-col justify-between group hover:-translate-y-1">
                  
                  <div class="space-y-4">
                    <!-- Contenedor Imagen y Badges -->
                    <div class="relative h-44 rounded-2xl bg-slate-950 border border-slate-800/80 overflow-hidden flex items-center justify-center">
                      
                      <!-- Badge Ubicación Bandeja / Slot -->
                      <span class="absolute top-2.5 left-2.5 z-10 px-2 py-0.5 rounded-lg bg-slate-900/95 border border-slate-700 text-indigo-300 text-[10px] font-mono font-bold shadow-md flex items-center gap-1">
                        <i class="fas fa-cube text-[9px] text-indigo-400"></i> {{ product.ubicacion || 'A001' }}
                      </span>

                      <!-- Badge Descuento si aplica -->
                      @if (product.descuento && product.descuento > 0 && product.descuento < product.precio) {
                        <span class="absolute top-2.5 right-2.5 z-10 px-2 py-0.5 rounded-lg bg-rose-500/90 text-white text-[10px] font-black uppercase tracking-wider shadow-md">
                          -{{ product.descuento | currency:'MXN':'symbol':'1.0-0' }} OFF
                        </span>
                      }

                      <!-- Imagen -->
                      @if (product.tiene_imagen === 1) {
                        <img
                          [src]="getProductImageUrl(product.id_producto)"
                          [alt]="product.nombre_producto"
                          class="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-300 pointer-events-none"
                          decoding="async"
                          loading="lazy"
                          (error)="onImageError($event)"
                        />
                      } @else {
                        <div class="text-center p-6 text-slate-600">
                          <i class="fas fa-box-open text-4xl mb-2 block text-slate-700"></i>
                          <span class="text-[11px] font-medium text-slate-500">Sin Fotografía</span>
                        </div>
                      }
                    </div>

                    <!-- Datos del Producto -->
                    <div>
                      <div class="flex items-center justify-between text-[11px] font-bold text-indigo-400 uppercase tracking-wider mb-1">
                        <span class="truncate">{{ product.nombre_categoria || 'General' }}</span>
                        @if (product.stock !== undefined) {
                          <span
                            [class.text-emerald-400]="product.stock > 0"
                            [class.text-rose-400]="product.stock <= 0"
                            class="text-[10px] font-mono normal-case shrink-0"
                          >
                            {{ product.stock > 0 ? product.stock + ' pzs' : 'Agotado' }}
                          </span>
                        }
                      </div>

                      <h3 class="text-base font-bold text-white group-hover:text-indigo-300 transition-colors line-clamp-1" [title]="product.nombre_producto">
                        {{ product.nombre_producto }}
                      </h3>

                      @if (product.descripcion) {
                        <p class="text-xs text-slate-400 line-clamp-2 mt-1 min-h-[2rem]">
                          {{ product.descripcion }}
                        </p>
                      }
                    </div>
                  </div>

                  <!-- Precios y Botón de Agregar -->
                  <div class="pt-4 border-t border-slate-800 mt-4 flex items-center justify-between gap-2">
                    <div>
                      @if (product.descuento && product.descuento > 0 && product.descuento < product.precio) {
                        <div class="text-[11px] text-slate-500 line-through font-mono">
                          {{ product.precio | currency:'MXN':'symbol':'1.2-2' }}
                        </div>
                        <div class="text-lg font-black font-mono text-emerald-400">
                          {{ (product.precio - product.descuento) | currency:'MXN':'symbol':'1.2-2' }}
                        </div>
                      } @else {
                        <div class="text-lg font-black font-mono text-white">
                          {{ product.precio | currency:'MXN':'symbol':'1.2-2' }}
                        </div>
                      }
                    </div>

                    <button
                      type="button"
                      (click)="addToCart(product)"
                      [disabled]="product.stock !== undefined && product.stock <= 0"
                      [class.opacity-50]="product.stock !== undefined && product.stock <= 0"
                      [class.cursor-not-allowed]="product.stock !== undefined && product.stock <= 0"
                      class="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/30 hover:shadow-indigo-600/50 hover:scale-105 active:scale-95 transition-all cursor-pointer"
                    >
                      <i class="fas fa-plus text-xs"></i>
                      <span>Agregar</span>
                      @if (cartService.getItemQuantity(product.id_producto) > 0) {
                        <span class="w-4 h-4 rounded-full bg-white text-indigo-700 text-[10px] font-black flex items-center justify-center ml-0.5 shadow-sm">
                          {{ cartService.getItemQuantity(product.id_producto) }}
                        </span>
                      }
                    </button>
                  </div>

                </div>
              }
            </div>
          }
        </section>

      </main>

      <!-- Drawer Lateral de Carrito de Compras -->
      @if (showCartDrawer()) {
        <div class="fixed inset-0 z-50 overflow-hidden animate-fade-in">
          <div
            (click)="toggleCartDrawer()"
            class="absolute inset-0 bg-slate-950/80 transition-opacity"
          ></div>

          <div class="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <div class="w-screen max-w-md bg-slate-900 border-l border-slate-800 p-6 flex flex-col justify-between shadow-2xl">
              
              <!-- Header Drawer -->
              <div>
                <div class="flex items-center justify-between pb-4 border-b border-slate-800">
                  <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center font-bold">
                      <i class="fas fa-shopping-bag"></i>
                    </div>
                    <div>
                      <h3 class="font-black text-lg text-white">Tu Carrito</h3>
                      <p class="text-xs text-slate-400">{{ cartItemsCount() }} artículos seleccionados</p>
                    </div>
                  </div>
                  <button
                    (click)="toggleCartDrawer()"
                    class="w-8 h-8 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 flex items-center justify-center cursor-pointer transition-colors"
                  >
                    <i class="fas fa-xmark"></i>
                  </button>
                </div>

                <!-- Lista de Artículos -->
                <div class="divide-y divide-slate-800/60 max-h-[60vh] overflow-y-auto my-4 pr-1">
                  @if (cartItems().length === 0) {
                    <div class="py-16 text-center text-slate-500">
                      <i class="fas fa-cart-arrow-down text-4xl mb-3 block text-slate-600"></i>
                      <p class="text-sm font-semibold text-slate-400">Tu carrito está vacío</p>
                      <p class="text-xs text-slate-500 mt-1">Agrega productos del carrusel para comenzar.</p>
                    </div>
                  } @else {
                    @for (item of cartItems(); track item.id_producto) {
                      <div class="py-4 flex items-center gap-4">
                        <div class="w-14 h-14 rounded-xl bg-slate-950 border border-slate-800 overflow-hidden flex items-center justify-center shrink-0">
                          @if (item.tiene_imagen === 1) {
                            <img [src]="getProductImageUrl(item.id_producto)" [alt]="item.nombre_producto" class="w-full h-full object-contain p-1" />
                          } @else {
                            <i class="fas fa-box text-slate-600"></i>
                          }
                        </div>
                        <div class="flex-1 min-w-0">
                          <h4 class="text-sm font-bold text-white truncate">{{ item.nombre_producto }}</h4>
                          <div class="text-xs font-mono text-emerald-400 font-bold">
                            {{ item.precio_final | currency:'MXN':'symbol':'1.2-2' }}
                          </div>
                          
                          <!-- Controles de Cantidad -->
                          <div class="flex items-center gap-2 mt-2">
                            <button
                              (click)="cartService.updateQuantity(item.id_producto, item.cantidad - 1)"
                              class="w-6 h-6 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center text-xs cursor-pointer"
                            >
                              -
                            </button>
                            <span class="text-xs font-mono font-bold text-white px-2">
                              {{ item.cantidad }}
                            </span>
                            <button
                              (click)="cartService.updateQuantity(item.id_producto, item.cantidad + 1)"
                              class="w-6 h-6 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center text-xs cursor-pointer"
                            >
                              +
                            </button>
                          </div>
                        </div>

                        <!-- Botón Eliminar -->
                        <button
                          (click)="cartService.removeItem(item.id_producto)"
                          class="w-8 h-8 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 flex items-center justify-center cursor-pointer transition-colors"
                          title="Eliminar artículo"
                        >
                          <i class="fas fa-trash-can text-xs"></i>
                        </button>
                      </div>
                    }
                  }
                </div>
              </div>

              <!-- Footer Drawer: Totales & Checkout -->
              @if (cartItems().length > 0) {
                <div class="pt-4 border-t border-slate-800 space-y-4">
                  <div class="space-y-1 text-sm">
                    <div class="flex justify-between text-slate-400 text-xs">
                      <span>Subtotal</span>
                      <span class="font-mono">{{ cartSubtotal() | currency:'MXN':'symbol':'1.2-2' }}</span>
                    </div>
                    @if (cartService.totalSavings() > 0) {
                      <div class="flex justify-between text-emerald-400 text-xs font-bold">
                        <span>Ahorro en Descuentos</span>
                        <span class="font-mono">-{{ cartService.totalSavings() | currency:'MXN':'symbol':'1.2-2' }}</span>
                      </div>
                    }
                    <div class="flex justify-between text-white font-black text-lg pt-1">
                      <span>Total</span>
                      <span class="font-mono text-emerald-400">{{ cartSubtotal() | currency:'MXN':'symbol':'1.2-2' }}</span>
                    </div>
                  </div>

                  <div class="space-y-2">
                    <button
                      type="button"
                      (click)="openCheckout('payment_card')"
                      class="w-full py-3.5 px-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-sm shadow-lg shadow-indigo-600/30 hover:shadow-indigo-600/50 hover:-translate-y-0.5 transition-all cursor-pointer flex items-center justify-center gap-2"
                    >
                      <i class="fas fa-credit-card"></i>
                      <span>Pagar con Tarjeta</span>
                    </button>

                    <button
                      type="button"
                      (click)="openCheckout('payment_cash')"
                      class="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-sm shadow-lg shadow-emerald-600/30 hover:shadow-emerald-600/50 hover:-translate-y-0.5 transition-all cursor-pointer flex items-center justify-center gap-2"
                    >
                      <i class="fas fa-coins"></i>
                      <span>Pagar con Efectivo</span>
                    </button>
                    
                    <button
                      type="button"
                      (click)="cartService.clear()"
                      class="w-full py-2 text-xs font-semibold text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
                    >
                      Vaciar Carrito
                    </button>
                  </div>
                </div>
              }

            </div>
          </div>
        </div>
      }

      <!-- Footer General de la Tienda -->
      <footer class="border-t border-slate-800 bg-slate-900 py-8 text-center text-xs text-slate-500">
        <p>PauloBot Store &copy; 2026 — Plataforma Inteligente Vending & Ecommerce Desacoplada</p>
      </footer>

    </div>
  `,
  styles: [`
    .border-emerald-500-60 {
      border-color: rgba(16, 185, 129, 0.6);
    }
    .hover\\:shadow-emerald-500-10:hover {
      box-shadow: 0 10px 25px -5px rgba(16, 185, 129, 0.1);
    }
    .bg-emerald-500-20 {
      background-color: rgba(16, 185, 129, 0.2);
    }
    .border-emerald-500-30 {
      border-color: rgba(16, 185, 129, 0.3);
    }
  `]
})
export class StoreComponent implements OnInit, OnDestroy {
  @ViewChild('featuredWrapper') featuredWrapper!: ElementRef<HTMLDivElement>;
  @ViewChild('categoryWrapper') categoryWrapper!: ElementRef<HTMLDivElement>;

  private productService = inject(ProductService);
  private categoryService = inject(CategoryService);
  public cartService = inject(CartService);
  private digitalServicesService = inject(DigitalServicesService);

  featuredProducts = signal<ProductDto[]>([]);
  categories = signal<CategoryDto[]>([]);
  services = signal<ServiceProvider[]>([]);
  allProducts = signal<ProductDto[]>([]);
  
  isLoadingFeatured = signal<boolean>(true);
  isLoadingCategories = signal<boolean>(true);
  isLoadingServices = signal<boolean>(true);
  isLoadingAllProducts = signal<boolean>(true);

  // Filtros y Búsqueda del Catálogo Completo
  searchProductQuery = signal<string>('');
  selectedCatalogCategoryId = signal<number | null>(null);
  catalogSortBy = signal<'default' | 'price-asc' | 'price-desc' | 'discount'>('default');
  
  showCartDrawer = signal<boolean>(false);
  showCfeModal = signal<boolean>(false);
  showMovistarModal = signal<boolean>(false);
  showAllCategoriesModal = signal<boolean>(false);
  showCheckoutModal = signal<boolean>(false);
  checkoutInitialStep = signal<'review' | 'payment_card' | 'payment_cash'>('payment_card');
  toastMessage = signal<string | null>(null);

  // Computados de Carrito
  readonly cartItems = this.cartService.items;
  readonly cartItemsCount = this.cartService.totalItems;
  readonly cartSubtotal = this.cartService.subtotal;

  // Catálogo Completo Filtrado Dinámicamente
  filteredCatalogProducts = computed(() => {
    let list = this.allProducts();
    const catId = this.selectedCatalogCategoryId();
    const q = this.searchProductQuery().toLowerCase().trim();
    const sort = this.catalogSortBy();

    if (catId !== null) {
      list = list.filter(p => p.id_categoria === catId);
    }

    if (q) {
      list = list.filter(p =>
        p.nombre_producto?.toLowerCase().includes(q) ||
        p.descripcion?.toLowerCase().includes(q) ||
        p.nombre_categoria?.toLowerCase().includes(q) ||
        p.nombre_subcategoria?.toLowerCase().includes(q) ||
        p.ubicacion?.toLowerCase().includes(q) ||
        p.sku?.toLowerCase().includes(q)
      );
    }

    if (sort === 'price-asc') {
      list = [...list].sort((a, b) => {
        const pA = (a.descuento && a.descuento > 0 && a.descuento < a.precio) ? (a.precio - a.descuento) : a.precio;
        const pB = (b.descuento && b.descuento > 0 && b.descuento < b.precio) ? (b.precio - b.descuento) : b.precio;
        return pA - pB;
      });
    } else if (sort === 'price-desc') {
      list = [...list].sort((a, b) => {
        const pA = (a.descuento && a.descuento > 0 && a.descuento < a.precio) ? (a.precio - a.descuento) : a.precio;
        const pB = (b.descuento && b.descuento > 0 && b.descuento < b.precio) ? (b.precio - b.descuento) : b.precio;
        return pB - pA;
      });
    } else if (sort === 'discount') {
      list = [...list].sort((a, b) => (b.descuento || 0) - (a.descuento || 0));
    }

    return list;
  });

  // Índices de posición para GPU Slide
  servicesSlideIndex = signal<number>(0);
  featuredSlideIndex = signal<number>(0);
  categorySlideIndex = signal<number>(0);

  // Parámetros de tarjetas y pasos
  private cardWidth = 320;
  private cardGap = 24;
  private visibleCount = 3;

  private servicesInterval: any = null;
  private featuredInterval: any = null;
  private categoriesInterval: any = null;
  
  private isServicesHovered = false;
  private isFeaturedHovered = false;
  private isCategoriesHovered = false;

  @HostListener('window:resize')
  onResize(): void {
    this.updateVisibleCount();
  }

  async ngOnInit(): Promise<void> {
    this.updateVisibleCount();

    await Promise.all([
      this.loadServices(),
      this.loadFeatured(),
      this.loadCategories(),
      this.loadAllProducts()
    ]);

    this.startAutoSlides();
  }

  ngOnDestroy(): void {
    this.stopAutoSlides();
  }

  private updateVisibleCount(): void {
    if (typeof window === 'undefined') return;
    const w = window.innerWidth;
    if (w < 640) {
      this.visibleCount = 1;
      this.cardWidth = Math.min(w - 48, 300);
    } else if (w < 1024) {
      this.visibleCount = 2;
      this.cardWidth = 300;
    } else if (w < 1280) {
      this.visibleCount = 3;
      this.cardWidth = 320;
    } else {
      this.visibleCount = 4;
      this.cardWidth = 320;
    }
  }

  // Cálculos de Desplazamiento en Pixeles (GPU Offset)
  servicesOffset = computed(() => {
    const total = this.services().length;
    if (total === 0) return 0;
    const step = this.cardWidth + this.cardGap;
    const maxOffset = Math.max(0, (total - this.visibleCount) * step);
    return Math.min(this.servicesSlideIndex() * step, maxOffset);
  });

  featuredOffset = computed(() => {
    const total = this.featuredProducts().length;
    if (total === 0) return 0;
    const step = this.cardWidth + this.cardGap;
    const maxOffset = Math.max(0, (total - this.visibleCount) * step);
    return Math.min(this.featuredSlideIndex() * step, maxOffset);
  });

  categoryOffset = computed(() => {
    const total = this.categories().length + 1; // +1 por tarjeta especial "Todas las Categorías"
    if (total === 0) return 0;
    const step = this.cardWidth + this.cardGap;
    const maxOffset = Math.max(0, (total - this.visibleCount) * step);
    return Math.min(this.categorySlideIndex() * step, maxOffset);
  });

  // Conteo de Dots
  servicesDotsCount = computed(() => {
    const total = this.services().length;
    return Math.max(1, total - this.visibleCount + 1);
  });

  featuredDotsCount = computed(() => {
    const total = this.featuredProducts().length;
    return Math.max(1, total - this.visibleCount + 1);
  });

  categoryDotsCount = computed(() => {
    const total = this.categories().length + 1; // +1 por tarjeta especial "Todas las Categorías"
    return Math.max(1, total - this.visibleCount + 1);
  });

  private isAnyModalOpen(): boolean {
    return this.showCartDrawer() || this.showCfeModal() || this.showMovistarModal() || this.showAllCategoriesModal() || this.showCheckoutModal();
  }

  private startAutoSlides(): void {
    // 1. Auto-Slide de Servicios Digitales (cada 3.5 segundos)
    this.servicesInterval = setInterval(() => {
      if (!this.isServicesHovered && !this.isAnyModalOpen()) {
        this.nextService();
      }
    }, 3500);

    // 2. Auto-Slide de Productos Destacados (cada 2.5 segundos)
    this.featuredInterval = setInterval(() => {
      if (!this.isFeaturedHovered && !this.isAnyModalOpen()) {
        this.nextFeatured();
      }
    }, 2500);

    // 3. Auto-Slide de Categorías (cada 2.0 segundos)
    this.categoriesInterval = setInterval(() => {
      if (!this.isCategoriesHovered && !this.isAnyModalOpen()) {
        this.nextCategory();
      }
    }, 2000);
  }

  private stopAutoSlides(): void {
    if (this.servicesInterval) clearInterval(this.servicesInterval);
    if (this.featuredInterval) clearInterval(this.featuredInterval);
    if (this.categoriesInterval) clearInterval(this.categoriesInterval);
  }

  // Métodos de Navegación Servicios
  nextService(): void {
    const max = this.servicesDotsCount() - 1;
    if (max <= 0) return;
    this.servicesSlideIndex.update(i => (i >= max ? 0 : i + 1));
  }

  prevService(): void {
    const max = this.servicesDotsCount() - 1;
    if (max <= 0) return;
    this.servicesSlideIndex.update(i => (i <= 0 ? max : i - 1));
  }

  goToServiceSlide(index: number): void {
    this.servicesSlideIndex.set(index);
  }

  pauseServices(): void {
    this.isServicesHovered = true;
  }

  resumeServices(): void {
    this.isServicesHovered = false;
  }

  // Métodos de Navegación Destacados
  nextFeatured(): void {
    const max = this.featuredDotsCount() - 1;
    if (max <= 0) return;
    this.featuredSlideIndex.update(i => (i >= max ? 0 : i + 1));
  }

  prevFeatured(): void {
    const max = this.featuredDotsCount() - 1;
    if (max <= 0) return;
    this.featuredSlideIndex.update(i => (i <= 0 ? max : i - 1));
  }

  goToFeaturedSlide(index: number): void {
    this.featuredSlideIndex.set(index);
  }

  pauseFeatured(): void {
    this.isFeaturedHovered = true;
  }

  resumeFeatured(): void {
    this.isFeaturedHovered = false;
  }

  // Métodos de Navegación Categorías
  nextCategory(): void {
    const max = this.categoryDotsCount() - 1;
    if (max <= 0) return;
    this.categorySlideIndex.update(i => (i >= max ? 0 : i + 1));
  }

  prevCategory(): void {
    const max = this.categoryDotsCount() - 1;
    if (max <= 0) return;
    this.categorySlideIndex.update(i => (i <= 0 ? max : i - 1));
  }

  goToCategorySlide(index: number): void {
    this.categorySlideIndex.set(index);
  }

  pauseCategories(): void {
    this.isCategoriesHovered = true;
  }

  resumeCategories(): void {
    this.isCategoriesHovered = false;
  }

  async loadServices(): Promise<void> {
    this.isLoadingServices.set(true);
    try {
      const data = await this.digitalServicesService.loadProviders();
      this.services.set(data || []);
    } catch (e) {
      console.error('Error cargando servicios:', e);
    } finally {
      this.isLoadingServices.set(false);
    }
  }

  async loadFeatured(): Promise<void> {
    this.isLoadingFeatured.set(true);
    try {
      const data = await this.productService.loadFeaturedProducts();
      this.featuredProducts.set(data || []);
    } catch (e) {
      console.error('Error cargando destacados:', e);
    } finally {
      this.isLoadingFeatured.set(false);
    }
  }

  async loadCategories(): Promise<void> {
    this.isLoadingCategories.set(true);
    try {
      const data = await this.categoryService.loadCategories();
      this.categories.set(data || []);
    } catch (e) {
      console.error('Error cargando categorías:', e);
    } finally {
      this.isLoadingCategories.set(false);
    }
  }

  async loadAllProducts(): Promise<void> {
    this.isLoadingAllProducts.set(true);
    try {
      const data = await this.productService.loadProducts();
      this.allProducts.set(data || []);
    } catch (e) {
      console.error('Error cargando catálogo completo:', e);
    } finally {
      this.isLoadingAllProducts.set(false);
    }
  }

  getCategoryProductCount(catId: number): number {
    return this.allProducts().filter(p => p.id_categoria === catId).length;
  }

  selectCatalogCategory(catId: number | null): void {
    this.selectedCatalogCategoryId.set(catId);
  }

  onSearchProductInput(val: string): void {
    this.searchProductQuery.set(val);
  }

  setCatalogSort(val: any): void {
    this.catalogSortBy.set(val);
  }

  clearCatalogFilters(): void {
    this.searchProductQuery.set('');
    this.selectedCatalogCategoryId.set(null);
    this.catalogSortBy.set('default');
  }

  scrollToCatalog(event?: Event): void {
    if (event) {
      event.preventDefault();
    }
    const el = document.getElementById('catalogo');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  openCheckout(step: 'review' | 'payment_card' | 'payment_cash' = 'payment_card'): void {
    this.checkoutInitialStep.set(step);
    this.showCartDrawer.set(false);
    this.showCheckoutModal.set(true);
  }

  onServiceClick(service: ServiceProvider): void {
    if (service.id === 'cfe') {
      this.showCfeModal.set(true);
    } else if (service.id === 'movistar') {
      this.showMovistarModal.set(true);
    } else {
      this.toastMessage.set(`El servicio de ${service.nombre} estará habilitado próximamente.`);
      setTimeout(() => {
        this.toastMessage.set(null);
      }, 3000);
    }
  }

  onSelectCategoryFromModal(cat: CategoryDto): void {
    this.showAllCategoriesModal.set(false);
    this.selectCatalogCategory(cat.id);
    this.scrollToCatalog();
    this.toastMessage.set(`Filtrando catálogo por: ${cat.nombre}`);
    setTimeout(() => {
      this.toastMessage.set(null);
    }, 2500);
  }

  onCategoryClick(cat: CategoryDto): void {
    this.selectCatalogCategory(cat.id);
    this.scrollToCatalog();
    this.toastMessage.set(`Filtrando catálogo por: ${cat.nombre}`);
    setTimeout(() => {
      this.toastMessage.set(null);
    }, 2500);
  }

  getProductImageUrl(productId: number): string {
    return `http://localhost:8000/api/v1/products/${productId}/image`;
  }

  getCategoryImageUrl(categoryId: number): string {
    return `http://localhost:8000/api/v1/categories/${categoryId}/image`;
  }

  onImageError(event: any): void {
    event.target.style.display = 'none';
    if (event.target.parentElement) {
      event.target.parentElement.innerHTML = `
        <div class="text-center p-6 text-slate-600">
          <i class="fas fa-box-open text-4xl mb-2 block text-slate-700"></i>
          <span class="text-[11px] font-medium text-slate-500">Sin Fotografía</span>
        </div>
      `;
    }
  }

  addToCart(product: ProductDto): void {
    this.cartService.addItem({
      id_producto: product.id_producto,
      nombre_producto: product.nombre_producto,
      precio: product.precio,
      descuento: product.descuento,
      tiene_imagen: product.tiene_imagen,
      sku: product.sku,
      ubicacion: product.ubicacion
    });

    this.toastMessage.set(`¡${product.nombre_producto} agregado al carrito!`);
    setTimeout(() => {
      this.toastMessage.set(null);
    }, 2500);
  }

  toggleCartDrawer(): void {
    this.showCartDrawer.update(v => !v);
  }
}
