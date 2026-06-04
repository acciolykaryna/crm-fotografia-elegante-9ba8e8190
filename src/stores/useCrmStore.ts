import { useSyncExternalStore } from 'react'

export type ProjectStatus =
  | 'Lead'
  | 'Contrato Assinado'
  | 'Agendado'
  | 'Pós-Produção'
  | 'Entregue'
  | 'Arquivado'

export interface Client {
  id: string
  name: string
  email: string
  phone: string
  lastSessionDate?: string
  nextImportantDate?: string
  status: 'Ativo' | 'Inativo'
}

export interface Project {
  id: string
  clientId: string
  title: string
  type: string
  date?: string
  status: ProjectStatus
  progress: number
  imageUrl?: string
}

interface CrmState {
  clients: Client[]
  projects: Project[]
}

let state: CrmState = {
  clients: [
    {
      id: '1',
      name: 'Maria Silva',
      email: 'maria@exemplo.com',
      phone: '(11) 99999-1111',
      lastSessionDate: '2023-05-15',
      nextImportantDate: '2024-05-15',
      status: 'Ativo',
    },
    {
      id: '2',
      name: 'João Santos',
      email: 'joao@exemplo.com',
      phone: '(11) 98888-2222',
      lastSessionDate: '2023-11-20',
      nextImportantDate: '2024-11-20',
      status: 'Ativo',
    },
    {
      id: '3',
      name: 'Ana Costa',
      email: 'ana@exemplo.com',
      phone: '(11) 97777-3333',
      status: 'Ativo',
    },
  ],
  projects: [
    {
      id: '1',
      clientId: '1',
      title: 'Casamento Maria & José',
      type: 'Casamento',
      date: '2024-05-15',
      status: 'Pós-Produção',
      progress: 60,
      imageUrl: 'https://img.usecurling.com/p/400/300?q=wedding&color=black',
    },
    {
      id: '2',
      clientId: '2',
      title: 'Ensaio Corporativo João',
      type: 'Corporativo',
      date: '2024-02-10',
      status: 'Entregue',
      progress: 100,
      imageUrl: 'https://img.usecurling.com/p/400/300?q=portrait&color=black',
    },
    {
      id: '3',
      clientId: '1',
      title: 'Bodas de Papel',
      type: 'Ensaio Casal',
      date: '2024-06-20',
      status: 'Agendado',
      progress: 0,
      imageUrl: 'https://img.usecurling.com/p/400/300?q=couple',
    },
    {
      id: '4',
      clientId: '3',
      title: 'Lead: Formatura',
      type: 'Formatura',
      status: 'Lead',
      progress: 0,
      imageUrl: 'https://img.usecurling.com/p/400/300?q=graduation',
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
  addClient: (client: Omit<Client, 'id'>) => {
    const newClient = { ...client, id: Math.random().toString(36).substr(2, 9) }
    setState({ clients: [...state.clients, newClient] })
    return newClient
  },
  addProject: (project: Omit<Project, 'id'>) => {
    setState({
      projects: [...state.projects, { ...project, id: Math.random().toString(36).substr(2, 9) }],
    })
  },
  updateProjectStatus: (id: string, status: ProjectStatus) => {
    setState({
      projects: state.projects.map((p) => (p.id === id ? { ...p, status } : p)),
    })
  },
}

export default function useCrmStore() {
  return useSyncExternalStore(subscribe, getSnapshot)
}
