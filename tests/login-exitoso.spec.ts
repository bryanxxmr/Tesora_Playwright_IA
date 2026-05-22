import { test } from '@fixtures/test-fixtures';
import { logger } from '@utils/logger';

const USER = process.env.TEST_USER ?? '';
const PASS = process.env.TEST_PASS ?? '';

test.describe('Tesora - Autenticación', () => {
  test('Login exitoso', async ({ loginPage, conciliationsPage }) => {
    await loginPage.loginAs(USER, PASS);
    await conciliationsPage.waitForLoaded();
    logger.info(`Login exitoso para ${USER} - módulo Conciliaciones cargado`);
  });
});
