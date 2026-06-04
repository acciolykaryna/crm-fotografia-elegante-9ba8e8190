import { useMemo, useState } from 'react'
import { Calendar as CalendarIcon, CheckCircle2, Plus, Filter } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import useCrmStore, { crmActions, ProjectStatus, ServiceType } from '@/stores/useCrmStore'
import { useToast } from '@/hooks/use-toast'

const KANBAN_COLUMNS: { id: ProjectStatus; title: string; color: string }[] = [
  { id: 'Lead', title: 'Lead', color: 'bg-slate-100 text-slate-700' },
  { id: 'Proposta enviada', title: 'Proposta', color: 'bg-slate-100 text-slate-700' },
  { id: 'Contratado', title: 'Contratado', color: 'bg-blue-100 text-blue-700' },
  { id: 'Sobreaviso ativo', title: 'Sobreaviso (Parto)', color: 'bg-rose-100 text-rose-700' },
  { id: 'Sessão agendada', title: 'Agendado', color: 'bg-amber-100 text-amber-700' },
  { id: 'Sessão realizada', title: 'Realizado (Sessão)', color: 'bg-indigo-100 text-indigo-700' },
  { id: 'Parto realizado', title: 'Realizado (Parto)', color: 'bg-indigo-100 text-indigo-700' },
  { id: 'Edição', title: 'Edição', color: 'bg-purple-100 text-purple-700' },
  { id: 'Galeria entregue', title: 'Entregue', color: 'bg-emerald-100 text-emerald-700' },
  { id: 'Concluído', title: 'Concluído', color: 'bg-emerald-100 text-emerald-700' },
]

export default function Projects() {
  const { projects, clients, users, currentUser, tenant } = useCrmStore()
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [type, setType] = useState<ServiceType>('Família')

  // Filters
  const [filterPhotographer, setFilterPhotographer] = useState<string>('all')
  const [filterService, setFilterService] = useState<string>('all')

  const handleStatusChange = (projectId: string, newStatus: ProjectStatus) => {
    crmActions.updateProjectStatus(projectId, newStatus)
    if (newStatus === 'Galeria entregue' || newStatus === 'Concluído') {
      toast({
        title: 'Trabalho Entregue/Concluído!',
        description: 'Lembre-se de enviar o link para feedback (NPS).',
      })
    }
  }

  const handleAddProject = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const totalValue = Number(formData.get('total'))
    const entryAmount = Number(formData.get('entry'))
    const date = formData.get('date') as string
    const assignedId = formData.get('assignedPhotographerId') as string

    crmActions.addProject({
      clientId: formData.get('clientId') as string,
      title: formData.get('title') as string,
      type,
      status: 'Lead',
      date,
      totalValue,
      assignedPhotographerId: assignedId || currentUser.id,
      installments: [
        {
          id: Math.random().toString(),
          amount: entryAmount,
          dueDate: new Date().toISOString().split('T')[0],
          paid: false,
        },
        {
          id: Math.random().toString(),
          amount: totalValue - entryAmount,
          dueDate: date || new Date().toISOString().split('T')[0],
          paid: false,
        },
      ],
    })
    setOpen(false)
    if (type === 'Parto') {
      toast({
        title: 'Lead de Parto criado',
        description: 'O sobreaviso será ativado quando contratado.',
      })
    }
  }

  const isAdmin = currentUser.role === 'admin'

  const filteredProjects = useMemo(() => {
    let list = projects.filter((p) => !p.deleted)

    if (!isAdmin) {
      list = list.filter((p) => p.assignedPhotographerId === currentUser.id)
    } else {
      if (filterPhotographer !== 'all') {
        list = list.filter((p) => p.assignedPhotographerId === filterPhotographer)
      }
    }

    if (filterService !== 'all') {
      list = list.filter((p) => p.type === filterService)
    }

    return list
  }, [projects, isAdmin, currentUser.id, filterPhotographer, filterService])

  const projectsByColumn = useMemo(() => {
    const map = new Map<ProjectStatus, typeof filteredProjects>()
    KANBAN_COLUMNS.forEach((col) => map.set(col.id, []))
    filteredProjects.forEach((p) => {
      if (map.has(p.status)) map.get(p.status)!.push(p)
    })
    return map
  }, [filteredProjects])

  return (
    <div className="page-container h-[calc(100vh-4rem)] flex flex-col space-y-6 p-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-3xl font-serif font-bold text-foreground">Ensaios e Projetos</h1>
          <p className="text-muted-foreground mt-1">Acompanhe o progresso de cada serviço.</p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {isAdmin && (
            <Select value={filterPhotographer} onValueChange={setFilterPhotographer}>
              <SelectTrigger className="w-[160px] bg-background">
                <SelectValue placeholder="Fotógrafo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos Equipe</SelectItem>
                {users.map((u) => (
                  <SelectItem key={u.id} value={u.id}>
                    {u.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          <Select value={filterService} onValueChange={setFilterService}>
            <SelectTrigger className="w-[140px] bg-background">
              <SelectValue placeholder="Serviço" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos Serviços</SelectItem>
              {tenant.services.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="rounded-full gap-2">
                <Plus className="h-4 w-4" /> Novo Job
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle className="font-serif">Criar Novo Job</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddProject} className="space-y-4 pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Cliente</Label>
                    <Select name="clientId" required>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione..." />
                      </SelectTrigger>
                      <SelectContent>
                        {clients
                          .filter((c) => !c.deleted)
                          .map((c) => (
                            <SelectItem key={c.id} value={c.id}>
                              {c.name}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Tipo de Serviço</Label>
                    <Select value={type} onValueChange={(v) => setType(v as ServiceType)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {tenant.services.map((t) => (
                          <SelectItem key={t} value={t}>
                            {t}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Título do Job</Label>
                  <Input name="title" required placeholder="Ex: Acompanhamento Trimestral" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{type === 'Parto' ? 'DPP (Prevista)' : 'Data da Sessão'}</Label>
                    <Input name="date" type="date" required />
                  </div>
                  {isAdmin && (
                    <div className="space-y-2">
                      <Label>Fotógrafo Principal</Label>
                      <Select name="assignedPhotographerId" defaultValue={currentUser.id}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {users
                            .filter((u) => u.active)
                            .map((u) => (
                              <SelectItem key={u.id} value={u.id}>
                                {u.name}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4 border-t pt-4">
                  <div className="space-y-2">
                    <Label>Valor Total (R$)</Label>
                    <Input name="total" type="number" required />
                  </div>
                  <div className="space-y-2">
                    <Label>Sinal / Entrada (R$)</Label>
                    <Input name="entry" type="number" required />
                  </div>
                </div>
                <DialogFooter className="pt-4">
                  <Button type="submit" className="w-full">
                    Criar Job
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="flex-1 overflow-x-auto pb-4 custom-scrollbar">
        <div className="flex gap-4 h-full min-w-max items-start">
          {KANBAN_COLUMNS.map((col) => {
            const colsProjects = projectsByColumn.get(col.id) || []
            if (
              colsProjects.length === 0 &&
              !['Lead', 'Proposta enviada', 'Contratado'].includes(col.id)
            )
              return null

            return (
              <div
                key={col.id}
                className="w-80 flex flex-col h-full bg-secondary/30 rounded-xl border border-border/50"
              >
                <div className="p-3 flex items-center justify-between bg-card/50 rounded-t-xl shrink-0">
                  <Badge
                    variant="secondary"
                    className={`font-medium ${col.color} border-transparent`}
                  >
                    {col.title}
                  </Badge>
                  <span className="text-xs text-muted-foreground font-medium">
                    {colsProjects.length}
                  </span>
                </div>
                <div className="p-3 flex-1 overflow-y-auto space-y-3">
                  {colsProjects.map((project) => {
                    const client = clients.find((c) => c.id === project.clientId)
                    const assignedPhoto = users.find((u) => u.id === project.assignedPhotographerId)
                    return (
                      <div
                        key={project.id}
                        className="bg-card rounded-lg p-3 shadow-sm border border-border/60 hover:border-primary/30 transition-colors"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-semibold text-sm line-clamp-1">{project.title}</h4>
                          <Badge variant="outline" className="text-[10px]">
                            {project.type}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between mb-3">
                          <p className="text-xs text-muted-foreground">{client?.name}</p>
                          {assignedPhoto && isAdmin && (
                            <Avatar
                              className="h-5 w-5 border border-border"
                              title={assignedPhoto.name}
                            >
                              <AvatarImage src={assignedPhoto.avatar} />
                              <AvatarFallback>{assignedPhoto.name[0]}</AvatarFallback>
                            </Avatar>
                          )}
                        </div>

                        {project.date && (
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-3 bg-secondary/50 w-fit px-2 py-1 rounded-md">
                            <CalendarIcon className="h-3 w-3" />
                            {new Date(project.date).toLocaleDateString('pt-BR')}
                          </div>
                        )}

                        <Select
                          value={project.status}
                          onValueChange={(v) => handleStatusChange(project.id, v as ProjectStatus)}
                        >
                          <SelectTrigger className="h-8 text-xs bg-transparent border-border/50">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {KANBAN_COLUMNS.map((c) => (
                              <SelectItem key={c.id} value={c.id} className="text-xs">
                                {c.title}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
