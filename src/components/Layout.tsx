import { Link, Outlet, useLocation } from 'react-router-dom'
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
import { Home, Users, Calendar, Image as ImageIcon, Zap, Search, Bell } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

const navigation = [
  { name: 'Dashboard', href: '/', icon: Home },
  { name: 'Clientes', href: '/clientes', icon: Users },
  { name: 'Calendário', href: '/calendario', icon: Calendar },
  { name: 'Projetos', href: '/projetos', icon: ImageIcon },
  { name: 'Automações', href: '/automacoes', icon: Zap },
]

export default function Layout() {
  const location = useLocation()

  return (
    <SidebarProvider>
      <Sidebar variant="inset" className="border-r border-border/50">
        <SidebarHeader className="h-16 flex items-center px-6">
          <Link to="/" className="flex items-center gap-2 transition-opacity hover:opacity-80">
            <span className="font-serif text-2xl font-bold tracking-tight text-primary">
              Elegante
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
          <div className="flex items-center gap-3 rounded-lg bg-secondary/50 p-3">
            <Avatar className="h-9 w-9 border border-border">
              <AvatarImage src="https://img.usecurling.com/ppl/thumbnail?gender=female&seed=1" />
              <AvatarFallback>PH</AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="text-sm font-semibold">Fotografia Studio</span>
              <span className="text-xs text-muted-foreground">Plano Premium</span>
            </div>
          </div>
        </SidebarFooter>
      </Sidebar>

      <main className="flex min-h-screen flex-1 flex-col bg-secondary/20">
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-background/80 px-6 backdrop-blur-md">
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
            <Button variant="ghost" size="icon" className="relative rounded-full">
              <Bell className="h-5 w-5 text-muted-foreground" />
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-primary ring-2 ring-background"></span>
            </Button>
          </div>
        </header>
        <div className="flex-1 overflow-auto">
          <Outlet />
        </div>
      </main>
    </SidebarProvider>
  )
}
