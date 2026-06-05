import { useEffect, useState, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Send, Search, MessageCircle, Settings, FileText } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Label } from '@/components/ui/label'

export default function WhatsApp() {
  const [searchParams] = useSearchParams()
  const initialClientId = searchParams.get('client')
  const { profile } = useAuth()
  const { toast } = useToast()

  const [clients, setClients] = useState<any[]>([])
  const [searchClient, setSearchClient] = useState('')
  const [selectedClientId, setSelectedClientId] = useState<string | null>(initialClientId)
  const [messages, setMessages] = useState<any[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [loadingClients, setLoadingClients] = useState(true)
  const [loadingMessages, setLoadingMessages] = useState(false)
  const [templates, setTemplates] = useState<any[]>([])

  const [showSettings, setShowSettings] = useState(false)
  const [whatsappConfig, setWhatsappConfig] = useState({
    accessToken: '',
    phoneNumberId: '',
    verifyToken: '',
  })
  const [savingConfig, setSavingConfig] = useState(false)

  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!profile?.tenant_id) return

    const fetchData = async () => {
      const { data: clientsData } = await supabase
        .from('clients')
        .select('id, name, phone')
        .order('name')
      const { data: messagesData } = await supabase
        .from('whatsapp_messages' as any)
        .select('client_id, created_at, content')
        .order('created_at', { ascending: false })
      const { data: tpls } = await supabase.from('message_templates').select('*')
      const { data: tenantData } = await supabase
        .from('tenants')
        .select('whatsapp_config')
        .eq('id', profile.tenant_id)
        .single()

      if (clientsData) {
        const mapped = clientsData
          .map((c) => {
            const msgs = messagesData?.filter((m: any) => m.client_id === c.id) || []
            return { ...c, latestMessage: msgs.length > 0 ? msgs[0] : null }
          })
          .sort((a, b) => {
            if (a.latestMessage && b.latestMessage)
              return (
                new Date(b.latestMessage.created_at).getTime() -
                new Date(a.latestMessage.created_at).getTime()
              )
            if (a.latestMessage) return -1
            if (b.latestMessage) return 1
            return 0
          })
        setClients(mapped)
      }
      if (tpls) setTemplates(tpls)
      if (tenantData?.whatsapp_config) {
        const config = tenantData.whatsapp_config as any
        setWhatsappConfig({
          accessToken: config.accessToken || '',
          phoneNumberId: config.phoneNumberId || '',
          verifyToken: config.verifyToken || '',
        })
      }
      setLoadingClients(false)
    }
    fetchData()
  }, [profile?.tenant_id])

  useEffect(() => {
    if (!selectedClientId) return
    setLoadingMessages(true)
    const fetchMessages = async () => {
      const { data } = await supabase
        .from('whatsapp_messages' as any)
        .select('*')
        .eq('client_id', selectedClientId)
        .order('created_at', { ascending: true })
      if (data) setMessages(data)
      setLoadingMessages(false)
      scrollToBottom()
    }
    fetchMessages()

    const channel = supabase
      .channel(`whatsapp_messages:client_id=eq.${selectedClientId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'whatsapp_messages',
          filter: `client_id=eq.${selectedClientId}`,
        },
        (payload) => {
          setMessages((prev) =>
            prev.some((m) => m.id === payload.new.id) ? prev : [...prev, payload.new],
          )
          scrollToBottom()
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [selectedClientId])

  const scrollToBottom = () => {
    setTimeout(() => {
      if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }, 100)
  }

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !selectedClientId) return
    setSending(true)
    const content = newMessage
    setNewMessage('')
    try {
      const { error } = await supabase.functions.invoke('send-whatsapp-message', {
        body: { client_id: selectedClientId, content },
      })
      if (error) throw error
    } catch (err: any) {
      toast({ title: 'Erro ao enviar', description: err.message, variant: 'destructive' })
      setNewMessage(content)
    } finally {
      setSending(false)
    }
  }

  const saveConfig = async () => {
    if (!profile?.tenant_id) return
    setSavingConfig(true)
    try {
      await supabase
        .from('tenants')
        .update({ whatsapp_config: whatsappConfig })
        .eq('id', profile.tenant_id)
      toast({ title: 'Configurações salvas com sucesso' })
      setShowSettings(false)
    } catch (err: any) {
      toast({ title: 'Erro ao salvar', description: err.message, variant: 'destructive' })
    } finally {
      setSavingConfig(false)
    }
  }

  const insertTemplate = (templateContent: string) => {
    const client = clients.find((c) => c.id === selectedClientId)
    let parsed = templateContent
    if (client) parsed = parsed.replace(/{client_name}/g, client.name)
    setNewMessage(parsed)
  }

  const selectedClient = clients.find((c) => c.id === selectedClientId)
  const filteredClients = clients.filter(
    (c) =>
      c.name.toLowerCase().includes(searchClient.toLowerCase()) || c.phone?.includes(searchClient),
  )

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-background overflow-hidden">
      <div className="w-80 border-r flex flex-col bg-card shrink-0">
        <div className="p-4 border-b flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="font-serif font-bold text-xl flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-green-600" /> WhatsApp
            </h2>
            <Button variant="ghost" size="icon" onClick={() => setShowSettings(true)}>
              <Settings className="h-4 w-4" />
            </Button>
          </div>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              className="pl-9 bg-secondary/50 border-none"
              placeholder="Buscar cliente..."
              value={searchClient}
              onChange={(e) => setSearchClient(e.target.value)}
            />
          </div>
        </div>
        <ScrollArea className="flex-1">
          {loadingClients ? (
            <div className="p-4 space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            filteredClients.map((client) => (
              <div
                key={client.id}
                onClick={() => setSelectedClientId(client.id)}
                className={cn(
                  'p-4 border-b border-border/50 cursor-pointer hover:bg-secondary/50 transition-colors flex items-center gap-3',
                  selectedClientId === client.id && 'bg-secondary/80 border-l-2 border-l-primary',
                )}
              >
                <Avatar className="h-10 w-10 border border-border">
                  <AvatarFallback>{client.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 overflow-hidden">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-semibold text-sm truncate">{client.name}</span>
                    {client.latestMessage && (
                      <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                        {new Date(client.latestMessage.created_at).toLocaleDateString('pt-BR')}
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground truncate h-4">
                    {client.latestMessage ? client.latestMessage.content : 'Sem mensagens'}
                  </div>
                </div>
              </div>
            ))
          )}
        </ScrollArea>
      </div>

      <div className="flex-1 flex flex-col bg-secondary/10 relative">
        {selectedClient ? (
          <>
            <div className="h-16 border-b bg-card/80 backdrop-blur-md flex items-center px-6 gap-4 shrink-0 absolute top-0 w-full z-10">
              <Avatar className="h-10 w-10 border border-border">
                <AvatarFallback>{selectedClient.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold text-sm">{selectedClient.name}</h3>
                <p className="text-xs text-muted-foreground">
                  {selectedClient.phone || 'Sem número cadastrado'}
                </p>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-4 pt-20 pb-24" ref={scrollRef}>
              {loadingMessages ? (
                <div className="flex justify-center">
                  <Skeleton className="h-4 w-32" />
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                  <MessageCircle className="h-12 w-12 mb-4 opacity-20" />
                  <p className="text-sm">Nenhuma mensagem ainda.</p>
                  <p className="text-xs">Envie a primeira mensagem para {selectedClient.name}.</p>
                </div>
              ) : (
                messages.map((msg: any) => (
                  <div
                    key={msg.id}
                    className={cn(
                      'flex',
                      msg.direction === 'outbound' ? 'justify-end' : 'justify-start',
                    )}
                  >
                    <div
                      className={cn(
                        'max-w-[70%] px-4 py-2 shadow-sm relative',
                        msg.direction === 'outbound'
                          ? 'bg-primary text-primary-foreground rounded-2xl rounded-tr-none'
                          : 'bg-card border border-border/50 rounded-2xl rounded-tl-none',
                      )}
                    >
                      <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                      <div
                        className={cn(
                          'text-[10px] mt-1 text-right font-medium',
                          msg.direction === 'outbound'
                            ? 'text-primary-foreground/70'
                            : 'text-muted-foreground',
                        )}
                      >
                        {new Date(msg.created_at).toLocaleTimeString('pt-BR', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                        {msg.direction === 'outbound' && (
                          <span className="ml-2 uppercase tracking-wider text-[8px] opacity-80">
                            {msg.status === 'read'
                              ? '✓✓'
                              : msg.status === 'delivered'
                                ? '✓✓'
                                : msg.status === 'sent'
                                  ? '✓'
                                  : '!'}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="p-4 bg-card border-t absolute bottom-0 w-full z-10 shrink-0">
              <form onSubmit={handleSend} className="flex gap-2 items-end max-w-4xl mx-auto">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="shrink-0 mb-1 text-muted-foreground hover:text-foreground"
                    >
                      <FileText className="h-5 w-5" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent align="start" className="w-80 p-2" sideOffset={10}>
                    <div className="font-medium text-sm px-2 mb-2">Templates de Mensagem</div>
                    <ScrollArea className="h-[200px]">
                      {templates.length === 0 ? (
                        <div className="text-xs text-muted-foreground px-2 py-4">
                          Nenhum template cadastrado.
                        </div>
                      ) : (
                        <div className="space-y-1">
                          {templates.map((t) => (
                            <button
                              key={t.id}
                              type="button"
                              className="w-full text-left px-2 py-2 text-sm rounded-md hover:bg-secondary/50 transition-colors"
                              onClick={() => insertTemplate(t.content)}
                            >
                              <div className="font-medium truncate">{t.title}</div>
                              <div className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                                {t.content}
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </ScrollArea>
                  </PopoverContent>
                </Popover>
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Mensagem..."
                  className="flex-1 rounded-full bg-secondary/50 border-none focus-visible:ring-1"
                  disabled={sending}
                  autoComplete="off"
                />
                <Button
                  type="submit"
                  size="icon"
                  className="rounded-full shrink-0 h-9 w-9 bg-green-600 hover:bg-green-700"
                  disabled={sending || !newMessage.trim()}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground bg-card/30">
            <div className="h-24 w-24 rounded-full bg-secondary/50 flex items-center justify-center mb-6">
              <MessageCircle className="h-10 w-10 opacity-50" />
            </div>
            <h3 className="font-serif text-2xl font-semibold mb-2">WhatsApp Dashboard</h3>
            <p className="text-sm max-w-md text-center opacity-80">
              Selecione um cliente no painel ao lado para visualizar o histórico ou iniciar uma nova
              conversa.
            </p>
          </div>
        )}
      </div>

      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Configurações da API</DialogTitle>
            <DialogDescription>
              Insira suas credenciais da Meta para integrar o WhatsApp Business.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Access Token</Label>
              <Input
                value={whatsappConfig.accessToken}
                onChange={(e) => setWhatsappConfig((p) => ({ ...p, accessToken: e.target.value }))}
                type="password"
              />
            </div>
            <div className="space-y-2">
              <Label>Phone Number ID</Label>
              <Input
                value={whatsappConfig.phoneNumberId}
                onChange={(e) =>
                  setWhatsappConfig((p) => ({ ...p, phoneNumberId: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Verify Token (Webhook)</Label>
              <Input
                value={whatsappConfig.verifyToken}
                onChange={(e) => setWhatsappConfig((p) => ({ ...p, verifyToken: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSettings(false)}>
              Cancelar
            </Button>
            <Button onClick={saveConfig} disabled={savingConfig}>
              {savingConfig ? 'Salvando...' : 'Salvar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
