import { useState } from 'react'
import { MessageSquare, Plus, Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'
import useCrmStore, { crmActions, MessageTemplate } from '@/stores/useCrmStore'

export default function Templates() {
  const { templates } = useCrmStore()
  const { toast } = useToast()

  const [open, setOpen] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<MessageTemplate | null>(null)

  const [name, setName] = useState('')
  const [body, setBody] = useState('')

  const handleOpenNew = () => {
    setEditingTemplate(null)
    setName('')
    setBody('')
    setOpen(true)
  }

  const handleOpenEdit = (t: MessageTemplate) => {
    setEditingTemplate(t)
    setName(t.name)
    setBody(t.body)
    setOpen(true)
  }

  const handleSave = () => {
    if (!name.trim() || !body.trim()) return

    if (editingTemplate) {
      crmActions.updateTemplate(editingTemplate.id, { name, body })
      toast({ title: 'Template atualizado com sucesso.' })
    } else {
      crmActions.addTemplate({ name, body })
      toast({ title: 'Template criado com sucesso.' })
    }
    setOpen(false)
  }

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este template?')) {
      crmActions.deleteTemplate(id)
      toast({ title: 'Template excluído.', variant: 'destructive' })
    }
  }

  const insertPlaceholder = (ph: string) => {
    setBody((prev) => prev + ph)
  }

  return (
    <div className="page-container space-y-6 p-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-foreground">Templates de Mensagem</h1>
          <p className="text-muted-foreground mt-1">
            Crie mensagens padrão para envio rápido via WhatsApp.
          </p>
        </div>
        <Button onClick={handleOpenNew} className="gap-2 rounded-full">
          <Plus className="h-4 w-4" /> Novo Template
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {templates.map((t) => (
          <Card
            key={t.id}
            className="flex flex-col h-full shadow-sm hover:shadow-md transition-shadow"
          >
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between gap-2">
                <CardTitle className="text-lg">{t.name}</CardTitle>
                <MessageSquare className="h-4 w-4 text-muted-foreground shrink-0" />
              </div>
            </CardHeader>
            <CardContent className="flex flex-col flex-1">
              <p className="text-sm text-muted-foreground line-clamp-4 flex-1 mb-4 whitespace-pre-wrap">
                {t.body}
              </p>
              <div className="flex items-center gap-2 mt-auto pt-4 border-t border-border/50">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 gap-2"
                  onClick={() => handleOpenEdit(t)}
                >
                  <Pencil className="h-4 w-4" /> Editar
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-destructive hover:bg-destructive/10"
                  onClick={() => handleDelete(t.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl">
              {editingTemplate ? 'Editar Template' : 'Novo Template'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nome do Template</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Lembrete de Ensaio"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Mensagem</Label>
              </div>
              <Textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Escreva sua mensagem aqui..."
                className="min-h-[200px]"
              />
              <div className="flex flex-wrap gap-2 pt-2">
                <span className="text-xs text-muted-foreground w-full mb-1">
                  Variáveis disponíveis:
                </span>
                {['{client_name}', '{event_date}', '{baby_name}', '{shoot_type}'].map((ph) => (
                  <Button
                    key={ph}
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => insertPlaceholder(ph)}
                    className="h-7 text-xs"
                  >
                    {ph}
                  </Button>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave}>Salvar Template</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
