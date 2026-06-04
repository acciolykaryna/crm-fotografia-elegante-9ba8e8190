import { useState, useEffect } from 'react'
import { MessageSquare, Plus, Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/lib/supabase/client'

export default function Templates() {
  const [templates, setTemplates] = useState<any[]>([])
  const { toast } = useToast()

  const [open, setOpen] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<any | null>(null)

  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')

  const fetchTemplates = async () => {
    const { data } = await supabase
      .from('message_templates')
      .select('*')
      .order('created_at', { ascending: false })
    if (data) setTemplates(data)
  }

  useEffect(() => {
    fetchTemplates()
  }, [])

  const handleOpenNew = () => {
    setEditingTemplate(null)
    setTitle('')
    setContent('')
    setOpen(true)
  }

  const handleOpenEdit = (t: any) => {
    setEditingTemplate(t)
    setTitle(t.title)
    setContent(t.content)
    setOpen(true)
  }

  const handleSave = async () => {
    if (!title.trim() || !content.trim()) return

    if (editingTemplate) {
      await supabase
        .from('message_templates')
        .update({ title, content })
        .eq('id', editingTemplate.id)
      toast({ title: 'Template atualizado com sucesso.' })
    } else {
      await supabase.from('message_templates').insert({ title, content })
      toast({ title: 'Template criado com sucesso.' })
    }
    setOpen(false)
    fetchTemplates()
  }

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este template?')) {
      await supabase.from('message_templates').delete().eq('id', id)
      toast({ title: 'Template excluído.', variant: 'destructive' })
      fetchTemplates()
    }
  }

  const insertPlaceholder = (ph: string) => {
    setContent((prev) => prev + ph)
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
                <div>
                  <Badge variant="outline" className="mb-1 text-[10px]">
                    Personalizado
                  </Badge>
                  <CardTitle className="text-lg">{t.title}</CardTitle>
                </div>
                <MessageSquare className="h-4 w-4 text-muted-foreground shrink-0" />
              </div>
            </CardHeader>
            <CardContent className="flex flex-col flex-1">
              <p className="text-sm text-muted-foreground line-clamp-4 flex-1 mb-4 whitespace-pre-wrap">
                {t.content}
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
        {templates.length === 0 && (
          <div className="col-span-full text-center py-12 text-muted-foreground bg-secondary/20 rounded-xl border border-dashed border-border/60">
            Nenhum template cadastrado ainda.
          </div>
        )}
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
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Lembrete de Ensaio"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Mensagem</Label>
              </div>
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Escreva sua mensagem aqui..."
                className="min-h-[200px]"
              />
              <div className="flex flex-wrap gap-2 pt-2">
                <span className="text-xs text-muted-foreground w-full mb-1">
                  Variáveis disponíveis:
                </span>
                {['{client_name}', '{event_date}', '{shoot_type}'].map((ph) => (
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
