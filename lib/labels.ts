export const STRATEGY_LABELS: Record<string, string> = {
  any: 'Qualquer',
  rental_income: 'Renda de aluguel',
  retail: 'Varejo',
  warehouse_logistics: 'Galpão / logística',
  food_beverage: 'Alimentação',
  pharmacy: 'Farmácia',
  gym_fitness: 'Academia / fitness',
  flip: 'Revenda',
  own_business: 'Negócio próprio',
  land_banking: 'Reserva de terreno',
}

export const RISK_LABELS: Record<string, string> = {
  any: 'Qualquer',
  low: 'Baixo',
  medium: 'Médio',
  high: 'Alto',
}

export const CONFIDENCE_LABELS: Record<string, string> = {
  low: 'baixa',
  medium: 'média',
  high: 'alta',
}

export const MATCH_STRENGTH_LABELS: Record<string, string> = {
  strong: 'Forte',
  medium: 'Médio',
  weak: 'Fraco',
}

export const ENRICHMENT_STATUS_LABELS: Record<string, string> = {
  pending: 'Pendente',
  processing: 'Processando',
  completed: 'Concluído',
  failed: 'Falhou',
}

export function confidenceVariant(confidence: string | null | undefined) {
  if (confidence === 'high') return 'default' as const
  if (confidence === 'medium') return 'outline' as const
  return 'secondary' as const
}

export function matchStrengthVariant(status: string | null | undefined) {
  if (status === 'strong') return 'default' as const
  if (status === 'medium') return 'outline' as const
  return 'secondary' as const
}
