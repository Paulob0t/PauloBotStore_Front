import { Injectable, signal, computed } from '@angular/core';
import { Api } from '../../api/api';
import { createProduct, getProducts, getFeaturedProducts, getProductById, checkFeaturedOrder, deleteProduct } from '../../api/functions';
import { CreateProductRequest, ProductDto, ProductResponse } from '../../api/models';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private productsSignal = signal<ProductDto[]>([]);
  private loadingSignal = signal<boolean>(false);
  private filterQuerySignal = signal<string>('');
  private selectedCategoryFilterSignal = signal<number | null>(null);

  readonly products = this.productsSignal.asReadonly();
  readonly isLoading = this.loadingSignal.asReadonly();
  readonly filterQuery = this.filterQuerySignal.asReadonly();
  readonly selectedCategoryFilter = this.selectedCategoryFilterSignal.asReadonly();

  // Productos filtrados dinámicamente con Signals
  readonly filteredProducts = computed(() => {
    let list = this.productsSignal();
    const query = this.filterQuerySignal().toLowerCase().trim();
    const catId = this.selectedCategoryFilterSignal();

    if (catId !== null) {
      list = list.filter(p => p.id_categoria === catId);
    }

    if (query) {
      list = list.filter(p => 
        p.nombre_producto.toLowerCase().includes(query) ||
        (p.sku && p.sku.toLowerCase().includes(query)) ||
        (p.ubicacion && p.ubicacion.toLowerCase().includes(query)) ||
        (p.nombre_categoria && p.nombre_categoria.toLowerCase().includes(query))
      );
    }

    return list;
  });

  // Métricas calculadas para la vista de consulta
  readonly totalProductsCount = computed(() => this.productsSignal().length);
  readonly activeProductsCount = computed(() => this.productsSignal().filter(p => p.activo === 1).length);
  readonly totalStockCount = computed(() => this.productsSignal().reduce((acc, p) => acc + (p.stock || 0), 0));

  constructor(private api: Api) {}

  async loadFeaturedProducts(): Promise<ProductDto[]> {
    try {
      const data = await this.api.invoke(getFeaturedProducts, {});
      return data || [];
    } catch (error) {
      console.error('Error cargando productos destacados:', error);
      return [];
    }
  }

  async loadProducts(): Promise<ProductDto[]> {
    this.loadingSignal.set(true);
    try {
      const data = await this.api.invoke(getProducts, {});
      this.productsSignal.set(data || []);
      return data || [];
    } catch (error) {
      console.error('Error cargando productos:', error);
      return [];
    } finally {
      this.loadingSignal.set(false);
    }
  }

  async create(productData: CreateProductRequest): Promise<ProductResponse> {
    this.loadingSignal.set(true);
    try {
      const response = await this.api.invoke(createProduct, {
        body: productData
      });
      await this.loadProducts();
      return response;
    } catch (error: any) {
      const msg = error?.error?.message || error?.message || 'Error al guardar el producto.';
      throw new Error(msg);
    } finally {
      this.loadingSignal.set(false);
    }
  }

  async delete(id: number): Promise<ProductResponse> {
    this.loadingSignal.set(true);
    try {
      const response = await this.api.invoke(deleteProduct, { id });
      // Remover de la lista local
      this.productsSignal.update(list => list.filter(p => p.id_producto !== id));
      return response;
    } catch (error: any) {
      const msg = error?.error?.message || error?.message || 'Error al eliminar el producto.';
      throw new Error(msg);
    } finally {
      this.loadingSignal.set(false);
    }
  }

  setFilterQuery(query: string): void {
    this.filterQuerySignal.set(query);
  }

  setCategoryFilter(categoryId: number | null): void {
    this.selectedCategoryFilterSignal.set(categoryId);
  }

  getProductImageUrl(id: number, type: 'main' | 'sec1' | 'sec2' | 'sec3' = 'main'): string {
    return `/api/v1/products/${id}/image?type=${type}`;
  }

  async checkOrderAvailability(order: number, excludeId?: number): Promise<boolean> {
    try {
      const res = await this.api.invoke(checkFeaturedOrder, {
        order: order
      });
      return !res?.occupied;
    } catch {
      return true;
    }
  }

  compressImage(file: File, maxWidth: number = 800, maxHeight: number = 800, quality: number = 0.82): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event: any) => {
        const img = new Image();
        img.onload = () => {
          let width = img.width;
          let height = img.height;

          if (width > maxWidth || height > maxHeight) {
            if (width > height) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            } else {
              width = Math.round((width * maxHeight) / height);
              height = maxHeight;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');

          if (!ctx) {
            resolve(event.target.result as string);
            return;
          }

          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
          resolve(compressedDataUrl);
        };
        img.onerror = (err) => reject(err);
        img.src = event.target.result;
      };
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
    });
  }
}
