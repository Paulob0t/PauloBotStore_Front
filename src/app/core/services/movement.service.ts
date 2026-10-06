import { Injectable, signal, computed } from '@angular/core';
import { Api } from '../../api/api';
import { getMovements, getMovementsSummary, getMovementById } from '../../api/functions';
import { MovementItemDto, MovementsSummaryDto, SaleDetailsResponseDto } from '../../api/models';

@Injectable({
  providedIn: 'root'
})
export class MovementService {
  private movementsSignal = signal<MovementItemDto[]>([]);
  private summarySignal = signal<MovementsSummaryDto | null>(null);
  private selectedDetailSignal = signal<SaleDetailsResponseDto | null>(null);
  private loadingSignal = signal<boolean>(false);
  private searchQuerySignal = signal<string>('');
  private paymentFilterSignal = signal<string | null>(null);

  readonly movements = this.movementsSignal.asReadonly();
  readonly summary = this.summarySignal.asReadonly();
  readonly selectedDetail = this.selectedDetailSignal.asReadonly();
  readonly isLoading = this.loadingSignal.asReadonly();
  readonly searchQuery = this.searchQuerySignal.asReadonly();
  readonly paymentFilter = this.paymentFilterSignal.asReadonly();

  // Movimientos filtrados reactivamente
  readonly filteredMovements = computed(() => {
    let list = this.movementsSignal();
    const query = this.searchQuerySignal().toLowerCase().trim();
    const payment = this.paymentFilterSignal();

    if (payment) {
      list = list.filter(m => {
        if (payment === 'efectivo') {
          return m.metodo_pago.toLowerCase().includes('efectivo') || m.tipo_pago === 2;
        }
        if (payment === 'tarjeta') {
          return m.metodo_pago.toLowerCase().includes('tarjeta') || m.tipo_pago === 1;
        }
        return m.metodo_pago.toLowerCase().includes(payment.toLowerCase());
      });
    }

    if (query) {
      list = list.filter(m =>
        m.folio.toLowerCase().includes(query) ||
        (m.notas && m.notas.toLowerCase().includes(query)) ||
        (m.nombre_usuario && m.nombre_usuario.toLowerCase().includes(query)) ||
        m.metodo_pago.toLowerCase().includes(query)
      );
    }

    return list;
  });

  // Métricas calculadas para tarjetas de resumen
  readonly totalVentasCount = computed(() => {
    return this.summarySignal()?.totalVentas ?? this.movementsSignal().length;
  });

  readonly totalIngresosAmount = computed(() => {
    return this.summarySignal()?.totalIngresos ?? this.movementsSignal().reduce((acc, m) => acc + m.total, 0);
  });

  readonly ventasHoyCount = computed(() => {
    return this.summarySignal()?.ventasHoy ?? 0;
  });

  readonly promedioVentaAmount = computed(() => {
    return this.summarySignal()?.promedioVenta ?? 0;
  });

  constructor(private api: Api) {}

  async loadMovements(startDate?: string, endDate?: string): Promise<MovementItemDto[]> {
    this.loadingSignal.set(true);
    try {
      const data = await this.api.invoke(getMovements, {
        start_date: startDate,
        end_date: endDate
      });
      this.movementsSignal.set(data || []);
      await this.loadSummary();
      return data || [];
    } catch (error) {
      console.error('Error cargando movimientos:', error);
      return [];
    } finally {
      this.loadingSignal.set(false);
    }
  }

  async loadSummary(): Promise<MovementsSummaryDto | null> {
    try {
      const data = await this.api.invoke(getMovementsSummary, {});
      this.summarySignal.set(data);
      return data;
    } catch (error) {
      console.error('Error cargando resumen de movimientos:', error);
      return null;
    }
  }

  async loadDetail(id: number): Promise<SaleDetailsResponseDto | null> {
    this.loadingSignal.set(true);
    try {
      const detail = await this.api.invoke(getMovementById, { id });
      this.selectedDetailSignal.set(detail);
      return detail;
    } catch (error) {
      console.error('Error cargando detalle de venta:', error);
      this.selectedDetailSignal.set(null);
      return null;
    } finally {
      this.loadingSignal.set(false);
    }
  }

  clearSelectedDetail(): void {
    this.selectedDetailSignal.set(null);
  }

  setSearchQuery(query: string): void {
    this.searchQuerySignal.set(query);
  }

  setPaymentFilter(payment: string | null): void {
    this.paymentFilterSignal.set(payment);
  }
}
