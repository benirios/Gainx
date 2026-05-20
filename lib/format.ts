const PT_BR = 'pt-BR'

export function formatDate(value: string | null | undefined): string {
  if (!value) return '-'
  return new Intl.DateTimeFormat(PT_BR, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value))
}

export function formatDateLong(value: string | null | undefined): string {
  if (!value) return '-'
  return new Intl.DateTimeFormat(PT_BR, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(value))
}

export function formatDatetime(value: string | null | undefined): string {
  if (!value) return '-'
  return new Intl.DateTimeFormat(PT_BR, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))
}

export function formatDatetimeFull(value: string | null | undefined): string {
  if (!value) return '-'
  return new Intl.DateTimeFormat(PT_BR, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))
}

export function formatMoney(value: number | null | undefined): string | null {
  if (value === null || value === undefined) return null
  return new Intl.NumberFormat(PT_BR, {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
  }).format(value)
}

export function formatNumber(value: number | null | undefined): string {
  if (value === null || value === undefined) return '-'
  return new Intl.NumberFormat(PT_BR, { maximumFractionDigits: 0 }).format(value)
}

type BudgetHolder = {
  budget_min: string | number | null | undefined
  budget_max: string | number | null | undefined
}

export function formatBudget(investor: BudgetHolder): string {
  const min = investor.budget_min
    ? `R$ ${Number(investor.budget_min).toLocaleString(PT_BR)}`
    : 'Qualquer'
  const max = investor.budget_max
    ? `R$ ${Number(investor.budget_max).toLocaleString(PT_BR)}`
    : 'Qualquer'
  return `${min} - ${max}`
}
