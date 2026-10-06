import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CategoryService } from '../../../core/services/category.service';
import { CategoryDto, SubcategoryDto } from '../../../api/models';

@Component({
  selector: 'app-category-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6 animate-fade-in max-w-7xl mx-auto">
      
      <!-- Header de la Página -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 class="text-2xl font-semibold text-white tracking-tight">
            Gestión de Categorías
          </h1>
          <p class="text-xs text-slate-400 mt-1 font-normal">
            Organiza la estructura de categorías y subcategorías del catálogo
          </p>
        </div>

        <div class="flex items-center gap-2.5">
          <button
            type="button"
            (click)="openCreateModal()"
            class="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium text-slate-900 bg-slate-100 hover:bg-white transition-colors cursor-pointer"
          >
            <i class="fas fa-plus text-[11px]"></i>
            <span>Nueva Categoría</span>
          </button>

          <button
            (click)="refresh()"
            [disabled]="isLoading()"
            class="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium text-slate-300 bg-[#0d111a] hover:bg-slate-800 border border-slate-800 transition-colors cursor-pointer disabled:opacity-40"
            title="Recargar categorías"
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

      <!-- Grid 4 Mini Stats KPI -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <!-- Total Categorías -->
        <div class="bg-[#111622] border border-slate-800/90 rounded-2xl p-4 sm:p-5 flex items-center gap-3.5">
          <div class="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700/60 text-slate-300 flex items-center justify-center text-sm shrink-0">
            <i class="fas fa-tag"></i>
          </div>
          <div>
            <div class="text-xl font-semibold text-white tracking-tight">{{ totalCategories() }}</div>
            <div class="text-xs text-slate-400">Total Categorías</div>
          </div>
        </div>

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

        <!-- Sin Subcategorías -->
        <div class="bg-[#111622] border border-slate-800/90 rounded-2xl p-4 sm:p-5 flex items-center gap-3.5">
          <div class="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700/60 text-amber-400 flex items-center justify-center text-sm shrink-0">
            <i class="fas fa-circle-exclamation"></i>
          </div>
          <div>
            <div class="text-xl font-semibold text-amber-400 tracking-tight">{{ withoutSubcategories() }}</div>
            <div class="text-xs text-slate-400">Sin Subcategorías</div>
          </div>
        </div>

        <!-- Clasificaciones Totales -->
        <div class="bg-[#111622] border border-slate-800/90 rounded-2xl p-4 sm:p-5 flex items-center gap-3.5">
          <div class="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700/60 text-emerald-400 flex items-center justify-center text-sm shrink-0">
            <i class="fas fa-layer-group"></i>
          </div>
          <div>
            <div class="text-xl font-semibold text-emerald-400 tracking-tight">{{ totalCategories() + totalSubcategories() }}</div>
            <div class="text-xs text-slate-400">Clasificaciones Totales</div>
          </div>
        </div>
      </div>

      <!-- Buscador y Vista de Categorías -->
      <div class="bg-[#111622] border border-slate-800/90 rounded-2xl p-5 sm:p-6 space-y-5">
        
        <!-- Barra de Búsqueda -->
        <div class="flex flex-col sm:flex-row gap-3 justify-between items-stretch sm:items-center">
          <div class="relative flex-1 max-w-md">
            <span class="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500 pointer-events-none text-xs">
              <i class="fas fa-magnifying-glass"></i>
            </span>
            <input
              type="text"
              [(ngModel)]="searchQuery"
              (ngModelChange)="onSearchChange($event)"
              placeholder="Buscar categoría o subcategoría..."
              class="w-full pl-9 pr-3.5 py-2 bg-[#0d111a] border border-slate-800 rounded-xl text-slate-200 placeholder-slate-600 text-xs focus:outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500 transition-colors"
            />
          </div>

          <div class="text-xs text-slate-500 font-medium">
            Mostrando {{ categories().length }} categorías
          </div>
        </div>

        <!-- Grid de Tarjetas de Categorías -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          @if (isLoading() && categories().length === 0) {
            <div class="col-span-full py-12 text-center text-slate-400">
              <i class="fas fa-spinner fa-spin text-xl text-slate-400 mb-2"></i>
              <p class="text-xs text-slate-500">Cargando categorías...</p>
            </div>
          } @else if (categories().length > 0) {
            @for (cat of categories(); track cat.id) {
              <div class="bg-[#0d111a] border border-slate-800 rounded-2xl p-4 sm:p-5 hover:border-slate-700 transition-all flex flex-col justify-between group">
                
                <div>
                  <!-- Header Tarjeta -->
                  <div class="flex items-start justify-between gap-3 mb-3.5">
                    <div class="flex items-center gap-3">
                      <div class="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700/60 text-slate-300 flex items-center justify-center text-xs shrink-0">
                        <i class="fas fa-folder"></i>
                      </div>
                      <div>
                        <h3 class="font-semibold text-slate-200 text-sm leading-tight">{{ cat.nombre }}</h3>
                        <span class="text-[11px] text-slate-500">
                          {{ cat.subcategorias?.length || 0 }} subcategorías
                        </span>
                      </div>
                    </div>

                    <!-- Acciones Categoría -->
                    <div class="flex items-center gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
                      <button
                        type="button"
                        (click)="openEditModal(cat)"
                        class="w-7 h-7 rounded-lg bg-[#111622] border border-slate-800 text-slate-400 hover:text-white hover:border-slate-600 hover:bg-slate-800 flex items-center justify-center text-xs transition-colors cursor-pointer"
                        title="Editar categoría"
                      >
                        <i class="fas fa-pen text-[11px]"></i>
                      </button>
                      <button
                        type="button"
                        (click)="confirmDeleteCategory(cat)"
                        class="w-7 h-7 rounded-lg bg-[#111622] border border-slate-800 text-slate-400 hover:text-red-400 hover:border-red-800/40 hover:bg-red-950/20 flex items-center justify-center text-xs transition-colors cursor-pointer"
                        title="Eliminar categoría"
                      >
                        <i class="fas fa-trash-can text-[11px]"></i>
                      </button>
                    </div>
                  </div>

                  <!-- Subcategorías Pills -->
                  <div class="space-y-2 pt-2.5 border-t border-slate-800/60">
                    <div class="text-[10px] uppercase tracking-wider text-slate-500 font-medium">
                      Subcategorías:
                    </div>

                    <div class="flex flex-wrap gap-1.5 min-h-[32px] items-center">
                      @if (cat.subcategorias && cat.subcategorias.length > 0) {
                        @for (sub of cat.subcategorias; track sub.id) {
                          <span class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-[11px] font-medium bg-[#111622] border border-slate-800 text-slate-300 hover:border-slate-700 transition-colors">
                            <span>{{ sub.nombre }}</span>
                            <button
                              type="button"
                              (click)="confirmDeleteSubcategory(sub)"
                              class="text-slate-500 hover:text-red-400 transition-colors text-[9px] cursor-pointer"
                              title="Eliminar subcategoría"
                            >
                              <i class="fas fa-xmark"></i>
                            </button>
                          </span>
                        }
                      } @else {
                        <span class="text-[11px] text-slate-600 italic">Sin subcategorías registradas</span>
                      }
                    </div>
                  </div>
                </div>

                <!-- Footer Botón Rápido Agregar Subcategoría -->
                <div class="mt-4 pt-3 border-t border-slate-800/60 flex justify-end">
                  <button
                    type="button"
                    (click)="openAddSubcategoryModal(cat)"
                    class="inline-flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-white transition-colors cursor-pointer"
                  >
                    <i class="fas fa-plus text-[10px]"></i>
                    <span>Agregar Subcategoría</span>
                  </button>
                </div>

              </div>
            }
          } @else {
            <div class="col-span-full py-12 text-center text-slate-500 text-xs">
              <i class="fas fa-folder-open text-2xl mb-2 text-slate-600 block"></i>
              No se encontraron categorías registradas.
            </div>
          }
        </div>

      </div>

      <!-- ================= MODAL 1: Crear / Editar Categoría ================= -->
      @if (showCategoryModal()) {
        <div class="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div class="bg-[#111622] border border-slate-800/90 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5">
            <div class="flex items-center justify-between pb-3 border-b border-slate-800/80">
              <div class="flex items-center gap-2.5">
                <div class="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700/60 text-slate-300 flex items-center justify-center text-xs shrink-0">
                  <i class="fas fa-folder"></i>
                </div>
                <div>
                  <h3 class="text-sm font-semibold text-white">
                    {{ isEditingCategory() ? 'Editar Categoría' : 'Nueva Categoría' }}
                  </h3>
                  <p class="text-[11px] text-slate-500 font-normal">Define el nombre y subcategorías</p>
                </div>
              </div>
              <button (click)="closeCategoryModal()" class="w-7 h-7 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 flex items-center justify-center transition-colors cursor-pointer">
                <i class="fas fa-xmark text-sm"></i>
              </button>
            </div>

            <div class="space-y-4 text-xs">
              <!-- Nombre Categoría -->
              <div>
                <label for="modalCatName" class="block font-medium text-slate-300 mb-1.5">
                  Nombre de la Categoría <span class="text-red-400">*</span>
                </label>
                <input
                  id="modalCatName"
                  type="text"
                  [(ngModel)]="categoryFormName"
                  placeholder="Ej: Bebidas, Snacks, Farmacia"
                  class="w-full px-3 py-2 bg-[#0d111a] border border-slate-800 rounded-xl text-slate-200 placeholder-slate-600 text-xs focus:outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500 transition-colors"
                />
              </div>

              <!-- Subcategorías iniciales (Solo en modo creación) -->
              @if (!isEditingCategory()) {
                <div class="space-y-2 pt-1">
                  <label class="block font-medium text-slate-300">
                    Subcategorías Iniciales (Opcional)
                  </label>
                  
                  <div class="flex gap-2">
                    <input
                      type="text"
                      [(ngModel)]="newSubcategoryInput"
                      (keyup.enter)="addSubcategoryTag()"
                      placeholder="Escribe y presiona Enter o Añadir..."
                      class="flex-1 px-3 py-2 bg-[#0d111a] border border-slate-800 rounded-xl text-slate-200 placeholder-slate-600 text-xs focus:outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500 transition-colors"
                    />
                    <button
                      type="button"
                      (click)="addSubcategoryTag()"
                      class="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium cursor-pointer transition-colors"
                    >
                      Añadir
                    </button>
                  </div>

                  <!-- Chips de Subcategorías agregadas -->
                  <div class="flex flex-wrap gap-1.5 pt-1">
                    @for (sub of initialSubcategories(); track $index) {
                      <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] bg-[#0d111a] border border-slate-800 text-slate-300">
                        <span>{{ sub }}</span>
                        <button type="button" (click)="removeSubcategoryTag($index)" class="text-slate-500 hover:text-red-400 text-[10px] cursor-pointer">
                          <i class="fas fa-xmark"></i>
                        </button>
                      </span>
                    }
                  </div>
                </div>
              }
            </div>

            <!-- Botones Modal -->
            <div class="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-800/80">
              <button
                type="button"
                (click)="closeCategoryModal()"
                class="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                (click)="saveCategory()"
                [disabled]="isLoading() || !categoryFormName.trim()"
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

      <!-- ================= MODAL 2: Agregar Subcategoría Rápida ================= -->
      @if (showSubcategoryModal()) {
        <div class="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div class="bg-[#111622] border border-slate-800/90 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5">
            <div class="flex items-center justify-between pb-3 border-b border-slate-800/80">
              <div class="flex items-center gap-2.5">
                <div class="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700/60 text-slate-300 flex items-center justify-center text-xs shrink-0">
                  <i class="fas fa-folder-plus"></i>
                </div>
                <div>
                  <h3 class="text-sm font-semibold text-white">Agregar Subcategoría</h3>
                  <p class="text-[11px] text-slate-500 font-normal">Para la categoría <strong class="text-slate-300">{{ targetCategory()?.nombre }}</strong></p>
                </div>
              </div>
              <button (click)="closeSubcategoryModal()" class="w-7 h-7 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 flex items-center justify-center transition-colors cursor-pointer">
                <i class="fas fa-xmark text-sm"></i>
              </button>
            </div>

            <div class="text-xs space-y-3">
              <div>
                <label for="subNameInput" class="block font-medium text-slate-300 mb-1.5">
                  Nombre de la Subcategoría <span class="text-red-400">*</span>
                </label>
                <input
                  id="subNameInput"
                  type="text"
                  [(ngModel)]="singleSubcategoryName"
                  placeholder="Ej: Refrescos, Papas, Chocolates"
                  class="w-full px-3 py-2 bg-[#0d111a] border border-slate-800 rounded-xl text-slate-200 placeholder-slate-600 text-xs focus:outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500 transition-colors"
                />
              </div>
            </div>

            <div class="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-800/80">
              <button
                type="button"
                (click)="closeSubcategoryModal()"
                class="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                (click)="saveSingleSubcategory()"
                [disabled]="isLoading() || !singleSubcategoryName.trim()"
                class="px-4 py-2 rounded-xl text-xs font-medium text-slate-900 bg-slate-100 hover:bg-white transition-colors cursor-pointer disabled:opacity-40 shadow-sm"
              >
                @if (isLoading()) {
                  <i class="fas fa-spinner fa-spin mr-1"></i> Agregando...
                } @else {
                  <i class="fas fa-plus mr-1"></i> Agregar
                }
              </button>
            </div>
          </div>
        </div>
      }

      <!-- ================= MODAL 3: Confirmar Eliminación ================= -->
      @if (itemToDelete(); as item) {
        <div class="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div class="bg-[#111622] border border-slate-800/90 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5">
            <div class="w-10 h-10 rounded-xl bg-red-950/40 text-red-400 flex items-center justify-center text-base border border-red-800/40">
              <i class="fas fa-triangle-exclamation"></i>
            </div>
            
            <div>
              <h3 class="text-lg font-semibold text-white">¿Eliminar {{ item.type === 'category' ? 'Categoría' : 'Subcategoría' }}?</h3>
              <p class="text-xs text-slate-400 mt-1.5 font-normal leading-relaxed">
                ¿Estás seguro de que deseas eliminar permanentemente <strong class="text-slate-200">"{{ item.name }}"</strong>?
                @if (item.type === 'category') {
                  <span class="block mt-1 text-red-400 text-[11px]">⚠️ Esto también eliminará todas sus subcategorías asociadas.</span>
                }
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
export class CategoryListComponent implements OnInit {
  searchQuery = '';
  showCategoryModal = signal<boolean>(false);
  isEditingCategory = signal<boolean>(false);
  editingCategoryId = signal<number | null>(null);
  categoryFormName = '';

  initialSubcategories = signal<string[]>([]);
  newSubcategoryInput = '';

  showSubcategoryModal = signal<boolean>(false);
  targetCategory = signal<CategoryDto | null>(null);
  singleSubcategoryName = '';

  itemToDelete = signal<{ id: number; name: string; type: 'category' | 'subcategory' } | null>(null);
  alertMessage = signal<string | null>(null);
  alertType = signal<'success' | 'error'>('success');

  get categories() {
    return this.categoryService.filteredCategories;
  }

  get totalCategories() {
    return this.categoryService.totalCategoriesCount;
  }

  get totalSubcategories() {
    return this.categoryService.totalSubcategoriesCount;
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
  }

  onSearchChange(val: string): void {
    this.categoryService.setSearchQuery(val);
  }

  openCreateModal(): void {
    this.isEditingCategory.set(false);
    this.editingCategoryId.set(null);
    this.categoryFormName = '';
    this.initialSubcategories.set([]);
    this.newSubcategoryInput = '';
    this.showCategoryModal.set(true);
  }

  openEditModal(cat: CategoryDto): void {
    this.isEditingCategory.set(true);
    this.editingCategoryId.set(cat.id);
    this.categoryFormName = cat.nombre;
    this.showCategoryModal.set(true);
  }

  closeCategoryModal(): void {
    this.showCategoryModal.set(false);
  }

  addSubcategoryTag(): void {
    const val = this.newSubcategoryInput.trim();
    if (val && !this.initialSubcategories().includes(val)) {
      this.initialSubcategories.update(list => [...list, val]);
      this.newSubcategoryInput = '';
    }
  }

  removeSubcategoryTag(index: number): void {
    this.initialSubcategories.update(list => list.filter((_, i) => i !== index));
  }

  async saveCategory(): Promise<void> {
    const name = this.categoryFormName.trim();
    if (!name) return;

    try {
      if (this.isEditingCategory() && this.editingCategoryId()) {
        const res = await this.categoryService.update(this.editingCategoryId()!, {
          nombre_categoria: name
        });
        this.alertType.set('success');
        this.alertMessage.set(res.message || 'Categoría actualizada exitosamente.');
      } else {
        const res = await this.categoryService.create({
          nombre_categoria: name,
          subcategorias: this.initialSubcategories()
        });
        this.alertType.set('success');
        this.alertMessage.set(res.message || 'Categoría creada exitosamente.');
      }
      this.closeCategoryModal();
    } catch (err: any) {
      this.alertType.set('error');
      this.alertMessage.set(err.message || 'Error al guardar categoría.');
    }
  }

  openAddSubcategoryModal(cat: CategoryDto): void {
    this.targetCategory.set(cat);
    this.singleSubcategoryName = '';
    this.showSubcategoryModal.set(true);
  }

  closeSubcategoryModal(): void {
    this.showSubcategoryModal.set(false);
    this.targetCategory.set(null);
  }

  async saveSingleSubcategory(): Promise<void> {
    const cat = this.targetCategory();
    const subName = this.singleSubcategoryName.trim();
    if (!cat || !subName) return;

    try {
      const res = await this.categoryService.addSubcategory(cat.id, {
        nombre_subcategoria: subName
      });
      this.alertType.set('success');
      this.alertMessage.set(res.message || 'Subcategoría agregada exitosamente.');
      this.closeSubcategoryModal();
    } catch (err: any) {
      this.alertType.set('error');
      this.alertMessage.set(err.message || 'Error al agregar subcategoría.');
    }
  }

  confirmDeleteCategory(cat: CategoryDto): void {
    this.itemToDelete.set({
      id: cat.id,
      name: cat.nombre,
      type: 'category'
    });
  }

  confirmDeleteSubcategory(sub: SubcategoryDto): void {
    this.itemToDelete.set({
      id: sub.id,
      name: sub.nombre,
      type: 'subcategory'
    });
  }

  cancelDelete(): void {
    this.itemToDelete.set(null);
  }

  async executeDelete(): Promise<void> {
    const item = this.itemToDelete();
    if (!item) return;

    try {
      if (item.type === 'category') {
        const res = await this.categoryService.delete(item.id);
        this.alertType.set('success');
        this.alertMessage.set(res.message || 'Categoría eliminada.');
      } else {
        const res = await this.categoryService.deleteSubcategory(item.id);
        this.alertType.set('success');
        this.alertMessage.set(res.message || 'Subcategoría eliminada.');
      }
    } catch (err: any) {
      this.alertType.set('error');
      this.alertMessage.set(err.message || 'Error al eliminar.');
    } finally {
      this.itemToDelete.set(null);
    }
  }
}
