import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="min-h-screen bg-[#0a0d14] text-slate-200 flex flex-col justify-between select-none">
      
      <!-- Fondo sutil con grid punteado -->
      <div class="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-20 pointer-events-none"></div>

      <!-- Navegación Superior Minimalista -->
      <header class="relative z-10 border-b border-slate-800/80 bg-[#0d111a]/80 backdrop-blur-md">
        <div class="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <a routerLink="/" class="flex items-center gap-2.5 group">
            <div class="w-8 h-8 bg-slate-800 border border-slate-700/80 rounded-lg flex items-center justify-center text-slate-100 text-sm">
              <i class="fas fa-cube"></i>
            </div>
            <span class="text-base font-semibold tracking-tight text-white">
              PauloBot <span class="text-slate-400 font-normal">Store</span>
            </span>
          </a>

          <div class="flex items-center gap-3">
            <a routerLink="/store"
               class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800/80 border border-slate-800 transition-colors">
              <i class="fas fa-store text-[11px]"></i>
              <span>Tienda</span>
            </a>
            <a routerLink="/login"
               class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium text-slate-900 bg-slate-100 hover:bg-white transition-colors">
              <i class="fas fa-lock text-[11px]"></i>
              <span>Admin</span>
            </a>
          </div>
        </div>
      </header>

      <!-- Contenido Principal -->
      <main class="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 py-16 sm:py-24 flex-1 flex flex-col justify-center">
        
        <!-- Header Central -->
        <div class="text-center mb-12 sm:mb-16">
          <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700/60 text-slate-300 text-xs font-medium mb-6">
            <span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            <span>Sistema Vending & Ecommerce Activo</span>
          </div>

          <h1 class="text-3xl sm:text-4xl font-semibold text-white tracking-tight mb-4">
            Plataforma de Gestión y Venta
          </h1>
          <p class="text-sm sm:text-base text-slate-400 max-w-xl mx-auto font-normal leading-relaxed">
            Selecciona el entorno al que deseas ingresar para interactuar con el catálogo o gestionar el sistema.
          </p>
        </div>

        <!-- Tarjetas de Acceso (Tienda & Admin) -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-5 mb-14">
          
          <!-- Opción 1: Catálogo y Tienda -->
          <a routerLink="/store"
             class="group block p-6 sm:p-7 rounded-2xl bg-[#111622] border border-slate-800/90 hover:border-slate-600 transition-all duration-200">
            <div class="w-10 h-10 rounded-xl bg-slate-800/80 border border-slate-700/80 flex items-center justify-center text-slate-200 text-base mb-5 group-hover:border-slate-500 transition-colors">
              <i class="fas fa-bag-shopping"></i>
            </div>
            <h2 class="text-lg font-semibold text-white mb-2 flex items-center justify-between">
              <span>Tienda & Catálogo</span>
              <i class="fas fa-arrow-right text-xs text-slate-500 group-hover:text-white group-hover:translate-x-1 transition-all"></i>
            </h2>
            <p class="text-xs sm:text-sm text-slate-400 font-normal leading-relaxed">
              Exploración de productos, carrusel de destacados y despacho interactivo para usuarios finales.
            </p>
          </a>

          <!-- Opción 2: Panel Administrador -->
          <a routerLink="/login"
             class="group block p-6 sm:p-7 rounded-2xl bg-[#111622] border border-slate-800/90 hover:border-slate-600 transition-all duration-200">
            <div class="w-10 h-10 rounded-xl bg-slate-800/80 border border-slate-700/80 flex items-center justify-center text-slate-200 text-base mb-5 group-hover:border-slate-500 transition-colors">
              <i class="fas fa-sliders"></i>
            </div>
            <h2 class="text-lg font-semibold text-white mb-2 flex items-center justify-between">
              <span>Panel Administrador</span>
              <i class="fas fa-arrow-right text-xs text-slate-500 group-hover:text-white group-hover:translate-x-1 transition-all"></i>
            </h2>
            <p class="text-xs sm:text-sm text-slate-400 font-normal leading-relaxed">
              Control total de inventario, categorías, cortes de caja, historial de movimientos y configuración de empresa.
            </p>
          </a>

        </div>

        <!-- Módulos Informativos Mínimos -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div class="p-3.5 rounded-xl bg-[#0d111a] border border-slate-800/60 text-center">
            <div class="text-xs font-medium text-slate-200">Inventario</div>
            <div class="text-[11px] text-slate-500 mt-0.5">Control por stock</div>
          </div>
          <div class="p-3.5 rounded-xl bg-[#0d111a] border border-slate-800/60 text-center">
            <div class="text-xs font-medium text-slate-200">Corte de Caja</div>
            <div class="text-[11px] text-slate-500 mt-0.5">Auditoría diaria</div>
          </div>
          <div class="p-3.5 rounded-xl bg-[#0d111a] border border-slate-800/60 text-center">
            <div class="text-xs font-medium text-slate-200">MDB Vending</div>
            <div class="text-[11px] text-slate-500 mt-0.5">Monedero & Billetero</div>
          </div>
          <div class="p-3.5 rounded-xl bg-[#0d111a] border border-slate-800/60 text-center">
            <div class="text-xs font-medium text-slate-200">FastAPI Sync</div>
            <div class="text-[11px] text-slate-500 mt-0.5">Arquitectura limpia</div>
          </div>
        </div>

      </main>

      <!-- Footer Minimalista -->
      <footer class="relative z-10 border-t border-slate-800/60 bg-[#0d111a]/40 py-6">
        <div class="max-w-5xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div>© 2026 PauloBot Store. Todos los derechos reservados.</div>
          <div class="flex items-center gap-4">
            <a href="http://localhost:8000/api/docs" target="_blank" class="hover:text-slate-300 transition-colors">
              API Docs
            </a>
          </div>
        </div>
      </footer>

    </div>
  `
})
export class HomeComponent {}
