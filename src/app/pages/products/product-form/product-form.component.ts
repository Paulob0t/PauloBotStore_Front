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
    <div class="space-y-8 animate-fade-in max-w-5xl mx-auto">
      
      <!-- Header de la Página -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div class="flex items-center gap-4">
          <a
            routerLink="/admin"
            class="w-10 h-10 rounded-2xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 flex items-center justify-center transition-all cursor-pointer shadow-sm"
            title="Volver al Dashboard"
          >
            <i class="fas fa-arrow-left"></i>
          </a>
          <div>
            <h1 class="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
              <span class="w-9 h-9 rounded-xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 flex items-center justify-center text-lg">
                <i class="fas fa-box-open"></i>
              </span>
              Agregar Nuevo Producto
            </h1>
            <p class="text-xs sm:text-sm text-slate-400 mt-1">
              Registra un producto en el catálogo con precios, stock, ubicación e imágenes optimizadas.
            </p>
          </div>
        </div>
      </div>

      <!-- Alertas de Estado -->
      @if (errorMessage()) {
        <div class="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm flex items-start gap-3 animate-fade-in">
          <i class="fas fa-circle-exclamation text-rose-400 mt-0.5 text-base shrink-0"></i>
          <div class="flex-1 font-medium">{{ errorMessage() }}</div>
        </div>
      }

      @if (successMessage()) {
        <div class="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-sm flex items-start gap-3 animate-fade-in">
          <i class="fas fa-circle-check text-emerald-400 mt-0.5 text-base shrink-0"></i>
          <div class="flex-1 font-medium">{{ successMessage() }}</div>
        </div>
      }

      <!-- Formulario Principal -->
      <form [formGroup]="productForm" (ngSubmit)="onSubmit()" class="grid grid-cols-1 lg:grid-cols-12 gap-6" novalidate>
        
        <!-- Columna Izquierda: Datos, Clasificación, Precios (8 cols) -->
        <div class="lg:col-span-8 space-y-6">
          
          <!-- 1. Datos Básicos -->
          <section class="bg-slate-900/90 border border-slate-800/90 rounded-3xl p-6 sm:p-7 shadow-sm">
            <header class="flex items-center gap-3 mb-6 pb-4 border-b border-slate-800/80">
              <div class="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-400 font-bold text-sm flex items-center justify-center border border-indigo-500/20">
                1
              </div>
              <div>
                <h2 class="text-base font-bold text-white flex items-center gap-2">
                  <i class="fas fa-info-circle text-indigo-400"></i> Datos del Producto
                </h2>
                <p class="text-xs text-slate-400">Nombre, código identificador y descripción comercial</p>
              </div>
            </header>

            <div class="space-y-4">
              <div class="grid grid-cols-1 sm:grid-cols-12 gap-4">
                <!-- Nombre del Producto -->
                <div class="sm:col-span-8">
                  <label for="nombre_producto" class="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                    Nombre del Producto <span class="text-rose-400">*</span>
                  </label>
                  <input
                    id="nombre_producto"
                    type="text"
                    formControlName="nombre_producto"
                    placeholder="Ej: Coca Cola 600ml"
                    class="w-full px-4 py-3 bg-slate-950/60 border border-slate-800 rounded-2xl text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                    [class.border-rose-500]="isFieldInvalid('nombre_producto')"
                  />
                  @if (isFieldInvalid('nombre_producto')) {
                    <p class="mt-1.5 text-xs text-rose-400">El nombre del producto es obligatorio.</p>
                  }
                </div>

                <!-- SKU / Código -->
                <div class="sm:col-span-4">
                  <label for="sku" class="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                    SKU / Código
                  </label>
                  <input
                    id="sku"
                    type="text"
                    formControlName="sku"
                    placeholder="COD-001"
                    class="w-full px-4 py-3 bg-slate-950/60 border border-slate-800 rounded-2xl text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                  />
                </div>
              </div>

              <!-- Descripción -->
              <div>
                <label for="descripcion" class="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                  Descripción <span class="text-rose-400">*</span>
                </label>
                <textarea
                  id="descripcion"
                  rows="3"
                  formControlName="descripcion"
                  placeholder="Describe brevemente las características del producto..."
                  class="w-full px-4 py-3 bg-slate-950/60 border border-slate-800 rounded-2xl text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                  [class.border-rose-500]="isFieldInvalid('descripcion')"
                ></textarea>
                @if (isFieldInvalid('descripcion')) {
                  <p class="mt-1.5 text-xs text-rose-400">La descripción es obligatoria.</p>
                }
              </div>
            </div>
          </section>

          <!-- 2. Clasificación -->
          <section class="bg-slate-900/90 border border-slate-800/90 rounded-3xl p-6 sm:p-7 shadow-sm">
            <header class="flex items-center gap-3 mb-6 pb-4 border-b border-slate-800/80">
              <div class="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-400 font-bold text-sm flex items-center justify-center border border-purple-500/20">
                2
              </div>
              <div>
                <h2 class="text-base font-bold text-white flex items-center gap-2">
                  <i class="fas fa-folder-tree text-purple-400"></i> Clasificación
                </h2>
                <p class="text-xs text-slate-400">Asigna la categoría y subcategoría correspondiente</p>
              </div>
            </header>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <!-- Selector de Categoría -->
              <div>
                <label for="id_categoria" class="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                  Categoría <span class="text-rose-400">*</span>
                </label>
                <select
                  id="id_categoria"
                  formControlName="id_categoria"
                  (change)="onCategoryChange()"
                  class="w-full px-4 py-3 bg-slate-950/60 border border-slate-800 rounded-2xl text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                  [class.border-rose-500]="isFieldInvalid('id_categoria')"
                >
                  <option value="" disabled selected>-- Seleccionar Categoría --</option>
                  @for (cat of categories(); track cat.id) {
                    <option [value]="cat.id">{{ cat.nombre }}</option>
                  }
                </select>
                @if (isFieldInvalid('id_categoria')) {
                  <p class="mt-1.5 text-xs text-rose-400">Selecciona una categoría.</p>
                }
              </div>

              <!-- Selector de Subcategoría -->
              <div>
                <label for="id_subcategoria" class="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                  Subcategoría
                </label>
                <select
                  id="id_subcategoria"
                  formControlName="id_subcategoria"
                  class="w-full px-4 py-3 bg-slate-950/60 border border-slate-800 rounded-2xl text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all disabled:opacity-50"
                  [disabled]="availableSubcategories().length === 0"
                >
                  <option [ngValue]="null">-- Ninguna / Opcional --</option>
                  @for (sub of availableSubcategories(); track sub.id) {
                    <option [value]="sub.id">{{ sub.nombre }}</option>
                  }
                </select>
              </div>
            </div>
          </section>

          <!-- 3. Precios e Inventario -->
          <section class="bg-slate-900/90 border border-slate-800/90 rounded-3xl p-6 sm:p-7 shadow-sm">
            <header class="flex items-center gap-3 mb-6 pb-4 border-b border-slate-800/80">
              <div class="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 font-bold text-sm flex items-center justify-center border border-emerald-500/20">
                3
              </div>
              <div>
                <h2 class="text-base font-bold text-white flex items-center gap-2">
                  <i class="fas fa-coins text-emerald-400"></i> Precios e Inventario
                </h2>
                <p class="text-xs text-slate-400">Precios de venta, stock disponible y slot físico</p>
              </div>
            </header>

            <div class="space-y-4">
              <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <!-- Precio -->
                <div>
                  <label for="precio" class="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                    Precio ($) <span class="text-rose-400">*</span>
                  </label>
                  <div class="relative rounded-2xl">
                    <span class="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500 text-sm font-bold">$</span>
                    <input
                      id="precio"
                      type="number"
                      step="0.01"
                      min="0"
                      formControlName="precio"
                      placeholder="0.00"
                      class="w-full pl-8 pr-4 py-3 bg-slate-950/60 border border-slate-800 rounded-2xl text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                      [class.border-rose-500]="isFieldInvalid('precio')"
                    />
                  </div>
                  @if (isFieldInvalid('precio')) {
                    <p class="mt-1.5 text-xs text-rose-400">Ingresa un precio válido.</p>
                  }
                </div>

                <!-- Descuento -->
                <div>
                  <label for="descuento" class="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                    Descuento ($)
                  </label>
                  <div class="relative rounded-2xl">
                    <span class="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500 text-sm font-bold">$</span>
                    <input
                      id="descuento"
                      type="number"
                      step="0.01"
                      min="0"
                      formControlName="descuento"
                      placeholder="0.00"
                      class="w-full pl-8 pr-4 py-3 bg-slate-950/60 border border-slate-800 rounded-2xl text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                    />
                  </div>
                </div>

                <!-- Stock Inicial -->
                <div>
                  <label for="stock" class="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                    Stock Inicial <span class="text-rose-400">*</span>
                  </label>
                  <input
                    id="stock"
                    type="number"
                    min="0"
                    formControlName="stock"
                    placeholder="10"
                    class="w-full px-4 py-3 bg-slate-950/60 border border-slate-800 rounded-2xl text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                    [class.border-rose-500]="isFieldInvalid('stock')"
                  />
                  @if (isFieldInvalid('stock')) {
                    <p class="mt-1.5 text-xs text-rose-400">El stock es obligatorio.</p>
                  }
                </div>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <!-- Ubicación Slot -->
                <div>
                  <label for="ubicacion" class="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                    Ubicación Slot (Letra + Número) <span class="text-rose-400">*</span>
                  </label>
                  <input
                    id="ubicacion"
                    type="text"
                    formControlName="ubicacion"
                    placeholder="Ej: A1, B2, C3"
                    maxlength="3"
                    (input)="onUbicacionInput($event)"
                    class="w-full px-4 py-3 bg-slate-950/60 border border-slate-800 rounded-2xl text-slate-100 text-sm uppercase focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-mono"
                    [class.border-rose-500]="isFieldInvalid('ubicacion')"
                  />
                  @if (isFieldInvalid('ubicacion')) {
                    <p class="mt-1.5 text-xs text-rose-400">Formato inválido. Usa una letra y un número (Ej: A1).</p>
                  }
                </div>

                <!-- Switch Activo -->
                <div class="flex items-center gap-3 sm:pt-6">
                  <label class="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" formControlName="activo" class="sr-only peer">
                    <div class="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                  </label>
                  <span class="text-sm font-semibold text-slate-200">Producto Activo en Tienda</span>
                </div>
              </div>
            </div>
          </section>

        </div>

        <!-- Columna Derecha: Imágenes, Destacado y Botón Submit (4 cols) -->
        <div class="lg:col-span-4 space-y-6">
          
          <!-- 4. Imágenes del Producto -->
          <section class="bg-slate-900/90 border border-slate-800/90 rounded-3xl p-6 shadow-sm">
            <header class="flex items-center gap-3 mb-5 pb-4 border-b border-slate-800/80">
              <div class="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 font-bold text-sm flex items-center justify-center border border-amber-500/20">
                4
              </div>
              <div>
                <h2 class="text-base font-bold text-white flex items-center gap-2">
                  <i class="fas fa-image text-amber-400"></i> Imágenes
                </h2>
                <p class="text-xs text-slate-400">Principal y secundarias optimizadas</p>
              </div>
            </header>

            <!-- Imagen Principal -->
            <div class="space-y-3 mb-5">
              <label class="block text-xs font-bold uppercase tracking-wider text-slate-300">
                <i class="fas fa-star text-amber-400 text-xs mr-1"></i> Imagen Principal <span class="text-rose-400">*</span>
              </label>

              @if (imgPrincipalPreview()) {
                <div class="relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 group">
                  <img [src]="imgPrincipalPreview()" alt="Preview Principal" class="w-full h-44 object-contain p-2" />
                  <div class="absolute inset-0 bg-slate-950/70 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-3 transition-opacity">
                    <button
                      type="button"
                      (click)="fileInputPrincipal.click()"
                      class="p-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-500 text-xs font-semibold cursor-pointer"
                      title="Cambiar imagen"
                    >
                      <i class="fas fa-camera"></i> Cambiar
                    </button>
                    <button
                      type="button"
                      (click)="removePrincipalImage()"
                      class="p-2 rounded-xl bg-rose-600 text-white hover:bg-rose-500 text-xs font-semibold cursor-pointer"
                      title="Eliminar imagen"
                    >
                      <i class="fas fa-trash"></i>
                    </button>
                  </div>
                </div>
              } @else {
                <div
                  (click)="fileInputPrincipal.click()"
                  class="border-2 border-dashed border-slate-800 hover:border-indigo-500/60 rounded-2xl p-6 text-center cursor-pointer transition-all hover:bg-slate-950/40 group"
                >
                  <i class="fas fa-cloud-arrow-up text-3xl text-indigo-400 mb-2 group-hover:scale-110 transition-transform"></i>
                  <p class="text-xs font-bold text-slate-300">Subir Imagen Principal</p>
                  <p class="text-[11px] text-slate-500 mt-1">PNG, JPG, WebP (Optimizado a 800px)</p>
                </div>
              }
              <input #fileInputPrincipal type="file" accept="image/*" (change)="onFileChange($event, 'principal')" class="hidden" />
            </div>

            <!-- Imágenes Secundarias (3 slots) -->
            <div class="space-y-2">
              <label class="block text-xs font-bold uppercase tracking-wider text-slate-400">
                Imágenes Secundarias (Opcionales)
              </label>
              
              <div class="grid grid-cols-3 gap-2">
                <!-- Slot 1 -->
                @if (imgSec1Preview()) {
                  <div class="relative rounded-xl overflow-hidden border border-slate-800 bg-slate-950 aspect-square group">
                    <img [src]="imgSec1Preview()" alt="Sec 1" class="w-full h-full object-contain p-1" />
                    <button
                      type="button"
                      (click)="removeSecImage(1)"
                      class="absolute top-1 right-1 w-6 h-6 rounded-md bg-rose-600/80 text-white text-[10px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <i class="fas fa-xmark"></i>
                    </button>
                  </div>
                } @else {
                  <div
                    (click)="fileInputSec1.click()"
                    class="border border-dashed border-slate-800 hover:border-slate-700 rounded-xl aspect-square flex flex-col items-center justify-center cursor-pointer text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    <i class="fas fa-plus text-xs"></i>
                    <span class="text-[9px] mt-1 font-semibold">Foto 2</span>
                  </div>
                }
                <input #fileInputSec1 type="file" accept="image/*" (change)="onFileChange($event, 'sec1')" class="hidden" />

                <!-- Slot 2 -->
                @if (imgSec2Preview()) {
                  <div class="relative rounded-xl overflow-hidden border border-slate-800 bg-slate-950 aspect-square group">
                    <img [src]="imgSec2Preview()" alt="Sec 2" class="w-full h-full object-contain p-1" />
                    <button
                      type="button"
                      (click)="removeSecImage(2)"
                      class="absolute top-1 right-1 w-6 h-6 rounded-md bg-rose-600/80 text-white text-[10px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <i class="fas fa-xmark"></i>
                    </button>
                  </div>
                } @else {
                  <div
                    (click)="fileInputSec2.click()"
                    class="border border-dashed border-slate-800 hover:border-slate-700 rounded-xl aspect-square flex flex-col items-center justify-center cursor-pointer text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    <i class="fas fa-plus text-xs"></i>
                    <span class="text-[9px] mt-1 font-semibold">Foto 3</span>
                  </div>
                }
                <input #fileInputSec2 type="file" accept="image/*" (change)="onFileChange($event, 'sec2')" class="hidden" />

                <!-- Slot 3 -->
                @if (imgSec3Preview()) {
                  <div class="relative rounded-xl overflow-hidden border border-slate-800 bg-slate-950 aspect-square group">
                    <img [src]="imgSec3Preview()" alt="Sec 3" class="w-full h-full object-contain p-1" />
                    <button
                      type="button"
                      (click)="removeSecImage(3)"
                      class="absolute top-1 right-1 w-6 h-6 rounded-md bg-rose-600/80 text-white text-[10px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <i class="fas fa-xmark"></i>
                    </button>
                  </div>
                } @else {
                  <div
                    (click)="fileInputSec3.click()"
                    class="border border-dashed border-slate-800 hover:border-slate-700 rounded-xl aspect-square flex flex-col items-center justify-center cursor-pointer text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    <i class="fas fa-plus text-xs"></i>
                    <span class="text-[9px] mt-1 font-semibold">Foto 4</span>
                  </div>
                }
                <input #fileInputSec3 type="file" accept="image/*" (change)="onFileChange($event, 'sec3')" class="hidden" />
              </div>
            </div>
          </section>

          <!-- 5. Opciones Destacadas -->
          <section class="bg-slate-900/90 border border-slate-800/90 rounded-3xl p-6 shadow-sm">
            <header class="flex items-center gap-3 mb-5 pb-4 border-b border-slate-800/80">
              <div class="w-8 h-8 rounded-xl bg-cyan-500/10 text-cyan-400 font-bold text-sm flex items-center justify-center border border-cyan-500/20">
                5
              </div>
              <div>
                <h2 class="text-base font-bold text-white flex items-center gap-2">
                  <i class="fas fa-award text-cyan-400"></i> Destacado
                </h2>
                <p class="text-xs text-slate-400">Prioridad en quiosco y terminal</p>
              </div>
            </header>

            <div class="space-y-4">
              <div class="flex items-center justify-between">
                <span class="text-sm font-semibold text-slate-200">Destacar en Catálogo</span>
                <label class="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" formControlName="destacado" (change)="onDestacadoChange()" class="sr-only peer">
                  <div class="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-600"></div>
                </label>
              </div>

              @if (isDestacadoChecked()) {
                <div class="pt-2 animate-fade-in">
                  <label for="orden_destacado" class="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                    Posición de Orden <span class="text-rose-400">*</span>
                  </label>
                  <input
                    id="orden_destacado"
                    type="number"
                    min="1"
                    formControlName="orden_destacado"
                    placeholder="Ej: 1, 2, 3"
                    class="w-full px-4 py-3 bg-slate-950/60 border border-slate-800 rounded-2xl text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all font-mono"
                    [class.border-rose-500]="isFieldInvalid('orden_destacado')"
                  />
                  @if (isFieldInvalid('orden_destacado')) {
                    <p class="mt-1.5 text-xs text-rose-400">Indica el número de orden para productos destacados.</p>
                  }
                </div>
              }
            </div>
          </section>

          <!-- Botones de Acción -->
          <div class="space-y-3 pt-2">
            <button
              type="submit"
              [disabled]="isLoading() || productForm.invalid || !imgPrincipalPreview()"
              class="w-full inline-flex items-center justify-center gap-2.5 py-4 px-6 rounded-2xl font-bold text-sm tracking-wider uppercase text-white bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-600/30 hover:shadow-indigo-600/50 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 cursor-pointer"
            >
              @if (isLoading()) {
                <i class="fas fa-spinner fa-spin"></i>
                <span>Guardando Producto...</span>
              } @else {
                <i class="fas fa-save"></i>
                <span>GUARDAR PRODUCTO</span>
              }
            </button>

            <a
              routerLink="/admin"
              class="w-full inline-flex items-center justify-center gap-2 py-3 px-6 rounded-2xl font-semibold text-xs text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 transition-all cursor-pointer text-center"
            >
              Cancelar y Volver
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
      id_categoria: ['', [Validators.required]],
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
    } else {
      this.availableSubcategories.set([]);
      this.productForm.get('id_subcategoria')?.setValue(null);
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

    const formVal = this.productForm.value;

    const payload = {
      nombre_producto: formVal.nombre_producto.trim(),
      sku: formVal.sku ? formVal.sku.trim() : null,
      descripcion: formVal.descripcion.trim(),
      id_categoria: Number(formVal.id_categoria),
      id_subcategoria: formVal.id_subcategoria ? Number(formVal.id_subcategoria) : null,
      precio: Number(formVal.precio),
      descuento: formVal.descuento !== null && formVal.descuento !== '' ? Number(formVal.descuento) : null,
      stock: Number(formVal.stock),
      ubicacion: formVal.ubicacion.trim().toUpperCase(),
      imagen_principal: this.imgPrincipalPreview()!,
      imagen_secundaria_1: this.imgSec1Preview(),
      imagen_secundaria_2: this.imgSec2Preview(),
      imagen_secundaria_3: this.imgSec3Preview(),
      destacado: !!formVal.destacado,
      orden_destacado: formVal.destacado && formVal.orden_destacado ? Number(formVal.orden_destacado) : null,
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
