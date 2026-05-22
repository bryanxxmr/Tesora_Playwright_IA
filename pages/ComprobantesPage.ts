import { Locator, Page, expect } from '@playwright/test';
import { BasePage } from '@pages/BasePage';
import { logger } from '@utils/logger';

export class ComprobantesPage extends BasePage {
  protected readonly path = '/admin/accounts-receivable/receipts';

  private readonly heading: Locator;
  private readonly table: Locator;
  private readonly firstRow: Locator;
  private readonly loadingPlaceholder: Locator;
  private readonly conciliadoFilterButton: Locator;
  private readonly pendienteFilterButton: Locator;
  private readonly parcialFilterButton: Locator;
  private readonly cookiesAcceptButton: Locator;
  private readonly cookiesDialog: Locator;

  constructor(page: Page) {
    super(page);
    this.heading = page.getByRole('heading', { name: 'Comprobantes', level: 1 });
    this.table = page.locator('bcp-table').first();
    this.firstRow = page.locator('bcp-table-row').nth(1);
    this.loadingPlaceholder = page.locator('text="Cargando"').first();
    this.conciliadoFilterButton = page.getByRole('button', { name: 'Conciliado', exact: true });
    this.pendienteFilterButton = page.getByRole('button', { name: 'Pendiente', exact: true });
    this.parcialFilterButton = page.getByRole('button', { name: 'Parcial', exact: true });

    this.cookiesAcceptButton = page.locator(
      '#CybotCookiebotDialogBodyLevelButtonLevelOptinAllowAll',
    );
    this.cookiesDialog = page.locator('#CybotCookiebotDialog');
  }

  async goto(): Promise<void> {
    await this.page.waitForURL(/\/admin\//, { timeout: 30_000 });
    await this.page.goto(this.path);
  }

  async waitForLoaded(): Promise<void> {
    await this.page.waitForURL(new RegExp(this.path), { timeout: 20_000 });
    await expect(this.heading).toBeVisible({ timeout: 15_000 });
    await this.dismissCookiesBanner();
    await expect(this.firstRow).toBeVisible({ timeout: 15_000 });
    logger.info('Módulo Comprobantes cargado correctamente');
  }

  private async applyStatusFilter(filterButton: Locator, filterName: string): Promise<void> {
    logger.info(`Aplicando filtro "${filterName}"`);

    await expect(filterButton).toBeVisible();

    const responsePromise = this.page
      .waitForResponse(
        (resp) => /receipt|comproban/i.test(resp.url()) && resp.request().method() === 'GET',
        { timeout: 15_000 },
      )
      .catch(() => undefined);

    await filterButton.click();

    await expect(filterButton).toHaveClass(/bcp-ffw-btn-primary/, { timeout: 10_000 });
    await responsePromise;
    await this.page.waitForLoadState('networkidle', { timeout: 15_000 }).catch(() => undefined);
    await expect(this.firstRow).toBeVisible({ timeout: 15_000 });

    logger.info(`Comprobantes con estado "${filterName}" cargados correctamente`);
  }

  async filterByConciliado(): Promise<void> {
    await this.applyStatusFilter(this.conciliadoFilterButton, 'Conciliado');
  }

  async filterByPendiente(): Promise<void> {
    await this.applyStatusFilter(this.pendienteFilterButton, 'Pendiente');
  }

  async filterByParcial(): Promise<void> {
    await this.applyStatusFilter(this.parcialFilterButton, 'Parcial');
  }

  async dismissCookiesBanner(): Promise<void> {
    if (await this.cookiesAcceptButton.isVisible().catch(() => false)) {
      await this.cookiesAcceptButton.click();
      await expect(this.cookiesDialog).toBeHidden();
    }
  }
}
