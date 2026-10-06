import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row">
      
      <!-- Sidebar Lateral Modular -->
      <aside class="w-full md:w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between shrink-0">
        <div>
          <!-- Logo & Brand Header -->
          <div class="h-20 flex items-center gap-3 px-6 border-b border-slate-800/80">
            <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center text-white text-xl shadow-md shadow-indigo-600/30">
              <i class="fas fa-robot"></i>
            </div>
            <div>
              <div class="font-extrabold text-lg text-white tracking-tight leading-none">
                PauloBot <span class="text-indigo-400">Store</span>
              </div>
              <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400">Panel Administrador</span>
            </div>
          </div>

          <!-- Navegación Modular -->
          <nav class="p-4 space-y-1.5 text-sm font-medium">
            <a
              routerLink="/admin"
              routerLinkActive="bg-indigo-600/15 text-indigo-400 border border-indigo-500/30"
              [routerLinkActiveOptions]="{ exact: true }"
              class="flex items-center gap-3 px-4 py-3 rounded-2xl text-slate-300 hover:bg-slate-800 hover:text-white transition-all group"
            >
              <i class="fas fa-chart-pie text-slate-400 group-hover:text-indigo-400 w-5"></i>
              <span>Dashboard</span>
            </a>

            <div class="pt-4 pb-2 px-4 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Operación & Catálogo
            </div>

            <!-- Consulta de Productos -->
            <a
              routerLink="/admin/productos"
              routerLinkActive="bg-indigo-600/15 text-indigo-400 border border-indigo-500/30"
              [routerLinkActiveOptions]="{ exact: true }"
              class="flex items-center justify-between px-4 py-3 rounded-2xl text-slate-300 hover:bg-slate-800 hover:text-white transition-all group"
            >
              <div class="flex items-center gap-3">
                <i class="fas fa-boxes-stacked text-slate-400 group-hover:text-indigo-400 w-5"></i>
                <span>Consulta Productos</span>
              </div>
              <span class="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">Nuevo</span>
            </a>

            <!-- Agregar Producto -->
            <a
              routerLink="/admin/productos/nuevo"
              routerLinkActive="bg-indigo-600/15 text-indigo-400 border border-indigo-500/30"
              class="flex items-center justify-between px-4 py-3 rounded-2xl text-slate-300 hover:bg-slate-800 hover:text-white transition-all group"
            >
              <div class="flex items-center gap-3">
                <i class="fas fa-box-open text-slate-400 group-hover:text-indigo-400 w-5"></i>
                <span>Agregar Producto</span>
              </div>
              <span class="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">Nuevo</span>
            </a>

            <!-- Categorías -->
            <a
              routerLink="/admin/categorias"
              routerLinkActive="bg-indigo-600/15 text-indigo-400 border border-indigo-500/30"
              class="flex items-center justify-between px-4 py-3 rounded-2xl text-slate-300 hover:bg-slate-800 hover:text-white transition-all group"
            >
              <div class="flex items-center gap-3">
                <i class="fas fa-tags text-slate-400 group-hover:text-indigo-400 w-5"></i>
                <span>Categorías</span>
              </div>
              <span class="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">Nuevo</span>
            </a>

            <!-- Subcategorías -->
            <a
              routerLink="/admin/subcategorias"
              routerLinkActive="bg-indigo-600/15 text-indigo-400 border border-indigo-500/30"
              class="flex items-center justify-between px-4 py-3 rounded-2xl text-slate-300 hover:bg-slate-800 hover:text-white transition-all group"
            >
              <div class="flex items-center gap-3">
                <i class="fas fa-folder-tree text-slate-400 group-hover:text-indigo-400 w-5"></i>
                <span>Subcategorías</span>
              </div>
              <span class="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">Nuevo</span>
            </a>

            <div class="pt-4 pb-2 px-4 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Finanzas & Caja
            </div>

            <!-- Movimientos -->
            <a
              routerLink="/admin/movimientos"
              routerLinkActive="bg-indigo-600/15 text-indigo-400 border border-indigo-500/30"
              class="flex items-center justify-between px-4 py-3 rounded-2xl text-slate-300 hover:bg-slate-800 hover:text-white transition-all group"
            >
              <div class="flex items-center gap-3">
                <i class="fas fa-money-bill-transfer text-slate-400 group-hover:text-indigo-400 w-5"></i>
                <span>Movimientos</span>
              </div>
              <span class="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">Nuevo</span>
            </a>

            <!-- Cortes de Caja -->
            <a
              routerLink="/admin/cortes-caja"
              routerLinkActive="bg-indigo-600/15 text-indigo-400 border border-indigo-500/30"
              class="flex items-center justify-between px-4 py-3 rounded-2xl text-slate-300 hover:bg-slate-800 hover:text-white transition-all group"
            >
              <div class="flex items-center gap-3">
                <i class="fas fa-cash-register text-slate-400 group-hover:text-indigo-400 w-5"></i>
                <span>Cortes de Caja</span>
              </div>
              <span class="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">Nuevo</span>
            </a>

            <div class="pt-4 pb-2 px-4 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Configuración & Sistema
            </div>

            <!-- Usuarios (Nuevo Módulo Migrado) -->
            <a
              routerLink="/admin/usuarios"
              routerLinkActive="bg-indigo-600/15 text-indigo-400 border border-indigo-500/30"
              class="flex items-center justify-between px-4 py-3 rounded-2xl text-slate-300 hover:bg-slate-800 hover:text-white transition-all group"
            >
              <div class="flex items-center gap-3">
                <i class="fas fa-users-gear text-slate-400 group-hover:text-indigo-400 w-5"></i>
                <span>Usuarios</span>
              </div>
              <span class="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">Nuevo</span>
            </a>

            <!-- Configuración Empresa -->
            <a
              routerLink="/admin/configuracion"
              routerLinkActive="bg-indigo-600/15 text-indigo-400 border border-indigo-500/30"
              class="flex items-center justify-between px-4 py-3 rounded-2xl text-slate-300 hover:bg-slate-800 hover:text-white transition-all group"
            >
              <div class="flex items-center gap-3">
                <i class="fas fa-sliders text-slate-400 group-hover:text-indigo-400 w-5"></i>
                <span>Empresa</span>
              </div>
              <span class="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">Nuevo</span>
            </a>

            <a
              href="javascript:void(0)"
              class="flex items-center justify-between px-4 py-3 rounded-2xl text-slate-400 hover:bg-slate-800/60 hover:text-slate-200 transition-all opacity-70 group"
              title="Módulo en proceso de migración"
            >
              <div class="flex items-center gap-3">
                <i class="fas fa-coins w-5 text-slate-500"></i>
                <span>Monedero MDB</span>
              </div>
              <span class="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">Próx.</span>
            </a>
          </nav>
        </div>

        <!-- Footer Sidebar con Usuario & Logout -->
        <div class="p-4 border-t border-slate-800/80">
          <div class="flex items-center justify-between p-3 rounded-2xl bg-slate-950/60 border border-slate-800">
            <div class="flex items-center gap-3 overflow-hidden">
              <div class="w-9 h-9 rounded-xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 flex items-center justify-center font-bold text-sm shrink-0">
                {{ (user()?.nombre || 'U').charAt(0).toUpperCase() }}
              </div>
              <div class="truncate">
                <div class="text-xs font-bold text-white truncate">{{ user()?.nombre }}</div>
                <div class="text-[10px] text-slate-400 truncate">{{ user()?.correo }}</div>
              </div>
            </div>
            <button
              (click)="onLogout()"
              class="w-8 h-8 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 flex items-center justify-center transition-colors cursor-pointer shrink-0"
              title="Cerrar Sesión"
            >
              <i class="fas fa-arrow-right-from-bracket text-xs"></i>
            </button>
          </div>
        </div>
      </aside>

      <!-- Panel Principal y Contenido de Rutas Hijas -->
      <div class="flex-1 flex flex-col min-w-0">
        
        <!-- Header Superior -->
        <header class="h-20 bg-slate-900/60 border-b border-slate-800/80 backdrop-blur-md sticky top-0 z-40 px-6 sm:px-8 flex items-center justify-between">
          <div class="flex items-center gap-3">
            <span class="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span> Sistema En Línea
            </span>
          </div>

          <div class="flex items-center gap-4">
            <a
              href="http://localhost:8000/api/docs"
              target="_blank"
              class="hidden sm:inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-indigo-400 px-3 py-1.5 rounded-xl border border-slate-800 hover:border-slate-700 transition-all"
            >
              <i class="fas fa-book text-indigo-400"></i>
              <span>Swagger API Docs</span>
            </a>

            <a
              routerLink="/store"
              class="inline-flex items-center gap-2 text-xs font-semibold text-slate-300 hover:text-white px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-all"
            >
              <i class="fas fa-store text-xs"></i>
              <span>Ver Tienda</span>
            </a>
          </div>
        </header>

        <!-- Outlet de Componentes -->
        <main class="flex-1 p-6 sm:p-8 lg:p-10 max-w-7xl w-full mx-auto">
          <router-outlet></router-outlet>
        </main>
      </div>

    </div>
  `
})
export class AdminLayoutComponent {
  get user() {
    return this.authService.currentUser;
  }

  constructor(private authService: AuthService) {}

  async onLogout(): Promise<void> {
    await this.authService.logout();
  }
}
