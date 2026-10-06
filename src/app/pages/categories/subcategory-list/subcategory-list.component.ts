import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CategoryService } from '../../../core/services/category.service';
import { CategoryDto, SubcategoryDetailDto } from '../../../api/models';

@Component({
  selector: 'app-subcategory-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6 animate-fade-in max-w-7xl mx-auto">
      
      <!-- Header de la Página -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 class="text-2xl font-semibold text-white tracking-tight">
            Gestión de Subcategorías
          </h1>
          <p class="text-xs text-slate-400 mt-1 font-normal">
            Catálogo de divisiones y sub-clasificaciones para el catálogo de productos
          </p>
        </div>

        <div class="flex items-center gap-2.5">
          <button
            type="button"
            (click)="openCreateModal()"
            class="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium text-slate-900 bg-slate-100 hover:bg-white transition-colors cursor-pointer"
          >
            <i class="fas fa-plus text-[11px]"></i>
            <span>Nueva Subcategoría</span>
          </button>

          <button
            (click)="refresh()"
            [disabled]="isLoading()"
            class="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium text-slate-300 bg-[#0d111a] hover:bg-slate-800 border border-slate-800 transition-colors cursor-pointer disabled:opacity-40"
            title="Recargar datos"
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
        <!-- Total Subcategorías -->
        <div class="bg-[#111622] border border-slate-800/90 rounded-2xl p-4 sm:p-5 flex items-center gap-3.5">
          <div class="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700/60 text-slate-300 flex items-center justify-center text-sm shrink-0">
            <i class="fas fa-folder-tree"></i>
          </div>
          <div>
            <div class="text-xl font-semibold text-white tracking-tight">{{ totalSubcategories() }}</div>
            <div class="text-xs text-slate-400">Total Subcategorías</div>
          </div>
        </div>

        <!-- Categorías Padre -->
        <div class="bg-[#111622] border border-slate-800/90 rounded-2xl p-4 sm:p-5 flex items-center gap-3.5">
          <div class="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700/60 text-slate-300 flex items-center justify-center text-sm shrink-0">
            <i class="fas fa-tags"></i>
          </div>
          <div>
            <div class="text-xl font-semibold text-white tracking-tight">{{ totalCategories() }}</div>
            <div class="text-xs text-slate-400">Categorías Padre Activas</div>
          </div>
        </div>

        <!-- Cobertura -->
        <div class="bg-[#111622] border border-slate-800/90 rounded-2xl p-4 sm:p-5 flex items-center gap-3.5">
          <div class="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700/60 text-emerald-400 flex items-center justify-center text-sm shrink-0">
            <i class="fas fa-check-double"></i>
          </div>
          <div>
            <div class="text-xl font-semibold text-emerald-400 tracking-tight">{{ totalCategories() - withoutSubcategories() }} / {{ totalCategories() }}</div>
            <div class="text-xs text-slate-400">Categorías con Subclasificación</div>
          </div>
        </div>
      </div>

      <!-- Tarjeta Principal de Tabla con Buscador y Filtro -->
      <div class="bg-[#111622] border border-slate-800/90 rounded-2xl p-5 sm:p-6 space-y-5">
        
        <!-- Barra de Búsqueda y Filtros -->
        <div class="flex flex-col sm:flex-row gap-3 justify-between items-stretch sm:items-center">
          <div class="relative flex-1 max-w-md">
            <span class="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500 pointer-events-none text-xs">
              <i class="fas fa-magnifying-glass"></i>
            </span>
            <input
              type="text"
              [(ngModel)]="searchQuery"
              (ngModelChange)="onSearchChange($event)"
              placeholder="Buscar por subcategoría o categoría padre..."
              class="w-full pl-9 pr-3.5 py-2 bg-[#0d111a] border border-slate-800 rounded-xl text-slate-200 placeholder-slate-600 text-xs focus:outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500 transition-colors"
            />
          </div>

          <!-- Filtro por Categoría Padre -->
          <div class="flex items-center gap-3">
            <select
              [(ngModel)]="selectedCategory"
              (ngModelChange)="onCategoryFilterChange($event)"
              class="w-full sm:w-auto px-3 py-2 bg-[#0d111a] border border-slate-800 rounded-xl text-slate-300 text-xs focus:outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500 transition-colors cursor-pointer"
            >
              <option [ngValue]="null">Todas las Categorías Padre</option>
              @for (cat of categories(); track cat.id) {
                <option [ngValue]="cat.id">{{ cat.nombre }}</option>
              }
            </select>
          </div>
        </div>

        <!-- Tabla de Subcategorías -->
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs">
            <thead>
              <tr class="border-b border-slate-800/80 text-[11px] uppercase tracking-wider text-slate-500">
                <th class="pb-2.5 font-medium">ID</th>
                <th class="pb-2.5 font-medium">Categoría Padre</th>
                <th class="pb-2.5 font-medium">Subcategoría</th>
                <th class="pb-2.5 font-medium text-right">Acciones</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-800/40">
              @if (isLoading() && subcategories().length === 0) {
                <tr>
                  <td colspan="4" class="py-12 text-center text-slate-400">
                    <i class="fas fa-spinner fa-spin text-xl text-slate-400 mb-2"></i>
                    <p class="text-xs text-slate-500">Cargando subcategorías...</p>
                  </td>
                </tr>
              } @else if (subcategories().length > 0) {
                @for (sub of subcategories(); track sub.id_subcategoria) {
                  <tr class="hover:bg-slate-800/30 transition-colors">
                    <!-- ID -->
                    <td class="py-3">
                      <code class="px-1.5 py-0.5 rounded bg-[#0a0d14] text-slate-300 border border-slate-800 text-[11px] font-mono">
                        #{{ sub.id_subcategoria }}
                      </code>
                    </td>

                    <!-- Categoría Padre -->
                    <td class="py-3">
                      <span class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium bg-[#0a0d14] border border-slate-800 text-slate-300">
                        <i class="fas fa-folder text-slate-500 text-[9px]"></i>
                        {{ sub.nombre_categoria }}
                      </span>
                    </td>

                    <!-- Subcategoría -->
                    <td class="py-3">
                      <div class="font-medium text-slate-200 flex items-center gap-2">
                        <i class="fas fa-tag text-[10px] text-slate-500"></i>
                        <span>{{ sub.nombre_subcategoria }}</span>
                      </div>
                    </td>

                    <!-- Acciones -->
                    <td class="py-3 text-right">
                      <div class="inline-flex items-center gap-1.5">
                        <button
                          type="button"
                          (click)="openEditModal(sub)"
                          class="w-7 h-7 rounded-lg bg-[#0a0d14] border border-slate-800 text-slate-400 hover:text-white hover:border-slate-600 hover:bg-slate-800 flex items-center justify-center transition-colors cursor-pointer"
                          title="Editar subcategoría"
                        >
                          <i class="fas fa-pen text-[11px]"></i>
                        </button>
                        <button
                          type="button"
                          (click)="confirmDelete(sub)"
                          class="w-7 h-7 rounded-lg bg-[#0a0d14] border border-slate-800 text-slate-400 hover:text-red-400 hover:border-red-800/40 hover:bg-red-950/20 flex items-center justify-center transition-colors cursor-pointer"
                          title="Eliminar subcategoría"
                        >
                          <i class="fas fa-trash-can text-[11px]"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                }
              } @else {
                <tr>
                  <td colspan="4" class="py-10 text-center text-slate-500 text-xs">
                    <i class="fas fa-folder-tree text-2xl mb-2 text-slate-600 block"></i>
                    No se encontraron subcategorías con los filtros aplicados.
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>

      </div>

      <!-- ================= Modal Crear / Editar Subcategoría ================= -->
      @if (showModal()) {
        <div class="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div class="bg-[#111622] border border-slate-800/90 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5">
            <div class="flex items-center justify-between pb-3 border-b border-slate-800/80">
              <div class="flex items-center gap-2.5">
                <div class="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700/60 text-slate-300 flex items-center justify-center text-xs shrink-0">
                  <i class="fas fa-folder-tree"></i>
                </div>
                <div>
                  <h3 class="text-sm font-semibold text-white">
                    {{ isEditing() ? 'Editar Subcategoría' : 'Nueva Subcategoría' }}
                  </h3>
                  <p class="text-[11px] text-slate-500 font-normal">Asigna la categoría padre y nombre</p>
                </div>
              </div>
              <button (click)="closeModal()" class="w-7 h-7 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 flex items-center justify-center transition-colors cursor-pointer">
                <i class="fas fa-xmark text-sm"></i>
              </button>
            </div>

            <div class="space-y-4 text-xs">
              <!-- Categoría Padre -->
              <div>
                <label for="modalParentCat" class="block font-medium text-slate-300 mb-1.5">
                  Categoría Padre <span class="text-red-400">*</span>
                </label>
                <select
                  id="modalParentCat"
                  [(ngModel)]="formCategoryId"
                  class="w-full px-3 py-2 bg-[#0d111a] border border-slate-800 rounded-xl text-slate-300 text-xs focus:outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500 transition-colors cursor-pointer"
                >
                  <option [ngValue]="null" disabled>-- Selecciona Categoría --</option>
                  @for (cat of categories(); track cat.id) {
                    <option [ngValue]="cat.id">{{ cat.nombre }}</option>
                  }
                </select>
              </div>

              <!-- Nombre Subcategoría -->
              <div>
                <label for="modalSubName" class="block font-medium text-slate-300 mb-1.5">
                  Nombre de la Subcategoría <span class="text-red-400">*</span>
                </label>
                <input
                  id="modalSubName"
                  type="text"
                  [(ngModel)]="formSubcategoryName"
                  placeholder="Ej: Refrescos, Papas, Galletas"
                  class="w-full px-3 py-2 bg-[#0d111a] border border-slate-800 rounded-xl text-slate-200 placeholder-slate-600 text-xs focus:outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500 transition-colors"
                />
              </div>
            </div>

            <div class="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-800/80">
              <button
                type="button"
                (click)="closeModal()"
                class="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                (click)="saveSubcategory()"
                [disabled]="isLoading() || !formCategoryId || !formSubcategoryName.trim()"
                class="px-4 py-2 rounded-xl text-xs font-medium text-slate-900 bg-slate-100 hover:bg-white transition-colors cursor-pointer disabled:opacity-40 shadow-sm"
              >
                @if (isLoading()) {
                  <i class="fas fa-spinner fa-spin mr-1"></i> Guardando...
                } @else {
                  <i class="fas fa-check mr-1"></i> Guardar
                }
              </button>
            </div>
          </div>
        </div>
      }

      <!-- ================= Modal Confirmar Eliminación ================= -->
      @if (subToDelete(); as sub) {
        <div class="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div class="bg-[#111622] border border-slate-800/90 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5">
            <div class="w-10 h-10 rounded-xl bg-red-950/40 text-red-400 flex items-center justify-center text-base border border-red-800/40">
              <i class="fas fa-triangle-exclamation"></i>
            </div>
            
            <div>
              <h3 class="text-lg font-semibold text-white">¿Eliminar Subcategoría?</h3>
              <p class="text-xs text-slate-400 mt-1.5 font-normal leading-relaxed">
                ¿Estás seguro de que deseas eliminar permanentemente <strong class="text-slate-200">"{{ sub.nombre_subcategoria }}"</strong> (de la categoría {{ sub.nombre_categoria }})?
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
export class SubcategoryListComponent implements OnInit {
  searchQuery = '';
  selectedCategory: number | null = null;

  showModal = signal<boolean>(false);
  isEditing = signal<boolean>(false);
  editingSubcategoryId = signal<number | null>(null);
  formCategoryId: number | null = null;
  formSubcategoryName = '';

  subToDelete = signal<SubcategoryDetailDto | null>(null);
  alertMessage = signal<string | null>(null);
  alertType = signal<'success' | 'error'>('success');

  get subcategories() {
    return this.categoryService.filteredSubcategories;
  }

  get categories() {
    return this.categoryService.categories;
  }

  get totalSubcategories() {
    return this.categoryService.totalSubcategoriesCount;
  }

  get totalCategories() {
    return this.categoryService.totalCategoriesCount;
  }

  get withoutSubcategories() {
    return this.categoryService.withoutSubcategoriesCount;
  }

  get isLoading() {
    return this.categoryService.isLoading;
  }

  constructor(private categoryService: CategoryService) {}

  ngOnInit(): void {
    this.refresh();
  }

  refresh(): void {
    this.categoryService.loadCategories();
    this.categoryService.loadSubcategories();
  }

  onSearchChange(val: string): void {
    this.categoryService.setSearchQuery(val);
  }

  onCategoryFilterChange(catId: number | null): void {
    this.categoryService.setCategoryFilter(catId);
  }

  openCreateModal(): void {
    this.isEditing.set(false);
    this.editingSubcategoryId.set(null);
    this.formCategoryId = this.categories().length > 0 ? this.categories()[0].id : null;
    this.formSubcategoryName = '';
    this.showModal.set(true);
  }

  openEditModal(sub: SubcategoryDetailDto): void {
    this.isEditing.set(true);
    this.editingSubcategoryId.set(sub.id_subcategoria);
    this.formCategoryId = sub.id_categoria;
    this.formSubcategoryName = sub.nombre_subcategoria;
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
  }

  async saveSubcategory(): Promise<void> {
    if (!this.formCategoryId || !this.formSubcategoryName.trim()) return;

    try {
      if (this.isEditing() && this.editingSubcategoryId()) {
        const res = await this.categoryService.updateSubcategory(this.editingSubcategoryId()!, {
          nombre_subcategoria: this.formSubcategoryName.trim(),
          id_categoria: this.formCategoryId
        });
        this.alertType.set('success');
        this.alertMessage.set(res.message || 'Subcategoría actualizada.');
      } else {
        const res = await this.categoryService.addSubcategory(this.formCategoryId, {
          nombre_subcategoria: this.formSubcategoryName.trim()
        });
        this.alertType.set('success');
        this.alertMessage.set(res.message || 'Subcategoría creada.');
      }
      this.closeModal();
    } catch (err: any) {
      this.alertType.set('error');
      this.alertMessage.set(err.message || 'Error al guardar subcategoría.');
    }
  }

  confirmDelete(sub: SubcategoryDetailDto): void {
    this.subToDelete.set(sub);
  }

  cancelDelete(): void {
    this.subToDelete.set(null);
  }

  async executeDelete(): Promise<void> {
    const sub = this.subToDelete();
    if (!sub) return;

    try {
      const res = await this.categoryService.deleteSubcategory(sub.id_subcategoria);
      this.alertType.set('success');
      this.alertMessage.set(res.message || 'Subcategoría eliminada.');
    } catch (err: any) {
      this.alertType.set('error');
      this.alertMessage.set(err.message || 'Error al eliminar subcategoría.');
    } finally {
      this.subToDelete.set(null);
    }
  }
}
