import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <!-- Navegación Superior -->
    <header class="sticky top-0 z-50 bg-white/85 backdrop-blur-md border-b border-slate-200/80 transition-all duration-200">
      <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-20">
          <!-- Logo & Marca -->
          <a routerLink="/" class="flex items-center gap-3 group">
            <div class="w-11 h-11 bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-xl flex items-center justify-center text-white text-xl shadow-md shadow-indigo-500/25 group-hover:scale-105 transition-transform duration-200">
              <i class="fas fa-robot"></i>
            </div>
            <div class="text-2xl font-extrabold text-slate-900 tracking-tight">
              PauloBot <span class="text-indigo-600">Store</span>
            </div>
          </a>

          <!-- Botones de Acción -->
          <div class="flex items-center gap-3.5">
            <a routerLink="/store"
               class="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-600/25 hover:shadow-indigo-600/40 hover:-translate-y-0.5 transition-all duration-200">
              <i class="fas fa-shopping-bag text-xs"></i>
              <span>Ir a la Tienda</span>
            </a>
            <a routerLink="/login"
               class="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold text-slate-800 bg-white hover:bg-slate-900 hover:text-white border border-slate-300 hover:border-slate-900 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
              <i class="fas fa-user-shield text-xs"></i>
              <span>Administrador</span>
            </a>
          </div>
        </div>
      </div>
    </header>

    <!-- Hero Section -->
    <main>
      <section class="relative pt-16 pb-20 overflow-hidden">
        <!-- Glow radial decorativo de fondo -->
        <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-200/40 rounded-full blur-3xl pointer-events-none -z-10"></div>

        <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <!-- Badge Hero -->
          <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-100/90 text-indigo-700 font-bold text-xs sm:text-sm tracking-wide uppercase mb-6 shadow-sm">
            <i class="fas fa-sparkles text-amber-500"></i>
            <span>Ecosistema Inteligente de Ventas 24/7</span>
          </div>

          <!-- Título Hero -->
          <h1 class="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15] max-w-3xl mb-6">
            Bienvenido a <span class="bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 bg-clip-text text-transparent">PauloBot Store</span>
          </h1>

          <!-- Subtítulo Hero -->
          <p class="text-lg sm:text-xl text-slate-600 max-w-2xl leading-relaxed mb-12">
            Plataforma de vending y comercio automatizado. Accede directamente al sistema de compras para usuarios o administra el inventario, ventas y caja.
          </p>

          <!-- Portales Principales (Grid 2 Cards) -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-7 mb-20">
            <!-- Tarjeta 1: Sistema de Clientes (Tienda /store) -->
            <div class="bg-white border border-slate-200/90 hover:border-indigo-500/40 rounded-3xl p-8 sm:p-9 shadow-sm hover:shadow-xl hover:shadow-indigo-500/10 hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between group">
              <div>
                <div class="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-2xl mb-6 group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
                  <i class="fas fa-store"></i>
                </div>
                <h2 class="text-2xl font-bold text-slate-900 mb-3 group-hover:text-indigo-600 transition-colors">Tienda Vending / Clientes</h2>
                <p class="text-slate-600 text-base leading-relaxed mb-8">
                  Catálogo interactivo con carrusel de productos destacados, navegación por categorías y terminal de despacho automatizado para usuarios finales.
                </p>
              </div>
              <a routerLink="/store"
                 class="w-full inline-flex items-center justify-center gap-2.5 py-3.5 px-6 rounded-full font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-600/30 hover:shadow-indigo-600/50 transition-all duration-200">
                <i class="fas fa-shopping-cart"></i>
                <span>Abrir Tienda / Catálogo</span>
              </a>
            </div>

            <!-- Tarjeta 2: Panel Administrador -->
            <div class="bg-white border border-slate-200/90 hover:border-slate-900/40 rounded-3xl p-8 sm:p-9 shadow-sm hover:shadow-xl hover:shadow-slate-900/10 hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between group">
              <div>
                <div class="w-16 h-16 rounded-2xl bg-slate-100 text-slate-800 flex items-center justify-center text-2xl mb-6 group-hover:scale-110 group-hover:bg-slate-900 group-hover:text-white transition-all duration-300">
                  <i class="fas fa-chart-pie"></i>
                </div>
                <h2 class="text-2xl font-bold text-slate-900 mb-3 group-hover:text-slate-900 transition-colors">Panel Administrador</h2>
                <p class="text-slate-600 text-base leading-relaxed mb-8">
                  Gestión completa de inventario, cortes de caja, reporte de movimientos, configuración de empresa, usuarios y monedero MDB.
                </p>
              </div>
              <a routerLink="/login"
                 class="w-full inline-flex items-center justify-center gap-2.5 py-3.5 px-6 rounded-full font-semibold text-slate-900 bg-white hover:bg-slate-900 hover:text-white border-2 border-slate-200 hover:border-slate-900 shadow-sm transition-all duration-200">
                <i class="fas fa-key"></i>
                <span>Acceso Administrador</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      <!-- Módulos y Capacidades del Sistema -->
      <section class="py-20 bg-slate-100/70 border-t border-slate-200">
        <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="text-center max-w-2xl mx-auto mb-14">
            <h2 class="text-3xl font-extrabold text-slate-900 tracking-tight mb-3">Capacidades del Sistema</h2>
            <p class="text-slate-600 text-base">Estructurado para máxima eficiencia en punto de venta y administración remota.</p>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <!-- Capacidad 1 -->
            <div class="bg-white p-7 rounded-2xl border border-slate-200/80 hover:border-indigo-500/40 hover:-translate-y-1 hover:shadow-lg transition-all duration-200 group">
              <div class="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-xl mb-4 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                <i class="fas fa-cash-register"></i>
              </div>
              <h3 class="text-lg font-bold text-slate-900 mb-2">Venta Automática</h3>
              <p class="text-sm text-slate-600 leading-relaxed">Procesamiento de pagos y emisión instantánea de despachos.</p>
            </div>

            <!-- Capacidad 2 -->
            <div class="bg-white p-7 rounded-2xl border border-slate-200/80 hover:border-indigo-500/40 hover:-translate-y-1 hover:shadow-lg transition-all duration-200 group">
              <div class="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-xl mb-4 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                <i class="fas fa-coins"></i>
              </div>
              <h3 class="text-lg font-bold text-slate-900 mb-2">Monedero MDB</h3>
              <p class="text-sm text-slate-600 leading-relaxed">Control exacto de cambio, validación de monedas y billetes.</p>
            </div>

            <!-- Capacidad 3 -->
            <div class="bg-white p-7 rounded-2xl border border-slate-200/80 hover:border-indigo-500/40 hover:-translate-y-1 hover:shadow-lg transition-all duration-200 group">
              <div class="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-xl mb-4 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                <i class="fas fa-boxes-stacked"></i>
              </div>
              <h3 class="text-lg font-bold text-slate-900 mb-2">Gestión de Productos</h3>
              <p class="text-sm text-slate-600 leading-relaxed">Categorías, subcategorías y destacado de productos en tiempo real.</p>
            </div>

            <!-- Capacidad 4 -->
            <div class="bg-white p-7 rounded-2xl border border-slate-200/80 hover:border-indigo-500/40 hover:-translate-y-1 hover:shadow-lg transition-all duration-200 group">
              <div class="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-xl mb-4 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                <i class="fas fa-cloud-arrow-up"></i>
              </div>
              <h3 class="text-lg font-bold text-slate-900 mb-2">Sync Híbrida</h3>
              <p class="text-sm text-slate-600 leading-relaxed">Sincronización continua de transacciones entre servidor local y nube.</p>
            </div>
          </div>
        </div>
      </section>
    </main>

    <!-- Footer -->
    <footer class="bg-slate-900 text-slate-400 py-10 border-t border-slate-800">
      <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div class="flex items-center gap-2 text-white font-bold text-base">
            <i class="fas fa-robot text-indigo-400"></i>
            <span>PauloBot Store</span>
          </div>
          <div class="text-sm">
            © 2026 PauloBot Store – Todos los derechos reservados.
          </div>
          <div class="flex items-center gap-4 text-xs">
            <a href="http://localhost:8000/api/docs" target="_blank" class="hover:text-indigo-400 transition-colors">
              <i class="fas fa-book mr-1"></i> Swagger API Docs
            </a>
          </div>
        </div>
      </div>
    </footer>
  `
})
export class HomeComponent {}
