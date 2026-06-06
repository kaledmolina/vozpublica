'use client'

import { useState, useCallback } from 'react'
import { useMounted } from '@/hooks/use-mounted'
import { Menu, Moon, Sun, Search, X, LogIn } from 'lucide-react'
import { useTheme } from 'next-themes'
import { motion, AnimatePresence } from 'framer-motion'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Separator } from '@/components/ui/separator'
import { usePublicStore } from '@/store/public-store'
import { toast } from 'sonner'

interface PublicHeaderProps {
  onLoginClick: () => void
}

export function PublicHeader({ onLoginClick }: PublicHeaderProps) {
  const mounted = useMounted()
  const { theme, setTheme } = useTheme()
  const [searchOpen, setSearchOpen] = useState(false)
  const [mobileSearchQuery, setMobileSearchQuery] = useState('')

  const categories = usePublicStore((s) => s.categories)
  const selectedCategory = usePublicStore((s) => s.selectedCategory)
  const selectCategory = usePublicStore((s) => s.selectCategory)
  const search = usePublicStore((s) => s.search)
  const setView = usePublicStore((s) => s.setView)
  
  const settings = usePublicStore((s) => s.settings || {})
  const siteName = settings.site_name || 'VozPublica'
  const siteLogo = settings.site_logo

  const handleDesktopSearch = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault()
      const formData = new FormData(e.currentTarget)
      const query = formData.get('search') as string
      search(query)
      setSearchOpen(false)
    },
    [search]
  )

  const handleMobileSearch = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault()
      search(mobileSearchQuery)
      setMobileSearchQuery('')
    },
    [search, mobileSearchQuery]
  )

  const handleCategoryClick = useCallback(
    (slug: string | null) => {
      selectCategory(slug)
    },
    [selectCategory]
  )

  // Format today's date
  const formattedToday = mounted 
    ? format(new Date(), "EEEE, d 'de' MMMM 'de' yyyy", { locale: es })
    : ''
  const displayDate = formattedToday ? formattedToday.charAt(0).toUpperCase() + formattedToday.slice(1) : ''

  return (
    <header className="w-full flex flex-col bg-background border-b border-border/80 relative z-40">
      
      {/* 1. Top Bar: Menu Trigger + Date | Logo (Centered) | Actions */}
      <div className="w-full border-b border-border/30 py-4 md:py-6">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex items-center justify-between h-14 relative">
          
          {/* Left: Menu & Date */}
          <div className="flex items-center gap-4">
            {/* Mobile/Tablet Hamburger Trigger */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="h-10 w-10 hover:bg-secondary rounded-full" aria-label="Open menu">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72 overflow-y-auto">
                <SheetHeader>
                  <SheetTitle className="text-left font-bold text-xl font-heading text-primary">Menú</SheetTitle>
                </SheetHeader>

                {/* Mobile Search */}
                <div className="px-1 py-4">
                  <form onSubmit={handleMobileSearch} className="relative">
                    <Input
                      type="search"
                      placeholder="Buscar artículos..."
                      value={mobileSearchQuery}
                      onChange={(e) => setMobileSearchQuery(e.target.value)}
                      className="h-10 rounded-none border-border bg-secondary pl-3 pr-10 text-sm"
                    />
                    <button type="submit" className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground">
                      <Search className="h-4 w-4" />
                    </button>
                  </form>
                </div>

                <Separator className="my-2" />

                {/* Mobile Categories */}
                <nav className="flex flex-col gap-1 py-2 font-heading" aria-label="Mobile navigation">
                  <button
                    onClick={() => {
                      handleCategoryClick(null)
                    }}
                    className={`px-3 py-3 text-left text-sm font-bold uppercase tracking-wider transition-colors ${
                      selectedCategory === null
                        ? 'text-primary bg-secondary/50 border-l-4 border-primary'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    }`}
                  >
                    Todas las Noticias
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => {
                        handleCategoryClick(cat.slug)
                      }}
                      className={`px-3 py-3 text-left text-sm font-bold uppercase tracking-wider transition-colors ${
                        selectedCategory === cat.slug
                          ? 'text-foreground border-l-4'
                          : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                      }`}
                      style={
                        selectedCategory === cat.slug
                          ? { borderLeftColor: cat.color, backgroundColor: `${cat.color}10`, color: cat.color }
                          : undefined
                      }
                    >
                      {cat.name}
                    </button>
                  ))}
                </nav>

                <Separator className="my-3" />

                {/* Login in mobile */}
                <div className="pt-2">
                  <Button
                    variant="outline"
                    className="w-full justify-center gap-2 rounded-none border-foreground hover:bg-foreground hover:text-background"
                    onClick={onLoginClick}
                  >
                    <LogIn className="h-4 w-4" />
                    Iniciar Sesión
                  </Button>
                </div>
              </SheetContent>
            </Sheet>

            {/* Date Display */}
            <div className="hidden md:flex text-[11px] text-muted-foreground border-l border-border/40 pl-3">
              <span className="font-semibold text-foreground/80">{displayDate}</span>
            </div>
          </div>

          {/* Center: Brand Logo */}
          <div className="absolute left-1/2 -translate-x-1/2 flex items-center">
            <button
              onClick={() => {
                setView('home')
                handleCategoryClick(null)
              }}
              className="focus:outline-none transition-transform hover:scale-[1.02]"
            >
              {siteLogo ? (
                <img src={siteLogo} alt={siteName} className="h-10 md:h-12 object-contain" />
              ) : (
                <h1 className="text-3xl md:text-4.5xl font-black font-heading tracking-tight text-primary uppercase" style={{ color: 'var(--primary)', fontFamily: 'var(--font-lora)' }}>
                  {siteName}
                </h1>
              )}
            </button>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Search Toggle */}
            <div className="relative flex items-center">
              <AnimatePresence>
                {searchOpen && (
                  <motion.form
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: 180, opacity: 1 }}
                    exit={{ width: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    onSubmit={handleDesktopSearch}
                    className="relative z-10 mr-1"
                  >
                    <Input
                      name="search"
                      type="search"
                      placeholder="Buscar..."
                      className="h-8 w-full rounded-none border-border pl-3 pr-8 text-xs bg-card"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => setSearchOpen(false)}
                      className="absolute top-1/2 right-2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </motion.form>
                )}
              </AnimatePresence>
              {!searchOpen && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSearchOpen(true)}
                  className="h-9 w-9 text-muted-foreground hover:text-foreground rounded-full"
                  aria-label="Open search"
                >
                  <Search className="h-4 w-4" />
                </Button>
              )}
            </div>

            {/* Theme Toggle */}
            {mounted && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="h-9 w-9 text-muted-foreground hover:text-foreground rounded-full"
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>
            )}

            {/* Subscribe Outline Button */}
            <Button
              variant="outline"
              size="sm"
              className="hidden sm:inline-flex rounded-full border-foreground hover:bg-foreground hover:text-background text-xs font-bold px-4 py-1 h-8 ml-1"
              onClick={() => toast.success('¡Gracias por tu interés en suscribirte!')}
            >
              Suscríbete
            </Button>

            {/* User Profile Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={onLoginClick}
              className="h-9 w-9 text-muted-foreground hover:text-foreground rounded-full"
              aria-label="Iniciar Sesión"
            >
              <LogIn className="h-4.5 w-4.5" />
            </Button>
          </div>

        </div>
      </div>

      {/* 2. Bottom Row: Categories Centered Nav Bar */}
      <div className="w-full bg-background border-b border-border/10 overflow-x-auto scrollbar-none py-1">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex justify-center h-10 items-center">
          <nav className="flex items-center gap-6 md:gap-8 whitespace-nowrap" aria-label="Main navigation">
            <button
              onClick={() => handleCategoryClick(null)}
              className={`pb-1.5 text-xs font-extrabold uppercase tracking-wider transition-all duration-200 border-b-2 -mb-[2px] ${
                selectedCategory === null
                  ? 'text-primary border-primary font-black'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
              style={selectedCategory === null ? { color: 'var(--primary)', borderBottomColor: 'var(--primary)' } : undefined}
            >
              Últimas noticias
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => handleCategoryClick(cat.slug)}
                className={`pb-1.5 text-xs font-extrabold uppercase tracking-wider transition-all duration-200 border-b-2 -mb-[2px] ${
                  selectedCategory === cat.slug
                    ? 'text-foreground font-black'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
                style={
                  selectedCategory === cat.slug
                    ? { borderBottomColor: cat.color, color: cat.color }
                    : undefined
                }
              >
                {cat.name}
              </button>
            ))}
          </nav>
        </div>
      </div>

    </header>
  )
}
