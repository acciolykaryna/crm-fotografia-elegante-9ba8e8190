import { useState } from 'react'
import { Phone, CalendarHeart, Baby, MessageSquare } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import useCrmStore, { crmActions, Project } from '@/stores/useCrmStore'
import { SendMessageDialog } from '@/components/SendMessageDialog'

export default function OnCall() {
  const { projects, clients, users, currentUser } = useCrmStore()
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [messageProject, setMessageProject] = useState<Project | null>(null)

  const isAdmin = currentUser.role === 'admin'

  const onCallProjects = projects
    .filter((p) => !p.deleted && p.type === 'Parto' && p.status === 'Sobreaviso ativo')
    .filter((p) => isAdmin || p.assignedPhotographerId === currentUser.id)
    .sort((a, b) => new Date(a.date || '').getTime() - new Date(b.date || '').getTime())

  const handleAssignBackup = (projectId: string, backupId: string) => {
    crmActions.updateProject(projectId, { backupPhotographerId: backupId })
  }

  const getGestationalWeek = (dpp?: string) => {
    if (!dpp) return 0
    const dppDate = new Date(dpp)
    const today = new Date()
    const diffDays = Math.ceil((dppDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    const weeksLeft = diffDays / 7
    return Math.floor(40 - weeksLeft)
  }

  const handleRegisterBirth = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (selectedProject) {
      const birthDate = new FormData(e.currentTarget).get('birthDate') as string
      crmActions.registerBirth(selectedProject.id, birthDate)
      setSelectedProject(null)
    }
  }

  return (
    <div className="page-container space-y-6 p-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-3xl font-serif font-bold text-foreground">Sobreaviso</h1>
        <p className="text-muted-foreground mt-1">Gestão de partos ativos. Acionamento rápido.</p>
      </div>

      <div className="space-y-4">
        {onCallProjects.length === 0 ? (
          <div className="text-center p-12 bg-secondary/20 rounded-xl border border-dashed border-border/60">
            <Baby className="h-8 w-8 mx-auto text-muted-foreground mb-4 opacity-50" />
            <p className="text-muted-foreground">Nenhum parto em sobreaviso ativo no momento.</p>
          </div>
        ) : (
          onCallProjects.map((project) => {
            const client = clients.find((c) => c.id === project.clientId)
            const gWeek = getGestationalWeek(project.date)

            return (
              <Card key={project.id} className="border-rose-200 shadow-sm overflow-hidden">
                <div className="h-2 bg-rose-500 w-full" />
                <CardContent className="p-5">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-serif text-xl font-bold">{client?.name}</h3>
                      <p className="text-sm text-muted-foreground mb-2">
                        DPP:{' '}
                        {project.date ? new Date(project.date).toLocaleDateString('pt-BR') : '--'} •{' '}
                        {project.maternity || 'Maternidade não definida'}
                      </p>
                      {isAdmin && (
                        <div className="flex items-center gap-2 mt-2 bg-secondary/30 p-2 rounded-md w-fit text-sm">
                          <span className="text-muted-foreground">Titular:</span>
                          <span className="font-medium">
                            {users.find((u) => u.id === project.assignedPhotographerId)?.name ||
                              'Não definido'}
                          </span>
                          <span className="text-muted-foreground ml-2">Backup:</span>
                          <select
                            className="bg-transparent border-b border-border text-sm font-medium focus:outline-none"
                            value={project.backupPhotographerId || ''}
                            onChange={(e) => handleAssignBackup(project.id, e.target.value)}
                          >
                            <option value="">Selecione...</option>
                            {users.map((u) => (
                              <option key={u.id} value={u.id}>
                                {u.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}
                    </div>
                    <Badge
                      variant="secondary"
                      className="bg-rose-100 text-rose-700 hover:bg-rose-200 text-sm py-1"
                    >
                      {gWeek} Semanas
                    </Badge>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 mt-6">
                    <Button
                      className="flex-1 bg-green-600 hover:bg-green-700 gap-2 text-white"
                      onClick={() => setMessageProject(project)}
                    >
                      <MessageSquare className="h-4 w-4" /> Acionar Família
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1 gap-2 border-rose-200 text-rose-700 hover:bg-rose-50 hover:text-rose-800"
                      onClick={() => setSelectedProject(project)}
                    >
                      <CalendarHeart className="h-4 w-4" /> Registrar Parto
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>

      <SendMessageDialog
        client={
          messageProject ? clients.find((c) => c.id === messageProject.clientId) || null : null
        }
        project={messageProject}
        open={!!messageProject}
        onOpenChange={(o) => !o && setMessageProject(null)}
      />

      <Dialog open={!!selectedProject} onOpenChange={(o) => !o && setSelectedProject(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-serif">Registrar Parto Realizado</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleRegisterBirth} className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label>Data e Hora do Nascimento</Label>
              <Input
                type="datetime-local"
                name="birthDate"
                required
                defaultValue={new Date().toISOString().slice(0, 16)}
              />
            </div>
            <DialogFooter>
              <Button type="submit" className="w-full">
                Confirmar e Criar Job Newborn
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
