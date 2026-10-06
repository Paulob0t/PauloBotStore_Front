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
    <div class="min-h-screen bg-[#0a0d14] flex flex-col justify-center items-center px-4 py-12 relative select-none">
      
      <!-- Fondo con textura sutil y tenue -->
      <div class="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-20 pointer-events-none"></div>

      <!-- Tarjeta Principal del Login -->
      <div class="w-full max-w-md bg-[#111622] border border-slate-800/90 rounded-2xl p-8 sm:p-10 shadow-2xl relative z-10">
        
        <!-- Header & Logo -->
        <div class="text-center mb-8">
          <a routerLink="/" class="inline-flex items-center gap-2.5 mb-5 group">
            <div class="w-10 h-10 bg-slate-800 border border-slate-700/80 rounded-xl flex items-center justify-center text-slate-100 text-lg transition-colors group-hover:border-slate-500">
              <i class="fas fa-cube"></i>
            </div>
            <span class="text-xl font-semibold tracking-tight text-white">
              PauloBot <span class="text-slate-400 font-normal">Store</span>
            </span>
          </a>
          <h1 class="text-xl font-semibold text-slate-100 tracking-tight">Acceso Administrativo</h1>
          <p class="text-xs text-slate-400 mt-1.5 font-normal">
            Ingresa tus credenciales para gestionar el sistema
          </p>
        </div>

        <!-- Alerta de Error -->
        @if (errorMessage()) {
          <div class="mb-5 p-3.5 rounded-xl bg-red-950/40 border border-red-800/40 text-red-300 text-xs flex items-start gap-2.5">
            <i class="fas fa-circle-exclamation text-red-400 mt-0.5 text-sm"></i>
            <div class="flex-1 font-medium leading-relaxed">{{ errorMessage() }}</div>
          </div>
        }

        <!-- Alerta de Éxito -->
        @if (successMessage()) {
          <div class="mb-5 p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-800/40 text-emerald-300 text-xs flex items-start gap-2.5">
            <i class="fas fa-circle-check text-emerald-400 mt-0.5 text-sm"></i>
            <div class="flex-1 font-medium leading-relaxed">{{ successMessage() }}</div>
          </div>
        }

        <!-- Formulario -->
        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="space-y-4" novalidate>
          <!-- Campo Correo Electrónico -->
          <div>
            <label for="correo" class="block text-xs font-medium text-slate-300 mb-1.5">
              Correo Electrónico
            </label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500 text-xs">
                <i class="fas fa-envelope"></i>
              </div>
              <input
                id="correo"
                type="email"
                formControlName="correo"
                placeholder="admin@paulobot.com"
                autocomplete="email"
                class="block w-full pl-9 pr-3.5 py-2.5 bg-[#0d111a] border border-slate-800 rounded-xl text-slate-200 placeholder-slate-600 text-sm focus:outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500 transition-colors"
                [class.border-red-600]="isFieldInvalid('correo')"
              />
            </div>
            @if (isFieldInvalid('correo')) {
              <p class="mt-1.5 text-xs text-red-400 flex items-center gap-1">
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
            <div class="flex items-center justify-between mb-1.5">
              <label for="contrasena" class="block text-xs font-medium text-slate-300">
                Contraseña
              </label>
            </div>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500 text-xs">
                <i class="fas fa-lock"></i>
              </div>
              <input
                id="contrasena"
                [type]="showPassword() ? 'text' : 'password'"
                formControlName="contrasena"
                placeholder="••••••••••••"
                autocomplete="current-password"
                class="block w-full pl-9 pr-10 py-2.5 bg-[#0d111a] border border-slate-800 rounded-xl text-slate-200 placeholder-slate-600 text-sm focus:outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500 transition-colors"
                [class.border-red-600]="isFieldInvalid('contrasena')"
              />
              <button
                type="button"
                (click)="togglePasswordVisibility()"
                class="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300 transition-colors focus:outline-none cursor-pointer"
                tabindex="-1"
              >
                <i class="fas" [class.fa-eye]="!showPassword()" [class.fa-eye-slash]="showPassword()"></i>
              </button>
            </div>
            @if (isFieldInvalid('contrasena')) {
              <p class="mt-1.5 text-xs text-red-400 flex items-center gap-1">
                <i class="fas fa-circle-xmark text-[10px]"></i>
                La contraseña es obligatoria.
              </p>
            }
          </div>

          <!-- Botón Iniciar Sesión -->
          <button
            type="submit"
            [disabled]="isLoading() || loginForm.invalid"
            class="w-full mt-2 inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-medium text-sm text-slate-900 bg-slate-100 hover:bg-white active:bg-slate-200 disabled:opacity-40 disabled:hover:bg-slate-100 disabled:cursor-not-allowed transition-colors cursor-pointer shadow-sm"
          >
            @if (isLoading()) {
              <i class="fas fa-spinner fa-spin"></i>
              <span>Autenticando...</span>
            } @else {
              <span>Iniciar sesión</span>
              <i class="fas fa-arrow-right text-xs"></i>
            }
          </button>
        </form>

        <!-- Footer del Login -->
        <div class="mt-7 pt-5 border-t border-slate-800/60 text-center">
          <a
            routerLink="/"
            class="inline-flex items-center gap-2 text-xs font-medium text-slate-400 hover:text-slate-200 transition-colors"
          >
            <i class="fas fa-arrow-left text-[11px]"></i>
            <span>Volver a la tienda</span>
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
