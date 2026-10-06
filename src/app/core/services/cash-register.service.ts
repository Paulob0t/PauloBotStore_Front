import { Injectable, signal, computed } from '@angular/core';
import { Api } from '../../api/api';
import {
  getCashRegisterStatus,
  getCashRegisterHistory,
  getCashRegisterCutById,
  openCashRegister,
  closeCashRegister,
  createCashMovement,
  updateCashRegisterConfig
} from '../../api/functions';
import {
  CashRegisterStatusDto,
  CashRegisterCutDto,
  CashRegisterActionResponse,
  OpenCashRegisterRequest,
  CloseCashRegisterRequest,
  CreateCashMovementRequest,
  UpdateCashConfigRequest
} from '../../api/models';

@Injectable({
  providedIn: 'root'
})
export class CashRegisterService {
  private statusSignal = signal<CashRegisterStatusDto | null>(null);
  private historySignal = signal<CashRegisterCutDto[]>([]);
  private selectedCutDetailSignal = signal<any | null>(null);
  private loadingSignal = signal<boolean>(false);

  readonly status = this.statusSignal.asReadonly();
  readonly history = this.historySignal.asReadonly();
  readonly selectedCutDetail = this.selectedCutDetailSignal.asReadonly();
  readonly isLoading = this.loadingSignal.asReadonly();

  readonly isCajaActiva = computed(() => this.statusSignal()?.caja_activa ?? false);
  readonly corteActual = computed(() => this.statusSignal()?.corte_actual ?? null);
  readonly totales = computed(() => this.statusSignal()?.totales ?? null);
  readonly config = computed(() => this.statusSignal()?.config ?? null);
  readonly movimientosTurno = computed(() => this.statusSignal()?.movimientos ?? []);

  constructor(private api: Api) {}

  async loadStatus(): Promise<CashRegisterStatusDto | null> {
    this.loadingSignal.set(true);
    try {
      const data = await this.api.invoke(getCashRegisterStatus, {});
      this.statusSignal.set(data);
      return data;
    } catch (error) {
      console.error('Error cargando estado de caja:', error);
      return null;
    } finally {
      this.loadingSignal.set(false);
    }
  }

  async loadHistory(desde?: string, hasta?: string): Promise<CashRegisterCutDto[]> {
    this.loadingSignal.set(true);
    try {
      const data = await this.api.invoke(getCashRegisterHistory, { desde, hasta });
      this.historySignal.set(data || []);
      return data || [];
    } catch (error) {
      console.error('Error cargando historial de cortes:', error);
      return [];
    } finally {
      this.loadingSignal.set(false);
    }
  }

  async loadCutDetail(id: number): Promise<any | null> {
    this.loadingSignal.set(true);
    try {
      const data = await this.api.invoke(getCashRegisterCutById, { id });
      this.selectedCutDetailSignal.set(data);
      return data;
    } catch (error) {
      console.error('Error cargando detalle de corte:', error);
      this.selectedCutDetailSignal.set(null);
      return null;
    } finally {
      this.loadingSignal.set(false);
    }
  }

  clearSelectedDetail(): void {
    this.selectedCutDetailSignal.set(null);
  }

  async openCaja(data: OpenCashRegisterRequest): Promise<CashRegisterActionResponse> {
    this.loadingSignal.set(true);
    try {
      const res = await this.api.invoke(openCashRegister, { body: data });
      await this.loadStatus();
      await this.loadHistory();
      return res;
    } catch (error: any) {
      throw new Error(error?.error?.message || error?.message || 'Error al iniciar caja.');
    } finally {
      this.loadingSignal.set(false);
    }
  }

  async closeCaja(data: CloseCashRegisterRequest): Promise<CashRegisterActionResponse> {
    this.loadingSignal.set(true);
    try {
      const res = await this.api.invoke(closeCashRegister, { body: data });
      await this.loadStatus();
      await this.loadHistory();
      return res;
    } catch (error: any) {
      throw new Error(error?.error?.message || error?.message || 'Error al cerrar caja.');
    } finally {
      this.loadingSignal.set(false);
    }
  }

  async addMovement(data: CreateCashMovementRequest): Promise<CashRegisterActionResponse> {
    this.loadingSignal.set(true);
    try {
      const res = await this.api.invoke(createCashMovement, { body: data });
      await this.loadStatus();
      return res;
    } catch (error: any) {
      throw new Error(error?.error?.message || error?.message || 'Error al registrar movimiento.');
    } finally {
      this.loadingSignal.set(false);
    }
  }

  async updateConfig(data: UpdateCashConfigRequest): Promise<CashRegisterActionResponse> {
    this.loadingSignal.set(true);
    try {
      const res = await this.api.invoke(updateCashRegisterConfig, { body: data });
      await this.loadStatus();
      return res;
    } catch (error: any) {
      throw new Error(error?.error?.message || error?.message || 'Error al actualizar configuración.');
    } finally {
      this.loadingSignal.set(false);
    }
  }
}
