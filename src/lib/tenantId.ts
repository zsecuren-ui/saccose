import { isUuid } from './uuid';

export const normalizeTenantId = (value: unknown): string | undefined => {
  if (typeof value !== 'string') return undefined;

  const normalized = value.trim();
  return isUuid(normalized) ? normalized : undefined;
};
