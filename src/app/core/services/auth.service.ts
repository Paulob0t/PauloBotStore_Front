import { Injectable, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { Api } from '../../api/api';
import { login, logout, getCurrentUser } from '../../api/functions';
import { UserDto, LoginRequest, LoginResponse } from '../../api/models';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly TOKEN_KEY = 'paulobot_auth_token';
  private readonly USER_KEY = 'paulobot_auth_user';

  // Reactive State con Signals
  private currentUserSignal = signal<UserDto | null>(this.getStoredUser());
  private tokenSignal = signal<string | null>(this.getStoredToken());
  private loadingSignal = signal<boolean>(false);

  // Computed signals
  readonly currentUser = this.currentUserSignal.asReadonly();
  readonly token = this.tokenSignal.asReadonly();
  readonly isAuthenticated = computed(() => !!this.currentUserSignal());
  readonly isLoading = this.loadingSignal.asReadonly();

  constructor(
    private api: Api,
    private router: Router
  ) {}

  /**
   * Iniciar sesión llamando a la API REST OpenAPI generada o con credenciales maestras de respaldo
   */
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    this.loadingSignal.set(true);
    try {
      const response = await this.api.invoke(login, {
        body: credentials
      });

      if (response && response.success && response.user) {
        this.setSession(response.token || '', response.user);
      }

      return response;
    } catch (error: any) {
      // Soporte para credenciales de administrador de desarrollo / fallback
      const correo = (credentials.correo || '').trim().toLowerCase();
      const contrasena = (credentials.contrasena || '').trim();

      if (
        (correo === 'admin@paulobot.com' || correo === 'paulobot@admin.com' || correo === 'admin@admin.com') &&
        (contrasena === 'admin123' || contrasena === 'paulobot123' || contrasena === 'admin')
      ) {
        const adminUser: UserDto = {
          id: 1,
          nombre: 'Administrador PauloBot',
          correo: correo,
          tipo_usuario: 'Administrador',
          activo: 1,
          created_at: new Date().toISOString()
        };
        const token = 'paulobot_dev_token_' + Date.now();
        this.setSession(token, adminUser);
        return {
          success: true,
          message: 'Autenticación exitosa (Modo Administrador)',
          user: adminUser,
          token: token
        };
      }

      const errorMsg = error?.error?.message || error?.message || 'Error al conectar con el servidor de autenticación.';
      throw new Error(errorMsg);
    } finally {
      this.loadingSignal.set(false);
    }
  }

  /**
   * Cerrar sesión en el backend y limpiar estado local
   */
  async logout(): Promise<void> {
    this.loadingSignal.set(true);
    try {
      await this.api.invoke(logout, {});
    } catch (e) {
      console.warn('Logout en backend omitido o fallido:', e);
    } finally {
      this.clearSession();
      this.loadingSignal.set(false);
      this.router.navigate(['/login']);
    }
  }

  /**
   * Verificar la sesión activa contra el backend
   */
  async checkSession(): Promise<boolean> {
    if (!this.tokenSignal()) {
      this.clearSession();
      return false;
    }

    try {
      const user = await this.api.invoke(getCurrentUser, {});
      if (user && user.id) {
        this.currentUserSignal.set(user);
        localStorage.setItem(this.USER_KEY, JSON.stringify(user));
        return true;
      }
      return false;
    } catch {
      this.clearSession();
      return false;
    }
  }

  private setSession(token: string, user: UserDto): void {
    this.tokenSignal.set(token);
    this.currentUserSignal.set(user);
    if (token) {
      localStorage.setItem(this.TOKEN_KEY, token);
    }
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }

  private clearSession(): void {
    this.tokenSignal.set(null);
    this.currentUserSignal.set(null);
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
  }

  private getStoredToken(): string | null {
    try {
      return localStorage.getItem(this.TOKEN_KEY);
    } catch {
      return null;
    }
  }

  private getStoredUser(): UserDto | null {
    try {
      const raw = localStorage.getItem(this.USER_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }
}
