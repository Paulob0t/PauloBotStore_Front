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
    <div class="space-y-8 animate-fade-in max-w-7xl mx-auto">
      
      <!-- Header de la Página -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 flex items-center justify-center text-2xl shadow-lg shadow-indigo-600/20">
            <i class="fas fa-folder-tree"></i>
          </div>
          <div>
            <h1 class="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Gestión de Subcategorías
            </h1>
            <p class="text-xs sm:text-sm text-slate-400 mt-1">
              Catálogo de divisiones y sub-clasificaciones para el sistema de ventas.
            </p>
          </div>
        </div>

        <div class="flex items-center gap-3">
          <button
            type="button"
            (click)="openCreateModal()"
            class="inline-flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-600/30 hover:shadow-indigo-600/50 hover:-translate-y-0.5 transition-all cursor-pointer"
          >
            <i class="fas fa-plus"></i>
            <span>Nueva Subcategoría</span>
          </button>

          <button
            (click)="refresh()"
            [disabled]="isLoading()"
            class="inline-flex items-center gap-2 px-4 py-3 rounded-2xl text-xs font-semibold text-slate-300 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer disabled:opacity-50"
            title="Recargar datos"
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
        <!-- Total Subcategorías -->
        <div class="bg-slate-900/90 border border-slate-800/90 rounded-3xl p-6 shadow-sm flex items-center gap-4">
          <div class="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center text-xl shrink-0">
            <i class="fas fa-folder-tree"></i>
          </div>
          <div>
            <div class="text-2xl font-black text-white tracking-tight">{{ totalSubcategories() }}</div>
            <div class="text-xs text-slate-400">Total Subcategorías Registradas</div>
          </div>
        </div>

        <!-- Categorías Padre -->
        <div class="bg-slate-900/90 border border-slate-800/90 rounded-3xl p-6 shadow-sm flex items-center gap-4">
          <div class="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-400 flex items-center justify-center text-xl shrink-0">
            <i class="fas fa-tags"></i>
          </div>
          <div>
            <div class="text-2xl font-black text-purple-400 tracking-tight">{{ totalCategories() }}</div>
            <div class="text-xs text-slate-400">Categorías Padre Activas</div>
          </div>
        </div>

        <!-- Cobertura -->
        <div class="bg-slate-900/90 border border-slate-800/90 rounded-3xl p-6 shadow-sm flex items-center gap-4">
          <div class="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center text-xl shrink-0">
            <i class="fas fa-check-double"></i>
          </div>
          <div>
            <div class="text-2xl font-black text-emerald-400 tracking-tight">{{ totalCategories() - withoutSubcategories() }} / {{ totalCategories() }}</div>
            <div class="text-xs text-slate-400">Categorías con Subclasificación</div>
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
              placeholder="Buscar por subcategoría o categoría padre..."
              class="w-full pl-10 pr-4 py-3 bg-slate-950/60 border border-slate-800 rounded-2xl text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
            />
          </div>

          <!-- Filtro por Categoría Padre -->
          <div class="flex items-center gap-3">
            <select
              [(ngModel)]="selectedCategory"
              (ngModelChange)="onCategoryFilterChange($event)"
              class="px-4 py-3 bg-slate-950/60 border border-slate-800 rounded-2xl text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all cursor-pointer"
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
          <table class="w-full text-left text-sm">
            <thead>
              <tr class="border-b border-slate-800 text-xs uppercase tracking-wider text-slate-400">
                <th class="pb-3.5 font-semibold">ID</th>
                <th class="pb-3.5 font-semibold">Categoría Padre</th>
                <th class="pb-3.5 font-semibold">Subcategoría</th>
                <th class="pb-3.5 font-semibold text-right">Acciones</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-800/60">
              @if (isLoading() && subcategories().length === 0) {
                <tr>
                  <td colspan="4" class="py-12 text-center text-slate-400">
                    <i class="fas fa-spinner fa-spin text-2xl text-indigo-500 mb-2"></i>
                    <p class="text-xs">Cargando subcategorías...</p>
                  </td>
                </tr>
              } @else if (subcategories().length > 0) {
                @for (sub of subcategories(); track sub.id_subcategoria) {
                  <tr class="hover:bg-slate-800/30 transition-colors">
                    <!-- ID -->
                    <td class="py-4">
                      <code class="px-2 py-0.5 rounded-md bg-slate-950 text-indigo-300 border border-slate-800 text-xs font-mono">
                        #{{ sub.id_subcategoria }}
                      </code>
                    </td>

                    <!-- Categoría Padre -->
                    <td class="py-4">
                      <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold bg-purple-500/10 border border-purple-500/20 text-purple-300">
                        <i class="fas fa-folder text-purple-400 text-[10px]"></i>
                        {{ sub.nombre_categoria }}
                      </span>
                    </td>

                    <!-- Subcategoría -->
                    <td class="py-4">
                      <div class="font-bold text-slate-100 flex items-center gap-2">
                        <i class="fas fa-tag text-xs text-slate-500"></i>
                        <span>{{ sub.nombre_subcategoria }}</span>
                      </div>
                    </td>

                    <!-- Acciones -->
                    <td class="py-4 text-right">
                      <div class="inline-flex items-center gap-1.5">
                        <button
                          type="button"
                          (click)="openEditModal(sub)"
                          class="w-8 h-8 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 hover:text-indigo-400 hover:border-indigo-500/40 hover:bg-indigo-500/10 flex items-center justify-center transition-all cursor-pointer"
                          title="Editar subcategoría"
                        >
                          <i class="fas fa-pen text-xs"></i>
                        </button>
                        <button
                          type="button"
                          (click)="confirmDelete(sub)"
                          class="w-8 h-8 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 hover:text-rose-400 hover:border-rose-500/40 hover:bg-rose-500/10 flex items-center justify-center transition-all cursor-pointer"
                          title="Eliminar subcategoría"
                        >
                          <i class="fas fa-trash-can text-xs"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                }
              } @else {
                <tr>
                  <td colspan="4" class="py-12 text-center text-slate-500">
                    <i class="fas fa-folder-tree text-3xl mb-2 text-slate-600 block"></i>
                    No se encontraron subcategorías con los filtros aplicados.
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>

      </div>

      <!-- Modal Crear / Editar Subcategoría -->
      @if (showModal()) {
        <div class="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div class="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl space-y-6">
            <div class="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 class="text-lg font-bold text-white flex items-center gap-2">
                <i class="fas fa-folder-tree text-indigo-400"></i>
                <span>{{ isEditing() ? 'Editar Subcategoría' : 'Nueva Subcategoría' }}</span>
              </h3>
              <button (click)="closeModal()" class="text-slate-400 hover:text-white cursor-pointer">
                <i class="fas fa-xmark"></i>
              </button>
            </div>

            <div class="space-y-4">
              <!-- Categoría Padre -->
              <div>
                <label for="modalParentCat" class="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                  Categoría Padre <span class="text-rose-400">*</span>
                </label>
                <select
                  id="modalParentCat"
                  [(ngModel)]="formCategoryId"
                  class="w-full px-4 py-3 bg-slate-950/60 border border-slate-800 rounded-2xl text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all cursor-pointer"
                >
                  <option [ngValue]="null" disabled>-- Selecciona Categoría --</option>
                  @for (cat of categories(); track cat.id) {
                    <option [ngValue]="cat.id">{{ cat.nombre }}</option>
                  }
                </select>
              </div>

              <!-- Nombre Subcategoría -->
              <div>
                <label for="modalSubName" class="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                  Nombre de la Subcategoría <span class="text-rose-400">*</span>
                </label>
                <input
                  id="modalSubName"
                  type="text"
                  [(ngModel)]="formSubcategoryName"
                  placeholder="Ej: Refrescos, Papas, Maruchan"
                  class="w-full px-4 py-3 bg-slate-950/60 border border-slate-800 rounded-2xl text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                />
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
                (click)="saveSubcategory()"
                [disabled]="isLoading() || !formCategoryId || !formSubcategoryName.trim()"
                class="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 transition-colors cursor-pointer shadow-lg shadow-indigo-600/30"
              >
                @if (isLoading()) {
                  <i class="fas fa-spinner fa-spin mr-1"></i> Guardando...
                } @else {
                  <i class="fas fa-save mr-1"></i> Guardar
                }
              </button>
            </div>
          </div>
        </div>
      }

      <!-- Modal Confirmar Eliminación -->
      @if (subToDelete(); as sub) {
        <div class="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div class="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl space-y-6">
            <div class="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-400 flex items-center justify-center text-2xl border border-rose-500/20">
              <i class="fas fa-triangle-exclamation"></i>
            </div>
            
            <div>
              <h3 class="text-xl font-bold text-white">¿Eliminar Subcategoría?</h3>
              <p class="text-sm text-slate-400 mt-2">
                ¿Estás seguro de que deseas eliminar permanentemente la subcategoría <strong class="text-slate-200">"{{ sub.nombre_subcategoria }}"</strong> (de la categoría {{ sub.nombre_categoria }})?
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
