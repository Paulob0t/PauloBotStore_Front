import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="min-h-screen bg-slate-950 flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
      <!-- Glow ambiental de fondo -->
      <div class="absolute -top-40 -left-40 w-96 h-96 bg-indigo-600/20 rounded-full blur-[128px] pointer-events-none"></div>
      <div class="absolute -bottom-40 -right-40 w-96 h-96 bg-purple-600/20 rounded-full blur-[128px] pointer-events-none"></div>

      <!-- Tarjeta Principal del Login -->
      <div class="w-full max-w-md bg-slate-900/90 border border-slate-800/80 rounded-3xl p-8 sm:p-10 shadow-2xl backdrop-blur-xl relative z-10 transition-all duration-300">
        
        <!-- Header & Logo -->
        <div class="text-center mb-8">
          <a routerLink="/" class="inline-flex items-center gap-3 mb-6 group">
            <div class="w-12 h-12 bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-2xl flex items-center justify-center text-white text-2xl shadow-lg shadow-indigo-500/30 group-hover:scale-105 transition-transform duration-200">
              <i class="fas fa-robot"></i>
            </div>
            <span class="text-2xl font-black text-white tracking-tight">
              PauloBot <span class="text-indigo-400">Store</span>
            </span>
          </a>
          <h1 class="text-2xl font-bold text-white tracking-tight">Panel Administrador</h1>
          <p class="text-sm text-slate-400 mt-2">
            Ingresa tus credenciales para gestionar el sistema automatizado
          </p>
        </div>

        <!-- Alerta de Error -->
        @if (errorMessage()) {
          <div class="mb-6 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm flex items-start gap-3 animate-fade-in">
            <i class="fas fa-circle-exclamation text-rose-400 mt-0.5 text-base"></i>
            <div class="flex-1 font-medium">{{ errorMessage() }}</div>
          </div>
        }

        <!-- Alerta de Éxito -->
        @if (successMessage()) {
          <div class="mb-6 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-sm flex items-start gap-3 animate-fade-in">
            <i class="fas fa-circle-check text-emerald-400 mt-0.5 text-base"></i>
            <div class="flex-1 font-medium">{{ successMessage() }}</div>
          </div>
        }

        <!-- Formulario -->
        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="space-y-5" novalidate>
          <!-- Campo Correo Electrónico -->
          <div>
            <label for="correo" class="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
              Correo Electrónico
            </label>
            <div class="relative rounded-2xl shadow-sm">
              <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500">
                <i class="fas fa-envelope"></i>
              </div>
              <input
                id="correo"
                type="email"
                formControlName="correo"
                placeholder="admin@paulobot.com"
                autocomplete="email"
                class="block w-full pl-11 pr-4 py-3.5 bg-slate-950/60 border border-slate-800 rounded-2xl text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                [class.border-rose-500]="isFieldInvalid('correo')"
                [class.focus:ring-rose-500]="isFieldInvalid('correo')"
              />
            </div>
            @if (isFieldInvalid('correo')) {
              <p class="mt-1.5 text-xs text-rose-400 flex items-center gap-1">
                <i class="fas fa-circle-xmark text-[10px]"></i>
                @if (loginForm.get('correo')?.errors?.['required']) {
                  El correo es obligatorio.
                } @else if (loginForm.get('correo')?.errors?.['email']) {
                  Ingresa un formato de correo válido.
                }
              </p>
            }
          </div>

          <!-- Campo Contraseña -->
          <div>
            <div class="flex items-center justify-between mb-2">
              <label for="contrasena" class="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                Contraseña
              </label>
            </div>
            <div class="relative rounded-2xl shadow-sm">
              <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500">
                <i class="fas fa-lock"></i>
              </div>
              <input
                id="contrasena"
                [type]="showPassword() ? 'text' : 'password'"
                formControlName="contrasena"
                placeholder="••••••••••••"
                autocomplete="current-password"
                class="block w-full pl-11 pr-12 py-3.5 bg-slate-950/60 border border-slate-800 rounded-2xl text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                [class.border-rose-500]="isFieldInvalid('contrasena')"
                [class.focus:ring-rose-500]="isFieldInvalid('contrasena')"
              />
              <button
                type="button"
                (click)="togglePasswordVisibility()"
                class="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-200 transition-colors focus:outline-none cursor-pointer"
                tabindex="-1"
              >
                <i class="fas" [class.fa-eye]="!showPassword()" [class.fa-eye-slash]="showPassword()"></i>
              </button>
            </div>
            @if (isFieldInvalid('contrasena')) {
              <p class="mt-1.5 text-xs text-rose-400 flex items-center gap-1">
                <i class="fas fa-circle-xmark text-[10px]"></i>
                La contraseña es obligatoria.
              </p>
            }
          </div>

          <!-- Botón Iniciar Sesión -->
          <button
            type="submit"
            [disabled]="isLoading() || loginForm.invalid"
            class="w-full mt-2 inline-flex items-center justify-center gap-2.5 py-4 px-6 rounded-2xl font-bold text-sm tracking-wider uppercase text-white bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-600/30 hover:shadow-indigo-600/50 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 cursor-pointer"
          >
            @if (isLoading()) {
              <i class="fas fa-spinner fa-spin"></i>
              <span>Autenticando...</span>
            } @else {
              <span>INICIAR SESIÓN</span>
              <i class="fas fa-arrow-right text-xs"></i>
            }
          </button>
        </form>

        <!-- Footer del Login -->
        <div class="mt-8 pt-6 border-t border-slate-800/80 text-center">
          <a
            routerLink="/"
            class="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-indigo-400 transition-colors"
          >
            <i class="fas fa-arrow-left"></i>
            <span>Volver al Portal Principal</span>
          </a>
        </div>

      </div>
    </div>
  `
})
export class LoginComponent {
  loginForm: FormGroup;
  showPassword = signal<boolean>(false);
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);

  get isLoading() {
    return this.authService.isLoading;
  }

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      correo: ['', [Validators.required, Validators.email]],
      contrasena: ['', [Validators.required]]
    });
  }

  togglePasswordVisibility(): void {
    this.showPassword.update(v => !v);
  }

  isFieldInvalid(field: string): boolean {
    const control = this.loginForm.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  async onSubmit(): Promise<void> {
    this.errorMessage.set(null);
    this.successMessage.set(null);

    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    const { correo, contrasena } = this.loginForm.value;

    try {
      const response = await this.authService.login({
        correo: correo.trim(),
        contrasena: contrasena
      });

      if (response && response.success) {
        this.successMessage.set(response.message || '¡Acceso Concedido!');
        await this.router.navigate(['/admin']);
      } else {
        this.errorMessage.set(response?.message || 'Error de autenticación.');
      }
    } catch (err: any) {
      console.error('Error durante login:', err);
      this.errorMessage.set(err.message || 'Error inesperado al iniciar sesión.');
    }
  }
}
