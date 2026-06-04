import { Zap, Mail, Gift, Cake, Clock } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'

const automations = [
  {
    id: 'anniv',
    title: 'Lembrete de Bodas',
    description: 'Envia um e-mail oferecendo um ensaio comemorativo 11 meses após o casamento.',
    icon: Clock,
    active: true,
  },
  {
    id: 'bday',
    title: 'Feliz Aniversário',
    description: 'Envia um cupom de desconto de 15% na semana do aniversário do cliente.',
    icon: Cake,
    active: true,
  },
  {
    id: 'newborn',
    title: 'Ensaio Sitter (6 Meses)',
    description: 'Lembra pais de recém-nascidos sobre a fase em que o bebê senta sozinho.',
    icon: Gift,
    active: false,
  },
  {
    id: 'review',
    title: 'Solicitação de Avaliação',
    description: 'Envia um link do Google Meu Negócio 3 dias após o status mudar para "Entregue".',
    icon: Mail,
    active: true,
  },
]

export default function Automations() {
  return (
    <div className="page-container space-y-6">
      <div>
        <h1 className="text-3xl font-serif font-bold text-foreground">Automações</h1>
        <p className="text-muted-foreground mt-1">
          Acione gatilhos para aumentar o engajamento e recorrência.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {automations.map((auto) => (
          <Card key={auto.id} className="card-hover border-border/60">
            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-secondary rounded-md">
                    <auto.icon className="h-4 w-4 text-primary" />
                  </div>
                  <CardTitle className="text-base font-semibold">{auto.title}</CardTitle>
                </div>
                <CardDescription className="pt-2 text-sm leading-relaxed">
                  {auto.description}
                </CardDescription>
              </div>
              <Switch defaultChecked={auto.active} id={auto.id} />
            </CardHeader>
            <CardContent>
              <div className="mt-4 pt-4 border-t flex justify-end">
                <button className="text-sm font-medium text-primary hover:underline">
                  Editar Template
                </button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
