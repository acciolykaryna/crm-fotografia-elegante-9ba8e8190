import { useState, useEffect } from 'react'
import { Settings, Shield, Edit2, Mail, Trash2, Plus } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'
import { useToast } from '@/hooks/use-toast'
import { Skeleton } from '@/components/ui/skeleton'

export default function Team() {
  const { profile } = useAuth()
  const { toast } = useToast()

  const [members, setMembers] = useState<any[]>([])
  const [invitations, setInvitations] = useState<any[]>([])
  const [selectedUser, setSelectedUser] = useState<any | null>(null)
  const [isInviteOpen, setIsInviteOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const isAdmin = profile?.role === 'admin'

  const fetchData = async () => {
    if (!profile?.tenant_id) return
    setIsLoading(true)

    const [profilesRes, invRes] = await Promise.all([
      supabase.from('profiles').select('*').order('full_name'),
      supabase
        .from('invitations')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: false }),
    ])

    if (profilesRes.data) setMembers(profilesRes.data)
    if (invRes.data) setInvitations(invRes.data)
    setIsLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [profile?.tenant_id])

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!selectedUser) return
    const formData = new FormData(e.currentTarget)
    const role = formData.get('role') as string

    const { error } = await supabase.from('profiles').update({ role }).eq('id', selectedUser.id)
    if (error) {
      toast({ title: 'Erro ao atualizar', description: error.message, variant: 'destructive' })
    } else {
      toast({ title: 'Membro atualizado com sucesso' })
      setSelectedUser(null)
      fetchData()
    }
  }

  const handleInvite = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const email = formData.get('email') as string
    const role = formData.get('role') as string

    const { error } = await supabase.from('invitations').insert({
      email,
      role,
      tenant_id: profile?.tenant_id,
    })

    if (error) {
      toast({ title: 'Erro ao convidar', description: error.message, variant: 'destructive' })
    } else {
      toast({ title: 'Convite enviado!' })
      setIsInviteOpen(false)
      fetchData()
    }
  }

  const handleRevokeInvite = async (id: string) => {
    const { error } = await supabase.from('invitations').delete().eq('id', id)
    if (error) {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' })
    } else {
      toast({ title: 'Convite revogado' })
      fetchData()
    }
  }

  if (isLoading) {
    return (
      <div className="page-container space-y-6 p-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      </div>
    )
  }

  return (
    <div className="page-container space-y-6 p-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-foreground">Equipe e Permissões</h1>
          <p className="text-muted-foreground mt-1">Gerencie os acessos do estúdio.</p>
        </div>

        {isAdmin && (
          <Dialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
            <DialogTrigger asChild>
              <Button className="rounded-full gap-2">
                <Plus className="h-4 w-4" /> Convidar Membro
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Convidar Membro</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleInvite} className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label>E-mail</Label>
                  <Input name="email" type="email" required placeholder="email@exemplo.com" />
                </div>
                <div className="space-y-2">
                  <Label>Nível de Acesso</Label>
                  <Select name="role" defaultValue="member">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin (Acesso Total)</SelectItem>
                      <SelectItem value="member">Membro (Jobs Atribuídos)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button type="submit" className="w-full">
                  Enviar Convite
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {members.map((user) => (
          <Card
            key={user.id}
            className="border-border/60 hover:shadow-md transition-shadow relative overflow-hidden"
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <Avatar className="h-16 w-16 border-2 border-background shadow-sm">
                  <AvatarImage src={user.avatar_url || ''} />
                  <AvatarFallback>{user.full_name?.[0] || 'U'}</AvatarFallback>
                </Avatar>
                <Badge
                  variant={user.role === 'admin' ? 'default' : 'secondary'}
                  className="capitalize"
                >
                  {user.role || 'membro'}
                </Badge>
              </div>
              <h3 className="font-semibold text-lg">{user.full_name || 'Usuário Sem Nome'}</h3>
              <p className="text-sm text-muted-foreground mb-4">Membro ativo</p>

              <div className="flex justify-end items-center pt-4 border-t border-border/50">
                {isAdmin && (
                  <Button variant="ghost" size="sm" onClick={() => setSelectedUser(user)}>
                    <Edit2 className="h-4 w-4 mr-2" /> Editar
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}

        {invitations.map((inv) => (
          <Card
            key={inv.id}
            className="border-dashed border-2 bg-secondary/10 hover:shadow-md transition-shadow relative overflow-hidden opacity-75"
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="h-16 w-16 rounded-full bg-secondary flex items-center justify-center border-2 border-background shadow-sm">
                  <Mail className="h-6 w-6 text-muted-foreground" />
                </div>
                <Badge variant="outline">Pendente</Badge>
              </div>
              <h3 className="font-semibold text-lg truncate" title={inv.email}>
                {inv.email}
              </h3>
              <p className="text-sm text-muted-foreground mb-4 capitalize">
                Convite para: {inv.role}
              </p>

              <div className="flex justify-end items-center pt-4 border-t border-border/50">
                {isAdmin && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRevokeInvite(inv.id)}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-4 w-4 mr-2" /> Revogar
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}

        {members.length === 0 && invitations.length === 0 && (
          <div className="col-span-full py-12 text-center text-muted-foreground border rounded-xl bg-card border-dashed">
            Nenhum membro encontrado.
          </div>
        )}
      </div>

      <Dialog open={!!selectedUser} onOpenChange={(o) => !o && setSelectedUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-serif">
              Editar Membro: {selectedUser?.full_name}
            </DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <form onSubmit={handleSave} className="space-y-6 pt-4">
              <div className="space-y-2">
                <Label>Nível de Acesso</Label>
                <Select name="role" defaultValue={selectedUser.role || 'member'}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin (Acesso Total)</SelectItem>
                    <SelectItem value="member">Membro (Jobs Atribuídos)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button type="submit" className="w-full">
                Salvar Alterações
              </Button>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
