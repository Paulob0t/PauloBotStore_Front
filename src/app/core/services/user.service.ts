import { Injectable, signal, computed } from '@angular/core';
import { Api } from '../../api/api';
import { getUsers, createUser, updateUserStatus } from '../../api/functions';
import { UserItemDto, CreateUserRequest, UpdateUserStatusRequest, ApiResponse } from '../../api/models';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private usersSignal = signal<UserItemDto[]>([]);
  private loadingSignal = signal<boolean>(false);
  private searchQuerySignal = signal<string>('');
  private roleFilterSignal = signal<number | null>(null);

  readonly users = this.usersSignal.asReadonly();
  readonly isLoading = this.loadingSignal.asReadonly();
  readonly searchQuery = this.searchQuerySignal.asReadonly();
  readonly roleFilter = this.roleFilterSignal.asReadonly();

  // Usuarios filtrados reactivamente por búsqueda y rol
  readonly filteredUsers = computed(() => {
    let list = this.usersSignal();
    const query = this.searchQuerySignal().toLowerCase().trim();
    const role = this.roleFilterSignal();

    if (role !== null) {
      list = list.filter(u => u.tipo_usuario === role);
    }

    if (query) {
      list = list.filter(u =>
        u.nombre.toLowerCase().includes(query) ||
        u.correo.toLowerCase().includes(query) ||
        (u.tipo_usuario_label?.toLowerCase().includes(query) ?? false)
      );
    }

    return list;
  });

  // Métricas computadas
  readonly totalUsersCount = computed(() => this.usersSignal().length);
  readonly activeUsersCount = computed(() => this.usersSignal().filter(u => u.activo === 1).length);
  readonly adminUsersCount = computed(() => this.usersSignal().filter(u => u.tipo_usuario === 0 || u.tipo_usuario === 1).length);

  constructor(private api: Api) {}

  async loadUsers(): Promise<UserItemDto[]> {
    this.loadingSignal.set(true);
    try {
      const data = await this.api.invoke(getUsers, {});
      this.usersSignal.set(data || []);
      return data || [];
    } catch (error) {
      console.error('Error cargando usuarios:', error);
      return [];
    } finally {
      this.loadingSignal.set(false);
    }
  }

  async create(data: CreateUserRequest): Promise<ApiResponse> {
    this.loadingSignal.set(true);
    try {
      const res = await this.api.invoke(createUser, { body: data });
      await this.loadUsers();
      return res;
    } catch (error: any) {
      throw new Error(error?.error?.message || error?.message || 'Error al crear usuario.');
    } finally {
      this.loadingSignal.set(false);
    }
  }

  async toggleStatus(id: number, currentActive: number): Promise<void> {
    const newActive = currentActive === 1 ? 0 : 1;
    this.loadingSignal.set(true);
    try {
      await this.api.invoke(updateUserStatus, {
        id,
        body: { activo: newActive }
      });
      this.usersSignal.update(list =>
        list.map(u => u.id === id ? { ...u, activo: newActive } : u)
      );
    } catch (error: any) {
      throw new Error(error?.error?.message || error?.message || 'Error al cambiar estado.');
    } finally {
      this.loadingSignal.set(false);
    }
  }

  setSearchQuery(query: string): void {
    this.searchQuerySignal.set(query);
  }

  setRoleFilter(role: number | null): void {
    this.roleFilterSignal.set(role);
  }
}
