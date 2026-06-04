import { useState, useEffect } from 'react'
import { MessageCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import useCrmStore, { Client, Project, Alert } from '@/stores/useCrmStore'

interface SendMessageDialogProps {
  client: Client | null
  project?: Project | null
  alert?: Alert | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SendMessageDialog({
  client,
  project,
  alert,
  open,
  onOpenChange,
}: SendMessageDialogProps) {
  const { templates } = useCrmStore()
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!open) {
      setSelectedTemplateId('')
      setMessage('')
    }
  }, [open])

  const handleTemplateChange = (templateId: string) => {
    setSelectedTemplateId(templateId)
    const template = templates.find((t) => t.id === templateId)
    if (!template || !client) return

    let parsed = template.body
    parsed = parsed.replace(/{client_name}/g, client.name)

    const eventDate = project?.date || alert?.dueDate || ''
    const formattedDate = eventDate
      ? new Date(eventDate).toLocaleDateString('pt-BR', { timeZone: 'UTC' })
      : '[Data]'
    parsed = parsed.replace(/{event_date}/g, formattedDate)

    const babyName =
      client.children && client.children.length > 0 ? client.children[0].name : '[Nome do Bebê]'
    parsed = parsed.replace(/{baby_name}/g, babyName)

    const shootType = project?.type || '[Tipo de Ensaio]'
    parsed = parsed.replace(/{shoot_type}/g, shootType)

    setMessage(parsed)
  }

  const handleSend = () => {
    if (!client || !message) return
    const encodedMessage = encodeURIComponent(message)
    const phone = client.whatsapp.replace(/\D/g, '')
    const url = `https://wa.me/55${phone}?text=${encodedMessage}`
    window.open(url, '_blank')
    onOpenChange(false)
  }

  if (!client) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl">Enviar Mensagem (WhatsApp)</DialogTitle>
          <DialogDescription>
            Escolha um template ou escreva uma mensagem para enviar a {client.name}.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Template Rápido</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {templates.map((t) => (
                <Button
                  key={t.id}
                  variant="outline"
                  size="sm"
                  onClick={() => handleTemplateChange(t.id)}
                  className={selectedTemplateId === t.id ? 'border-primary text-primary' : ''}
                >
                  {t.name}
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Mensagem</Label>
            <Textarea
              className="min-h-[150px] resize-none"
              placeholder="Digite a mensagem aqui..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            onClick={handleSend}
            disabled={!message}
            className="gap-2 bg-green-600 hover:bg-green-700 text-white"
          >
            <MessageCircle className="h-4 w-4" />
            Abrir no WhatsApp
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
