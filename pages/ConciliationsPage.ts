import { Locator, Page, expect } from '@playwright/test';
import { BasePage } from '@pages/BasePage';
import { logger } from '@utils/logger';

export type ConciliationStatus = 'Conciliada' | 'Parcial' | 'Pendiente' | 'Desconocido';

export interface ConciliationStatusInfo {
  status: ConciliationStatus;
  label: string;
  percent: string;
}

export interface ConciliationData {
  operacion: string;
  comprobante: string;
  status: ConciliationStatus;
  statusLabel: string;
  statusPercent: string;
}

export interface RegisterCashIncomeData {
  importe: string;
  numeroOperacion: string;
}

export interface MonthOperationsSummary {
  totalReportado: number;
  conNumeroOperacion: number;
  sinNumeroOperacion: number;
}

export class ConciliationsPage extends BasePage {
  protected readonly path = '/admin/accounts-receivable/conciliations';

  private readonly heading: Locator;
  private readonly firstIncomeRow: Locator;
  private readonly firstRowConciliarAction: Locator;
  private readonly verTodosToggleLabel: Locator;
  private readonly firstComprobanteRow: Locator;
  private readonly firstComprobanteCheckbox: Locator;
  private readonly firstComprobanteLabel: Locator;
  private readonly modalConciliarButton: Locator;
  private readonly resultSummary: Locator;
  private readonly resultSummaryAmounts: Locator;
  private readonly registerIncomeButton: Locator;
  private readonly registerModal: Locator;
  private readonly cashToggle: Locator;
  private readonly importeInput: Locator;
  private readonly numeroOperacionInput: Locator;
  private readonly registerSubmitButton: Locator;
  private readonly thisWeekButton: Locator;
  private readonly thisMonthButton: Locator;
  private readonly last30DaysButton: Locator;
  private readonly incomesCountText: Locator;
  private readonly searchOperationInput: Locator;
  private readonly firstRowKebab: Locator;
  private readonly hideMenuOption: Locator;
  private readonly hideModalConfirmButton: Locator;
  private readonly cookiesAcceptButton: Locator;
  private readonly cookiesDialog: Locator;

  constructor(page: Page) {
    super(page);
    this.heading = page.getByRole('heading', { name: 'Conciliaciones', level: 1 });

    this.firstIncomeRow = page.locator('bcp-table-row').nth(1);
    this.firstRowConciliarAction = page.locator('#conciliate-button-0 a');

    this.verTodosToggleLabel = page.locator('#bcp-switch-text-0-lbl');

    const conciliateModal = page.locator('app-conciliate-receipt-modal');
    const comprobantesTable = conciliateModal
      .locator('bcp-table')
      .filter({ hasText: 'SERIE-NÚMERO' });

    this.firstComprobanteRow = comprobantesTable
      .locator('bcp-table-row')
      .filter({ has: page.locator('input[type="checkbox"][id^="bcp-cb-"]') })
      .filter({ has: page.locator('p') })
      .first();
    this.firstComprobanteCheckbox = this.firstComprobanteRow
      .locator('input[type="checkbox"][id^="bcp-cb-"]')
      .first();
    this.firstComprobanteLabel = this.firstComprobanteRow
      .locator('label[for^="bcp-cb-"]')
      .first();

    this.modalConciliarButton = conciliateModal.locator('#submit-modal button');

    this.resultSummary = page.locator('.result-summary');
    this.resultSummaryAmounts = this.resultSummary.locator(
      '.result-summary__leyend .result-summary__amounts.ng-star-inserted',
    );

    this.registerIncomeButton = page.getByRole('button', { name: 'Registrar ingreso' });
    this.registerModal = page.locator('.p-dialog').filter({ hasText: 'Registrar ingreso' });
    this.cashToggle = this.registerModal.getByText('Pago en efectivo', { exact: true });
    this.importeInput = this.registerModal.locator('#bcp-input-0');
    this.numeroOperacionInput = this.registerModal.locator('#operationNumber-control');
    this.registerSubmitButton = this.registerModal.getByRole('button', {
      name: 'Registrar',
      exact: true,
    });

    this.thisWeekButton = page.getByRole('button', { name: 'Esta semana', exact: true });
    this.thisMonthButton = page.getByRole('button', { name: 'Este mes', exact: true });
    this.last30DaysButton = page.getByRole('button', { name: 'Últimos 30 días', exact: true });
    this.incomesCountText = page.locator('p', { hasText: /ingresos? por conciliar\.?/i });

    this.searchOperationInput = page.getByRole('textbox', { name: 'Operación' });

    this.firstRowKebab = this.firstIncomeRow.locator('bcp-icon[name="points-vert-r"]');
    this.hideMenuOption = page.locator('.dropdown-popover__option', { hasText: 'Ocultar' });
    this.hideModalConfirmButton = page.locator(
      '.p-dialog.hide-conciliations .bcp-ffw-btn-primary',
    );

    this.cookiesAcceptButton = page.locator(
      '#CybotCookiebotDialogBodyLevelButtonLevelOptinAllowAll',
    );
    this.cookiesDialog = page.locator('#CybotCookiebotDialog');
  }

  async waitForLoaded(): Promise<void> {
    await this.page.waitForURL(new RegExp(this.path));
    await expect(this.heading).toBeVisible();
    await this.dismissCookiesBanner();
  }

  async dismissCookiesBanner(): Promise<void> {
    if (await this.cookiesAcceptButton.isVisible().catch(() => false)) {
      await this.cookiesAcceptButton.click();
      await expect(this.cookiesDialog).toBeHidden();
    }
  }

  async getFirstIncomeOperation(): Promise<string> {
    await expect(async () => {
      const texts = await this.firstIncomeRow.locator('p').allInnerTexts();
      const op = texts.map((t) => t.trim()).find((t) => /^\d+$/.test(t));
      expect(op, 'esperando número de operación en la primera fila').toBeDefined();
    }).toPass({ timeout: 15_000 });
    const texts = await this.firstIncomeRow.locator('p').allInnerTexts();
    return texts.map((t) => t.trim()).find((t) => /^\d+$/.test(t)) as string;
  }

  async openFirstIncomeConciliation(): Promise<void> {
    await expect(this.firstRowConciliarAction).toBeVisible();
    await expect(this.firstRowConciliarAction).toBeEnabled();
    await this.firstRowConciliarAction.click();
  }

  async switchToVerTodos(): Promise<void> {
    await expect(this.verTodosToggleLabel).toBeVisible();
    await this.verTodosToggleLabel.click();
  }

  async selectFirstComprobante(): Promise<string> {
    await this.firstComprobanteCheckbox.waitFor({ state: 'attached' });
    const cbId = await this.firstComprobanteCheckbox.getAttribute('id');
    if (!cbId) {
      throw new Error('No se pudo capturar el id del checkbox del primer comprobante');
    }
    const serie = (await this.firstComprobanteRow.locator('p').first().innerText()).trim();
    const stableLabel = this.page.locator(`label[for="${cbId}"]`);
    await stableLabel.evaluate((el: HTMLElement) => el.click());
    await expect(this.page.locator(`#${cbId}`)).toBeChecked();
    logger.info(`Primer comprobante seleccionado: ${serie} (${cbId})`);
    return serie;
  }

  async selectComprobantesUntilConciliarEnabled(): Promise<string[]> {
    const rows = this.page
      .locator('bcp-table-row')
      .filter({ has: this.page.locator('input[type="checkbox"][id^="bcp-cb-"]') })
      .filter({ has: this.page.locator('p') });

    await rows.first().waitFor({ state: 'attached', timeout: 10_000 });
    const count = await rows.count();

    if (count === 0) {
      throw new Error('No hay comprobantes disponibles en el modal de conciliación');
    }

    const selected: string[] = [];

    for (let i = 0; i < count; i++) {
      if (await this.modalConciliarButton.isEnabled()) break;

      const row = rows.nth(i);
      const serie = (await row.locator('p').first().innerText()).trim();
      const label = row.locator('label[for^="bcp-cb-"]').first();
      await label.evaluate((el: HTMLElement) => el.click());
      selected.push(serie);
      logger.info(`  ↳ Comprobante marcado [${i + 1}/${count}]: ${serie}`);

      await this.page.waitForTimeout(300);
    }

    if (!(await this.modalConciliarButton.isEnabled())) {
      throw new Error(
        `Tras seleccionar los ${selected.length} comprobantes disponibles, el botón "Conciliar" sigue deshabilitado. La data de prueba no permite conciliación completa.`,
      );
    }

    return selected;
  }

  async getConciliationStatus(): Promise<ConciliationStatusInfo> {
    await expect(this.resultSummaryAmounts).toBeVisible({ timeout: 10_000 });
    const titles = await this.resultSummaryAmounts
      .locator('.result-summary__title')
      .allInnerTexts();
    const label = (titles[0] ?? '').trim();
    const percent = (titles[1] ?? '').trim();

    const modifier = (await this.resultSummary.first().getAttribute('class')) ?? '';
    let status: ConciliationStatus;
    if (/fully-concilied|totally-concilied|--concilied(?!ed)/.test(modifier) || /Totalmente/i.test(label)) {
      status = 'Conciliada';
    } else if (/partially-concilied/.test(modifier) || /Parcialmente/i.test(label)) {
      status = 'Parcial';
    } else if (/Pendiente/i.test(label)) {
      status = 'Pendiente';
    } else {
      status = 'Desconocido';
    }
    return { status, label, percent };
  }

  async confirmConciliation(): Promise<{ apiStatus: number | null }> {
    await expect(this.modalConciliarButton).toBeVisible();
    await expect(
      this.modalConciliarButton,
      'el botón "Conciliar" del modal sigue deshabilitado: el primer comprobante no cubre la regla de validación del ingreso (monto/moneda/cliente). Limpiar data de prueba en Tesora o ajustar el caso de prueba.',
    ).toBeEnabled();
    await this.modalConciliarButton.scrollIntoViewIfNeeded();

    const apiResponsePromise = this.page
      .waitForResponse(
        (resp) =>
          /apis\.tesorabcp\.com\/conciliation\/v\d+\/conciliation\b/.test(resp.url()) &&
          resp.request().method() === 'POST',
        { timeout: 15_000 },
      )
      .catch(() => null);

    await this.modalConciliarButton.click();

    const response = await apiResponsePromise;
    const apiStatus = response ? response.status() : null;
    if (response && (apiStatus! < 200 || apiStatus! >= 300)) {
      throw new Error(
        `Conciliación falló: el backend respondió ${apiStatus} para ${response.url()}`,
      );
    }
    if (!response) {
      logger.warn(
        'No se capturó respuesta del API de conciliación (timeout 15s). Continuando con verificación de UI.',
      );
    }

    await expect(this.modalConciliarButton).toBeHidden({ timeout: 15_000 });
    await expect(this.heading).toBeVisible({ timeout: 15_000 });

    return { apiStatus };
  }

  async expectIncomeNoLongerPending(operacion: string): Promise<void> {
    await expect(async () => {
      const texts = await this.firstIncomeRow.locator('p').allInnerTexts();
      const currentOp = texts.map((t) => t.trim()).find((t) => /^\d+$/.test(t));
      expect(currentOp, `la operación ${operacion} sigue como primer ingreso pendiente`).not.toBe(
        operacion,
      );
    }).toPass({ timeout: 10_000 });
  }

  async registerCashIncome(data: RegisterCashIncomeData): Promise<void> {
    logger.info(`Registrando ingreso en efectivo → importe: ${data.importe}, operación: ${data.numeroOperacion}`);

    await expect(this.registerIncomeButton).toBeVisible();
    await this.registerIncomeButton.click();

    await expect(this.registerModal).toBeVisible();
    await this.cashToggle.click();

    await this.importeInput.fill(data.importe);
    await this.numeroOperacionInput.fill(data.numeroOperacion);

    await expect(this.registerSubmitButton).toBeEnabled();
    await this.registerSubmitButton.click();

    await expect(this.registerModal).toBeHidden({ timeout: 15_000 });
    logger.info(`Ingreso registrado, validando en Dashboard...`);

    await this.searchOperation(data.numeroOperacion);
  }

  private async scrollUntilAllOperationsSeen(expectedTotal: number): Promise<Set<string>> {
    const loadingPlaceholder = this.page.locator('text="Cargando"').first();
    const seen = new Set<string>();
    let stableLoops = 0;

    for (let i = 0; i < 80; i++) {
      const visibleOps = await this.page.$$eval('bcp-table-row p', (paragraphs) =>
        paragraphs
          .map((p) => (p as HTMLElement).innerText.trim())
          .filter((t) => /^\d{3,}$/.test(t)),
      );

      const sizeBefore = seen.size;
      for (const op of visibleOps) seen.add(op);
      logger.info(`  ↳ operaciones únicas vistas: ${seen.size}/${expectedTotal}`);

      if (seen.size >= expectedTotal) break;

      if (seen.size === sizeBefore) {
        stableLoops++;
        if (stableLoops >= 4) break;
      } else {
        stableLoops = 0;
      }

      await this.page.evaluate(() => {
        const containers = Array.from(document.querySelectorAll<HTMLElement>('*')).filter((el) => {
          const cs = getComputedStyle(el);
          const scrollable = cs.overflowY === 'auto' || cs.overflowY === 'scroll';
          return scrollable && el.scrollHeight > el.clientHeight + 10;
        });
        containers.sort((a, b) => b.scrollHeight - a.scrollHeight);
        const target = containers[0];
        if (target) {
          target.scrollTop = Math.min(target.scrollTop + 300, target.scrollHeight);
        } else {
          window.scrollBy(0, 300);
        }
      });

      await loadingPlaceholder
        .waitFor({ state: 'hidden', timeout: 5_000 })
        .catch(() => undefined);
      await this.page.waitForTimeout(700);
    }

    return seen;
  }

  private async applyDateFilterAndScrollAll(
    filterButton: Locator,
    filterName: string,
  ): Promise<MonthOperationsSummary> {
    logger.info(`Aplicando filtro "${filterName}"`);

    await expect(filterButton).toBeVisible();
    await filterButton.click();

    const loadingPlaceholder = this.page.locator('text="Cargando"').first();
    await loadingPlaceholder.waitFor({ state: 'hidden', timeout: 20_000 }).catch(() => undefined);

    await expect(this.incomesCountText).toBeVisible({ timeout: 15_000 });

    const text = (await this.incomesCountText.first().innerText()).trim();
    const totalReportado = parseInt(text.match(/(\d+)/)?.[1] ?? '0', 10);
    logger.info(`Total reportado en el header: ${totalReportado} ingresos`);

    logger.info('Scrolleando hasta cargar todas las operaciones...');
    const seen = await this.scrollUntilAllOperationsSeen(totalReportado);
    const conNumeroOperacion = seen.size;
    const sinNumeroOperacion = Math.max(0, totalReportado - conNumeroOperacion);

    logger.info(
      `Resumen → total: ${totalReportado} | con n° operación: ${conNumeroOperacion} | sin n°: ${sinNumeroOperacion}`,
    );

    return { totalReportado, conNumeroOperacion, sinNumeroOperacion };
  }

  async filterByThisMonth(): Promise<MonthOperationsSummary> {
    return this.applyDateFilterAndScrollAll(this.thisMonthButton, 'Este mes');
  }

  async filterByLast30Days(): Promise<MonthOperationsSummary> {
    return this.applyDateFilterAndScrollAll(this.last30DaysButton, 'Últimos 30 días');
  }

  async filterByThisWeek(): Promise<number> {
    logger.info('Aplicando filtro "Esta semana"');

    await expect(this.thisWeekButton).toBeVisible();
    await this.thisWeekButton.click();

    const loadingPlaceholder = this.page.locator('text="Cargando"').first();
    await loadingPlaceholder.waitFor({ state: 'hidden', timeout: 15_000 }).catch(() => undefined);

    await expect(this.incomesCountText).toBeVisible({ timeout: 15_000 });
    const text = (await this.incomesCountText.first().innerText()).trim();
    const match = text.match(/(\d+)/);
    const total = match ? parseInt(match[1], 10) : 0;

    logger.info(`Operaciones encontradas en "Esta semana": ${total}`);
    return total;
  }

  async searchOperation(operacion: string): Promise<void> {
    logger.info(`Buscando operación: ${operacion}`);

    await expect(this.searchOperationInput).toBeVisible();
    await this.searchOperationInput.fill(operacion);

    const operationCell = this.page
      .locator('bcp-table-row p')
      .filter({ hasText: new RegExp(`^\\s*"?${operacion}"?\\s*$`) });

    await expect(
      operationCell.first(),
      `la operación ${operacion} debe encontrarse en el Dashboard`,
    ).toBeVisible({ timeout: 10_000 });

    const total = await operationCell.count();
    logger.info(`Operación encontrada: ${operacion}${total > 1 ? ` (${total} coincidencias)` : ''}`);
  }

  async hideFirstIncome(): Promise<string> {
    const operacion = await this.getFirstIncomeOperation();
    logger.info(`Operación a ocultar: ${operacion}`);

    const operationCell = this.page
      .locator('bcp-table-row p')
      .filter({ hasText: new RegExp(`^\\s*"?${operacion}"?\\s*$`) });
    await expect(operationCell, `la operación ${operacion} debe estar visible antes de ocultar`)
      .toHaveCount(1);

    await expect(this.firstRowKebab).toBeVisible();
    await this.firstRowKebab.click();

    await expect(this.hideMenuOption).toBeVisible();
    await this.hideMenuOption.click();

    await expect(this.hideModalConfirmButton).toBeEnabled();
    await this.hideModalConfirmButton.click();

    await expect(this.hideModalConfirmButton).toBeHidden({ timeout: 10_000 });

    await expect(operationCell, `la operación ${operacion} debe desaparecer de la lista`)
      .toHaveCount(0, { timeout: 10_000 });

    logger.info(`Ingreso ocultado: ${operacion}`);
    return operacion;
  }

  async conciliateFirstIncomeWithFirstComprobante(): Promise<ConciliationData> {
    const operacion = await this.getFirstIncomeOperation();
    logger.info(`Operación capturada: ${operacion}`);

    await this.openFirstIncomeConciliation();
    await this.switchToVerTodos();

    const comprobante = await this.selectFirstComprobante();
    logger.info(`Comprobante capturado: ${comprobante}`);

    const { status, label, percent } = await this.getConciliationStatus();
    logger.info(`Estado pre-confirmación: ${status} (${label} ${percent})`);

    const { apiStatus } = await this.confirmConciliation();
    logger.info(
      `Modal cerrado -> operación: ${operacion} | comprobante: ${comprobante} | preview: ${status} | API: ${apiStatus ?? 'n/a'}`,
    );

    await this.expectIncomeNoLongerPending(operacion);
    logger.info(`Persistencia verificada: la operación ${operacion} ya no aparece como pendiente`);

    return { operacion, comprobante, status, statusLabel: label, statusPercent: percent };
  }
}
