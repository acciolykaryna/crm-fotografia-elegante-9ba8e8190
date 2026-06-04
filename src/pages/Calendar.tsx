import { useState } from 'react'
import { Calendar as CalendarComponent } from '@/components/ui/calendar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Clock, MapPin, Video } from 'lucide-react'
import useCrmStore from '@/stores/useCrmStore'

export default function CalendarPage() {
  const [date, setDate] = useState<Date | undefined>(new Date())
  const { projects } = useCrmStore()

  const selectedDateEvents = projects.filter((p) => {
    if (!p.date || !date) return false
    const pDate = new Date(p.date)
    return pDate.toDateString() === date.toDateString()
  })

  return (
    <div className="page-container space-y-6">
      <div>
        <h1 className="text-3xl font-serif font-bold text-foreground">Calendário</h1>
        <p className="text-muted-foreground mt-1">Organize seu tempo e compromissos.</p>
      </div>

      <div className="grid lg:grid-cols-[auto_1fr] gap-8 items-start">
        <Card className="p-2 border-border/60 shadow-sm w-fit bg-card/80 backdrop-blur-sm">
          <CalendarComponent
            mode="single"
            selected={date}
            onSelect={setDate}
            className="rounded-md"
            classNames={{
              day_selected:
                'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground',
              day_today: 'bg-secondary text-secondary-foreground',
            }}
          />
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
              selectedDateEvents.map((event) => (
                <Card
                  key={event.id}
                  className="border-border/60 hover:border-primary/30 transition-colors shadow-sm overflow-hidden"
                >
                  <div className="flex">
                    <div className="w-2 bg-primary"></div>
                    <CardContent className="p-5 flex-1">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <Badge variant="outline" className="mb-2 bg-secondary/50 font-normal">
                            {event.type}
                          </Badge>
                          <h4 className="text-lg font-semibold">{event.title}</h4>
                          <div className="flex flex-wrap gap-4 mt-3 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1.5">
                              <Clock className="h-4 w-4" /> 14:00 - 17:00
                            </span>
                            <span className="flex items-center gap-1.5">
                              <MapPin className="h-4 w-4" /> Estúdio Principal
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
              ))
            ) : (
              <div className="text-center p-12 bg-secondary/20 rounded-xl border border-dashed border-border/60">
                <p className="text-muted-foreground">Nenhum ensaio agendado para este dia.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
