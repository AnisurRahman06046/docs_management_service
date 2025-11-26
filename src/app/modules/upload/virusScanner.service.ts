import NodeClam from 'clamscan';
import path from 'path';
import fs from 'fs';
import config from '../../../config';

type ScanResult = {
  isClean: boolean;
  isInfected: boolean;
  viruses: string[];
  error?: string;
};

class VirusScannerService {
  private clamscan: NodeClam | null = null;
  private initialized = false;
  private initError: string | null = null;

  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      const quarantineDir =
        config.virusScan?.quarantineDir ||
        path.join(process.cwd(), 'uploads', 'quarantine');
      if (!fs.existsSync(quarantineDir)) {
        fs.mkdirSync(quarantineDir, { recursive: true });
      }

      this.clamscan = await new NodeClam().init({
        removeInfected: false,
        quarantineInfected: quarantineDir,
        scanLog: undefined,
        debugMode: false,
        fileList: undefined,
        scanRecursively: false,
        clamscan: {
          path: config.virusScan?.clamscan?.path || '/usr/bin/clamscan',
          db: undefined,
          scanArchives: true,
          active: true,
        },
        clamdscan: {
          socket: false,
          host: config.virusScan?.clamdscan?.host || '127.0.0.1',
          port: config.virusScan?.clamdscan?.port || 3310,
          timeout: config.virusScan?.clamdscan?.timeout || 60000,
          localFallback: true,
          path: '/usr/bin/clamdscan',
          configFile: undefined,
          multiscan: true,
          reloadDb: false,
          active: true,
          bypassTest: false,
        },
        preference: 'clamdscan',
      });

      this.initialized = true;
      console.log('Virus scanner initialized successfully');
    } catch (error) {
      this.initError =
        error instanceof Error
          ? error.message
          : 'Unknown error initializing virus scanner';
      console.warn('Virus scanner initialization failed:', this.initError);
      console.warn('File uploads will proceed without virus scanning');
    }
  }

  async scanFile(filePath: string): Promise<ScanResult> {
    if (config.virusScan?.enabled === false) {
      return {
        isClean: true,
        isInfected: false,
        viruses: [],
      };
    }

    if (!this.initialized || !this.clamscan) {
      console.warn('Virus scanner not available, skipping scan for:', filePath);
      return {
        isClean: true,
        isInfected: false,
        viruses: [],
        error: this.initError || 'Scanner not initialized',
      };
    }

    try {
      const fullPath = path.isAbsolute(filePath)
        ? filePath
        : path.join(config.file.uploadDir, filePath);

      if (!fs.existsSync(fullPath)) {
        return {
          isClean: false,
          isInfected: false,
          viruses: [],
          error: 'File not found',
        };
      }

      const { isInfected, viruses } = await this.clamscan.isInfected(fullPath);

      return {
        isClean: !isInfected,
        isInfected: isInfected || false,
        viruses: viruses || [],
      };
    } catch (error) {
      console.error('Virus scan error:', error);
      return {
        isClean: false,
        isInfected: false,
        viruses: [],
        error: error instanceof Error ? error.message : 'Scan failed',
      };
    }
  }

  async scanMultipleFiles(
    filePaths: string[]
  ): Promise<Map<string, ScanResult>> {
    const results = new Map<string, ScanResult>();
    for (const filePath of filePaths) {
      results.set(filePath, await this.scanFile(filePath));
    }
    return results;
  }

  isAvailable(): boolean {
    return this.initialized && this.clamscan !== null;
  }
}

// Export singleton instance
export const virusScanner = new VirusScannerService();
