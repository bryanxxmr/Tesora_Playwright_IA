import { test as base, type Page } from '@playwright/test';
import { LoginPage } from '@pages/LoginPage';
import { ConciliationsPage } from '@pages/ConciliationsPage';
import { ComprobantesPage } from '@pages/ComprobantesPage';

type Pages = {
  loginPage: LoginPage;
  conciliationsPage: ConciliationsPage;
  comprobantesPage: ComprobantesPage;
};

async function maximizeWindow(page: Page): Promise<void> {
  try {
    const session = await page.context().newCDPSession(page);
    const { windowId } = (await session.send('Browser.getWindowForTarget')) as {
      windowId: number;
    };
    await session.send('Browser.setWindowBounds', {
      windowId,
      bounds: { windowState: 'maximized' },
    });
  } catch {
    // CDP solo disponible en chromium; ignorar en otros browsers
  }
}

export const test = base.extend<Pages>({
  context: async ({ context }, use) => {
    const consent =
      `{stamp:%27auto%27%2Cnecessary:true%2Cpreferences:true%2Cstatistics:true` +
      `%2Cmarketing:true%2Cmethod:%27explicit%27%2Cver:1%2Cutc:${Date.now()}%2Cregion:%27pe%27}`;
    await context.addCookies([
      {
        name: 'CookieConsent',
        value: consent,
        domain: '.tesorabcp.com',
        path: '/',
        secure: true,
      },
    ]);
    await use(context);
  },
  page: async ({ page }, use) => {
    await maximizeWindow(page);
    await use(page);
  },
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  conciliationsPage: async ({ page }, use) => {
    await use(new ConciliationsPage(page));
  },
  comprobantesPage: async ({ page }, use) => {
    await use(new ComprobantesPage(page));
  },
});

export { expect } from '@playwright/test';
