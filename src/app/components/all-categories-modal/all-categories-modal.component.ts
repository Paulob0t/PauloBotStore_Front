import { Component, EventEmitter, Input, Output, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CategoryDto } from '../../api/models';

@Component({
  selector: 'app-all-categories-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 sm:p-6 animate-fade-in font-sans">
      
      <!-- Backdrop -->
      <div
        (click)="closeModal()"
        class="fixed inset-0 bg-slate-950/85 backdrop-blur-sm transition-opacity"
      ></div>

      <!-- Contenedor Modal -->
      <div class="relative w-full max-w-5xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden z-10 my-8 flex flex-col max-h-[90vh]">
        
        <!-- Header -->
        <div class="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/90 shrink-0">
          <div class="flex items-center gap-3.5">
            <div class="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 text-xl shadow-inner">
              <i class="fas fa-layer-group"></i>
            </div>
            <div>
              <div class="text-[10px] font-bold uppercase tracking-wider text-indigo-400">Catálogo Completo</div>
              <h2 class="text-xl font-black text-white">Todas las Categorías ({{ categories.length }})</h2>
            </div>
          </div>

          <button
            type="button"
            (click)="closeModal()"
            class="w-10 h-10 rounded-2xl text-slate-400 hover:text-white hover:bg-slate-800 flex items-center justify-center transition-colors cursor-pointer"
          >
            <i class="fas fa-xmark text-lg"></i>
          </button>
        </div>

        <!-- Barra de Búsqueda Rápida -->
        <div class="p-6 pb-2 border-b border-slate-800/60 bg-slate-950/50 shrink-0">
          <div class="relative">
            <i class="fas fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-sm"></i>
            <input
              type="text"
              [(ngModel)]="searchQuery"
              placeholder="Buscar por categoría o subcategoría..."
              class="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-2xl pl-11 pr-4 py-3 text-white text-sm outline-none transition-all placeholder:text-slate-600"
            />
          </div>
        </div>

        <!-- Grid de Categorías con Scroll -->
        <div class="p-6 overflow-y-auto space-y-4 flex-1">
          @if (filteredCategories().length === 0) {
            <div class="py-16 text-center text-slate-500">
              <i class="fas fa-tags text-4xl mb-3 block text-slate-600"></i>
              <p class="text-sm font-semibold text-slate-400">No se encontraron categorías</p>
              <p class="text-xs text-slate-500 mt-1">Prueba buscando con otro término.</p>
            </div>
          } @else {
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              @for (cat of filteredCategories(); track cat.id) {
                <div
                  (click)="onSelectCategory(cat)"
                  class="p-5 rounded-2xl bg-slate-950 border border-slate-800 hover:border-indigo-500/50 hover:bg-slate-950/80 transition-all cursor-pointer flex flex-col justify-between gap-4 group"
                >
                  <div class="flex items-start gap-4">
                    <!-- Miniatura de Categoría -->
                    <div class="w-14 h-14 rounded-xl bg-slate-900 border border-slate-800 overflow-hidden flex items-center justify-center shrink-0">
                      @if (cat.tiene_imagen === 1) {
                        <img
                          [src]="getCategoryImageUrl(cat.id)"
                          [alt]="cat.nombre"
                          class="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      } @else {
                        <i class="fas fa-tag text-indigo-500/40 text-xl"></i>
                      }
                    </div>

                    <div class="flex-1 min-w-0">
                      <h3 class="text-base font-black text-white group-hover:text-indigo-300 transition-colors truncate">
                        {{ cat.nombre }}
                      </h3>
                      <div class="text-[11px] text-slate-400 mt-0.5">
                        {{ (cat.subcategorias?.length || 0) }} subcategorías
                      </div>
                    </div>
                  </div>

                  <!-- Subcategorías Pills -->
                  @if (cat.subcategorias && cat.subcategorias.length > 0) {
                    <div class="flex flex-wrap gap-1.5 pt-2 border-t border-slate-800/80">
                      @for (sub of cat.subcategorias.slice(0, 5); track sub.id) {
                        <span class="px-2 py-0.5 rounded-lg bg-slate-900 border border-slate-800 text-[10px] text-slate-300 font-medium">
                          {{ sub.nombre }}
                        </span>
                      }
                      @if (cat.subcategorias.length > 5) {
                        <span class="px-1.5 py-0.5 rounded-lg bg-slate-900 text-[10px] text-slate-500">
                          +{{ cat.subcategorias.length - 5 }}
                        </span>
                      }
                    </div>
                  }
                </div>
              }
            </div>
          }
        </div>

        <!-- Footer -->
        <div class="p-4 border-t border-slate-800 bg-slate-900/90 text-right shrink-0">
          <button
            type="button"
            (click)="closeModal()"
            class="px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-colors cursor-pointer"
          >
            Cerrar
          </button>
        </div>

      </div>

    </div>
  `
})
export class AllCategoriesModalComponent {
  @Input() categories: CategoryDto[] = [];
  @Output() close = new EventEmitter<void>();
  @Output() selectCategory = new EventEmitter<CategoryDto>();

  searchQuery = signal<string>('');

  filteredCategories = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    if (!q) return this.categories;

    return this.categories.filter(cat => {
      const matchName = cat.nombre?.toLowerCase().includes(q);
      const matchSub = cat.subcategorias?.some(s => s.nombre?.toLowerCase().includes(q));
      return matchName || matchSub;
    });
  });

  getCategoryImageUrl(categoryId: number): string {
    return `http://localhost:8000/api/v1/categories/${categoryId}/image`;
  }

  onSelectCategory(cat: CategoryDto): void {
    this.selectCategory.emit(cat);
    this.closeModal();
  }

  closeModal(): void {
    this.close.emit();
  }
}
