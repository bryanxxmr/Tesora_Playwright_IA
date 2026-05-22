import { test } from '@fixtures/test-fixtures';

const USER = process.env.TEST_USER ?? '';
const PASS = process.env.TEST_PASS ?? '';

test.describe('Tesora - Cuentas por cobrar - Comprobantes', () => {
  test.beforeEach(async ({ loginPage }) => {
    await loginPage.loginAs(USER, PASS);
  });

  test('Carga de Comprobantes', async ({ comprobantesPage }) => {
    test.setTimeout(60_000);
    await comprobantesPage.goto();
    await comprobantesPage.waitForLoaded();
  });

  test('Comprobantes - Conciliado', async ({ comprobantesPage }) => {
    test.setTimeout(60_000);
    await comprobantesPage.goto();
    await comprobantesPage.waitForLoaded();
    await comprobantesPage.filterByConciliado();
  });

  test('Comprobantes - Pendiente', async ({ comprobantesPage }) => {
    test.setTimeout(60_000);
    await comprobantesPage.goto();
    await comprobantesPage.waitForLoaded();
    await comprobantesPage.filterByPendiente();
  });

  test('Comprobantes - Parcial', async ({ comprobantesPage }) => {
    test.setTimeout(60_000);
    await comprobantesPage.goto();
    await comprobantesPage.waitForLoaded();
    await comprobantesPage.filterByParcial();
  });
});
