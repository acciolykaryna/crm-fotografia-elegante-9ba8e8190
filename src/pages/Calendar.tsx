import { useState } from 'react'
import { Calendar as CalendarComponent } from '@/components/ui/calendar'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Baby, Image as ImageIcon } from 'lucide-react'
import useCrmStore from '@/stores/useCrmStore'

export default function CalendarPage() {
  const [date, setDate] = useState<Date | undefined>(new Date())
  const { projects, clients, users, currentUser } = useCrmStore()

  const isAdmin = currentUser.role === 'admin'
  const activeProjects = projects
    .filter((p) => !p.deleted && p.date)
    .filter((p) => isAdmin || p.assignedPhotographerId === currentUser.id)

  const selectedDateEvents = activeProjects.filter((p) => {
    if (!p.date || !date) return false
    return new Date(p.date).toDateString() === date.toDateString()
  })

  const sessionDates = activeProjects
    .filter((p) => p.type !== 'Parto')
    .map((p) => new Date(p.date!))
  const onCallDates = activeProjects.filter((p) => p.type === 'Parto').map((p) => new Date(p.date!))

  return (
    <div className="page-container space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-serif font-bold text-foreground">Calendário</h1>
        <p className="text-muted-foreground mt-1">Visão geral de ensaios e partos agendados.</p>
      </div>

      <div className="grid lg:grid-cols-[auto_1fr] gap-8 items-start">
        <Card className="p-2 border-border/60 shadow-sm w-fit bg-card/80 backdrop-blur-sm">
          <CalendarComponent
            mode="single"
            selected={date}
            onSelect={setDate}
            className="rounded-md"
            modifiers={{
              session: sessionDates,
              oncall: onCallDates,
            }}
            modifiersClassNames={{
              session: 'bg-indigo-100 text-indigo-900 font-bold',
              oncall: 'bg-rose-100 text-rose-900 font-bold',
            }}
          />
          <div className="flex gap-4 px-4 pb-4 mt-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-indigo-500" /> Sessões
            </span>
            <span className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-rose-500" /> DPP (Partos)
            </span>
          </div>
        </Card>

        <div className="space-y-4">
          <h3 className="font-serif text-xl font-medium flex items-center gap-2">
            Agenda:{' '}
            {date
              ? date.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })
              : 'Selecione uma data'}
          </h3>

          <div className="space-y-4">
            {selectedDateEvents.length > 0 ? (
              selectedDateEvents.map((event) => {
                const client = clients.find((c) => c.id === event.clientId)
                const photoColor =
                  users.find((u) => u.id === event.assignedPhotographerId)?.color ||
                  (event.type === 'Parto' ? '#f43f5e' : '#6366f1')

                return (
                  <Card
                    key={event.id}
                    className="border-border/60 hover:border-primary/30 transition-colors shadow-sm overflow-hidden"
                  >
                    <div className="flex">
                      <div className="w-2" style={{ backgroundColor: photoColor }}></div>
                      <CardContent className="p-5 flex-1">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <Badge variant="outline" className="mb-2 bg-secondary/50 font-normal">
                              {event.type}
                            </Badge>
                            <h4 className="text-lg font-semibold">{event.title}</h4>
                            <div className="flex flex-wrap gap-4 mt-3 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1.5">
                                {event.type === 'Parto' ? (
                                  <Baby className="h-4 w-4" />
                                ) : (
                                  <ImageIcon className="h-4 w-4" />
                                )}
                                {client?.name}
                              </span>
                            </div>
                          </div>
                          <Badge className="bg-secondary text-secondary-foreground hover:bg-secondary border-none">
                            {event.status}
                          </Badge>
                        </div>
                      </CardContent>
                    </div>
                  </Card>
                )
              })
            ) : (
              <div className="text-center p-12 bg-secondary/20 rounded-xl border border-dashed border-border/60">
                <p className="text-muted-foreground">Nenhum ensaio ou DPP para este dia.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
