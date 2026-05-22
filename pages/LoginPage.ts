import { Locator, Page, expect } from '@playwright/test';
import { BasePage } from '@pages/BasePage';
import { urls } from '@data/urls';

/**
 * Tesora B2C login page (Azure AD B2C custom policy).
 * The login URL is an absolute external URL, not relative to baseURL.
 */
export class LoginPage extends BasePage {
  protected readonly path = urls.login;

  private readonly usernameInput: Locator;
  private readonly passwordInput: Locator;
  private readonly submitButton: Locator;
  private readonly errorMessage: Locator;

  constructor(page: Page) {
    super(page);
    this.usernameInput = page.getByRole('textbox', { name: /correo electr/i });
    this.passwordInput = page.getByRole('textbox', { name: /contrase/i });
    this.submitButton = page.getByRole('button', { name: 'Ingresar' });
    this.errorMessage = page.getByRole('alert');
  }

  async goto(): Promise<void> {
    await this.page.goto(this.path);
    await this.page.waitForLoadState('networkidle');
    await expect(this.usernameInput).toBeVisible();
  }

  async login(username: string, password: string): Promise<void> {
    await expect(this.usernameInput).toBeVisible();
    await expect(this.passwordInput).toBeVisible();
    await expect(this.submitButton).toBeEnabled();
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }

  async loginAs(username: string, password: string): Promise<void> {
    await this.goto();
    await this.login(username, password);
    await this.expectRedirectedToApp();
  }

  async expectErrorVisible(): Promise<void> {
    await expect(this.errorMessage).toBeVisible();
  }

  async expectRedirectedToApp(): Promise<void> {
    await expect(this.page).toHaveURL(/app\.tesorabcp\.com/);
  }
}
