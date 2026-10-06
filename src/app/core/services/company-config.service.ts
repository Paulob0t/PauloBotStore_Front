import { Injectable, signal } from '@angular/core';
import { Api } from '../../api/api';
import { getCompanyConfig, updateCompanyConfig } from '../../api/functions';
import { CompanyConfigDto, UpdateCompanyConfigRequest } from '../../api/models';

@Injectable({
  providedIn: 'root'
})
export class CompanyConfigService {
  private configSignal = signal<CompanyConfigDto | null>(null);
  private loadingSignal = signal<boolean>(false);
  private savingSignal = signal<boolean>(false);

  readonly config = this.configSignal.asReadonly();
  readonly isLoading = this.loadingSignal.asReadonly();
  readonly isSaving = this.savingSignal.asReadonly();

  constructor(private api: Api) {}

  async loadConfig(): Promise<CompanyConfigDto | null> {
    this.loadingSignal.set(true);
    try {
      const data = await this.api.invoke(getCompanyConfig, {});
      this.configSignal.set(data);
      return data;
    } catch (error) {
      console.error('Error cargando configuración de empresa:', error);
      return null;
    } finally {
      this.loadingSignal.set(false);
    }
  }

  async saveConfig(data: UpdateCompanyConfigRequest): Promise<void> {
    this.savingSignal.set(true);
    try {
      await this.api.invoke(updateCompanyConfig, { body: data });
      this.configSignal.set(data as CompanyConfigDto);
    } catch (error: any) {
      throw new Error(error?.error?.message || error?.message || 'Error al guardar la configuración.');
    } finally {
      this.savingSignal.set(false);
    }
  }
}
