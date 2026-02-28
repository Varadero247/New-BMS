import {
  CalibrationCertificate,
  CertificateStatus,
  CalibrationResult,
} from './types';

export class CertificateTracker {
  private certs: Map<string, CalibrationCertificate> = new Map();
  private seq = 0;

  private newId(): string {
    return `cert-${++this.seq}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  }

  issue(
    equipmentId: string,
    certificateNumber: string,
    calibratedBy: string,
    calibrationDate: string,
    expiryDate: string,
    result: CalibrationResult,
    referenceStandard?: string,
    uncertaintyValue?: number,
    notes?: string,
  ): CalibrationCertificate {
    const id = this.newId();
    const cert: CalibrationCertificate = {
      id,
      equipmentId,
      certificateNumber,
      status: 'VALID',
      calibratedBy,
      calibrationDate,
      expiryDate,
      result,
      referenceStandard,
      uncertaintyValue,
      notes,
    };
    this.certs.set(id, cert);
    return cert;
  }

  expire(id: string): CalibrationCertificate {
    const cert = this.certs.get(id);
    if (!cert) throw new Error(`Certificate not found: ${id}`);
    cert.status = 'EXPIRED';
    return cert;
  }

  revoke(id: string): CalibrationCertificate {
    const cert = this.certs.get(id);
    if (!cert) throw new Error(`Certificate not found: ${id}`);
    cert.status = 'REVOKED';
    return cert;
  }

  supersede(id: string): CalibrationCertificate {
    const cert = this.certs.get(id);
    if (!cert) throw new Error(`Certificate not found: ${id}`);
    cert.status = 'SUPERSEDED';
    return cert;
  }

  get(id: string): CalibrationCertificate | undefined {
    return this.certs.get(id);
  }

  getAll(): CalibrationCertificate[] {
    return Array.from(this.certs.values());
  }

  getByEquipment(equipmentId: string): CalibrationCertificate[] {
    return this.getAll().filter((c) => c.equipmentId === equipmentId);
  }

  getLatest(equipmentId: string): CalibrationCertificate | undefined {
    const certs = this.getByEquipment(equipmentId);
    if (certs.length === 0) return undefined;
    return certs.reduce((latest, c) =>
      c.calibrationDate > latest.calibrationDate ? c : latest,
    );
  }

  getValid(): CalibrationCertificate[] {
    return this.getAll().filter((c) => c.status === 'VALID');
  }

  getExpired(): CalibrationCertificate[] {
    return this.getAll().filter((c) => c.status === 'EXPIRED');
  }

  getExpiring(asOf: string, withinDays: number): CalibrationCertificate[] {
    const asOfDate = new Date(asOf);
    const cutoff = new Date(asOfDate);
    cutoff.setDate(cutoff.getDate() + withinDays);
    const cutoffStr = cutoff.toISOString().slice(0, 10);
    return this.getAll().filter(
      (c) =>
        c.status === 'VALID' &&
        c.expiryDate >= asOf &&
        c.expiryDate <= cutoffStr,
    );
  }

  getByResult(result: CalibrationResult): CalibrationCertificate[] {
    return this.getAll().filter((c) => c.result === result);
  }

  getFailedOrOutOfTolerance(): CalibrationCertificate[] {
    return this.getAll().filter(
      (c) => c.result === 'FAIL' || c.result === 'OUT_OF_TOLERANCE',
    );
  }

  getCount(): number {
    return this.certs.size;
  }
}
