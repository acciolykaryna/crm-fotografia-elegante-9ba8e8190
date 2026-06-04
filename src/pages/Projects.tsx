import { useMemo } from 'react'
import { Calendar as CalendarIcon, Clock, CheckCircle2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import useCrmStore, { crmActions, ProjectStatus, Project } from '@/stores/useCrmStore'
import { useToast } from '@/hooks/use-toast'

const KANBAN_COLUMNS: { id: ProjectStatus; title: string; color: string }[] = [
  { id: 'Lead', title: 'Lead', color: 'bg-slate-100 text-slate-700' },
  { id: 'Contrato Assinado', title: 'Contratado', color: 'bg-blue-100 text-blue-700' },
  { id: 'Agendado', title: 'Agendado', color: 'bg-amber-100 text-amber-700' },
  { id: 'Pós-Produção', title: 'Edição', color: 'bg-purple-100 text-purple-700' },
  { id: 'Entregue', title: 'Entregue', color: 'bg-emerald-100 text-emerald-700' },
]

export default function Projects() {
  const { projects, clients } = useCrmStore()
  const { toast } = useToast()

  const handleStatusChange = (projectId: string, newStatus: ProjectStatus) => {
    crmActions.updateProjectStatus(projectId, newStatus)
    if (newStatus === 'Entregue') {
      toast({
        title: 'Ensaio Entregue!',
        description: 'Notificação de entrega pode ser enviada ao cliente.',
      })
    }
  }

  const projectsByColumn = useMemo(() => {
    const map = new Map<ProjectStatus, Project[]>()
    KANBAN_COLUMNS.forEach((col) => map.set(col.id, []))
    projects.forEach((p) => {
      if (map.has(p.status)) {
        map.get(p.status)!.push(p)
      }
    })
    return map
  }, [projects])

  return (
    <div className="page-container h-[calc(100vh-4rem)] flex flex-col space-y-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-3xl font-serif font-bold text-foreground">Ensaios e Projetos</h1>
          <p className="text-muted-foreground mt-1">Acompanhe o progresso do seu trabalho.</p>
        </div>
      </div>

      <div className="flex-1 overflow-x-auto pb-4">
        <div className="flex gap-4 h-full min-w-max items-start">
          {KANBAN_COLUMNS.map((col) => (
            <div
              key={col.id}
              className="w-80 flex flex-col h-full bg-secondary/30 rounded-xl border border-border/50"
            >
              <div className="p-3 border-b border-border/50 flex items-center justify-between bg-card/50 rounded-t-xl shrink-0">
                <div className="flex items-center gap-2">
                  <Badge
                    variant="secondary"
                    className={`font-medium ${col.color} border-transparent`}
                  >
                    {col.title}
                  </Badge>
                  <span className="text-xs text-muted-foreground font-medium">
                    {projectsByColumn.get(col.id)?.length || 0}
                  </span>
                </div>
              </div>
              <div className="p-3 flex-1 overflow-y-auto space-y-3">
                {projectsByColumn.get(col.id)?.map((project) => {
                  const client = clients.find((c) => c.id === project.clientId)
                  return (
                    <div
                      key={project.id}
                      className="bg-card rounded-lg p-3 shadow-sm border border-border/60 hover:border-primary/30 transition-colors group"
                    >
                      {project.imageUrl && (
                        <div className="h-28 w-full rounded-md bg-muted mb-3 overflow-hidden">
                          <img
                            src={project.imageUrl}
                            alt=""
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        </div>
                      )}
                      <h4 className="font-semibold text-sm line-clamp-1">{project.title}</h4>
                      <p className="text-xs text-muted-foreground mt-1 mb-3">{client?.name}</p>

                      {project.date && (
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-3 bg-secondary/50 w-fit px-2 py-1 rounded-md">
                          <CalendarIcon className="h-3 w-3" />
                          {new Date(project.date).toLocaleDateString('pt-BR')}
                        </div>
                      )}

                      {project.status === 'Pós-Produção' && (
                        <div className="space-y-1.5 mb-3">
                          <div className="flex justify-between text-[10px] font-medium text-muted-foreground">
                            <span>Progresso</span>
                            <span>{project.progress}%</span>
                          </div>
                          <Progress value={project.progress} className="h-1.5" />
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
          ))}
        </div>
      </div>
    </div>
  )
}
