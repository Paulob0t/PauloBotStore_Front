import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CategoryService } from '../../../core/services/category.service';
import { ProductService } from '../../../core/services/product.service';
import { CategoryDto, SubcategoryDto } from '../../../api/models';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="space-y-6 animate-fade-in max-w-5xl mx-auto">
      
      <!-- Header de la Página -->
      <div>
        <h1 class="text-2xl font-semibold text-white tracking-tight">
          Agregar Nuevo Producto
        </h1>
        <p class="text-xs text-slate-400 mt-1 font-normal">
          Registra un producto en el catálogo con precios, stock, ubicación e imágenes
        </p>
      </div>

      <!-- Alertas de Estado -->
      @if (errorMessage()) {
        <div class="p-3.5 rounded-xl bg-red-950/40 border border-red-800/40 text-red-300 text-xs flex items-start gap-2.5 animate-fade-in">
          <i class="fas fa-circle-exclamation text-red-400 mt-0.5 text-sm shrink-0"></i>
          <div class="flex-1 font-medium leading-relaxed">{{ errorMessage() }}</div>
        </div>
      }

      @if (successMessage()) {
        <div class="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-800/40 text-emerald-300 text-xs flex items-start gap-2.5 animate-fade-in">
          <i class="fas fa-circle-check text-emerald-400 mt-0.5 text-sm shrink-0"></i>
          <div class="flex-1 font-medium leading-relaxed">{{ successMessage() }}</div>
        </div>
      }

      <!-- Formulario Principal -->
      <form [formGroup]="productForm" (ngSubmit)="onSubmit()" class="grid grid-cols-1 lg:grid-cols-12 gap-5" novalidate>
        
        <!-- Columna Izquierda: Datos, Clasificación, Precios (8 cols) -->
        <div class="lg:col-span-8 space-y-5">
          
          <!-- 1. Datos Básicos -->
          <section class="bg-[#111622] border border-slate-800/90 rounded-2xl p-5 sm:p-6">
            <header class="flex items-center gap-2.5 mb-4 pb-3 border-b border-slate-800/80">
              <div class="w-6 h-6 rounded-md bg-slate-800 border border-slate-700/60 text-slate-300 font-medium text-xs flex items-center justify-center">
                1
              </div>
              <div>
                <h2 class="text-sm font-semibold text-white">Datos Principales</h2>
                <p class="text-[11px] text-slate-500">Nombre, código identificador y descripción</p>
              </div>
            </header>

            <div class="space-y-4">
              <div class="grid grid-cols-1 sm:grid-cols-12 gap-3.5">
                <!-- Nombre del Producto -->
                <div class="sm:col-span-8">
                  <label for="nombre_producto" class="block text-xs font-medium text-slate-300 mb-1.5">
                    Nombre del Producto <span class="text-red-400">*</span>
                  </label>
                  <input
                    id="nombre_producto"
                    type="text"
                    formControlName="nombre_producto"
                    placeholder="Ej: Coca Cola 600ml"
                    class="w-full px-3 py-2 bg-[#0d111a] border border-slate-800 rounded-xl text-slate-200 placeholder-slate-600 text-xs focus:outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500 transition-colors"
                    [class.border-red-600]="isFieldInvalid('nombre_producto')"
                  />
                  @if (isFieldInvalid('nombre_producto')) {
                    <p class="mt-1 text-[11px] text-red-400">El nombre del producto es obligatorio.</p>
                  }
                </div>

                <!-- SKU / Código -->
                <div class="sm:col-span-4">
                  <label for="sku" class="block text-xs font-medium text-slate-300 mb-1.5">
                    SKU / Código
                  </label>
                  <input
                    id="sku"
                    type="text"
                    formControlName="sku"
                    placeholder="COD-001"
                    class="w-full px-3 py-2 bg-[#0d111a] border border-slate-800 rounded-xl text-slate-200 placeholder-slate-600 text-xs focus:outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500 transition-colors"
                  />
                </div>
              </div>

              <!-- Descripción -->
              <div>
                <label for="descripcion" class="block text-xs font-medium text-slate-300 mb-1.5">
                  Descripción <span class="text-red-400">*</span>
                </label>
                <textarea
                  id="descripcion"
                  rows="3"
                  formControlName="descripcion"
                  placeholder="Describe brevemente las características del producto..."
                  class="w-full px-3 py-2 bg-[#0d111a] border border-slate-800 rounded-xl text-slate-200 placeholder-slate-600 text-xs focus:outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500 transition-colors"
                  [class.border-red-600]="isFieldInvalid('descripcion')"
                ></textarea>
                @if (isFieldInvalid('descripcion')) {
                  <p class="mt-1 text-[11px] text-red-400">La descripción es obligatoria.</p>
                }
              </div>
            </div>
          </section>

          <!-- 2. Clasificación -->
          <section class="bg-[#111622] border border-slate-800/90 rounded-2xl p-5 sm:p-6">
            <header class="flex items-center gap-2.5 mb-4 pb-3 border-b border-slate-800/80">
              <div class="w-6 h-6 rounded-md bg-slate-800 border border-slate-700/60 text-slate-300 font-medium text-xs flex items-center justify-center">
                2
              </div>
              <div>
                <h2 class="text-sm font-semibold text-white">Clasificación</h2>
                <p class="text-[11px] text-slate-500">Asigna la categoría y subcategoría correspondiente</p>
              </div>
            </header>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <!-- Selector de Categoría -->
              <div>
                <label for="id_categoria" class="block text-xs font-medium text-slate-300 mb-1.5">
                  Categoría <span class="text-red-400">*</span>
                </label>
                <select
                  id="id_categoria"
                  formControlName="id_categoria"
                  (change)="onCategoryChange()"
                  class="w-full px-3 py-2 bg-[#0d111a] border border-slate-800 rounded-xl text-slate-300 text-xs focus:outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500 transition-colors cursor-pointer"
                  [class.border-red-600]="isFieldInvalid('id_categoria')"
                >
                  <option [ngValue]="null" disabled selected>-- Seleccionar Categoría --</option>
                  @for (cat of categories(); track cat.id) {
                    <option [ngValue]="cat.id">{{ cat.nombre }}</option>
                  }
                </select>
                @if (isFieldInvalid('id_categoria')) {
                  <p class="mt-1 text-[11px] text-red-400">Selecciona una categoría.</p>
                }
              </div>

              <!-- Selector de Subcategoría -->
              <div>
                <label for="id_subcategoria" class="block text-xs font-medium text-slate-300 mb-1.5">
                  Subcategoría
                </label>
                <select
                  id="id_subcategoria"
                  formControlName="id_subcategoria"
                  class="w-full px-3 py-2 bg-[#0d111a] border border-slate-800 rounded-xl text-slate-300 text-xs focus:outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500 transition-colors disabled:opacity-40 cursor-pointer"
                >
                  <option [ngValue]="null">-- Ninguna / Opcional --</option>
                  @for (sub of availableSubcategories(); track sub.id) {
                    <option [ngValue]="sub.id">{{ sub.nombre }}</option>
                  }
                </select>
              </div>
            </div>
          </section>

          <!-- 3. Precios e Inventario -->
          <section class="bg-[#111622] border border-slate-800/90 rounded-2xl p-5 sm:p-6">
            <header class="flex items-center gap-2.5 mb-4 pb-3 border-b border-slate-800/80">
              <div class="w-6 h-6 rounded-md bg-slate-800 border border-slate-700/60 text-slate-300 font-medium text-xs flex items-center justify-center">
                3
              </div>
              <div>
                <h2 class="text-sm font-semibold text-white">Precios e Inventario</h2>
                <p class="text-[11px] text-slate-500">Precios de venta, stock disponible y slot físico</p>
              </div>
            </header>

            <div class="space-y-4">
              <div class="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <!-- Precio -->
                <div>
                  <label for="precio" class="block text-xs font-medium text-slate-300 mb-1.5">
                    Precio ($) <span class="text-red-400">*</span>
                  </label>
                  <div class="relative">
                    <span class="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500 text-xs">$</span>
                    <input
                      id="precio"
                      type="number"
                      step="0.01"
                      min="0"
                      formControlName="precio"
                      placeholder="0.00"
                      class="w-full pl-7 pr-3 py-2 bg-[#0d111a] border border-slate-800 rounded-xl text-slate-200 text-xs focus:outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500 transition-colors"
                      [class.border-red-600]="isFieldInvalid('precio')"
                    />
                  </div>
                  @if (isFieldInvalid('precio')) {
                    <p class="mt-1 text-[11px] text-red-400">Ingresa un precio válido.</p>
                  }
                </div>

                <!-- Descuento -->
                <div>
                  <label for="descuento" class="block text-xs font-medium text-slate-300 mb-1.5">
                    Descuento ($)
                  </label>
                  <div class="relative">
                    <span class="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500 text-xs">$</span>
                    <input
                      id="descuento"
                      type="number"
                      step="0.01"
                      min="0"
                      formControlName="descuento"
                      placeholder="0.00"
                      class="w-full pl-7 pr-3 py-2 bg-[#0d111a] border border-slate-800 rounded-xl text-slate-200 text-xs focus:outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500 transition-colors"
                    />
                  </div>
                </div>

                <!-- Stock Inicial -->
                <div>
                  <label for="stock" class="block text-xs font-medium text-slate-300 mb-1.5">
                    Stock Inicial <span class="text-red-400">*</span>
                  </label>
                  <input
                    id="stock"
                    type="number"
                    min="0"
                    formControlName="stock"
                    placeholder="10"
                    class="w-full px-3 py-2 bg-[#0d111a] border border-slate-800 rounded-xl text-slate-200 text-xs focus:outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500 transition-colors"
                    [class.border-red-600]="isFieldInvalid('stock')"
                  />
                  @if (isFieldInvalid('stock')) {
                    <p class="mt-1 text-[11px] text-red-400">El stock es obligatorio.</p>
                  }
                </div>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
                <!-- Ubicación Slot -->
                <div>
                  <label for="ubicacion" class="block text-xs font-medium text-slate-300 mb-1.5">
                    Ubicación Slot (Ej: A1) <span class="text-red-400">*</span>
                  </label>
                  <input
                    id="ubicacion"
                    type="text"
                    formControlName="ubicacion"
                    placeholder="A1"
                    maxlength="3"
                    (input)="onUbicacionInput($event)"
                    class="w-full px-3 py-2 bg-[#0d111a] border border-slate-800 rounded-xl text-slate-200 text-xs uppercase focus:outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500 transition-colors font-mono"
                    [class.border-red-600]="isFieldInvalid('ubicacion')"
                  />
                  @if (isFieldInvalid('ubicacion')) {
                    <p class="mt-1 text-[11px] text-red-400">Usa una letra y un número (Ej: A1).</p>
                  }
                </div>

                <!-- Switch Activo -->
                <div class="flex items-center gap-2.5 sm:pt-6">
                  <label class="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" formControlName="activo" class="sr-only peer">
                    <div class="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-slate-300"></div>
                  </label>
                  <span class="text-xs font-medium text-slate-300">Producto activo en tienda</span>
                </div>
              </div>
            </div>
          </section>

        </div>

        <!-- Columna Derecha: Imágenes, Destacado y Botón Submit (4 cols) -->
        <div class="lg:col-span-4 space-y-5">
          
          <!-- 4. Imágenes del Producto -->
          <section class="bg-[#111622] border border-slate-800/90 rounded-2xl p-5">
            <header class="flex items-center gap-2.5 mb-4 pb-3 border-b border-slate-800/80">
              <div class="w-6 h-6 rounded-md bg-slate-800 border border-slate-700/60 text-slate-300 font-medium text-xs flex items-center justify-center">
                4
              </div>
              <div>
                <h2 class="text-sm font-semibold text-white">Imágenes</h2>
                <p class="text-[11px] text-slate-500">Principal y secundarias</p>
              </div>
            </header>

            <!-- Imagen Principal -->
            <div class="space-y-2.5 mb-4">
              <label class="block text-xs font-medium text-slate-300">
                Imagen Principal <span class="text-red-400">*</span>
              </label>

              @if (imgPrincipalPreview()) {
                <div class="relative rounded-xl overflow-hidden border border-slate-800 bg-[#0d111a] group">
                  <img [src]="imgPrincipalPreview()" alt="Preview Principal" class="w-full h-36 object-contain p-2" />
                  <div class="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2 transition-opacity">
                    <button
                      type="button"
                      (click)="fileInputPrincipal.click()"
                      class="px-2.5 py-1.5 rounded-lg bg-slate-800 text-slate-200 hover:text-white text-xs font-medium cursor-pointer"
                      title="Cambiar imagen"
                    >
                      <i class="fas fa-camera"></i>
                    </button>
                    <button
                      type="button"
                      (click)="removePrincipalImage()"
                      class="px-2.5 py-1.5 rounded-lg bg-red-900/60 text-red-300 hover:text-white text-xs font-medium cursor-pointer"
                      title="Eliminar imagen"
                    >
                      <i class="fas fa-trash"></i>
                    </button>
                  </div>
                </div>
              } @else {
                <div
                  (click)="fileInputPrincipal.click()"
                  class="border border-dashed border-slate-800 hover:border-slate-600 rounded-xl p-5 text-center cursor-pointer transition-colors bg-[#0d111a] group"
                >
                  <i class="fas fa-cloud-arrow-up text-xl text-slate-400 mb-1.5"></i>
                  <p class="text-xs font-medium text-slate-300">Subir Imagen Principal</p>
                  <p class="text-[10px] text-slate-500 mt-0.5">PNG, JPG o WebP</p>
                </div>
              }
              <input #fileInputPrincipal type="file" accept="image/*" (change)="onFileChange($event, 'principal')" class="hidden" />
            </div>

            <!-- Imágenes Secundarias (3 slots) -->
            <div class="space-y-1.5">
              <label class="block text-xs font-medium text-slate-400">
                Secundarias (Opcionales)
              </label>
              
              <div class="grid grid-cols-3 gap-2">
                <!-- Slot 1 -->
                @if (imgSec1Preview()) {
                  <div class="relative rounded-lg overflow-hidden border border-slate-800 bg-[#0d111a] aspect-square group">
                    <img [src]="imgSec1Preview()" alt="Sec 1" class="w-full h-full object-contain p-1" />
                    <button
                      type="button"
                      (click)="removeSecImage(1)"
                      class="absolute top-1 right-1 w-5 h-5 rounded bg-red-900/80 text-white text-[9px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <i class="fas fa-xmark"></i>
                    </button>
                  </div>
                } @else {
                  <div
                    (click)="fileInputSec1.click()"
                    class="border border-dashed border-slate-800 hover:border-slate-600 rounded-lg aspect-square flex flex-col items-center justify-center cursor-pointer text-slate-500 hover:text-slate-300 transition-colors bg-[#0d111a]"
                  >
                    <i class="fas fa-plus text-xs"></i>
                    <span class="text-[8px] mt-0.5 font-medium">Foto 2</span>
                  </div>
                }
                <input #fileInputSec1 type="file" accept="image/*" (change)="onFileChange($event, 'sec1')" class="hidden" />

                <!-- Slot 2 -->
                @if (imgSec2Preview()) {
                  <div class="relative rounded-lg overflow-hidden border border-slate-800 bg-[#0d111a] aspect-square group">
                    <img [src]="imgSec2Preview()" alt="Sec 2" class="w-full h-full object-contain p-1" />
                    <button
                      type="button"
                      (click)="removeSecImage(2)"
                      class="absolute top-1 right-1 w-5 h-5 rounded bg-red-900/80 text-white text-[9px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <i class="fas fa-xmark"></i>
                    </button>
                  </div>
                } @else {
                  <div
                    (click)="fileInputSec2.click()"
                    class="border border-dashed border-slate-800 hover:border-slate-600 rounded-lg aspect-square flex flex-col items-center justify-center cursor-pointer text-slate-500 hover:text-slate-300 transition-colors bg-[#0d111a]"
                  >
                    <i class="fas fa-plus text-xs"></i>
                    <span class="text-[8px] mt-0.5 font-medium">Foto 3</span>
                  </div>
                }
                <input #fileInputSec2 type="file" accept="image/*" (change)="onFileChange($event, 'sec2')" class="hidden" />

                <!-- Slot 3 -->
                @if (imgSec3Preview()) {
                  <div class="relative rounded-lg overflow-hidden border border-slate-800 bg-[#0d111a] aspect-square group">
                    <img [src]="imgSec3Preview()" alt="Sec 3" class="w-full h-full object-contain p-1" />
                    <button
                      type="button"
                      (click)="removeSecImage(3)"
                      class="absolute top-1 right-1 w-5 h-5 rounded bg-red-900/80 text-white text-[9px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <i class="fas fa-xmark"></i>
                    </button>
                  </div>
                } @else {
                  <div
                    (click)="fileInputSec3.click()"
                    class="border border-dashed border-slate-800 hover:border-slate-600 rounded-lg aspect-square flex flex-col items-center justify-center cursor-pointer text-slate-500 hover:text-slate-300 transition-colors bg-[#0d111a]"
                  >
                    <i class="fas fa-plus text-xs"></i>
                    <span class="text-[8px] mt-0.5 font-medium">Foto 4</span>
                  </div>
                }
                <input #fileInputSec3 type="file" accept="image/*" (change)="onFileChange($event, 'sec3')" class="hidden" />
              </div>
            </div>
          </section>

          <!-- 5. Opciones Destacadas -->
          <section class="bg-[#111622] border border-slate-800/90 rounded-2xl p-5">
            <header class="flex items-center gap-2.5 mb-4 pb-3 border-b border-slate-800/80">
              <div class="w-6 h-6 rounded-md bg-slate-800 border border-slate-700/60 text-slate-300 font-medium text-xs flex items-center justify-center">
                5
              </div>
              <div>
                <h2 class="text-sm font-semibold text-white">Destacado</h2>
                <p class="text-[11px] text-slate-500">Prioridad en catálogo</p>
              </div>
            </header>

            <div class="space-y-3.5">
              <div class="flex items-center justify-between">
                <span class="text-xs font-medium text-slate-300">Destacar en catálogo</span>
                <label class="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" formControlName="destacado" (change)="onDestacadoChange()" class="sr-only peer">
                  <div class="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-slate-300"></div>
                </label>
              </div>

              @if (isDestacadoChecked()) {
                <div class="pt-1 animate-fade-in">
                  <label for="orden_destacado" class="block text-xs font-medium text-slate-300 mb-1.5">
                    Posición de Orden <span class="text-red-400">*</span>
                  </label>
                  <input
                    id="orden_destacado"
                    type="number"
                    min="1"
                    formControlName="orden_destacado"
                    placeholder="Ej: 1, 2, 3"
                    class="w-full px-3 py-2 bg-[#0d111a] border border-slate-800 rounded-xl text-slate-200 text-xs focus:outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500 transition-colors font-mono"
                    [class.border-red-600]="isFieldInvalid('orden_destacado')"
                  />
                  @if (isFieldInvalid('orden_destacado')) {
                    <p class="mt-1 text-[11px] text-red-400">Indica el número de orden.</p>
                  }
                </div>
              }
            </div>
          </section>

          <!-- Botones de Acción -->
          <div class="space-y-2.5 pt-1">
            <button
              type="submit"
              [disabled]="isLoading() || productForm.invalid || !imgPrincipalPreview()"
              class="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-medium text-xs text-slate-900 bg-slate-100 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer shadow-sm"
            >
              @if (isLoading()) {
                <i class="fas fa-spinner fa-spin"></i>
                <span>Guardando...</span>
              } @else {
                <i class="fas fa-check text-xs"></i>
                <span>Guardar Producto</span>
              }
            </button>

            <a
              routerLink="/admin/productos"
              class="w-full inline-flex items-center justify-center gap-2 py-2 px-4 rounded-xl font-medium text-xs text-slate-400 hover:text-slate-200 bg-[#0d111a] hover:bg-slate-800 border border-slate-800 transition-colors cursor-pointer text-center"
            >
              Cancelar
            </a>
          </div>

        </div>

      </form>

    </div>
  `
})
export class ProductFormComponent implements OnInit {
  productForm: FormGroup;
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);

  imgPrincipalPreview = signal<string | null>(null);
  imgSec1Preview = signal<string | null>(null);
  imgSec2Preview = signal<string | null>(null);
  imgSec3Preview = signal<string | null>(null);

  availableSubcategories = signal<SubcategoryDto[]>([]);

  get categories() {
    return this.categoryService.categories;
  }

  get isLoading() {
    return this.productService.isLoading;
  }

  constructor(
    private fb: FormBuilder,
    private categoryService: CategoryService,
    private productService: ProductService,
    private router: Router
  ) {
    this.productForm = this.fb.group({
      nombre_producto: ['', [Validators.required]],
      sku: [''],
      descripcion: ['', [Validators.required]],
      id_categoria: [null, [Validators.required]],
      id_subcategoria: [null],
      precio: [null, [Validators.required, Validators.min(0)]],
      descuento: [null, [Validators.min(0)]],
      stock: [10, [Validators.required, Validators.min(0)]],
      ubicacion: ['', [Validators.required, Validators.pattern(/^[A-Za-z][0-9]$/)]],
      destacado: [false],
      orden_destacado: [null],
      activo: [true]
    });
  }

  ngOnInit(): void {
    this.productForm.get('id_subcategoria')?.disable();
    this.categoryService.loadCategories();
  }

  isDestacadoChecked(): boolean {
    return !!this.productForm.get('destacado')?.value;
  }

  onDestacadoChange(): void {
    const destacado = this.isDestacadoChecked();
    const ordenControl = this.productForm.get('orden_destacado');
    if (destacado) {
      ordenControl?.setValidators([Validators.required, Validators.min(1)]);
    } else {
      ordenControl?.clearValidators();
      ordenControl?.setValue(null);
    }
    ordenControl?.updateValueAndValidity();
  }

  onCategoryChange(): void {
    const selectedCatId = Number(this.productForm.get('id_categoria')?.value);
    const cat = this.categories().find(c => c.id === selectedCatId);
    if (cat && cat.subcategorias && cat.subcategorias.length > 0) {
      this.availableSubcategories.set(cat.subcategorias);
      this.productForm.get('id_subcategoria')?.enable();
    } else {
      this.availableSubcategories.set([]);
      this.productForm.get('id_subcategoria')?.setValue(null);
      this.productForm.get('id_subcategoria')?.disable();
    }
  }

  onUbicacionInput(event: any): void {
    const val = (event.target.value || '').toUpperCase();
    this.productForm.get('ubicacion')?.setValue(val, { emitEvent: false });
  }

  isFieldInvalid(field: string): boolean {
    const control = this.productForm.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  async onFileChange(event: any, type: 'principal' | 'sec1' | 'sec2' | 'sec3'): Promise<void> {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const compressed = await this.productService.compressImage(file);
      if (type === 'principal') {
        this.imgPrincipalPreview.set(compressed);
      } else if (type === 'sec1') {
        this.imgSec1Preview.set(compressed);
      } else if (type === 'sec2') {
        this.imgSec2Preview.set(compressed);
      } else if (type === 'sec3') {
        this.imgSec3Preview.set(compressed);
      }
    } catch (err) {
      console.error('Error al procesar la imagen:', err);
    }
  }

  removePrincipalImage(): void {
    this.imgPrincipalPreview.set(null);
  }

  removeSecImage(slot: 1 | 2 | 3): void {
    if (slot === 1) this.imgSec1Preview.set(null);
    if (slot === 2) this.imgSec2Preview.set(null);
    if (slot === 3) this.imgSec3Preview.set(null);
  }

  async onSubmit(): Promise<void> {
    this.errorMessage.set(null);
    this.successMessage.set(null);

    if (this.productForm.invalid) {
      this.productForm.markAllAsTouched();
      return;
    }

    if (!this.imgPrincipalPreview()) {
      this.errorMessage.set('La imagen principal del producto es obligatoria.');
      return;
    }

    const formVal = this.productForm.getRawValue();

    const subId = formVal.id_subcategoria && formVal.id_subcategoria !== 'null' && Number(formVal.id_subcategoria) > 0
      ? Number(formVal.id_subcategoria)
      : null;

    const descVal = formVal.descuento !== null && formVal.descuento !== '' && !isNaN(Number(formVal.descuento))
      ? Number(formVal.descuento)
      : null;

    const ordVal = formVal.destacado && formVal.orden_destacado && !isNaN(Number(formVal.orden_destacado))
      ? Number(formVal.orden_destacado)
      : null;

    const payload = {
      nombre_producto: (formVal.nombre_producto || '').trim(),
      sku: formVal.sku && formVal.sku.trim() ? formVal.sku.trim() : null,
      descripcion: (formVal.descripcion || '').trim(),
      id_categoria: Number(formVal.id_categoria),
      id_subcategoria: subId,
      precio: Number(formVal.precio),
      descuento: descVal,
      stock: Number(formVal.stock),
      ubicacion: (formVal.ubicacion || '').trim().toUpperCase(),
      imagen_principal: this.imgPrincipalPreview()!,
      imagen_secundaria_1: this.imgSec1Preview(),
      imagen_secundaria_2: this.imgSec2Preview(),
      imagen_secundaria_3: this.imgSec3Preview(),
      destacado: !!formVal.destacado,
      orden_destacado: ordVal,
      activo: !!formVal.activo
    };

    try {
      const response = await this.productService.create(payload);
      if (response && response.success) {
        this.successMessage.set(response.message || '¡Producto guardado exitosamente!');
        setTimeout(() => {
          this.router.navigate(['/admin']);
        }, 1200);
      }
    } catch (err: any) {
      this.errorMessage.set(err.message || 'Ocurrió un error al registrar el producto.');
    }
  }
}
