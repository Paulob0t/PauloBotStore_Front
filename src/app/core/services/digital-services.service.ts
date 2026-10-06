import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

export interface ServiceProvider {
  id: string;
  nombre: string;
  subtitulo: string;
  categoria: 'servicios' | 'recargas' | 'streaming';
  color: string;
  bg_gradient: string;
  imagen: string;
  disponible: boolean;
  badge: string;
  comision: number;
  descripcion: string;
}

export interface CfeCheckResult {
  success: boolean;
  service_number: string;
  amount: number;
  commission: number;
  total: number;
  titular: string;
  info: string;
  sku: string;
}

export interface CfePayResult {
  success: boolean;
  message: string;
  service: string;
  provider: string;
  service_number: string;
  amount: number;
  commission: number;
  total: number;
  folio: string;
  payment_method: string;
  status: string;
  date: string;
}

export interface MovistarPackage {
  sku: string;
  amount: number;
  name: string;
  vigencia?: string;
  beneficio?: string;
}

export interface MovistarPackagesResponse {
  tiempo_aire: MovistarPackage[];
  datos: MovistarPackage[];
}

export interface MovistarRechargeResult {
  success: boolean;
  message: string;
  service: string;
  provider: string;
  phone_number: string;
  sku: string;
  amount: number;
  commission: number;
  total: number;
  folio: string;
  payment_method: string;
  status: string;
  date: string;
}

@Injectable({
  providedIn: 'root'
})
export class DigitalServicesService {
  private http = inject(HttpClient);
  private baseUrl = 'http://localhost:8000/api/v1/services';

  providers = signal<ServiceProvider[]>([]);
  isLoading = signal<boolean>(false);

  async loadProviders(): Promise<ServiceProvider[]> {
    this.isLoading.set(true);
    try {
      const data = await firstValueFrom(this.http.get<ServiceProvider[]>(this.baseUrl));
      this.providers.set(data || []);
      return data || [];
    } catch (e) {
      console.error('Error al cargar proveedores de servicios:', e);
      return [];
    } finally {
      this.isLoading.set(false);
    }
  }

  async checkCfeBalance(serviceNumber: string): Promise<CfeCheckResult> {
    return firstValueFrom(
      this.http.post<CfeCheckResult>(`${this.baseUrl}/cfe/check-balance`, {
        service_number: serviceNumber
      })
    );
  }

  async payCfe(serviceNumber: string, amount: number, paymentMethod: string = 'cash'): Promise<CfePayResult> {
    return firstValueFrom(
      this.http.post<CfePayResult>(`${this.baseUrl}/cfe/pay`, {
        service_number: serviceNumber,
        amount,
        payment_method: paymentMethod
      })
    );
  }

  async getMovistarPackages(): Promise<MovistarPackagesResponse> {
    return firstValueFrom(
      this.http.get<MovistarPackagesResponse>(`${this.baseUrl}/movistar/packages`)
    );
  }

  async rechargeMovistar(phoneNumber: string, sku: string, amount: number, paymentMethod: string = 'cash'): Promise<MovistarRechargeResult> {
    return firstValueFrom(
      this.http.post<MovistarRechargeResult>(`${this.baseUrl}/movistar/recharge`, {
        phone_number: phoneNumber,
        sku,
        amount,
        payment_method: paymentMethod
      })
    );
  }
}
