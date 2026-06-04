import { useState } from 'react'
import { Settings, Shield, Edit2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import useCrmStore, { crmActions, User } from '@/stores/useCrmStore'

export default function Team() {
  const { users, tenant } = useCrmStore()
  const [selectedUser, setSelectedUser] = useState<User | null>(null)

  const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!selectedUser) return
    const formData = new FormData(e.currentTarget)
    crmActions.updateUser(selectedUser.id, {
      role: formData.get('role') as 'admin' | 'member',
      color: formData.get('color') as string,
      canViewFinance: formData.get('finance') === 'on',
    })
    setSelectedUser(null)
  }

  return (
    <div className="page-container space-y-6 p-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-foreground">Equipe e Permissões</h1>
          <p className="text-muted-foreground mt-1">Gerencie os acessos do {tenant.name}.</p>
        </div>
        <Button className="rounded-full gap-2">Convidar Membro</Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {users.map((user) => (
          <Card
            key={user.id}
            className="border-border/60 hover:shadow-md transition-shadow relative overflow-hidden"
          >
            <div
              className="absolute top-0 left-0 w-full h-1"
              style={{ backgroundColor: user.color }}
            />
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <Avatar className="h-16 w-16 border-2 border-background shadow-sm">
                  <AvatarImage src={user.avatar} />
                  <AvatarFallback>{user.name[0]}</AvatarFallback>
                </Avatar>
                <Badge
                  variant={user.role === 'admin' ? 'default' : 'secondary'}
                  className="capitalize"
                >
                  {user.role}
                </Badge>
              </div>
              <h3 className="font-semibold text-lg">{user.name}</h3>
              <p className="text-sm text-muted-foreground mb-4">{user.email}</p>

              <div className="flex gap-2 flex-wrap mb-6">
                {user.roles.map((r) => (
                  <Badge key={r} variant="outline" className="text-[10px] uppercase font-normal">
                    {r}
                  </Badge>
                ))}
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-border/50">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  {user.canViewFinance ? (
                    <Shield className="h-3 w-3 text-success" />
                  ) : (
                    <Shield className="h-3 w-3" />
                  )}
                  Financeiro {user.canViewFinance ? 'Liberado' : 'Oculto'}
                </div>
                <Button variant="ghost" size="sm" onClick={() => setSelectedUser(user)}>
                  <Edit2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={!!selectedUser} onOpenChange={(o) => !o && setSelectedUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-serif">Editar Membro: {selectedUser?.name}</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <form onSubmit={handleSave} className="space-y-6 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nível de Acesso</Label>
                  <Select name="role" defaultValue={selectedUser.role}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin (Acesso Total)</SelectItem>
                      <SelectItem value="member">Membro (Jobs Atribuídos)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Cor na Agenda</Label>
                  <div className="flex gap-2">
                    <Input
                      name="color"
                      type="color"
                      defaultValue={selectedUser.color}
                      className="w-12 h-10 p-1"
                    />
                    <Input type="text" value={selectedUser.color} readOnly className="flex-1" />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between rounded-lg border p-4 bg-secondary/20">
                <div className="space-y-0.5">
                  <Label>Ver Financeiro</Label>
                  <p className="text-sm text-muted-foreground">Permite ver valores dos jobs.</p>
                </div>
                <Switch name="finance" defaultChecked={selectedUser.canViewFinance} />
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
