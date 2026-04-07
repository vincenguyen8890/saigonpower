export type CRMRole = 'admin' | 'office_manager' | 'csr' | 'agent'

export const ROLE_LABELS: Record<CRMRole, string> = {
  admin:          'Administrator',
  office_manager: 'Office Manager',
  csr:            'CSR',
  agent:          'Sales Agent',
}

export const ROLE_COLORS: Record<CRMRole, { bg: string; text: string; border: string }> = {
  admin:          { bg: 'bg-amber-50',    text: 'text-amber-700',  border: 'border-amber-200'  },
  office_manager: { bg: 'bg-blue-50',     text: 'text-blue-700',   border: 'border-blue-200'   },
  csr:            { bg: 'bg-purple-50',   text: 'text-purple-700', border: 'border-purple-200' },
  agent:          { bg: 'bg-[#E8FFF1]',   text: 'text-[#00A846]',  border: 'border-[#A3F0C4]' },
}

// Feature keys used to gate access
export type Feature =
  | 'agents'        // Sales Agents page
  | 'reports'       // Reports page
  | 'accounting'    // Accounting page
  | 'automation'    // Automation page
  | 'providers'     // Providers catalog
  | 'plans'         // Plans catalog
  | 'rfp'           // Rate RFPs
  | 'ai_manager'    // AI Manager
  | 'users'         // Users admin page (admin-only)
  | 'settings'      // Settings page (admin-only)
  | 'bulk_import'   // Import leads
  | 'delete_leads'  // Delete leads
  | 'delete_deals'  // Delete deals
  | 'commission'    // Commission tab

const ACCESS: Record<Feature, CRMRole[]> = {
  agents:       ['admin', 'office_manager'],
  reports:      ['admin', 'office_manager', 'agent'],
  accounting:   ['admin', 'office_manager'],
  automation:   ['admin', 'office_manager'],
  providers:    ['admin', 'office_manager'],
  plans:        ['admin', 'office_manager'],
  rfp:          ['admin', 'office_manager', 'csr'],
  ai_manager:   ['admin', 'office_manager', 'agent'],
  users:        ['admin'],
  settings:     ['admin'],
  bulk_import:  ['admin', 'office_manager', 'csr'],
  delete_leads: ['admin', 'office_manager'],
  delete_deals: ['admin', 'office_manager'],
  commission:   ['admin', 'office_manager', 'agent'],
}

export function can(role: CRMRole, feature: Feature): boolean {
  return ACCESS[feature]?.includes(role) ?? false
}

export function isAdmin(role: CRMRole): boolean {
  return role === 'admin'
}

export function isAdminOrManager(role: CRMRole): boolean {
  return role === 'admin' || role === 'office_manager'
}
