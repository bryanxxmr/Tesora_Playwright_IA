import { Page, expect } from '@playwright/test';

/**
 * BasePage: shared behaviour for every page object.
 * Extend this class, never instantiate it directly.
 */
export abstract class BasePage {
  protected readonly page: Page;

  /** Relative path the page object represents (e.g. '/login'). */
  protected abstract readonly path: string;

  constructor(page: Page) {
    this.page = page;
  }

  /** Navigate to the page's path (relative to config baseURL). */
  async goto(): Promise<void> {
    await this.page.goto(this.path);
  }

  /** Assert the page reached the expected URL fragment. */
  async expectLoaded(): Promise<void> {
    await expect(this.page).toHaveURL(new RegExp(this.path));
  }

  /** Capture a full-page screenshot under test-results/. */
  async screenshot(name: string): Promise<void> {
    await this.page.screenshot({
      path: `test-results/${name}.png`,
      fullPage: true,
    });
  }
}
