import { useSyncExternalStore } from 'react'

export type ServiceType = 'Parto' | 'Gestante' | 'Newborn' | 'Família' | 'Outro' | string
export type LeadSource =
  | 'Instagram (Orgânico)'
  | 'Instagram (Anúncio)'
  | 'Indicação'
  | 'Google'
  | 'Maternidade Parceira'
  | 'Feira/Evento'
  | 'Outro'

export type ProjectStatus =
  | 'Lead'
  | 'Proposta enviada'
  | 'Contratado'
  | 'Sobreaviso ativo'
  | 'Parto realizado'
  | 'Sessão agendada'
  | 'Sessão realizada'
  | 'Edição'
  | 'Galeria entregue'
  | 'Concluído'
  | 'Arquivado'

export interface Child {
  id: string
  name: string
  birthDate: string
}

export interface Client {
  id: string
  name: string
  whatsapp: string
  backupPhone?: string
  partnerName?: string
  children: Child[]
  source: LeadSource
  referredById?: string
  tags: string[]
  createdAt: string
  deleted?: boolean
}

export interface PaymentInstallment {
  id: string
  amount: number
  dueDate: string
  paid: boolean
}

export interface Project {
  id: string
  clientId: string
  title: string
  type: ServiceType
  status: ProjectStatus
  date?: string
  maternity?: string
  totalValue: number
  installments: PaymentInstallment[]
  createdAt: string
  linkedNewbornId?: string
  deleted?: boolean
  progress: number
  imageUrl?: string
  assignedPhotographerId?: string
  backupPhotographerId?: string
}

export interface MessageTemplate {
  id: string
  name: string
  body: string
  category?: string
}

export interface Alert {
  id: string
  clientId: string
  projectId?: string
  type:
    | 'Birthday'
    | 'Anniversary'
    | 'Session Anniversary'
    | 'Baby Milestone'
    | 'Follow-up'
    | 'Payment'
    | 'System'
  title: string
  dueDate: string
  status: 'Pending' | 'Completed' | 'Snoozed' | 'Ignored'
}

export interface User {
  id: string
  name: string
  email: string
  role: 'admin' | 'member'
  avatar: string
  color: string
  active: boolean
  roles: string[]
  canViewFinance: boolean
}

export interface Tenant {
  id: string
  name: string
  logo: string
  primaryColor: string
  services: ServiceType[]
  isOnboarded: boolean
}

interface CrmState {
  tenant: Tenant
  currentUser: User
  users: User[]
  clients: Client[]
  projects: Project[]
  alerts: Alert[]
  templates: MessageTemplate[]
}

const today = new Date().toISOString().split('T')[0]
const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
const lastMonth = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

const defaultAdmin: User = {
  id: 'u1',
  name: 'Usuário',
  email: 'admin@exemplo.com',
  role: 'admin',
  avatar: '',
  color: '#D4AF37',
  active: true,
  roles: [],
  canViewFinance: true,
}

let state: CrmState = {
  tenant: {
    id: 't1',
    name: 'Estúdio',
    logo: '',
    primaryColor: '#eab308',
    services: ['Parto', 'Gestante', 'Newborn', 'Família'],
    isOnboarded: true,
  },
  currentUser: defaultAdmin,
  users: [defaultAdmin],
  clients: [],
  projects: [],
  alerts: [],
  templates: [],
}

const listeners = new Set<() => void>()
function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}
function getSnapshot() {
  return state
}
function setState(newState: Partial<CrmState>) {
  state = { ...state, ...newState }
  listeners.forEach((l) => l())
}

export const crmActions = {
  updateTenant: (updates: Partial<Tenant>) => {
    setState({ tenant: { ...state.tenant, ...updates } })
  },
  setCurrentUser: (userId: string) => {
    const user = state.users.find((u) => u.id === userId)
    if (user) setState({ currentUser: user })
  },
  addUser: (user: Omit<User, 'id'>) => {
    setState({
      users: [...state.users, { ...user, id: Math.random().toString(36).substr(2, 9) }],
    })
  },
  updateUser: (id: string, updates: Partial<User>) => {
    setState({ users: state.users.map((u) => (u.id === id ? { ...u, ...updates } : u)) })
  },
  addClient: (client: Omit<Client, 'id' | 'createdAt'>) => {
    const newClient = {
      ...client,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString(),
    }

    const newAlerts = [...state.alerts]
    client.children.forEach((child) => {
      if (child.birthDate) {
        newAlerts.push({
          id: Math.random().toString(36).substr(2, 9),
          clientId: newClient.id,
          type: 'Birthday',
          title: `Aniversário de ${child.name}`,
          dueDate: child.birthDate,
          status: 'Pending',
        })
      }
    })

    setState({ clients: [...state.clients, newClient], alerts: newAlerts })
    return newClient
  },
  softDeleteClient: (id: string) => {
    setState({ clients: state.clients.map((c) => (c.id === id ? { ...c, deleted: true } : c)) })
  },
  addProject: (project: Omit<Project, 'id' | 'createdAt' | 'progress'>) => {
    setState({
      projects: [
        ...state.projects,
        {
          ...project,
          id: Math.random().toString(36).substr(2, 9),
          createdAt: new Date().toISOString(),
          progress: 0,
        },
      ],
    })
  },
  updateProject: (id: string, updates: Partial<Project>) => {
    setState({ projects: state.projects.map((p) => (p.id === id ? { ...p, ...updates } : p)) })
  },
  updateProjectStatus: (id: string, status: ProjectStatus) => {
    setState({ projects: state.projects.map((p) => (p.id === id ? { ...p, status } : p)) })
  },
  softDeleteProject: (id: string) => {
    setState({ projects: state.projects.map((p) => (p.id === id ? { ...p, deleted: true } : p)) })
  },
  resolveAlert: (id: string, status: Alert['status']) => {
    setState({ alerts: state.alerts.map((a) => (a.id === id ? { ...a, status } : a)) })
  },
  registerBirth: (projectId: string, birthDate: string) => {
    const parto = state.projects.find((p) => p.id === projectId)
    if (parto) {
      const newbornDate = new Date(new Date(birthDate).getTime() + 10 * 24 * 60 * 60 * 1000)
      const newborn: Project = {
        id: Math.random().toString(36).substr(2, 9),
        clientId: parto.clientId,
        title: `Newborn - Filho(a) de ${state.clients.find((c) => c.id === parto.clientId)?.name}`,
        type: 'Newborn',
        status: 'Sessão agendada',
        date: newbornDate.toISOString().split('T')[0],
        totalValue: 0,
        installments: [],
        createdAt: new Date().toISOString(),
        progress: 0,
        assignedPhotographerId: parto.assignedPhotographerId,
      }
      setState({
        projects: [
          ...state.projects.map((p) =>
            p.id === projectId ? { ...p, status: 'Parto realizado' } : p,
          ),
          newborn,
        ],
      })
    }
  },
  addTemplate: (template: Omit<MessageTemplate, 'id'>) => {
    setState({
      templates: [...state.templates, { ...template, id: Math.random().toString(36).substr(2, 9) }],
    })
  },
  updateTemplate: (id: string, updates: Partial<MessageTemplate>) => {
    setState({
      templates: state.templates.map((t) => (t.id === id ? { ...t, ...updates } : t)),
    })
  },
  deleteTemplate: (id: string) => {
    setState({
      templates: state.templates.filter((t) => t.id !== id),
    })
  },
}

export default function useCrmStore() {
  return useSyncExternalStore(subscribe, getSnapshot)
}
