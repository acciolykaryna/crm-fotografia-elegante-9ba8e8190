import { useSyncExternalStore } from 'react'

export type ServiceType = 'Parto' | 'Gestante' | 'Newborn' | 'Família' | 'Outro'
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
}

export interface MessageTemplate {
  id: string
  name: string
  body: string
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
  title: string
  dueDate: string
  status: 'Pending' | 'Completed' | 'Snoozed' | 'Ignored'
}

interface CrmState {
  clients: Client[]
  projects: Project[]
  alerts: Alert[]
  templates: MessageTemplate[]
}

const today = new Date().toISOString().split('T')[0]
const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
const lastMonth = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

let state: CrmState = {
  clients: [
    {
      id: '1',
      name: 'Maria Silva',
      whatsapp: '11999991111',
      partnerName: 'José Silva',
      children: [{ id: 'c1', name: 'Pedro', birthDate: '2023-05-15' }],
      source: 'Instagram (Orgânico)',
      tags: ['vip', 'família'],
      createdAt: '2023-01-10',
    },
    {
      id: '2',
      name: 'Ana Costa',
      whatsapp: '11988882222',
      children: [],
      source: 'Indicação',
      referredById: '1',
      tags: ['parto', 'gestante'],
      createdAt: '2024-02-15',
    },
  ],
  projects: [
    {
      id: 'p1',
      clientId: '1',
      title: 'Acompanhamento 1 Ano Pedro',
      type: 'Família',
      status: 'Concluído',
      date: '2024-05-15',
      totalValue: 1200,
      installments: [{ id: 'i1', amount: 1200, dueDate: '2024-05-10', paid: true }],
      createdAt: '2024-03-01',
      progress: 100,
      imageUrl: 'https://img.usecurling.com/p/400/300?q=family',
    },
    {
      id: 'p2',
      clientId: '2',
      title: 'Parto Humanizado Ana',
      type: 'Parto',
      status: 'Sobreaviso ativo',
      date: nextWeek,
      maternity: 'Maternidade São Luiz',
      totalValue: 4500,
      installments: [
        { id: 'i2', amount: 1500, dueDate: lastMonth, paid: true },
        { id: 'i3', amount: 3000, dueDate: nextWeek, paid: false },
      ],
      createdAt: '2024-02-20',
      progress: 20,
      imageUrl: 'https://img.usecurling.com/p/400/300?q=baby',
    },
  ],
  alerts: [
    {
      id: 'a1',
      clientId: '1',
      type: 'Birthday',
      title: 'Aniversário de Pedro (1 ano)',
      dueDate: today,
      status: 'Pending',
    },
    {
      id: 'a2',
      clientId: '2',
      projectId: 'p2',
      type: 'Payment',
      title: 'Cobrança pendente - Parto Ana',
      dueDate: nextWeek,
      status: 'Pending',
    },
  ],
  templates: [
    {
      id: 't1',
      name: 'Boas-vindas',
      body: 'Olá {client_name}! Seja muito bem-vinda(o) à nossa família. Estamos muito felizes em ter você conosco.',
    },
    {
      id: 't2',
      name: 'Lembrete de Ensaio',
      body: 'Oi {client_name}, passando para lembrar do nosso ensaio de {shoot_type} programado para o dia {event_date}.',
    },
    {
      id: 't3',
      name: 'Feliz Aniversário (Bebê)',
      body: 'Parabéns {baby_name} pelo seu aniversário! 🎉 Um abraço especial para toda a família.',
    },
    {
      id: 't4',
      name: 'Reativar Cliente (Anual)',
      body: 'Oi {client_name}, já faz um tempo desde nosso último encontro! Que tal atualizarmos as fotos da família?',
    },
  ],
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
  addClient: (client: Omit<Client, 'id' | 'createdAt'>) => {
    const newClient = {
      ...client,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString(),
    }
    setState({ clients: [...state.clients, newClient] })
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
      const newborn: Project = {
        id: Math.random().toString(36).substr(2, 9),
        clientId: parto.clientId,
        title: `Newborn - Filho(a) de ${state.clients.find((c) => c.id === parto.clientId)?.name}`,
        type: 'Newborn',
        status: 'Sessão agendada',
        date: new Date(new Date(birthDate).getTime() + 10 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split('T')[0],
        totalValue: 0,
        installments: [],
        createdAt: new Date().toISOString(),
        progress: 0,
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
