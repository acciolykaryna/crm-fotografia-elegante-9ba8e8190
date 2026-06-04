import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Camera, Check, ChevronRight } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import useCrmStore, { crmActions, ServiceType } from '@/stores/useCrmStore'

const ALL_SERVICES: ServiceType[] = [
  'Parto',
  'Gestante',
  'Newborn',
  'Família',
  'Corporativo',
  'Outro',
]

export default function Onboarding() {
  const navigate = useNavigate()
  const { tenant } = useCrmStore()
  const [step, setStep] = useState(1)

  const [name, setName] = useState(tenant.name || '')
  const [primaryColor, setPrimaryColor] = useState(tenant.primaryColor || '#D4AF37')
  const [services, setServices] = useState<ServiceType[]>(tenant.services || ['Parto', 'Família'])
  const [emails, setEmails] = useState('')

  const handleNext = () => setStep((s) => s + 1)
  const handlePrev = () => setStep((s) => s - 1)

  const handleFinish = () => {
    crmActions.updateTenant({
      name,
      primaryColor,
      services,
      isOnboarded: true,
    })
    navigate('/')
  }

  const toggleService = (srv: ServiceType) => {
    setServices((prev) => (prev.includes(srv) ? prev.filter((s) => s !== srv) : [...prev, srv]))
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary/30 p-4">
      <Card className="w-full max-w-xl border-border/60 shadow-lg">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mb-4">
            <Camera className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="font-serif text-2xl">Bem-vindo(a) ao seu CRM</CardTitle>
          <CardDescription>Vamos configurar seu estúdio. Leva apenas um minuto.</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="flex justify-between mb-8 relative">
            <div className="absolute top-1/2 left-0 w-full h-[2px] bg-border -z-10 -translate-y-1/2" />
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium border-2 bg-background transition-colors ${
                  step >= i ? 'border-primary text-primary' : 'border-border text-muted-foreground'
                } ${step > i ? 'bg-primary text-primary-foreground' : ''}`}
              >
                {step > i ? <Check className="h-4 w-4" /> : i}
              </div>
            ))}
          </div>

          <div className="min-h-[200px]">
            {step === 1 && (
              <div className="space-y-4 animate-fade-in-up">
                <div className="space-y-2">
                  <Label>Nome do Estúdio</Label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ex: Fotografia Elegante"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Cor Principal da Marca</Label>
                  <div className="flex gap-4">
                    <Input
                      type="color"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="w-16 h-10 p-1"
                    />
                    <Input
                      type="text"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4 animate-fade-in-up">
                <Label>Quais serviços você oferece?</Label>
                <div className="grid grid-cols-2 gap-4">
                  {ALL_SERVICES.map((srv) => (
                    <div key={srv} className="flex items-center space-x-2">
                      <Checkbox
                        id={`srv-${srv}`}
                        checked={services.includes(srv)}
                        onCheckedChange={() => toggleService(srv)}
                      />
                      <Label htmlFor={`srv-${srv}`} className="font-normal cursor-pointer">
                        {srv}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4 animate-fade-in-up">
                <div className="space-y-2">
                  <Label>Convide sua Equipe (Opcional)</Label>
                  <p className="text-sm text-muted-foreground mb-2">
                    Insira os e-mails dos fotógrafos e assistentes separados por vírgula.
                  </p>
                  <textarea
                    className="flex min-h-[100px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="ana@estudio.com, carlos@estudio.com"
                    value={emails}
                    onChange={(e) => setEmails(e.target.value)}
                  />
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-between mt-8 pt-4 border-t">
            <Button variant="ghost" onClick={handlePrev} disabled={step === 1}>
              Voltar
            </Button>
            {step < 3 ? (
              <Button onClick={handleNext} disabled={step === 1 && !name}>
                Continuar <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            ) : (
              <Button onClick={handleFinish}>Finalizar Configuração</Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
