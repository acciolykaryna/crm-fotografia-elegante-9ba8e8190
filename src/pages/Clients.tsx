import { useState, useEffect } from 'react'
import { Plus, Search, MoreHorizontal, Phone, Mail, MessageCircle } from 'lucide-react'
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
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/lib/supabase/client'
import { SendMessageDialog } from '@/components/SendMessageDialog'

export default function Clients() {
  const { toast } = useToast()
  const [clients, setClients] = useState<any[]>([])
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [selectedClient, setSelectedClient] = useState<any | null>(null)
  const [isMessageOpen, setIsMessageOpen] = useState(false)

  const fetchClients = async () => {
    const { data } = await supabase
      .from('clients')
      .select('*')
      .order('created_at', { ascending: false })
    if (data) setClients(data)
  }

  useEffect(() => {
    fetchClients()
  }, [])

  const filteredClients = clients.filter(
    (c) => c.name?.toLowerCase().includes(search.toLowerCase()) || c.phone?.includes(search),
  )

  const handleAddClient = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)

    const { error } = await supabase.from('clients').insert({
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string,
      birthday: formData.get('birthday') ? formData.get('birthday') : null,
    })

    if (!error) {
      setOpen(false)
      toast({ title: 'Cliente adicionado', description: 'O cliente foi cadastrado com sucesso.' })
      fetchClients()
    } else {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' })
    }
  }

  return (
    <div className="page-container space-y-6 p-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-foreground">Base de Clientes</h1>
          <p className="text-muted-foreground mt-1">Gerencie contatos e histórico.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-full gap-2">
              <Plus className="h-4 w-4" /> Novo Cliente
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle className="font-serif">Adicionar Cliente</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddClient} className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome Principal</Label>
                  <Input id="name" name="name" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">E-mail</Label>
                  <Input id="email" name="email" type="email" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone</Label>
                  <Input id="phone" name="phone" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="birthday">Data de Nascimento</Label>
                  <Input id="birthday" name="birthday" type="date" />
                </div>
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
              <TableHead>Cliente</TableHead>
              <TableHead>Contatos</TableHead>
              <TableHead>Nascimento</TableHead>
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
                  <div className="font-medium">{client.name}</div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="text-sm">{client.phone}</span>
                    <span className="text-xs text-muted-foreground">{client.email}</span>
                  </div>
                </TableCell>
                <TableCell>
                  {client.birthday ? new Date(client.birthday).toLocaleDateString('pt-BR') : '-'}
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {filteredClients.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                  Nenhum cliente encontrado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Sheet open={!!selectedClient} onOpenChange={(o) => !o && setSelectedClient(null)}>
        <SheetContent className="w-[400px] sm:w-[540px]">
          {selectedClient && (
            <>
              <SheetHeader className="mb-6">
                <SheetTitle className="font-serif text-2xl">{selectedClient.name}</SheetTitle>
              </SheetHeader>
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold text-sm mb-2 text-muted-foreground uppercase tracking-wider">
                    Contatos
                  </h3>
                  <div className="space-y-2">
                    <p className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4" /> {selectedClient.phone}
                    </p>
                    {selectedClient.email && (
                      <p className="flex items-center gap-2 text-sm">
                        <Mail className="h-4 w-4" /> {selectedClient.email}
                      </p>
                    )}
                  </div>
                </div>

                {selectedClient.birthday && (
                  <div>
                    <h3 className="font-semibold text-sm mb-2 text-muted-foreground uppercase tracking-wider">
                      Informações
                    </h3>
                    <p className="text-sm">
                      Nascimento: {new Date(selectedClient.birthday).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                )}

                <div className="pt-6 border-t border-border">
                  <Button
                    className="w-full gap-2 bg-green-600 hover:bg-green-700 text-white"
                    onClick={() => setIsMessageOpen(true)}
                  >
                    <MessageCircle className="h-4 w-4" />
                    Enviar Mensagem Rápida (WhatsApp)
                  </Button>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      <SendMessageDialog
        client={selectedClient ? { ...selectedClient, whatsapp: selectedClient.phone } : null}
        open={isMessageOpen}
        onOpenChange={setIsMessageOpen}
      />
    </div>
  )
}
