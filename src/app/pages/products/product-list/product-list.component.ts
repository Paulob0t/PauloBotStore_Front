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
    <div class="space-y-6 animate-fade-in max-w-7xl mx-auto">
      
      <!-- Header de la Página -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 class="text-2xl font-semibold text-white tracking-tight">
            Consulta de Productos
          </h1>
          <p class="text-xs text-slate-400 mt-1 font-normal">
            Inventario general y administración del catálogo
          </p>
        </div>

        <div class="flex items-center gap-2.5">
          <a
            routerLink="/admin/productos/nuevo"
            class="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium text-slate-900 bg-slate-100 hover:bg-white transition-colors cursor-pointer"
          >
            <i class="fas fa-plus text-[11px]"></i>
            <span>Nuevo Producto</span>
          </a>

          <button
            (click)="refresh()"
            [disabled]="isLoading()"
            class="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium text-slate-300 bg-[#0d111a] hover:bg-slate-800 border border-slate-800 transition-colors cursor-pointer disabled:opacity-40"
            title="Recargar catálogo"
          >
            <i class="fas fa-arrows-rotate text-[11px]" [class.fa-spin]="isLoading()"></i>
            <span class="hidden sm:inline">Actualizar</span>
          </button>
        </div>
      </div>

      <!-- Alertas de Estado -->
      @if (alertMessage()) {
        <div
          class="p-3.5 rounded-xl text-xs flex items-start justify-between gap-3 animate-fade-in"
          [ngClass]="alertType() === 'success' ? 'bg-emerald-950/40 border border-emerald-800/40 text-emerald-300' : 'bg-red-950/40 border border-red-800/40 text-red-300'"
        >
          <div class="flex items-center gap-2.5 font-medium">
            <i class="fas" [ngClass]="alertType() === 'success' ? 'fa-circle-check text-emerald-400 text-sm' : 'fa-circle-exclamation text-red-400 text-sm'"></i>
            <span>{{ alertMessage() }}</span>
          </div>
          <button (click)="alertMessage.set(null)" class="text-slate-400 hover:text-white cursor-pointer">
            <i class="fas fa-xmark text-xs"></i>
          </button>
        </div>
      }

      <!-- Grid 3 Mini KPI Stats -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <!-- Total Productos -->
        <div class="bg-[#111622] border border-slate-800/90 rounded-2xl p-4 sm:p-5 flex items-center gap-3.5">
          <div class="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700/60 text-slate-300 flex items-center justify-center text-sm shrink-0">
            <i class="fas fa-box"></i>
          </div>
          <div>
            <div class="text-xl font-semibold text-white tracking-tight">{{ totalCount() }}</div>
            <div class="text-xs text-slate-400">Total Productos</div>
          </div>
        </div>

        <!-- Productos Activos -->
        <div class="bg-[#111622] border border-slate-800/90 rounded-2xl p-4 sm:p-5 flex items-center gap-3.5">
          <div class="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700/60 text-emerald-400 flex items-center justify-center text-sm shrink-0">
            <i class="fas fa-circle-check"></i>
          </div>
          <div>
            <div class="text-xl font-semibold text-emerald-400 tracking-tight">{{ activeCount() }}</div>
            <div class="text-xs text-slate-400">Activos en Tienda</div>
          </div>
        </div>

        <!-- Unidades en Stock -->
        <div class="bg-[#111622] border border-slate-800/90 rounded-2xl p-4 sm:p-5 flex items-center gap-3.5">
          <div class="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700/60 text-slate-300 flex items-center justify-center text-sm shrink-0">
            <i class="fas fa-layer-group"></i>
          </div>
          <div>
            <div class="text-xl font-semibold text-white tracking-tight">{{ totalStock() }}</div>
            <div class="text-xs text-slate-400">Unidades en Stock</div>
          </div>
        </div>
      </div>

      <!-- Tarjeta Principal de la Tabla con Buscador y Filtros -->
      <div class="bg-[#111622] border border-slate-800/90 rounded-2xl p-5 sm:p-6 space-y-5">
        
        <!-- Barra de Búsqueda y Filtros -->
        <div class="flex flex-col sm:flex-row gap-3 justify-between items-stretch sm:items-center">
          <!-- Input Búsqueda -->
          <div class="relative flex-1 max-w-md">
            <span class="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500 pointer-events-none text-xs">
              <i class="fas fa-magnifying-glass"></i>
            </span>
            <input
              type="text"
              [(ngModel)]="searchQuery"
              (ngModelChange)="onSearchChange($event)"
              placeholder="Buscar por nombre, SKU o ubicación..."
              class="w-full pl-9 pr-3.5 py-2 bg-[#0d111a] border border-slate-800 rounded-xl text-slate-200 placeholder-slate-600 text-xs focus:outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500 transition-colors"
            />
          </div>

          <!-- Filtro de Categoría -->
          <div class="flex items-center gap-3">
            <select
              [(ngModel)]="selectedCategory"
              (ngModelChange)="onCategoryFilterChange($event)"
              class="w-full sm:w-auto px-3 py-2 bg-[#0d111a] border border-slate-800 rounded-xl text-slate-300 text-xs focus:outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500 transition-colors cursor-pointer"
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
          <table class="w-full text-left text-xs">
            <thead>
              <tr class="border-b border-slate-800/80 text-[11px] uppercase tracking-wider text-slate-500">
                <th class="pb-2.5 font-medium">ID</th>
                <th class="pb-2.5 font-medium">Imagen</th>
                <th class="pb-2.5 font-medium">Producto</th>
                <th class="pb-2.5 font-medium">Categoría</th>
                <th class="pb-2.5 font-medium text-center">Ubicación</th>
                <th class="pb-2.5 font-medium text-right">Precio</th>
                <th class="pb-2.5 font-medium text-center">Stock</th>
                <th class="pb-2.5 font-medium text-center">Estado</th>
                <th class="pb-2.5 font-medium text-right">Acciones</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-800/40">
              @if (isLoading() && products().length === 0) {
                <tr>
                  <td colspan="9" class="py-12 text-center text-slate-400">
                    <i class="fas fa-spinner fa-spin text-xl text-slate-400 mb-2"></i>
                    <p class="text-xs text-slate-500">Cargando inventario...</p>
                  </td>
                </tr>
              } @else if (products().length > 0) {
                @for (prod of products(); track prod.id_producto) {
                  <tr class="hover:bg-slate-800/30 transition-colors">
                    <!-- ID -->
                    <td class="py-3">
                      <code class="px-1.5 py-0.5 rounded bg-[#0a0d14] text-slate-300 border border-slate-800 text-[11px] font-mono">
                        #{{ prod.id_producto }}
                      </code>
                    </td>

                    <!-- Imagen -->
                    <td class="py-3">
                      <div class="w-10 h-10 rounded-lg bg-[#0a0d14] border border-slate-800 overflow-hidden flex items-center justify-center p-1">
                        <img
                          [src]="getImageUrl(prod.id_producto)"
                          [alt]="prod.nombre_producto"
                          loading="lazy"
                          class="w-full h-full object-contain"
                        />
                      </div>
                    </td>

                    <!-- Producto & SKU -->
                    <td class="py-3">
                      <div class="font-medium text-slate-200 flex items-center gap-2">
                        <span>{{ prod.nombre_producto }}</span>
                        @if (prod.destacado === 1) {
                          <span class="px-1.5 py-0.2 rounded text-[10px] font-medium bg-slate-800 text-slate-300 border border-slate-700/60" title="Producto Destacado #{{ prod.orden_destacado }}">
                            <i class="fas fa-star text-[9px] text-amber-400"></i> #{{ prod.orden_destacado }}
                          </span>
                        }
                      </div>
                      @if (prod.sku) {
                        <div class="text-[11px] text-slate-500 font-mono mt-0.5">
                          SKU: {{ prod.sku }}
                        </div>
                      }
                    </td>

                    <!-- Categoría -->
                    <td class="py-3">
                      <span class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium bg-[#0a0d14] border border-slate-800 text-slate-300">
                        <i class="fas fa-folder text-slate-500 text-[9px]"></i>
                        {{ prod.nombre_categoria || 'Sin categoría' }}
                      </span>
                      @if (prod.nombre_subcategoria) {
                        <div class="text-[10px] text-slate-500 ml-1 mt-0.5">
                          ↳ {{ prod.nombre_subcategoria }}
                        </div>
                      }
                    </td>

                    <!-- Ubicación -->
                    <td class="py-3 text-center">
                      <span class="px-2 py-0.5 rounded text-[11px] font-medium font-mono bg-slate-800/80 text-slate-300 border border-slate-700/60">
                        {{ prod.ubicacion || 'N/A' }}
                      </span>
                    </td>

                    <!-- Precio -->
                    <td class="py-3 text-right">
                      <span class="font-medium text-slate-200">
                        \${{ prod.precio | number:'1.2-2' }}
                      </span>
                      @if (prod.descuento && prod.descuento > 0) {
                        <div class="text-[10px] text-red-400 line-through">
                          -\${{ prod.descuento | number:'1.2-2' }}
                        </div>
                      }
                    </td>

                    <!-- Stock -->
                    <td class="py-3 text-center">
                      @if (prod.stock <= 5) {
                        <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-red-950/40 text-red-400 border border-red-800/40">
                          <i class="fas fa-triangle-exclamation text-[9px]"></i>
                          {{ prod.stock }} uds
                        </span>
                      } @else {
                        <span class="px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-800 text-slate-300 border border-slate-700/60">
                          {{ prod.stock }} uds
                        </span>
                      }
                    </td>

                    <!-- Estado -->
                    <td class="py-3 text-center">
                      @if (prod.activo === 1) {
                        <span class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-950/40 text-emerald-400 border border-emerald-800/40">
                          <span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> Activo
                        </span>
                      } @else {
                        <span class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-800 text-slate-400 border border-slate-700">
                          <span class="w-1.5 h-1.5 rounded-full bg-slate-500"></span> Inactivo
                        </span>
                      }
                    </td>

                    <!-- Acciones -->
                    <td class="py-3 text-right">
                      <div class="inline-flex items-center gap-1.5">
                        <button
                          type="button"
                          (click)="confirmDelete(prod)"
                          class="w-7 h-7 rounded-lg bg-[#0a0d14] border border-slate-800 text-slate-400 hover:text-red-400 hover:border-red-800/40 hover:bg-red-950/20 flex items-center justify-center transition-colors cursor-pointer"
                          title="Eliminar producto"
                        >
                          <i class="fas fa-trash-can text-[11px]"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                }
              } @else {
                <tr>
                  <td colspan="9" class="py-10 text-center text-slate-500 text-xs">
                    <i class="fas fa-boxes-stacked text-2xl mb-2 text-slate-600 block"></i>
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
        <div class="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div class="bg-[#111622] border border-slate-800/90 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5">
            <div class="w-10 h-10 rounded-xl bg-red-950/40 text-red-400 flex items-center justify-center text-base border border-red-800/40">
              <i class="fas fa-triangle-exclamation"></i>
            </div>
            
            <div>
              <h3 class="text-lg font-semibold text-white">¿Eliminar producto?</h3>
              <p class="text-xs text-slate-400 mt-1.5 font-normal leading-relaxed">
                ¿Estás seguro de que deseas eliminar permanentemente <strong class="text-slate-200">"{{ prod.nombre_producto }}"</strong> del catálogo? Esta acción no se puede deshacer.
              </p>
            </div>

            <div class="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                (click)="cancelDelete()"
                class="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                (click)="executeDelete()"
                [disabled]="isLoading()"
                class="px-4 py-2 rounded-xl text-xs font-medium text-white bg-red-600 hover:bg-red-500 transition-colors cursor-pointer shadow-sm"
              >
                @if (isLoading()) {
                  <i class="fas fa-spinner fa-spin mr-1"></i> Eliminando...
                } @else {
                  <i class="fas fa-trash-can mr-1"></i> Sí, eliminar
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
