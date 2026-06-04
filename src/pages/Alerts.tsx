import { useState } from 'react'
import { Bell, CheckCircle2, Clock, MessageSquare } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import useCrmStore, { crmActions, Client, Alert } from '@/stores/useCrmStore'
import { SendMessageDialog } from '@/components/SendMessageDialog'

export default function Alerts() {
  const { alerts, clients, projects } = useCrmStore()
  const [messageAlert, setMessageAlert] = useState<{ client: Client; alert: Alert } | null>(null)

  const pendingAlerts = alerts
    .filter((a) => a.status === 'Pending')
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())

  const handleResolve = (id: string) => {
    crmActions.resolveAlert(id, 'Completed')
  }

  return (
    <div className="page-container space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-serif font-bold text-foreground">Hub de Alertas</h1>
        <p className="text-muted-foreground mt-1">
          Lembretes de recontato, cobranças e aniversários automáticos.
        </p>
      </div>

      <div className="space-y-4">
        {pendingAlerts.length === 0 ? (
          <div className="text-center p-12 bg-secondary/20 rounded-xl border border-dashed border-border/60">
            <Bell className="h-8 w-8 mx-auto text-muted-foreground mb-4 opacity-50" />
            <p className="text-muted-foreground">Tudo limpo! Nenhum alerta pendente no momento.</p>
          </div>
        ) : (
          pendingAlerts.map((alert) => {
            const client = clients.find((c) => c.id === alert.clientId)
            return (
              <Card
                key={alert.id}
                className="border-border/60 shadow-sm transition-all hover:shadow-md"
              >
                <CardContent className="p-4 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                  <div className="flex gap-4 items-center">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                      <Clock className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-base">{alert.title}</h4>
                      <p className="text-sm text-muted-foreground">
                        {client?.name} • Vencimento:{' '}
                        {new Date(alert.dueDate).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2 w-full sm:w-auto">
                    {client && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 sm:flex-none gap-2 text-green-600 hover:text-green-700 hover:bg-green-50"
                        onClick={() => setMessageAlert({ client, alert })}
                      >
                        <MessageSquare className="h-4 w-4" /> Contatar
                      </Button>
                    )}
                    <Button variant="outline" size="sm" className="flex-1 sm:flex-none">
                      Adiar
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleResolve(alert.id)}
                      className="flex-1 sm:flex-none gap-2"
                    >
                      <CheckCircle2 className="h-4 w-4" /> Concluído
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>
      <SendMessageDialog
        client={messageAlert?.client || null}
        alert={messageAlert?.alert || null}
        project={
          messageAlert?.alert?.projectId
            ? projects.find((p) => p.id === messageAlert.alert.projectId)
            : null
        }
        open={!!messageAlert}
        onOpenChange={(o) => !o && setMessageAlert(null)}
      />
    </div>
  )
}
