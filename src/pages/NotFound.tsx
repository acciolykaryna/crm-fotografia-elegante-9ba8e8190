import { useLocation, Link } from 'react-router-dom'
import { useEffect } from 'react'
import { Button } from '@/components/ui/button'

const NotFound = () => {
  const location = useLocation()

  useEffect(() => {
    console.error('404 Error: Rota não encontrada:', location.pathname)
  }, [location.pathname])

  return (
    <div className="flex flex-col h-full items-center justify-center bg-secondary/20 p-8 text-center">
      <h1 className="font-serif text-8xl font-bold text-primary mb-4">404</h1>
      <h2 className="text-2xl font-medium text-foreground mb-4">Página não encontrada</h2>
      <p className="text-muted-foreground max-w-md mb-8">
        A página que você está procurando parece ter sido movida ou não existe mais no sistema.
      </p>
      <Button asChild className="rounded-full px-8">
        <Link to="/">Voltar ao Início</Link>
      </Button>
    </div>
  )
}

export default NotFound
