import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../../core/services/product.service';
import { CategoryService } from '../../../core/services/category.service';
import { ProductDto } from '../../../api/models';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="space-y-8 animate-fade-in max-w-7xl mx-auto">
      
      <!-- Header de la Página -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 flex items-center justify-center text-2xl shadow-lg shadow-indigo-600/20">
            <i class="fas fa-boxes-stacked"></i>
          </div>
          <div>
            <h1 class="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Consulta de Productos
            </h1>
            <p class="text-xs sm:text-sm text-slate-400 mt-1">
              Inventario general y administración del catálogo en PauloBot Store.
            </p>
          </div>
        </div>

        <div class="flex items-center gap-3">
          <a
            routerLink="/admin/productos/nuevo"
            class="inline-flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-600/30 hover:shadow-indigo-600/50 hover:-translate-y-0.5 transition-all cursor-pointer"
          >
            <i class="fas fa-plus"></i>
            <span>Nuevo Producto</span>
          </a>

          <button
            (click)="refresh()"
            [disabled]="isLoading()"
            class="inline-flex items-center gap-2 px-4 py-3 rounded-2xl text-xs font-semibold text-slate-300 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer disabled:opacity-50"
            title="Recargar catálogo"
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

      <!-- Grid 3 Mini KPI Stats -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <!-- Total Productos -->
        <div class="bg-slate-900/90 border border-slate-800/90 rounded-3xl p-6 shadow-sm flex items-center gap-4">
          <div class="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center text-xl shrink-0">
            <i class="fas fa-box"></i>
          </div>
          <div>
            <div class="text-2xl font-black text-white tracking-tight">{{ totalCount() }}</div>
            <div class="text-xs text-slate-400">Total Productos Registrados</div>
          </div>
        </div>

        <!-- Productos Activos -->
        <div class="bg-slate-900/90 border border-slate-800/90 rounded-3xl p-6 shadow-sm flex items-center gap-4">
          <div class="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center text-xl shrink-0">
            <i class="fas fa-circle-check"></i>
          </div>
          <div>
            <div class="text-2xl font-black text-emerald-400 tracking-tight">{{ activeCount() }}</div>
            <div class="text-xs text-slate-400">Productos Activos en Tienda</div>
          </div>
        </div>

        <!-- Unidades en Stock -->
        <div class="bg-slate-900/90 border border-slate-800/90 rounded-3xl p-6 shadow-sm flex items-center gap-4">
          <div class="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center text-xl shrink-0">
            <i class="fas fa-layer-group"></i>
          </div>
          <div>
            <div class="text-2xl font-black text-amber-400 tracking-tight">{{ totalStock() }}</div>
            <div class="text-xs text-slate-400">Unidades Totales en Stock</div>
          </div>
        </div>
      </div>

      <!-- Tarjeta Principal de la Tabla con Buscador y Filtros -->
      <div class="bg-slate-900/90 border border-slate-800/90 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        
        <!-- Barra de Búsqueda y Filtros -->
        <div class="flex flex-col sm:flex-row gap-4 justify-between items-stretch sm:items-center">
          <!-- Input Búsqueda -->
          <div class="relative flex-1 max-w-md">
            <span class="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500 pointer-events-none">
              <i class="fas fa-magnifying-glass"></i>
            </span>
            <input
              type="text"
              [(ngModel)]="searchQuery"
              (ngModelChange)="onSearchChange($event)"
              placeholder="Buscar por nombre, SKU, ubicación o categoría..."
              class="w-full pl-10 pr-4 py-3 bg-slate-950/60 border border-slate-800 rounded-2xl text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
            />
          </div>

          <!-- Filtro de Categoría -->
          <div class="flex items-center gap-3">
            <select
              [(ngModel)]="selectedCategory"
              (ngModelChange)="onCategoryFilterChange($event)"
              class="px-4 py-3 bg-slate-950/60 border border-slate-800 rounded-2xl text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all cursor-pointer"
            >
              <option [ngValue]="null">Todas las Categorías</option>
              @for (cat of categories(); track cat.id) {
                <option [ngValue]="cat.id">{{ cat.nombre }}</option>
              }
            </select>
          </div>
        </div>

        <!-- Tabla de Productos -->
        <div class="overflow-x-auto">
          <table class="w-full text-left text-sm">
            <thead>
              <tr class="border-b border-slate-800 text-xs uppercase tracking-wider text-slate-400">
                <th class="pb-3.5 font-semibold">ID</th>
                <th class="pb-3.5 font-semibold">Imagen</th>
                <th class="pb-3.5 font-semibold">Producto</th>
                <th class="pb-3.5 font-semibold">Categoría</th>
                <th class="pb-3.5 font-semibold text-center">Ubicación</th>
                <th class="pb-3.5 font-semibold text-right">Precio</th>
                <th class="pb-3.5 font-semibold text-center">Stock</th>
                <th class="pb-3.5 font-semibold text-center">Estado</th>
                <th class="pb-3.5 font-semibold text-right">Acciones</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-800/60">
              @if (isLoading() && products().length === 0) {
                <tr>
                  <td colspan="9" class="py-12 text-center text-slate-400">
                    <i class="fas fa-spinner fa-spin text-2xl text-indigo-500 mb-2"></i>
                    <p class="text-xs">Cargando inventario...</p>
                  </td>
                </tr>
              } @else if (products().length > 0) {
                @for (prod of products(); track prod.id_producto) {
                  <tr class="hover:bg-slate-800/30 transition-colors">
                    <!-- ID -->
                    <td class="py-4">
                      <code class="px-2 py-0.5 rounded-md bg-slate-950 text-indigo-300 border border-slate-800 text-xs font-mono">
                        #{{ prod.id_producto }}
                      </code>
                    </td>

                    <!-- Imagen -->
                    <td class="py-4">
                      <div class="w-12 h-12 rounded-xl bg-slate-950 border border-slate-800 overflow-hidden flex items-center justify-center p-1">
                        <img
                          [src]="getImageUrl(prod.id_producto)"
                          [alt]="prod.nombre_producto"
                          loading="lazy"
                          class="w-full h-full object-contain"
                        />
                      </div>
                    </td>

                    <!-- Producto & SKU -->
                    <td class="py-4">
                      <div class="font-bold text-slate-100 flex items-center gap-2">
                        <span>{{ prod.nombre_producto }}</span>
                        @if (prod.destacado === 1) {
                          <span class="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20" title="Producto Destacado #{{ prod.orden_destacado }}">
                            <i class="fas fa-star text-[8px]"></i> #{{ prod.orden_destacado }}
                          </span>
                        }
                      </div>
                      @if (prod.sku) {
                        <div class="text-xs text-slate-500 font-mono mt-0.5">
                          SKU: {{ prod.sku }}
                        </div>
                      }
                    </td>

                    <!-- Categoría -->
                    <td class="py-4">
                      <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold bg-slate-950 border border-slate-800 text-slate-300">
                        <i class="fas fa-folder text-slate-500 text-[10px]"></i>
                        {{ prod.nombre_categoria || 'Sin categoría' }}
                      </span>
                      @if (prod.nombre_subcategoria) {
                        <div class="text-[11px] text-slate-500 ml-2 mt-0.5">
                          ↳ {{ prod.nombre_subcategoria }}
                        </div>
                      }
                    </td>

                    <!-- Ubicación -->
                    <td class="py-4 text-center">
                      <span class="px-2.5 py-1 rounded-lg text-xs font-bold font-mono bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                        {{ prod.ubicacion || 'N/A' }}
                      </span>
                    </td>

                    <!-- Precio -->
                    <td class="py-4 text-right">
                      <span class="font-bold text-emerald-400">
                        \${{ prod.precio | number:'1.2-2' }}
                      </span>
                      @if (prod.descuento && prod.descuento > 0) {
                        <div class="text-[10px] text-rose-400 font-medium line-through">
                          -\${{ prod.descuento | number:'1.2-2' }}
                        </div>
                      }
                    </td>

                    <!-- Stock -->
                    <td class="py-4 text-center">
                      @if (prod.stock <= 5) {
                        <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                          <i class="fas fa-triangle-exclamation text-[10px]"></i>
                          {{ prod.stock }} uds
                        </span>
                      } @else {
                        <span class="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          {{ prod.stock }} uds
                        </span>
                      }
                    </td>

                    <!-- Estado -->
                    <td class="py-4 text-center">
                      @if (prod.activo === 1) {
                        <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          <span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> Activo
                        </span>
                      } @else {
                        <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-800 text-slate-400 border border-slate-700">
                          <span class="w-1.5 h-1.5 rounded-full bg-slate-500"></span> Inactivo
                        </span>
                      }
                    </td>

                    <!-- Acciones -->
                    <td class="py-4 text-right">
                      <div class="inline-flex items-center gap-1.5">
                        <button
                          type="button"
                          (click)="confirmDelete(prod)"
                          class="w-8 h-8 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 hover:text-rose-400 hover:border-rose-500/40 hover:bg-rose-500/10 flex items-center justify-center transition-all cursor-pointer"
                          title="Eliminar producto"
                        >
                          <i class="fas fa-trash-can text-xs"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                }
              } @else {
                <tr>
                  <td colspan="9" class="py-12 text-center text-slate-500">
                    <i class="fas fa-boxes-stacked text-3xl mb-2 text-slate-600 block"></i>
                    No se encontraron productos registrados con los filtros aplicados.
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>

      </div>

      <!-- Modal de Confirmación de Eliminación -->
      @if (productToDelete(); as prod) {
        <div class="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div class="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl space-y-6">
            <div class="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-400 flex items-center justify-center text-2xl border border-rose-500/20">
              <i class="fas fa-triangle-exclamation"></i>
            </div>
            
            <div>
              <h3 class="text-xl font-bold text-white">¿Eliminar producto?</h3>
              <p class="text-sm text-slate-400 mt-2">
                ¿Estás seguro de que deseas eliminar permanentemente <strong class="text-slate-200">"{{ prod.nombre_producto }}"</strong> del catálogo? Esta acción no se puede deshacer.
              </p>
            </div>

            <div class="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                (click)="cancelDelete()"
                class="px-5 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                (click)="executeDelete()"
                [disabled]="isLoading()"
                class="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 transition-colors cursor-pointer shadow-lg shadow-rose-600/30"
              >
                @if (isLoading()) {
                  <i class="fas fa-spinner fa-spin mr-1"></i> Eliminando...
                } @else {
                  <i class="fas fa-trash-can mr-1"></i> Sí, Eliminar
                }
              </button>
            </div>
          </div>
        </div>
      }

    </div>
  `
})
export class ProductListComponent implements OnInit {
  searchQuery = '';
  selectedCategory: number | null = null;
  productToDelete = signal<ProductDto | null>(null);
  alertMessage = signal<string | null>(null);
  alertType = signal<'success' | 'error'>('success');

  get products() {
    return this.productService.filteredProducts;
  }

  get categories() {
    return this.categoryService.categories;
  }

  get totalCount() {
    return this.productService.totalProductsCount;
  }

  get activeCount() {
    return this.productService.activeProductsCount;
  }

  get totalStock() {
    return this.productService.totalStockCount;
  }

  get isLoading() {
    return this.productService.isLoading;
  }

  constructor(
    private productService: ProductService,
    private categoryService: CategoryService
  ) {}

  ngOnInit(): void {
    this.refresh();
  }

  refresh(): void {
    this.productService.loadProducts();
    this.categoryService.loadCategories();
  }

  onSearchChange(val: string): void {
    this.productService.setFilterQuery(val);
  }

  onCategoryFilterChange(catId: number | null): void {
    this.productService.setCategoryFilter(catId);
  }

  getImageUrl(id: number): string {
    return this.productService.getProductImageUrl(id);
  }

  confirmDelete(prod: ProductDto): void {
    this.productToDelete.set(prod);
  }

  cancelDelete(): void {
    this.productToDelete.set(null);
  }

  async executeDelete(): Promise<void> {
    const prod = this.productToDelete();
    if (!prod) return;

    try {
      const res = await this.productService.delete(prod.id_producto);
      this.alertType.set('success');
      this.alertMessage.set(res.message || 'Producto eliminado correctamente.');
    } catch (err: any) {
      this.alertType.set('error');
      this.alertMessage.set(err.message || 'Error al eliminar el producto.');
    } finally {
      this.productToDelete.set(null);
    }
  }
}
