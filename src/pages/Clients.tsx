import { useState } from 'react'
import { Plus, Search, MoreHorizontal, User, Phone, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import useCrmStore, { crmActions, Client, LeadSource, Child } from '@/stores/useCrmStore'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export default function Clients() {
  const { clients, projects } = useCrmStore()
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)

  const [source, setSource] = useState<LeadSource>('Instagram (Orgânico)')
  const [children, setChildren] = useState<Child[]>([])

  const activeClients = clients.filter((c) => !c.deleted)
  const filteredClients = activeClients.filter(
    (c) => c.name.toLowerCase().includes(search.toLowerCase()) || c.whatsapp.includes(search),
  )

  const handleAddChild = () =>
    setChildren([...children, { id: Math.random().toString(), name: '', birthDate: '' }])
  const handleChildChange = (id: string, field: 'name' | 'birthDate', value: string) =>
    setChildren(children.map((c) => (c.id === id ? { ...c, [field]: value } : c)))

  const handleAddClient = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const tagsRaw = formData.get('tags') as string

    crmActions.addClient({
      name: formData.get('name') as string,
      whatsapp: formData.get('whatsapp') as string,
      partnerName: formData.get('partner') as string,
      backupPhone: formData.get('backup') as string,
      source,
      referredById: formData.get('referredBy') as string,
      children: children.filter((c) => c.name && c.birthDate),
      tags: tagsRaw
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
    })
    setOpen(false)
    setChildren([])
    toast({ title: 'Cliente adicionado', description: 'O cliente foi cadastrado com sucesso.' })
  }

  const calculateLTV = (clientId: string) => {
    return projects
      .filter((p) => p.clientId === clientId && !p.deleted)
      .reduce((acc, p) => {
        return acc + p.installments.filter((i) => i.paid).reduce((sum, i) => sum + i.amount, 0)
      }, 0)
  }

  return (
    <div className="page-container space-y-6 p-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-foreground">Base de Clientes</h1>
          <p className="text-muted-foreground mt-1">Gerencie contatos, famílias e histórico.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-full gap-2">
              <Plus className="h-4 w-4" /> Novo Cliente
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-serif">Adicionar Cliente Familiar</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddClient} className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome Principal</Label>
                  <Input id="name" name="name" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="whatsapp">WhatsApp</Label>
                  <Input id="whatsapp" name="whatsapp" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="partner">Nome Parceiro(a)</Label>
                  <Input id="partner" name="partner" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="backup">Tel. Backup</Label>
                  <Input id="backup" name="backup" />
                </div>
              </div>

              <div className="space-y-2 border-t pt-4">
                <div className="flex items-center justify-between">
                  <Label>Filhos</Label>
                  <Button type="button" variant="outline" size="sm" onClick={handleAddChild}>
                    Adicionar Filho
                  </Button>
                </div>
                {children.map((child) => (
                  <div key={child.id} className="flex gap-2 items-center">
                    <Input
                      placeholder="Nome"
                      value={child.name}
                      onChange={(e) => handleChildChange(child.id, 'name', e.target.value)}
                    />
                    <Input
                      type="date"
                      value={child.birthDate}
                      onChange={(e) => handleChildChange(child.id, 'birthDate', e.target.value)}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => setChildren(children.filter((c) => c.id !== child.id))}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>

              <div className="space-y-2 border-t pt-4">
                <Label>Origem do Lead</Label>
                <Select value={source} onValueChange={(v) => setSource(v as LeadSource)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[
                      'Instagram (Orgânico)',
                      'Instagram (Anúncio)',
                      'Indicação',
                      'Google',
                      'Outro',
                    ].map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {source === 'Indicação' && (
                  <Select name="referredBy">
                    <SelectTrigger>
                      <SelectValue placeholder="Indicado por..." />
                    </SelectTrigger>
                    <SelectContent>
                      {activeClients.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="tags">Tags (separadas por vírgula)</Label>
                <Input id="tags" name="tags" placeholder="ex: parto, vip" />
              </div>
              <DialogFooter className="pt-4">
                <Button type="submit" className="w-full">
                  Salvar Cliente
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-card rounded-xl border shadow-subtle overflow-hidden">
        <div className="p-4 border-b bg-secondary/10 flex items-center gap-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-8 w-[300px] border-none bg-transparent shadow-none focus-visible:ring-0 px-0"
          />
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Família</TableHead>
              <TableHead>Contatos</TableHead>
              <TableHead>Tags</TableHead>
              <TableHead>LTV</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredClients.map((client) => (
              <TableRow
                key={client.id}
                className="cursor-pointer hover:bg-secondary/10"
                onClick={() => setSelectedClient(client)}
              >
                <TableCell>
                  <div className="font-medium">
                    {client.name} {client.partnerName && `& ${client.partnerName}`}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {client.children.length} filho(s)
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="text-sm">{client.whatsapp}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex gap-1 flex-wrap">
                    {client.tags.map((t) => (
                      <Badge key={t} variant="secondary" className="text-xs font-normal">
                        {t}
                      </Badge>
                    ))}
                  </div>
                </TableCell>
                <TableCell className="font-medium text-success">
                  R$ {calculateLTV(client.id).toLocaleString()}
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Sheet open={!!selectedClient} onOpenChange={(o) => !o && setSelectedClient(null)}>
        <SheetContent className="w-[400px] sm:w-[540px]">
          {selectedClient && (
            <>
              <SheetHeader className="mb-6">
                <SheetTitle className="font-serif text-2xl">{selectedClient.name}</SheetTitle>
                <div className="flex gap-2 mt-2">
                  <Badge variant="outline">{selectedClient.source}</Badge>
                  {selectedClient.tags.map((t) => (
                    <Badge
                      key={t}
                      className="bg-primary/10 text-primary border-none hover:bg-primary/20"
                    >
                      {t}
                    </Badge>
                  ))}
                </div>
              </SheetHeader>
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold text-sm mb-2 text-muted-foreground uppercase tracking-wider">
                    Contatos
                  </h3>
                  <div className="space-y-2">
                    <p className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4" /> {selectedClient.whatsapp}
                    </p>
                    {selectedClient.backupPhone && (
                      <p className="flex items-center gap-2 text-sm">
                        <Phone className="h-4 w-4 text-muted-foreground" />{' '}
                        {selectedClient.backupPhone} (Backup)
                      </p>
                    )}
                  </div>
                </div>
                {selectedClient.children.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-sm mb-2 text-muted-foreground uppercase tracking-wider">
                      Filhos
                    </h3>
                    <ul className="space-y-2">
                      {selectedClient.children.map((c) => (
                        <li
                          key={c.id}
                          className="flex items-center gap-2 text-sm bg-secondary/30 p-2 rounded-md"
                        >
                          <User className="h-4 w-4" /> {c.name} (Nasc:{' '}
                          {new Date(c.birthDate).toLocaleDateString('pt-BR')})
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                <div>
                  <h3 className="font-semibold text-sm mb-2 text-muted-foreground uppercase tracking-wider">
                    Financeiro (LTV)
                  </h3>
                  <p className="text-2xl font-bold text-success">
                    R$ {calculateLTV(selectedClient.id).toLocaleString()}
                  </p>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}
