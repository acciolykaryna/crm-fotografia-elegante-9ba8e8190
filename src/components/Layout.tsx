import { useMemo, useEffect, useState } from 'react'
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarHeader,
  SidebarTrigger,
  SidebarFooter,
} from '@/components/ui/sidebar'
import {
  Home,
  Users,
  Calendar,
  Image as ImageIcon,
  Search,
  Bell,
  Baby,
  MessageSquare,
  MessageCircle,
  Settings,
  LogOut,
} from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useAuth } from '@/hooks/use-auth'
import { supabase } from '@/lib/supabase/client'
import { Skeleton } from '@/components/ui/skeleton'

function hexToHsl(hex: string) {
  if (!hex) return '0 0% 0%'
  let r = 0,
    g = 0,
    b = 0
  if (hex.length === 4) {
    r = parseInt(hex[1] + hex[1], 16)
    g = parseInt(hex[2] + hex[2], 16)
    b = parseInt(hex[3] + hex[3], 16)
  } else if (hex.length === 7) {
    r = parseInt(hex.substring(1, 3), 16)
    g = parseInt(hex.substring(3, 5), 16)
    b = parseInt(hex.substring(5, 7), 16)
  }
  r /= 255
  g /= 255
  b /= 255
  const max = Math.max(r, g, b),
    min = Math.min(r, g, b)
  let h = 0,
    s = 0,
    l = (max + min) / 2
  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0)
        break
      case g:
        h = (b - r) / d + 2
        break
      case b:
        h = (r - g) / d + 4
        break
    }
    h /= 6
  }
  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`
}

export default function Layout() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, profile, signOut } = useAuth()
  const [tenant, setTenant] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (profile?.tenant_id) {
      supabase
        .from('tenants')
        .select('*')
        .eq('id', profile.tenant_id)
        .single()
        .then(({ data }) => {
          if (data) setTenant(data)
          setIsLoading(false)
        })
    } else {
      setIsLoading(false)
    }
  }, [profile?.tenant_id])

  const primaryHsl = useMemo(
    () => hexToHsl(tenant?.branding?.primaryColor || '#D4AF37'),
    [tenant?.branding?.primaryColor],
  )

  const navigation = [
    { name: 'Dashboard', href: '/', icon: Home, show: true },
    { name: 'Clientes', href: '/clientes', icon: Users, show: profile?.role === 'admin' },
    { name: 'WhatsApp', href: '/whatsapp', icon: MessageCircle, show: true },
    { name: 'Ensaios e Projetos', href: '/projetos', icon: ImageIcon, show: true },
    { name: 'Sobreaviso', href: '/sobreaviso', icon: Baby, show: true },
    { name: 'Calendário', href: '/calendario', icon: Calendar, show: true },
    { name: 'Alertas', href: '/alertas', icon: Bell, show: true },
    { name: 'Templates', href: '/templates', icon: MessageSquare, show: true },
    { name: 'Equipe', href: '/equipe', icon: Settings, show: profile?.role === 'admin' },
  ].filter((n) => n.show)

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Skeleton className="h-12 w-12 rounded-full" />
      </div>
    )
  }

  return (
    <div style={{ '--primary': primaryHsl, '--ring': primaryHsl } as React.CSSProperties}>
      <SidebarProvider>
        <Sidebar variant="inset" className="border-r border-border/50">
          <SidebarHeader className="h-16 flex items-center px-6">
            <Link to="/" className="flex items-center gap-2 transition-opacity hover:opacity-80">
              <span className="font-serif text-2xl font-bold tracking-tight text-primary">
                {tenant?.name || 'Studio'}
              </span>
            </Link>
          </SidebarHeader>
          <SidebarContent className="px-3 py-4">
            <SidebarMenu>
              {navigation.map((item) => (
                <SidebarMenuItem key={item.name}>
                  <SidebarMenuButton asChild isActive={location.pathname === item.href}>
                    <Link to={item.href} className="flex items-center gap-3 px-3 py-2.5">
                      <item.icon className="h-5 w-5 opacity-70" />
                      <span className="font-medium">{item.name}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter className="p-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-3 rounded-lg bg-secondary/50 p-3 hover:bg-secondary/70 transition-colors w-full text-left">
                  <Avatar className="h-9 w-9 border border-border">
                    <AvatarImage src={profile?.avatar_url || ''} />
                    <AvatarFallback>{profile?.full_name?.charAt(0) || 'U'}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col flex-1 overflow-hidden">
                    <span className="text-sm font-semibold truncate">
                      {profile?.full_name || 'Usuário'}
                    </span>
                    <span className="text-xs text-muted-foreground capitalize">
                      {profile?.role || 'Membro'}
                    </span>
                  </div>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-[240px]">
                <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive focus:bg-destructive focus:text-destructive-foreground cursor-pointer"
                  onClick={handleSignOut}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarFooter>
        </Sidebar>

        <main className="flex min-h-screen flex-1 flex-col bg-secondary/20 w-full overflow-hidden">
          <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-background/80 px-6 backdrop-blur-md shrink-0">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
              <div className="relative hidden w-64 md:block">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Buscar clientes ou ensaios..."
                  className="h-9 w-full rounded-full bg-secondary/50 pl-9 border-none focus-visible:ring-1 focus-visible:bg-background"
                />
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" className="relative rounded-full" asChild>
                <Link to="/alertas">
                  <Bell className="h-5 w-5 text-muted-foreground" />
                </Link>
              </Button>
            </div>
          </header>
          <div className="flex-1 overflow-auto">
            <Outlet />
          </div>
        </main>
      </SidebarProvider>
    </div>
  )
}
