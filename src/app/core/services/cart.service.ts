import { Injectable, signal, computed } from '@angular/core';

export interface CartItem {
  id_producto: number;
  nombre_producto: string;
  precio: number;
  descuento?: number | null;
  descuento_unitario: number;
  precio_final: number;
  cantidad: number;
  tiene_imagen?: number;
  sku?: string | null;
  ubicacion?: string | null;
}

export interface CheckoutResult {
  success: boolean;
  mensaje: string;
  id_comanda: number;
  folio: string;
  total: number;
  subtotal: number;
  descuento: number;
  iva: number;
  metodo_pago: string;
  monto_pagado: number;
  cambio: number;
  despachos: Array<{
    id_despacho: number;
    producto: string;
    ubicacion: string;
    cantidad: number;
    sku: string;
    estatus: string;
  }>;
  ticket_data: {
    folio: string;
    fecha: string;
    cajero: string;
    productos: Array<{
      id_producto: number;
      nombre: string;
      cantidad: number;
      ubicacion: string;
      precio_original: number;
      descuento: number;
      precio: number;
      subtotal: number;
    }>;
    subtotal: number;
    descuento: number;
    iva: number;
    total: number;
    metodo_pago: string;
    monto_pagado: number;
    cambio: number;
    empresa: {
      nombre_empresa: string;
      direccion?: string | null;
      ciudad?: string | null;
      estado?: string | null;
      telefono?: string | null;
      rfc?: string | null;
      email?: string | null;
      website?: string | null;
      mensaje_ticket?: string | null;
    };
  };
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private readonly STORAGE_KEY = 'paulobot_store_cart';
  private itemsSignal = signal<CartItem[]>(this.loadFromStorage());

  readonly items = this.itemsSignal.asReadonly();

  readonly totalItems = computed(() =>
    this.itemsSignal().reduce((sum, item) => sum + item.cantidad, 0)
  );

  readonly subtotal = computed(() =>
    this.itemsSignal().reduce((sum, item) => sum + item.precio_final * item.cantidad, 0)
  );

  readonly originalSubtotal = computed(() =>
    this.itemsSignal().reduce((sum, item) => sum + item.precio * item.cantidad, 0)
  );

  readonly totalSavings = computed(() =>
    this.itemsSignal().reduce((sum, item) => sum + item.descuento_unitario * item.cantidad, 0)
  );

  constructor() {}

  private loadFromStorage(): CartItem[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  private saveToStorage(items: CartItem[]): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.error('Error guardando carrito en localStorage:', e);
    }
  }

  addItem(product: {
    id_producto: number;
    nombre_producto: string;
    precio: number;
    descuento?: number | null;
    tiene_imagen?: number;
    sku?: string | null;
    ubicacion?: string | null;
  }): void {
    const precioOriginal = Number(product.precio) || 0;
    const descuentoRaw = Number(product.descuento) || 0;
    // En este sistema, descuento es en pesos (máximo igual al precio original)
    const descuentoPesos = (descuentoRaw > 0 && descuentoRaw < precioOriginal) ? descuentoRaw : 0;
    const finalPrice = Math.max(0, precioOriginal - descuentoPesos);

    this.itemsSignal.update(currentItems => {
      const index = currentItems.findIndex(i => i.id_producto === product.id_producto);
      let updated: CartItem[];

      if (index > -1) {
        updated = currentItems.map((item, i) =>
          i === index ? { ...item, cantidad: item.cantidad + 1 } : item
        );
      } else {
        updated = [
          ...currentItems,
          {
            id_producto: product.id_producto,
            nombre_producto: product.nombre_producto,
            precio: precioOriginal,
            descuento: product.descuento,
            descuento_unitario: descuentoPesos,
            precio_final: finalPrice,
            cantidad: 1,
            tiene_imagen: product.tiene_imagen,
            sku: product.sku,
            ubicacion: product.ubicacion
          }
        ];
      }

      this.saveToStorage(updated);
      return updated;
    });
  }

  removeItem(productId: number): void {
    this.itemsSignal.update(items => {
      const updated = items.filter(i => i.id_producto !== productId);
      this.saveToStorage(updated);
      return updated;
    });
  }

  updateQuantity(productId: number, qty: number): void {
    if (qty <= 0) {
      this.removeItem(productId);
      return;
    }

    this.itemsSignal.update(items => {
      const updated = items.map(item =>
        item.id_producto === productId ? { ...item, cantidad: qty } : item
      );
      this.saveToStorage(updated);
      return updated;
    });
  }

  getItemQuantity(productId: number): number {
    const item = this.itemsSignal().find(i => i.id_producto === productId);
    return item ? item.cantidad : 0;
  }

  clear(): void {
    this.itemsSignal.set([]);
    localStorage.removeItem(this.STORAGE_KEY);
  }

  /**
   * Enviar la venta al backend REST API
   */
  async checkoutSale(options: {
    metodo_pago: 'Efectivo' | 'Tarjeta';
    tipo_pago: number; // 0=Efectivo, 1=Tarjeta
    tipo_tarjeta?: number; // 0=No aplica, 1=Débito, 2=Crédito
    monto_pagado?: number;
    cambio?: number;
  }): Promise<CheckoutResult> {
    const currentItems = this.itemsSignal();
    if (currentItems.length === 0) {
      throw new Error('El carrito está vacío');
    }

    const payload = {
      cart: currentItems.map(item => ({
        id_producto: item.id_producto,
        quantity: item.cantidad
      })),
      metodo_pago: options.metodo_pago,
      tipo_pago: options.tipo_pago,
      tipo_tarjeta: options.tipo_tarjeta ?? 0,
      monto_pagado: options.monto_pagado ?? this.subtotal(),
      cambio: options.cambio ?? 0
    };

    const res = await fetch('http://localhost:8000/api/v1/sales/checkout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || data.mensaje || 'Error al procesar la venta');
    }

    return data as CheckoutResult;
  }
}
