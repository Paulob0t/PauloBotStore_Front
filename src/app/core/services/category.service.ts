import { Injectable, signal, computed } from '@angular/core';
import { Api } from '../../api/api';
import {
  getCategories,
  getSubcategories,
  createCategory,
  updateCategory,
  deleteCategory,
  createSubcategory,
  updateSubcategory,
  deleteSubcategory
} from '../../api/functions';
import {
  CategoryDto,
  CategoryResponse,
  CreateCategoryRequest,
  CreateSubcategoryRequest,
  SubcategoryDetailDto,
  UpdateCategoryRequest,
  UpdateSubcategoryRequest
} from '../../api/models';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private categoriesSignal = signal<CategoryDto[]>([]);
  private subcategoriesSignal = signal<SubcategoryDetailDto[]>([]);
  private loadingSignal = signal<boolean>(false);
  private searchQuerySignal = signal<string>('');
  private selectedCategoryFilterSignal = signal<number | null>(null);

  readonly categories = this.categoriesSignal.asReadonly();
  readonly subcategories = this.subcategoriesSignal.asReadonly();
  readonly isLoading = this.loadingSignal.asReadonly();
  readonly searchQuery = this.searchQuerySignal.asReadonly();
  readonly selectedCategoryFilter = this.selectedCategoryFilterSignal.asReadonly();

  // Categorías filtradas por búsqueda reactiva
  readonly filteredCategories = computed(() => {
    const query = this.searchQuerySignal().toLowerCase().trim();
    const list = this.categoriesSignal();

    if (!query) return list;

    return list.filter(cat =>
      cat.nombre.toLowerCase().includes(query) ||
      cat.subcategorias.some(sub => sub.nombre.toLowerCase().includes(query))
    );
  });

  // Subcategorías filtradas reactivamente
  readonly filteredSubcategories = computed(() => {
    let list = this.subcategoriesSignal();
    const query = this.searchQuerySignal().toLowerCase().trim();
    const catId = this.selectedCategoryFilterSignal();

    if (catId !== null) {
      list = list.filter(s => s.id_categoria === catId);
    }

    if (query) {
      list = list.filter(s =>
        s.nombre_subcategoria.toLowerCase().includes(query) ||
        s.nombre_categoria.toLowerCase().includes(query)
      );
    }

    return list;
  });

  // Métricas para tarjetas de resumen
  readonly totalCategoriesCount = computed(() => this.categoriesSignal().length);
  readonly totalSubcategoriesCount = computed(() =>
    this.categoriesSignal().reduce((sum, cat) => sum + (cat.subcategorias?.length || 0), 0)
  );
  readonly withoutSubcategoriesCount = computed(() =>
    this.categoriesSignal().filter(cat => !cat.subcategorias || cat.subcategorias.length === 0).length
  );

  constructor(private api: Api) {}

  async loadCategories(): Promise<CategoryDto[]> {
    this.loadingSignal.set(true);
    try {
      const data = await this.api.invoke(getCategories, {});
      this.categoriesSignal.set(data || []);
      return data || [];
    } catch (error) {
      console.error('Error cargando categorías:', error);
      return [];
    } finally {
      this.loadingSignal.set(false);
    }
  }

  async loadSubcategories(): Promise<SubcategoryDetailDto[]> {
    this.loadingSignal.set(true);
    try {
      const data = await this.api.invoke(getSubcategories, {});
      this.subcategoriesSignal.set(data || []);
      return data || [];
    } catch (error) {
      console.error('Error cargando subcategorías:', error);
      return [];
    } finally {
      this.loadingSignal.set(false);
    }
  }

  setSearchQuery(query: string): void {
    this.searchQuerySignal.set(query);
  }

  setCategoryFilter(catId: number | null): void {
    this.selectedCategoryFilterSignal.set(catId);
  }

  async create(data: CreateCategoryRequest): Promise<CategoryResponse> {
    this.loadingSignal.set(true);
    try {
      const res = await this.api.invoke(createCategory, { body: data });
      await this.loadCategories();
      await this.loadSubcategories();
      return res;
    } catch (error: any) {
      throw new Error(error?.error?.message || error?.message || 'Error al crear la categoría.');
    } finally {
      this.loadingSignal.set(false);
    }
  }

  async update(id: number, data: UpdateCategoryRequest): Promise<CategoryResponse> {
    this.loadingSignal.set(true);
    try {
      const res = await this.api.invoke(updateCategory, { id, body: data });
      await this.loadCategories();
      await this.loadSubcategories();
      return res;
    } catch (error: any) {
      throw new Error(error?.error?.message || error?.message || 'Error al actualizar la categoría.');
    } finally {
      this.loadingSignal.set(false);
    }
  }

  async delete(id: number): Promise<CategoryResponse> {
    this.loadingSignal.set(true);
    try {
      const res = await this.api.invoke(deleteCategory, { id });
      this.categoriesSignal.update(list => list.filter(c => c.id !== id));
      this.subcategoriesSignal.update(list => list.filter(s => s.id_categoria !== id));
      return res;
    } catch (error: any) {
      throw new Error(error?.error?.message || error?.message || 'Error al eliminar la categoría.');
    } finally {
      this.loadingSignal.set(false);
    }
  }

  async addSubcategory(categoryId: number, data: CreateSubcategoryRequest): Promise<CategoryResponse> {
    this.loadingSignal.set(true);
    try {
      const res = await this.api.invoke(createSubcategory, { id: categoryId, body: data });
      await this.loadCategories();
      await this.loadSubcategories();
      return res;
    } catch (error: any) {
      throw new Error(error?.error?.message || error?.message || 'Error al agregar subcategoría.');
    } finally {
      this.loadingSignal.set(false);
    }
  }

  async updateSubcategory(subcategoryId: number, data: UpdateSubcategoryRequest): Promise<CategoryResponse> {
    this.loadingSignal.set(true);
    try {
      const res = await this.api.invoke(updateSubcategory, { id: subcategoryId, body: data });
      await this.loadCategories();
      await this.loadSubcategories();
      return res;
    } catch (error: any) {
      throw new Error(error?.error?.message || error?.message || 'Error al actualizar subcategoría.');
    } finally {
      this.loadingSignal.set(false);
    }
  }

  async deleteSubcategory(subcategoryId: number): Promise<CategoryResponse> {
    this.loadingSignal.set(true);
    try {
      const res = await this.api.invoke(deleteSubcategory, { id: subcategoryId });
      await this.loadCategories();
      await this.loadSubcategories();
      return res;
    } catch (error: any) {
      throw new Error(error?.error?.message || error?.message || 'Error al eliminar subcategoría.');
    } finally {
      this.loadingSignal.set(false);
    }
  }
}
