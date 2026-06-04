import { Link } from 'react-router-dom'
import { Calendar, DollarSign, Baby, ArrowRight, AlertCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import useCrmStore from '@/stores/useCrmStore'

export default function Index() {
  const { projects, clients, alerts } = useCrmStore()

  const currentMonthStr = new Date().toISOString().slice(0, 7)
  let receivedThisMonth = 0
  let expectedThisMonth = 0
  let overdueTotal = 0

  projects
    .filter((p) => !p.deleted)
    .forEach((p) => {
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

  const activeOnCalls = projects.filter((p) => !p.deleted && p.status === 'Sobreaviso ativo')
  const pendingAlerts = alerts.filter((a) => a.status === 'Pending').slice(0, 5)

  const metrics = [
    {
      title: 'Receita Mês (Recebida)',
      value: `R$ ${receivedThisMonth.toLocaleString()}`,
      icon: DollarSign,
    },
    { title: 'A Receber (Mês)', value: `R$ ${expectedThisMonth.toLocaleString()}`, icon: Calendar },
    { title: 'Total em Atraso', value: `R$ ${overdueTotal.toLocaleString()}`, icon: AlertCircle },
    { title: 'Partos em Sobreaviso', value: activeOnCalls.length.toString(), icon: Baby },
  ]

  return (
    <div className="page-container space-y-8 p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-foreground">Bom dia, Studio</h1>
          <p className="text-muted-foreground mt-1">Aqui está o resumo do seu negócio hoje.</p>
        </div>
        <Button asChild className="rounded-full shadow-subtle">
          <Link to="/projetos">Novo Ensaio</Link>
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric) => (
          <Card
            key={metric.title}
            className="card-hover border-border/60 bg-background/50 backdrop-blur-sm"
          >
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
            <CardTitle className="font-serif text-xl">Sobreaviso Ativo</CardTitle>
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
                return (
                  <div key={shoot.id} className="flex items-center gap-4 group">
                    <div className="h-12 w-12 rounded-lg bg-secondary/50 flex flex-col items-center justify-center text-primary shrink-0 border border-border/50 transition-colors group-hover:bg-primary/10">
                      <Baby className="h-5 w-5" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium leading-none">{shoot.title}</p>
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
