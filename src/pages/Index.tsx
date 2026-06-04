import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  Calendar,
  DollarSign,
  Baby,
  ArrowRight,
  AlertCircle,
  AlertTriangle,
  Users,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import useCrmStore from '@/stores/useCrmStore'

export default function Index() {
  const { projects, clients, alerts, currentUser, users, tenant } = useCrmStore()

  const isAdmin = currentUser.role === 'admin'

  const visibleProjects = useMemo(() => {
    if (isAdmin) return projects.filter((p) => !p.deleted)
    return projects.filter((p) => !p.deleted && p.assignedPhotographerId === currentUser.id)
  }, [projects, isAdmin, currentUser.id])

  const currentMonthStr = new Date().toISOString().slice(0, 7)
  let receivedThisMonth = 0
  let expectedThisMonth = 0
  let overdueTotal = 0

  visibleProjects.forEach((p) => {
    p.installments.forEach((inst) => {
      if (inst.paid && inst.dueDate.startsWith(currentMonthStr)) {
        receivedThisMonth += inst.amount
      }
      if (!inst.paid) {
        if (inst.dueDate.startsWith(currentMonthStr)) expectedThisMonth += inst.amount
        if (new Date(inst.dueDate) < new Date(new Date().toISOString().split('T')[0]))
          overdueTotal += inst.amount
      }
    })
  })

  const activeOnCalls = visibleProjects.filter((p) => p.status === 'Sobreaviso ativo')
  const pendingAlerts = alerts.filter((a) => a.status === 'Pending').slice(0, 5)

  // Check Overlaps (Admin only)
  const overlapAlerts = useMemo(() => {
    if (!isAdmin) return []
    const onCalls = projects.filter((p) => !p.deleted && p.status === 'Sobreaviso ativo')
    const conflicts: any[] = []

    // Group by photographer and week
    const groups = new Map<string, typeof onCalls>()
    onCalls.forEach((p) => {
      if (!p.assignedPhotographerId) return
      if (!p.date) return
      // simplistic week grouping based on year-week
      const d = new Date(p.date)
      const week = `${d.getFullYear()}-${Math.ceil(d.getDate() / 7)}`
      const key = `${p.assignedPhotographerId}_${week}`
      if (!groups.has(key)) groups.set(key, [])
      groups.get(key)!.push(p)
    })

    groups.forEach((items, key) => {
      // Find overlaps where no backup is defined
      const noBackup = items.filter((i) => !i.backupPhotographerId)
      if (noBackup.length > 1) {
        const photoId = key.split('_')[0]
        const photo = users.find((u) => u.id === photoId)
        conflicts.push({ photographer: photo, count: noBackup.length, jobs: noBackup })
      }
    })
    return conflicts
  }, [projects, isAdmin, users])

  const metrics =
    isAdmin || currentUser.canViewFinance
      ? [
          {
            title: 'Receita Mês (Recebida)',
            value: `R$ ${receivedThisMonth.toLocaleString()}`,
            icon: DollarSign,
          },
          {
            title: 'A Receber (Mês)',
            value: `R$ ${expectedThisMonth.toLocaleString()}`,
            icon: Calendar,
          },
          {
            title: 'Total em Atraso',
            value: `R$ ${overdueTotal.toLocaleString()}`,
            icon: AlertCircle,
          },
          { title: 'Partos em Sobreaviso', value: activeOnCalls.length.toString(), icon: Baby },
        ]
      : [
          {
            title: 'Meus Jobs Ativos',
            value: visibleProjects
              .filter((p) => !['Concluído', 'Arquivado'].includes(p.status))
              .length.toString(),
            icon: Calendar,
          },
          { title: 'Meus Partos', value: activeOnCalls.length.toString(), icon: Baby },
        ]

  return (
    <div className="page-container space-y-8 p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-foreground">
            Bom dia, {currentUser.name.split(' ')[0]}
          </h1>
          <p className="text-muted-foreground mt-1">
            Aqui está o resumo da {isAdmin ? 'sua empresa' : 'sua agenda'} hoje.
          </p>
        </div>
        <Button asChild className="rounded-full shadow-subtle">
          <Link to="/projetos">Novo Job</Link>
        </Button>
      </div>

      {overlapAlerts.length > 0 && (
        <div className="bg-destructive/10 border border-destructive/30 rounded-xl p-4 flex items-start gap-4">
          <AlertTriangle className="h-6 w-6 text-destructive shrink-0" />
          <div>
            <h3 className="font-semibold text-destructive">Alerta de Sobreposição de Partos</h3>
            <p className="text-sm text-destructive/90 mt-1">
              Detectamos múltiplos partos na mesma semana para o mesmo fotógrafo sem backup
              definido.
            </p>
            <div className="mt-3 space-y-2">
              {overlapAlerts.map((c, i) => (
                <div key={i} className="text-sm flex items-center gap-2">
                  <Avatar className="h-5 w-5">
                    <AvatarImage src={c.photographer?.avatar} />
                  </Avatar>
                  <strong>{c.photographer?.name}</strong> tem {c.count} partos concorrentes.
                  <Button
                    variant="link"
                    asChild
                    className="h-auto p-0 text-destructive underline ml-2"
                  >
                    <Link to="/sobreaviso">Atribuir backups</Link>
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric, i) => (
          <Card key={i} className="card-hover border-border/60 bg-background/50 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {metric.title}
              </CardTitle>
              <metric.icon className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metric.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-border/60 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="font-serif text-xl">
              {isAdmin ? 'Sobreaviso Ativo (Estúdio)' : 'Meus Partos em Sobreaviso'}
            </CardTitle>
            <Button variant="ghost" size="sm" asChild className="text-muted-foreground">
              <Link to="/sobreaviso" className="flex items-center gap-1">
                Ver todos <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-6">
            {activeOnCalls.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Nenhum parto em sobreaviso no momento.
              </p>
            ) : (
              activeOnCalls.map((shoot) => {
                const client = clients.find((c) => c.id === shoot.clientId)
                const assigned = users.find((u) => u.id === shoot.assignedPhotographerId)
                return (
                  <div key={shoot.id} className="flex items-center gap-4 group">
                    <div className="h-12 w-12 rounded-lg bg-secondary/50 flex flex-col items-center justify-center text-primary shrink-0 border border-border/50 transition-colors group-hover:bg-primary/10">
                      <Baby className="h-5 w-5" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex justify-between items-start">
                        <p className="text-sm font-medium leading-none">{shoot.title}</p>
                        {isAdmin && assigned && (
                          <Badge variant="outline" className="text-[10px] ml-2 font-normal">
                            {assigned.name.split(' ')[0]}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {client?.name} • DPP:{' '}
                        {shoot.date ? new Date(shoot.date).toLocaleDateString('pt-BR') : '--'}
                      </p>
                    </div>
                  </div>
                )
              })
            )}
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-sm bg-[#fafaf8]">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="font-serif text-xl text-foreground">Próximos Alertas</CardTitle>
            <Button variant="ghost" size="sm" asChild className="text-muted-foreground">
              <Link to="/alertas" className="flex items-center gap-1">
                Ver todos <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-6">
            {pendingAlerts.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhum alerta pendente.</p>
            ) : (
              pendingAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className="relative flex gap-4 pl-4 before:absolute before:left-[7px] before:top-2 before:bottom-[-24px] before:w-[2px] before:bg-border last:before:hidden"
                >
                  <div className="absolute left-0 top-1.5 h-4 w-4 rounded-full border-2 border-background bg-primary" />
                  <div className="flex-1 space-y-1">
                    <p className="text-sm text-foreground">{alert.title}</p>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        {new Date(alert.dueDate).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
