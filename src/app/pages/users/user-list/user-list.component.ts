import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../../core/services/user.service';
import { UserItemDto, CreateUserRequest } from '../../../api/models';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-8 animate-fade-in max-w-7xl mx-auto">
      
      <!-- Header Superior -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 flex items-center justify-center text-2xl shadow-lg shadow-indigo-600/20">
            <i class="fas fa-users-gear"></i>
          </div>
          <div>
            <h1 class="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Gestión de Usuarios
            </h1>
            <p class="text-xs sm:text-sm text-slate-400 mt-1">
              Administración de cuentas, roles de acceso y alta de nuevos colaboradores en el sistema.
            </p>
          </div>
        </div>

        <div class="flex items-center gap-3">
          <button
            type="button"
            (click)="openCreateModal()"
            class="inline-flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-600/30 hover:shadow-indigo-600/50 hover:-translate-y-0.5 transition-all cursor-pointer"
          >
            <i class="fas fa-user-plus"></i>
            <span>Agregar Usuario</span>
          </button>

          <button
            (click)="refresh()"
            [disabled]="isLoading()"
            class="inline-flex items-center gap-2 px-4 py-3 rounded-2xl text-xs font-semibold text-slate-300 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer disabled:opacity-50"
            title="Recargar lista"
          >
            <i class="fas fa-arrows-rotate" [class.fa-spin]="isLoading()"></i>
            <span class="hidden sm:inline">Actualizar</span>
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

      <!-- Grid 3 Mini KPIs -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <!-- Total Usuarios -->
        <div class="bg-slate-900/90 border border-slate-800/90 rounded-3xl p-6 shadow-sm flex items-center gap-4">
          <div class="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center text-xl shrink-0">
            <i class="fas fa-users"></i>
          </div>
          <div>
            <div class="text-2xl font-black text-white tracking-tight">{{ totalUsers() }}</div>
            <div class="text-xs text-slate-400">Total Usuarios Registrados</div>
          </div>
        </div>

        <!-- Administradores -->
        <div class="bg-slate-900/90 border border-slate-800/90 rounded-3xl p-6 shadow-sm flex items-center gap-4">
          <div class="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-400 flex items-center justify-center text-xl shrink-0">
            <i class="fas fa-shield-halved"></i>
          </div>
          <div>
            <div class="text-2xl font-black text-purple-400 tracking-tight">{{ adminUsers() }}</div>
            <div class="text-xs text-slate-400">Administradores Activos</div>
          </div>
        </div>

        <!-- Cuentas Habilitadas -->
        <div class="bg-slate-900/90 border border-slate-800/90 rounded-3xl p-6 shadow-sm flex items-center gap-4">
          <div class="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center text-xl shrink-0">
            <i class="fas fa-user-check"></i>
          </div>
          <div>
            <div class="text-2xl font-black text-emerald-400 tracking-tight">
              {{ activeUsers() }} / {{ totalUsers() }}
            </div>
            <div class="text-xs text-slate-400">Cuentas con Acceso Habilitado</div>
          </div>
        </div>
      </div>

      <!-- Tarjeta Principal de Tabla con Buscador y Filtro -->
      <div class="bg-slate-900/90 border border-slate-800/90 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        
        <!-- Barra de Búsqueda y Filtros -->
        <div class="flex flex-col sm:flex-row gap-4 justify-between items-stretch sm:items-center">
          <div class="relative flex-1 max-w-md">
            <span class="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500 pointer-events-none">
              <i class="fas fa-magnifying-glass"></i>
            </span>
            <input
              type="text"
              [(ngModel)]="searchQuery"
              (ngModelChange)="onSearchChange($event)"
              placeholder="Buscar por nombre, correo o rol..."
              class="w-full pl-10 pr-4 py-3 bg-slate-950/60 border border-slate-800 rounded-2xl text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
            />
          </div>

          <!-- Filtro por Rol -->
          <div class="flex items-center gap-3">
            <select
              [(ngModel)]="selectedRole"
              (ngModelChange)="onRoleFilterChange($event)"
              class="px-4 py-3 bg-slate-950/60 border border-slate-800 rounded-2xl text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all cursor-pointer"
            >
              <option [ngValue]="null">Todos los Roles</option>
              <option [ngValue]="0">Super Administrador</option>
              <option [ngValue]="1">Administrador</option>
              <option [ngValue]="2">Operador</option>
            </select>
          </div>
        </div>

        <!-- Tabla de Usuarios -->
        <div class="overflow-x-auto">
          <table class="w-full text-left text-sm">
            <thead>
              <tr class="border-b border-slate-800 text-xs uppercase tracking-wider text-slate-400">
                <th class="pb-3.5 font-semibold">ID</th>
                <th class="pb-3.5 font-semibold">Usuario</th>
                <th class="pb-3.5 font-semibold">Rol</th>
                <th class="pb-3.5 font-semibold">Registro</th>
                <th class="pb-3.5 font-semibold text-center">Estado</th>
                <th class="pb-3.5 font-semibold text-right">Acción</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-800/60">
              @if (isLoading() && users().length === 0) {
                <tr>
                  <td colspan="6" class="py-12 text-center text-slate-400">
                    <i class="fas fa-spinner fa-spin text-2xl text-indigo-500 mb-2"></i>
                    <p class="text-xs">Cargando usuarios...</p>
                  </td>
                </tr>
              } @else if (users().length > 0) {
                @for (u of users(); track u.id) {
                  <tr class="hover:bg-slate-800/30 transition-colors">
                    <!-- ID -->
                    <td class="py-4">
                      <code class="px-2 py-0.5 rounded-md bg-slate-950 text-indigo-300 border border-slate-800 text-xs font-mono">
                        #{{ u.id }}
                      </code>
                    </td>

                    <!-- Avatar + Nombre + Correo -->
                    <td class="py-4">
                      <div class="flex items-center gap-3">
                        <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 text-indigo-300 flex items-center justify-center font-bold text-sm shrink-0">
                          {{ (u.nombre || 'U').charAt(0).toUpperCase() }}
                        </div>
                        <div>
                          <div class="font-bold text-slate-100">{{ u.nombre }}</div>
                          <div class="text-xs text-slate-400 font-mono">{{ u.correo }}</div>
                        </div>
                      </div>
                    </td>

                    <!-- Rol -->
                    <td class="py-4">
                      @if (u.tipo_usuario === 0) {
                        <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-300 border border-purple-500/20">
                          <i class="fas fa-crown text-[10px] text-purple-400"></i> Super Admin
                        </span>
                      } @else if (u.tipo_usuario === 1) {
                        <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                          <i class="fas fa-shield text-[10px] text-indigo-400"></i> Administrador
                        </span>
                      } @else {
                        <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                          <i class="fas fa-user text-[10px] text-cyan-400"></i> Operador
                        </span>
                      }
                    </td>

                    <!-- Fecha Registro -->
                    <td class="py-4 text-xs text-slate-400 whitespace-nowrap">
                      {{ u.fecha_creacion ? (u.fecha_creacion | date:'dd/MM/yyyy') : '—' }}
                    </td>

                    <!-- Estado -->
                    <td class="py-4 text-center">
                      @if (u.activo === 1) {
                        <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          <span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> Activo
                        </span>
                      } @else {
                        <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                          <span class="w-1.5 h-1.5 rounded-full bg-rose-400"></span> Inactivo
                        </span>
                      }
                    </td>

                    <!-- Acción Toggle Status -->
                    <td class="py-4 text-right">
                      <button
                        type="button"
                        (click)="toggleUserStatus(u)"
                        class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950 border text-xs font-medium transition-all cursor-pointer"
                        [ngClass]="u.activo === 1 ? 'border-slate-800 text-slate-400 hover:text-rose-400 hover:border-rose-500/40 hover:bg-rose-500/10' : 'border-slate-800 text-slate-400 hover:text-emerald-400 hover:border-emerald-500/40 hover:bg-emerald-500/10'"
                        [title]="u.activo === 1 ? 'Desactivar cuenta' : 'Activar cuenta'"
                      >
                        <i class="fas" [ngClass]="u.activo === 1 ? 'fa-user-slash' : 'fa-user-check'"></i>
                        <span>{{ u.activo === 1 ? 'Suspender' : 'Activar' }}</span>
                      </button>
                    </td>
                  </tr>
                }
              } @else {
                <tr>
                  <td colspan="6" class="py-12 text-center text-slate-500">
                    <i class="fas fa-users-slash text-3xl mb-2 text-slate-600 block"></i>
                    No se encontraron usuarios con los filtros aplicados.
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>

      </div>

      <!-- Modal Agregar Usuario -->
      @if (showModal()) {
        <div class="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div class="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl space-y-6">
            <div class="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 class="text-lg font-bold text-white flex items-center gap-2">
                <i class="fas fa-user-plus text-indigo-400"></i>
                <span>Nuevo Usuario</span>
              </h3>
              <button (click)="closeModal()" class="text-slate-400 hover:text-white cursor-pointer">
                <i class="fas fa-xmark"></i>
              </button>
            </div>

            <div class="space-y-4">
              <!-- Nombre Completo -->
              <div>
                <label for="formNombre" class="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                  Nombre Completo <span class="text-rose-400">*</span>
                </label>
                <div class="relative">
                  <span class="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500 pointer-events-none">
                    <i class="fas fa-user"></i>
                  </span>
                  <input
                    id="formNombre"
                    type="text"
                    [(ngModel)]="form.nombre"
                    placeholder="Ej: Juan Pérez"
                    class="w-full pl-10 pr-4 py-3 bg-slate-950/60 border border-slate-800 rounded-2xl text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                  />
                </div>
              </div>

              <!-- Correo -->
              <div>
                <label for="formCorreo" class="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                  Correo Electrónico <span class="text-rose-400">*</span>
                </label>
                <div class="relative">
                  <span class="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500 pointer-events-none">
                    <i class="fas fa-envelope"></i>
                  </span>
                  <input
                    id="formCorreo"
                    type="email"
                    [(ngModel)]="form.correo"
                    placeholder="usuario@paulobot.com"
                    class="w-full pl-10 pr-4 py-3 bg-slate-950/60 border border-slate-800 rounded-2xl text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                  />
                </div>
              </div>

              <!-- Rol -->
              <div>
                <label for="formRol" class="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                  Rol del Usuario
                </label>
                <select
                  id="formRol"
                  [(ngModel)]="form.tipo_usuario"
                  class="w-full px-4 py-3 bg-slate-950/60 border border-slate-800 rounded-2xl text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all cursor-pointer"
                >
                  <option [ngValue]="1">Administrador</option>
                  <option [ngValue]="2">Operador</option>
                  <option [ngValue]="0">Super Administrador</option>
                </select>
              </div>

              <!-- Contraseña -->
              <div>
                <label for="formPassword" class="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                  Contraseña <span class="text-rose-400">*</span> (mínimo 6 caracteres)
                </label>
                <div class="relative">
                  <span class="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500 pointer-events-none">
                    <i class="fas fa-lock"></i>
                  </span>
                  <input
                    id="formPassword"
                    type="password"
                    [(ngModel)]="form.contrasena"
                    placeholder="••••••••••••"
                    class="w-full pl-10 pr-4 py-3 bg-slate-950/60 border border-slate-800 rounded-2xl text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                  />
                </div>
              </div>

              <!-- Confirmar Contraseña -->
              <div>
                <label for="formConfirmPassword" class="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                  Confirmar Contraseña <span class="text-rose-400">*</span>
                </label>
                <div class="relative">
                  <span class="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500 pointer-events-none">
                    <i class="fas fa-shield-alt"></i>
                  </span>
                  <input
                    id="formConfirmPassword"
                    type="password"
                    [(ngModel)]="confirmPassword"
                    placeholder="••••••••••••"
                    class="w-full pl-10 pr-4 py-3 bg-slate-950/60 border border-slate-800 rounded-2xl text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                  />
                </div>
                @if (confirmPassword && form.contrasena !== confirmPassword) {
                  <p class="text-[11px] text-rose-400 mt-1">Las contraseñas no coinciden.</p>
                }
              </div>
            </div>

            <div class="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                (click)="closeModal()"
                class="px-5 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                (click)="saveUser()"
                [disabled]="isLoading() || !isFormValid()"
                class="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 transition-colors cursor-pointer shadow-lg shadow-indigo-600/30"
              >
                @if (isLoading()) {
                  <i class="fas fa-spinner fa-spin mr-1"></i> Guardando...
                } @else {
                  <i class="fas fa-user-plus mr-1"></i> Registrar Usuario
                }
              </button>
            </div>
          </div>
        </div>
      }

    </div>
  `
})
export class UserListComponent implements OnInit {
  searchQuery = '';
  selectedRole: number | null = null;
  showModal = signal<boolean>(false);

  form: CreateUserRequest = {
    nombre: '',
    correo: '',
    contrasena: '',
    tipo_usuario: 1,
    activo: 1
  };
  confirmPassword = '';

  alertMessage = signal<string | null>(null);
  alertType = signal<'success' | 'error'>('success');

  get users() {
    return this.userService.filteredUsers;
  }

  get totalUsers() {
    return this.userService.totalUsersCount;
  }

  get activeUsers() {
    return this.userService.activeUsersCount;
  }

  get adminUsers() {
    return this.userService.adminUsersCount;
  }

  get isLoading() {
    return this.userService.isLoading;
  }

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.refresh();
  }

  refresh(): void {
    this.userService.loadUsers();
  }

  onSearchChange(val: string): void {
    this.userService.setSearchQuery(val);
  }

  onRoleFilterChange(role: number | null): void {
    this.userService.setRoleFilter(role);
  }

  openCreateModal(): void {
    this.form = {
      nombre: '',
      correo: '',
      contrasena: '',
      tipo_usuario: 1,
      activo: 1
    };
    this.confirmPassword = '';
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
  }

  isFormValid(): boolean {
    return (
      this.form.nombre.trim().length > 0 &&
      this.form.correo.trim().length > 0 &&
      this.form.contrasena.length >= 6 &&
      this.form.contrasena === this.confirmPassword
    );
  }

  async saveUser(): Promise<void> {
    if (!this.isFormValid()) return;

    try {
      const res = await this.userService.create({
        nombre: this.form.nombre.trim(),
        correo: this.form.correo.trim(),
        contrasena: this.form.contrasena,
        tipo_usuario: this.form.tipo_usuario,
        activo: 1
      });
      this.alertType.set('success');
      this.alertMessage.set(res.message || 'Usuario creado exitosamente.');
      this.closeModal();
    } catch (err: any) {
      this.alertType.set('error');
      this.alertMessage.set(err.message || 'Error al crear usuario.');
    }
  }

  async toggleUserStatus(u: UserItemDto): Promise<void> {
    try {
      await this.userService.toggleStatus(u.id, u.activo);
      this.alertType.set('success');
      this.alertMessage.set(
        u.activo === 1 ? `Cuenta de ${u.nombre} suspendida.` : `Cuenta de ${u.nombre} activada.`
      );
    } catch (err: any) {
      this.alertType.set('error');
      this.alertMessage.set(err.message || 'Error al actualizar estado.');
    }
  }
}
