import { Link } from 'react-router-dom'
import { Calendar, Users, DollarSign, Gift, ArrowRight } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import useCrmStore from '@/stores/useCrmStore'

export default function Index() {
  const { projects, clients } = useCrmStore()

  const nextShoots = projects.filter((p) => p.status === 'Agendado').slice(0, 4)
  const activeLeads = projects.filter((p) => p.status === 'Lead').length

  const metrics = [
    { title: 'Próximos Ensaios', value: nextShoots.length.toString(), icon: Calendar },
    { title: 'Leads Ativos', value: activeLeads.toString(), icon: Users },
    { title: 'Receita Mensal', value: 'R$ 8.450', icon: DollarSign },
    { title: 'Datas Especiais Hoje', value: '2', icon: Gift },
  ]

  const recentActivities = [
    {
      id: 1,
      text: 'Maria Silva completou 1 ano de casada.',
      time: 'Há 2 horas',
      action: 'Enviar mensagem',
    },
    {
      id: 2,
      text: 'Novo lead recebido: Formatura de Ana.',
      time: 'Há 4 horas',
      action: 'Ver lead',
    },
    {
      id: 3,
      text: 'Ensaio de João Santos marcado como entregue.',
      time: 'Ontem',
      action: 'Solicitar review',
    },
  ]

  return (
    <div className="page-container space-y-8">
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
            <CardTitle className="font-serif text-xl">Agenda Próxima</CardTitle>
            <Button variant="ghost" size="sm" asChild className="text-muted-foreground">
              <Link to="/calendario" className="flex items-center gap-1">
                Ver todos <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-6">
            {nextShoots.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhum ensaio agendado.</p>
            ) : (
              nextShoots.map((shoot) => {
                const client = clients.find((c) => c.id === shoot.clientId)
                return (
                  <div key={shoot.id} className="flex items-center gap-4 group">
                    <div className="h-12 w-12 rounded-lg bg-secondary/50 flex flex-col items-center justify-center text-primary shrink-0 border border-border/50 transition-colors group-hover:bg-primary/10">
                      <span className="text-xs font-semibold">
                        {shoot.date?.split('-')[2] || '--'}
                      </span>
                      <span className="text-[10px] uppercase opacity-70">
                        {shoot.date
                          ? new Date(shoot.date).toLocaleString('pt-BR', { month: 'short' })
                          : 'Mês'}
                      </span>
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium leading-none">{shoot.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {client?.name} • {shoot.type}
                      </p>
                    </div>
                  </div>
                )
              })
            )}
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-sm bg-[#fafaf8]">
          <CardHeader>
            <CardTitle className="font-serif text-xl text-foreground">
              Oportunidades de Automação
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {recentActivities.map((activity) => (
              <div
                key={activity.id}
                className="relative flex gap-4 pl-4 before:absolute before:left-[7px] before:top-2 before:bottom-[-24px] before:w-[2px] before:bg-border last:before:hidden"
              >
                <div className="absolute left-0 top-1.5 h-4 w-4 rounded-full border-2 border-background bg-primary" />
                <div className="flex-1 space-y-1">
                  <p className="text-sm text-foreground">{activity.text}</p>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">{activity.time}</span>
                    <span className="text-xs text-border">•</span>
                    <button className="text-xs font-medium text-primary hover:underline">
                      {activity.action}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
