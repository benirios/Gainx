export const WORKFLOW_STATUSES = [
  'suggested',
  'saved',
  'sent',
  'interested',
  'rejected',
  'negotiating',
  'closed',
] as const

export type WorkflowStatus = typeof WORKFLOW_STATUSES[number]

export const WORKFLOW_STATUS_LABELS: Record<WorkflowStatus, string> = {
  suggested: 'Sugerida',
  saved: 'Salva',
  sent: 'Enviada',
  interested: 'Interessado',
  rejected: 'Rejeitada',
  negotiating: 'Negociando',
  closed: 'Fechada',
}

export function normalizeWorkflowStatus(value: string | null | undefined): WorkflowStatus {
  return (WORKFLOW_STATUSES as readonly string[]).includes(value as string)
    ? (value as WorkflowStatus)
    : 'suggested'
}

export function workflowStatusVariant(status: string) {
  if (['saved', 'sent', 'interested', 'negotiating', 'closed'].includes(status)) return 'default' as const
  if (status === 'rejected') return 'secondary' as const
  return 'outline' as const
}
