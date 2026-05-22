import { test } from '@fixtures/test-fixtures';
import {
  reportConciliation,
  reportHiddenIncome,
  reportRegisteredCashIncome,
  reportSearchedOperation,
  reportLast30DaysOperationsCount,
  reportMonthOperationsCount,
  reportWeekOperationsCount,
} from '@utils/test-reporter';

const USER = process.env.TEST_USER ?? '';
const PASS = process.env.TEST_PASS ?? '';

test.describe('Tesora - Cuentas por cobrar - Conciliación', () => {
  test.beforeEach(async ({ loginPage, conciliationsPage }) => {
    await loginPage.loginAs(USER, PASS);
    await conciliationsPage.waitForLoaded();
  });

  test('Conciliación', async ({ conciliationsPage }, testInfo) => {
    const data = await conciliationsPage.conciliateFirstIncomeWithFirstComprobante();
    await reportConciliation(testInfo, data);
  });

  test('Ocultar ingreso', async ({ conciliationsPage }, testInfo) => {
    const operacion = await conciliationsPage.hideFirstIncome();
    await reportHiddenIncome(testInfo, operacion);
  });

  test('Buscar operación', async ({ conciliationsPage }, testInfo) => {
    const operacion = '6406002';
    await conciliationsPage.searchOperation(operacion);
    await reportSearchedOperation(testInfo, operacion);
  });

  test('Registrar Ingreso - Efectivo', async ({ conciliationsPage }, testInfo) => {
    const data = { importe: '100', numeroOperacion: '99999' };
    await conciliationsPage.registerCashIncome(data);
    await reportRegisteredCashIncome(testInfo, data);
  });

  test('Búsqueda de Operaciones - Semana', async ({ conciliationsPage }, testInfo) => {
    const total = await conciliationsPage.filterByThisWeek();
    await reportWeekOperationsCount(testInfo, total);
  });

  test('Búsqueda de Operaciones - Este mes', async ({ conciliationsPage }, testInfo) => {
    test.setTimeout(90_000);
    const summary = await conciliationsPage.filterByThisMonth();
    await reportMonthOperationsCount(testInfo, summary);
  });

  test('Búsqueda de Operaciones - Últimos 30 días', async ({ conciliationsPage }, testInfo) => {
    test.setTimeout(90_000);
    const summary = await conciliationsPage.filterByLast30Days();
    await reportLast30DaysOperationsCount(testInfo, summary);
  });
});
