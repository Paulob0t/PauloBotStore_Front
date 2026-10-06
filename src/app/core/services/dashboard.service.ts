import { Injectable, signal } from '@angular/core';
import { Api } from '../../api/api';
import { getDashboardMetrics } from '../../api/functions';
import { DashboardMetricsDto } from '../../api/models';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private metricsSignal = signal<DashboardMetricsDto | null>(null);
  private loadingSignal = signal<boolean>(false);
  private errorSignal = signal<string | null>(null);

  readonly metrics = this.metricsSignal.asReadonly();
  readonly isLoading = this.loadingSignal.asReadonly();
  readonly error = this.errorSignal.asReadonly();

  constructor(private api: Api) {}

  async loadMetrics(): Promise<void> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    try {
      const data = await this.api.invoke(getDashboardMetrics, {});
      this.metricsSignal.set(data);
    } catch (err: any) {
      const msg = err?.error?.message || err?.message || 'Error al cargar métricas del dashboard';
      this.errorSignal.set(msg);
    } finally {
      this.loadingSignal.set(false);
    }
  }
}
