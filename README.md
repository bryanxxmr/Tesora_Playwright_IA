# Tesora - Playwright

Suite de pruebas E2E para la aplicación **Tesora BCP**, construida con **Playwright + TypeScript** y organizada bajo el patrón **Page Object Model (POM)**.

---

## Sobre el proyecto

Este repositorio automatiza la validación funcional de la aplicación Tesora, que utiliza **Azure AD B2C** como proveedor de autenticación. La suite cubre flujos críticos de usuario sobre los navegadores Chromium, Firefox y WebKit, y se integra con GitHub Actions para correr en cada cambio.

### Objetivos

- Validar de extremo a extremo los flujos de negocio principales de Tesora.
- Detectar regresiones rápido en entornos de QA y producción.
- Mantener un código de pruebas **mantenible, escalable y portable** entre máquinas.

### Decisiones de diseño

- **POM (Page Object Model):** cada pantalla se modela como una clase. Los tests describen el _qué_, los Page Objects el _cómo_.
- **Fixtures personalizadas:** las pruebas reciben los Page Objects ya instanciados, evitando duplicación.
- **Path aliases (`@pages`, `@fixtures`, `@utils`, `@data`):** imports limpios y refactor sencillo.
- **Cero dependencias de MCP:** el proyecto corre con Playwright puro. Se puede transportar a cualquier máquina (incluidas restringidas) sin requerir servidores MCP ni herramientas adicionales.
- **Configuración por entorno:** URLs y credenciales se leen desde variables de entorno / `.env`, permitiendo cambiar entre QA, staging y producción sin tocar código.

---

## Requisitos

- **Node.js** 20+ (probado con 22.17.1)
- **npm** 10+
- Sistema operativo: Windows / macOS / Linux

---

## Instalación

```powershell
# 1. Instalar dependencias del proyecto
npm ci

# 2. Descargar los navegadores que usa Playwright (~300 MB)
npx playwright install

# 3. Crear el archivo de credenciales locales
Copy-Item .env.example .env
# Luego editar .env con credenciales reales
```

> En CI usar `npx playwright install --with-deps` para instalar también las librerías del sistema.

---

## Configuración

### Variables de entorno (`.env`)

Copia `.env.example` a `.env` y rellena los valores. El archivo `.env` está en `.gitignore` y **nunca debe subirse al repositorio**.

| Variable | Obligatoria | Descripción |
|---|---|---|
| `TEST_USER` | Sí | Usuario de prueba para login en B2C |
| `TEST_PASS` | Sí | Contraseña del usuario de prueba |
| `BASE_URL` | No | Override de la URL de la app (por defecto `https://app.tesorabcp.com`) |
| `LOGIN_URL` | No | Override de la URL de login B2C |

### URLs

Las URLs viven en `data/urls.ts` y pueden sobrescribirse por env vars. Esto facilita correr la misma suite contra distintos entornos.

---

## Ejecutar pruebas

```powershell
# Todos los navegadores
npx playwright test

# Solo Chromium
npx playwright test --project=chromium

# Headed (navegador visible) — útil en desarrollo
npx playwright test --headed

# Modo UI interactivo con time-travel
npx playwright test --ui

# Debug paso a paso con inspector
npx playwright test --debug

# Filtrar por nombre de test
npx playwright test -g "login"

# Ver el reporte HTML del último run
npx playwright show-report

# Generar selectores automáticamente
npx playwright codegen https://app.tesorabcp.com
```

También disponibles vía scripts npm: `npm test`, `npm run test:chromium`, `npm run test:ui`, etc. (ver `package.json`).

---

## Estructura del proyecto

```
Tesora - Playwright/
├── .github/
│   └── workflows/
│       └── playwright.yml      # Pipeline CI (matrix de navegadores)
├── data/                       # Datos de prueba tipados
│   └── urls.ts                 # URLs de la app y de login B2C
├── fixtures/
│   └── test-fixtures.ts        # Fixture: inyecta POMs + pre-acepta cookies
├── pages/                      # Page Object Model
│   ├── BasePage.ts             # Clase base abstracta
│   ├── LoginPage.ts            # Página de login Azure B2C
│   └── ConciliationsPage.ts    # Módulo Cuentas por cobrar → Conciliaciones
├── tests/                      # Especificaciones (*.spec.ts)
│   ├── login-exitoso.spec.ts   # Login exitoso
│   └── conciliacion.spec.ts    # Conciliación del primer ingreso
├── utils/                      # Helpers reutilizables
│   └── logger.ts               # Logger formateado
├── .env.example                # Plantilla de variables de entorno
├── .gitignore                  # Excluye node_modules, .env, .claude/, reportes
├── package.json                # Dependencias: @playwright/test, dotenv
├── playwright.config.ts        # Configuración: navegadores, retries, traces
├── tsconfig.json               # Path aliases (@pages, @fixtures, @utils, @data)
└── README.md
```

---

## Convenciones POM

1. **Toda pantalla extiende `BasePage`** y define la propiedad `path`.
2. **Los locators viven dentro del Page Object**, nunca en los tests.
3. **Preferir locators semánticos** (`getByRole`, `getByLabel`, `getByText`) sobre selectores CSS/XPath. Cuando los componentes Angular usan inputs ocultos detrás de labels (caso Tesora con `bcp-ffw-*`), se aceptan IDs autogenerados estables como `#bcp-cb-N`, `#conciliate-button-N` por pragmatismo.
4. **Los tests importan `test` y `expect`** desde `@fixtures/test-fixtures`, no desde `@playwright/test`.
5. **Usar `test.step()`** solo cuando aporta legibilidad. Los tests "limpios" delegan steps al POM cuando son lineales.
6. **Cada Page Object expone acciones de alto nivel** (`loginAs(user, pass)`, `conciliateFirstIncomeWithFirstComprobante()`), no acciones atómicas (`clickLoginButton`).
7. **Las aserciones de estado de página** viven como métodos `expectX()` / `waitForLoaded()` en el Page Object cuando son reutilizables.
8. **Las esperas técnicas** (`waitForURL`, `waitForLoadState`, dismiss de banners) se encapsulan en el POM, no en el spec.
9. **El logging informativo** vive dentro del POM cuando describe la acción de negocio (operación capturada, conciliación confirmada).

---

## Reportes enriquecidos

Los tests publican datos relevantes al reporte HTML:

- **Annotations** (`testInfo.annotations.push({ type, description })`): aparecen junto al título del test (p. ej. `Operación: 2266368`, `Comprobante: E001-188`).
- **Attachments** (`testInfo.attach(...)`): JSON descargable con los datos capturados.

Esto permite revisar datos del run sin entrar a logs.

---

## Manejo de Cookiebot

El banner de Cookiebot se **pre-acepta a nivel de contexto** desde `fixtures/test-fixtures.ts`, inyectando la cookie `CookieConsent` con el formato propio de Cookiebot (no JSON estándar — usa sintaxis JS literal con `%27` para comillas simples y `%2C` para comas). De este modo el banner nunca aparece y los tests no pierden tiempo cerrándolo. Como red de seguridad, `ConciliationsPage.dismissCookiesBanner()` cierra el banner si volviera a aparecer.

---

## Configuración de navegadores

`playwright.config.ts` define:

- **Chromium:** abre maximizado (`--start-maximized` + `viewport: null`).
- **Firefox / WebKit:** viewport fijo `1920x1080`.
- **Retries:** 2 en CI, 0 en local.
- **Traces:** capturadas en el primer retry.
- **Screenshots:** solo en fallos.
- **Videos:** retenidos solo en fallos.
- **Reporter:** HTML (`playwright-report/`) + lista en consola.

---

## CI/CD

GitHub Actions corre la suite en cada push y pull request a `main` / `master`. El workflow:

- Cachea los browsers de Playwright para acelerar runs sucesivos.
- Ejecuta la matriz Chromium / Firefox / WebKit en paralelo.
- Sube el reporte HTML y los traces como artifacts en caso de fallo.

Ver `.github/workflows/playwright.yml`.

---

## Portabilidad entre máquinas

Este proyecto está pensado para **moverse limpiamente entre máquina personal y máquina de trabajo**:

1. Clonar / copiar el repo.
2. `npm ci` → instala únicamente `@playwright/test`, `@types/node` y `dotenv`.
3. `npx playwright install` → descarga los browsers.
4. Crear `.env` local con credenciales del entorno destino.
5. `npx playwright test` → corre la suite.

**No hay ninguna dependencia oculta de MCP, agentes IA u otras herramientas externas.** El código fuente es 100% Playwright + TypeScript estándar.

---

## Solución de problemas

| Problema | Solución |
|---|---|
| `playwright install` falla por proxy | Configurar `HTTPS_PROXY` o usar un mirror corporativo |
| Tests fallan con timeout | Subir `actionTimeout` / `navigationTimeout` en `playwright.config.ts` |
| `.env` no se carga | Verificar que existe en raíz y que `dotenv/config` se importa en `playwright.config.ts` |
| Browsers obsoletos | Re-ejecutar `npx playwright install` tras `npm update` |

---

## Recursos

- [Documentación oficial de Playwright](https://playwright.dev/)
- [Best Practices](https://playwright.dev/docs/best-practices)
- [Azure AD B2C](https://learn.microsoft.com/azure/active-directory-b2c/)
