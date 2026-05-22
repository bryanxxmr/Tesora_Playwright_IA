import type { TestInfo } from '@playwright/test';
import { logger } from '@utils/logger';
import type { ConciliationData, MonthOperationsSummary } from '@pages/ConciliationsPage';

export async function reportConciliation(
  testInfo: TestInfo,
  data: ConciliationData,
): Promise<void> {
  const { operacion, comprobante, status, statusLabel, statusPercent } = data;

  testInfo.annotations.push(
    { type: 'Operación', description: operacion },
    { type: 'Comprobante', description: comprobante },
    { type: 'Estado', description: `${status} (${statusLabel} ${statusPercent})` },
  );

  await testInfo.attach('datos-conciliacion', {
    body: JSON.stringify(data, null, 2),
    contentType: 'application/json',
  });

  logger.info(
    `✅ Conciliación → ${operacion} | ${comprobante} | ${status} (${statusPercent})`,
  );
}

export async function reportRegisteredCashIncome(
  testInfo: TestInfo,
  data: { importe: string; numeroOperacion: string },
): Promise<void> {
  testInfo.annotations.push(
    { type: 'Importe registrado', description: data.importe },
    { type: 'N° Operación', description: data.numeroOperacion },
  );
  await testInfo.attach('ingreso-efectivo-registrado', {
    body: JSON.stringify(data, null, 2),
    contentType: 'application/json',
  });
  logger.info(`✅ Ingreso efectivo registrado → importe ${data.importe} | operación ${data.numeroOperacion}`);
}

export async function reportWeekOperationsCount(
  testInfo: TestInfo,
  total: number,
): Promise<void> {
  testInfo.annotations.push({
    type: 'Operaciones (Esta semana)',
    description: String(total),
  });
  await testInfo.attach('operaciones-semana', {
    body: JSON.stringify({ filtro: 'Esta semana', total }, null, 2),
    contentType: 'application/json',
  });
  logger.info(`✅ Operaciones cargadas en "Esta semana" → ${total}`);
}

export async function reportDateFilterOperations(
  testInfo: TestInfo,
  filtro: string,
  summary: MonthOperationsSummary,
  attachmentName: string,
): Promise<void> {
  const { totalReportado, conNumeroOperacion, sinNumeroOperacion } = summary;

  testInfo.annotations.push(
    { type: `Total reportado (${filtro})`, description: String(totalReportado) },
    { type: 'Con N° operación', description: String(conNumeroOperacion) },
    { type: 'Sin N° operación', description: String(sinNumeroOperacion) },
  );
  await testInfo.attach(attachmentName, {
    body: JSON.stringify({ filtro, ...summary }, null, 2),
    contentType: 'application/json',
  });
  logger.info(
    `✅ Operaciones "${filtro}" → total: ${totalReportado} | con n°: ${conNumeroOperacion} | sin n°: ${sinNumeroOperacion}`,
  );
}

export async function reportMonthOperationsCount(
  testInfo: TestInfo,
  summary: MonthOperationsSummary,
): Promise<void> {
  await reportDateFilterOperations(testInfo, 'Este mes', summary, 'operaciones-mes');
}

export async function reportLast30DaysOperationsCount(
  testInfo: TestInfo,
  summary: MonthOperationsSummary,
): Promise<void> {
  await reportDateFilterOperations(testInfo, 'Últimos 30 días', summary, 'operaciones-30-dias');
}

export async function reportSearchedOperation(
  testInfo: TestInfo,
  operacion: string,
): Promise<void> {
  testInfo.annotations.push({ type: 'Operación encontrada', description: operacion });
  await testInfo.attach('operacion-buscada', {
    body: JSON.stringify({ operacion }, null, 2),
    contentType: 'application/json',
  });
  logger.info(`✅ Operación encontrada → ${operacion}`);
}

export async function reportHiddenIncome(
  testInfo: TestInfo,
  operacion: string,
): Promise<void> {
  testInfo.annotations.push({ type: 'Operación ocultada', description: operacion });
  await testInfo.attach('ingreso-ocultado', {
    body: JSON.stringify({ operacion }, null, 2),
    contentType: 'application/json',
  });
  logger.info(`✅ Ingreso ocultado → ${operacion}`);
}
