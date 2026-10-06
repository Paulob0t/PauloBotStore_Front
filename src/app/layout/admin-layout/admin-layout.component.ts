import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="min-h-screen bg-[#0a0d14] text-slate-200 flex flex-col md:flex-row select-none">
      
      <!-- Sidebar Lateral Minimalista -->
      <aside class="w-full md:w-64 bg-[#0d111a] border-r border-slate-800/80 flex flex-col justify-between shrink-0">
        <div>
          <!-- Logo & Brand Header -->
          <div class="h-16 flex items-center gap-2.5 px-6 border-b border-slate-800/80">
            <div class="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700/80 flex items-center justify-center text-slate-100 text-sm">
              <i class="fas fa-cube"></i>
            </div>
            <div>
              <div class="font-semibold text-sm text-white tracking-tight leading-none">
                PauloBot <span class="text-slate-400 font-normal">Store</span>
              </div>
              <span class="text-[10px] font-medium text-slate-500">Panel de Control</span>
            </div>
          </div>

          <!-- Navegación Modular -->
          <nav class="p-3 space-y-1 text-xs font-medium">
            <a
              routerLink="/admin"
              routerLinkActive="bg-slate-800 text-white"
              [routerLinkActiveOptions]="{ exact: true }"
              class="flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 transition-colors group"
            >
              <i class="fas fa-chart-pie text-slate-400 group-hover:text-slate-200 w-4"></i>
              <span>Dashboard</span>
            </a>

            <div class="pt-3 pb-1 px-3 text-[10px] font-semibold uppercase tracking-wider text-slate-600">
              Operación & Catálogo
            </div>

            <!-- Consulta de Productos -->
            <a
              routerLink="/admin/productos"
              routerLinkActive="bg-slate-800 text-white"
              [routerLinkActiveOptions]="{ exact: true }"
              class="flex items-center justify-between px-3 py-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 transition-colors group"
            >
              <div class="flex items-center gap-2.5">
                <i class="fas fa-boxes-stacked text-slate-400 group-hover:text-slate-200 w-4"></i>
                <span>Consulta Productos</span>
              </div>
            </a>

            <!-- Agregar Producto -->
            <a
              routerLink="/admin/productos/nuevo"
              routerLinkActive="bg-slate-800 text-white"
              class="flex items-center justify-between px-3 py-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 transition-colors group"
            >
              <div class="flex items-center gap-2.5">
                <i class="fas fa-plus text-slate-400 group-hover:text-slate-200 w-4"></i>
                <span>Agregar Producto</span>
              </div>
            </a>

            <!-- Categorías -->
            <a
              routerLink="/admin/categorias"
              routerLinkActive="bg-slate-800 text-white"
              class="flex items-center justify-between px-3 py-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 transition-colors group"
            >
              <div class="flex items-center gap-2.5">
                <i class="fas fa-tags text-slate-400 group-hover:text-slate-200 w-4"></i>
                <span>Categorías</span>
              </div>
            </a>

            <!-- Subcategorías -->
            <a
              routerLink="/admin/subcategorias"
              routerLinkActive="bg-slate-800 text-white"
              class="flex items-center justify-between px-3 py-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 transition-colors group"
            >
              <div class="flex items-center gap-2.5">
                <i class="fas fa-folder-tree text-slate-400 group-hover:text-slate-200 w-4"></i>
                <span>Subcategorías</span>
              </div>
            </a>

            <div class="pt-3 pb-1 px-3 text-[10px] font-semibold uppercase tracking-wider text-slate-600">
              Finanzas & Caja
            </div>

            <!-- Movimientos -->
            <a
              routerLink="/admin/movimientos"
              routerLinkActive="bg-slate-800 text-white"
              class="flex items-center justify-between px-3 py-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 transition-colors group"
            >
              <div class="flex items-center gap-2.5">
                <i class="fas fa-money-bill-transfer text-slate-400 group-hover:text-slate-200 w-4"></i>
                <span>Movimientos</span>
              </div>
            </a>

            <!-- Cortes de Caja -->
            <a
              routerLink="/admin/cortes-caja"
              routerLinkActive="bg-slate-800 text-white"
              class="flex items-center justify-between px-3 py-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 transition-colors group"
            >
              <div class="flex items-center gap-2.5">
                <i class="fas fa-cash-register text-slate-400 group-hover:text-slate-200 w-4"></i>
                <span>Cortes de Caja</span>
              </div>
            </a>

            <div class="pt-3 pb-1 px-3 text-[10px] font-semibold uppercase tracking-wider text-slate-600">
              Configuración & Sistema
            </div>

            <!-- Usuarios -->
            <a
              routerLink="/admin/usuarios"
              routerLinkActive="bg-slate-800 text-white"
              class="flex items-center justify-between px-3 py-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 transition-colors group"
            >
              <div class="flex items-center gap-2.5">
                <i class="fas fa-users-gear text-slate-400 group-hover:text-slate-200 w-4"></i>
                <span>Usuarios</span>
              </div>
            </a>

            <!-- Configuración Empresa -->
            <a
              routerLink="/admin/configuracion"
              routerLinkActive="bg-slate-800 text-white"
              class="flex items-center justify-between px-3 py-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 transition-colors group"
            >
              <div class="flex items-center gap-2.5">
                <i class="fas fa-sliders text-slate-400 group-hover:text-slate-200 w-4"></i>
                <span>Empresa</span>
              </div>
            </a>
          </nav>
        </div>

        <!-- Footer Sidebar con Usuario & Logout -->
        <div class="p-3 border-t border-slate-800/80">
          <div class="flex items-center justify-between p-2.5 rounded-xl bg-[#0a0d14] border border-slate-800/80">
            <div class="flex items-center gap-2.5 overflow-hidden">
              <div class="w-7 h-7 rounded-lg bg-slate-800 border border-slate-700/80 text-slate-200 flex items-center justify-center font-medium text-xs shrink-0">
                {{ (user()?.nombre || 'U').charAt(0).toUpperCase() }}
              </div>
              <div class="truncate">
                <div class="text-xs font-medium text-slate-200 truncate">{{ user()?.nombre }}</div>
                <div class="text-[10px] text-slate-500 truncate">{{ user()?.correo }}</div>
              </div>
            </div>
            <button
              (click)="onLogout()"
              class="w-7 h-7 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-950/30 flex items-center justify-center transition-colors cursor-pointer shrink-0"
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
        <header class="h-16 bg-[#0d111a]/80 border-b border-slate-800/80 backdrop-blur-md sticky top-0 z-40 px-6 flex items-center justify-between">
          <div class="flex items-center gap-2.5">
            <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-950/40 text-emerald-400 border border-emerald-800/40">
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> Sistema en línea
            </span>
          </div>

          <div class="flex items-center gap-3">
            <a
              href="http://localhost:8000/api/docs"
              target="_blank"
              class="hidden sm:inline-flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-slate-200 px-3 py-1.5 rounded-lg border border-slate-800 hover:border-slate-700 transition-colors"
            >
              <i class="fas fa-book text-slate-400 text-xs"></i>
              <span>API Docs</span>
            </a>

            <a
              routerLink="/store"
              class="inline-flex items-center gap-1.5 text-xs font-medium text-slate-900 bg-slate-100 hover:bg-white px-3 py-1.5 rounded-lg transition-colors"
            >
              <i class="fas fa-store text-xs"></i>
              <span>Ver Tienda</span>
            </a>
          </div>
        </header>

        <!-- Outlet de Componentes -->
        <main class="flex-1 p-6 sm:p-8 max-w-7xl w-full mx-auto">
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
