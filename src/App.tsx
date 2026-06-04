import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import Layout from './components/Layout'
import Index from './pages/Index'
import Clients from './pages/Clients'
import Projects from './pages/Projects'
import CalendarPage from './pages/Calendar'
import Alerts from './pages/Alerts'
import OnCall from './pages/OnCall'
import NotFound from './pages/NotFound'

const App = () => (
  <BrowserRouter future={{ v7_startTransition: false, v7_relativeSplatPath: false }}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Index />} />
          <Route path="/clientes" element={<Clients />} />
          <Route path="/projetos" element={<Projects />} />
          <Route path="/calendario" element={<CalendarPage />} />
          <Route path="/sobreaviso" element={<OnCall />} />
          <Route path="/alertas" element={<Alerts />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </TooltipProvider>
  </BrowserRouter>
)

export default App
