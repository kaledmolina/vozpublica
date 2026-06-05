'use client'

import { useCallback, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Newspaper, SlidersHorizontal } from 'lucide-react'
import { usePublicStore } from '@/store/public-store'
import { ArticleCard } from './ArticleCard'
import { CategoryBadge } from './CategoryBadge'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from '@/components/ui/pagination'

export function NewsGrid() {
  const articles = usePublicStore((s) => s.articles)
  const categories = usePublicStore((s) => s.categories)
  const selectedCategory = usePublicStore((s) => s.selectedCategory)
  const currentPage = usePublicStore((s) => s.currentPage)
  const totalPages = usePublicStore((s) => s.totalPages)
  const isLoading = usePublicStore((s) => s.isLoading)
  const selectCategory = usePublicStore((s) => s.selectCategory)
  const fetchArticle = usePublicStore((s) => s.fetchArticle)
  const setPage = usePublicStore((s) => s.setPage)
  const searchQuery = usePublicStore((s) => s.searchQuery)
  const search = usePublicStore((s) => s.search)

  const [sortBy, setSortBy] = useState<'latest' | 'views'>('latest')

  const handleArticleClick = useCallback(
    (id: string) => {
      fetchArticle(id)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    },
    [fetchArticle]
  )

  const handleCategorySelect = useCallback(
    (slug: string | null) => {
      selectCategory(slug)
    },
    [selectCategory]
  )

  // Sort articles locally
  const sortedArticles = [...articles].sort((a, b) => {
    if (sortBy === 'views') {
      return b.views - a.views
    }
    const dateA = a.publishedAt ? new Date(a.publishedAt).getTime() : new Date(a.createdAt).getTime()
    const dateB = b.publishedAt ? new Date(b.publishedAt).getTime() : new Date(b.createdAt).getTime()
    return dateB - dateA
  })

  // Loading skeletons
  if (isLoading && articles.length === 0) {
    return (
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Category filters skeleton */}
        <div className="mb-8 flex gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-7 w-20 rounded-sm" />
          ))}
        </div>
        {/* Grid skeleton */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="overflow-hidden rounded-lg border border-border">
              <Skeleton className="aspect-[16/10] w-full" />
              <div className="space-y-2 p-4">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <div className="flex items-center gap-3 pt-2">
                  <Skeleton className="h-6 w-6 rounded-full" />
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    )
  }

  // Empty state
  if (!isLoading && articles.length === 0) {
    return (
      <section className="mx-auto flex max-w-7xl flex-col items-center justify-center px-4 py-20 text-center sm:px-6 lg:px-8">
        <Newspaper className="mb-4 h-12 w-12 text-muted-foreground/40" />
        <h3 className="mb-2 text-lg font-semibold text-foreground">No se encontraron artículos</h3>
        <p className="mb-4 text-sm text-muted-foreground">
          {selectedCategory || searchQuery
            ? 'Ningún artículo coincide con los filtros.'
            : 'Comienza publicando tu primer artículo.'}
        </p>
        {(selectedCategory || searchQuery) && (
          <button
            onClick={() => {
              handleCategorySelect(null)
              search('')
            }}
            className="text-sm font-medium text-destructive hover:underline"
          >
            Limpiar todos los filtros
          </button>
        )}
      </section>
    )
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Category Filter Tabs */}
      {categories.length > 0 && (
        <div className="mb-10 flex flex-wrap gap-2.5 font-heading">
          <button
            onClick={() => handleCategorySelect(null)}
            className={`rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all duration-300 border ${
              selectedCategory === null
                ? 'bg-primary border-primary text-primary-foreground shadow-md shadow-primary/25 scale-[1.03]'
                : 'bg-card border-border/60 text-muted-foreground hover:border-primary/30 hover:text-foreground'
            }`}
          >
            Todas
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleCategorySelect(cat.slug)}
              className={`rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all duration-300 border ${
                selectedCategory === cat.slug
                  ? 'border-transparent text-white shadow-md'
                  : 'bg-card border-border/60 text-muted-foreground hover:text-foreground'
              }`}
              style={
                selectedCategory === cat.slug
                  ? { backgroundColor: cat.color, boxShadow: `0 4px 12px -2px ${cat.color}40`, transform: 'scale(1.03)' }
                  : undefined
              }
            >
              {cat.name}
            </button>
          ))}
        </div>
      )}

      {/* Search status banner */}
      {searchQuery && (
        <div className="mb-8 flex items-center justify-between rounded-2xl border border-border/40 bg-muted/30 px-5 py-4 backdrop-blur-sm">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">Mostrando resultados de búsqueda para:</span>
            <span className="font-bold text-foreground font-heading">"{searchQuery}"</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => search('')}
            className="h-8 rounded-full text-xs text-primary hover:bg-primary/10 transition-colors"
          >
            Limpiar Búsqueda
          </Button>
        </div>
      )}

      {/* Section header & sorting */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 items-center gap-3">
          <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground font-heading whitespace-nowrap">
            {selectedCategory
              ? categories.find((c) => c.slug === selectedCategory)?.name || 'Últimas'
              : 'Últimas Historias'}
          </h2>
          <div className="h-px w-full bg-border/40" />
        </div>

        {/* Sorting Controls */}
        <div className="flex items-center gap-2 self-end sm:self-auto font-heading">
          <SlidersHorizontal className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-xs text-muted-foreground mr-1">Ordenar:</span>
          <div className="inline-flex rounded-full bg-muted p-1 border border-border/30">
            <button
              onClick={() => setSortBy('latest')}
              className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition-all duration-300 ${
                sortBy === 'latest'
                  ? 'bg-background text-primary shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Recientes
            </button>
            <button
              onClick={() => setSortBy('views')}
              className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition-all duration-300 ${
                sortBy === 'views'
                  ? 'bg-background text-primary shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Populares
            </button>
          </div>
        </div>
      </div>

      {/* Article Grid and Sidebar Layout */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Left Column: News Grid (8 Cols) */}
        <div className="lg:col-span-8 space-y-8">
          <div className="grid gap-6 sm:grid-cols-2">
            <AnimatePresence mode="popLayout">
              {sortedArticles.map((article) => (
                <motion.div
                  key={article.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.5, cubicBezier: [0.16, 1, 0.3, 1] }}
                >
                  <ArticleCard
                    article={article}
                    onClick={() => handleArticleClick(article.id)}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <Pagination className="pt-6">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(e) => {
                      e.preventDefault()
                      if (currentPage > 1) {
                        setPage(currentPage - 1)
                        window.scrollTo({ top: 0, behavior: 'smooth' })
                      }
                    }}
                    aria-disabled={currentPage <= 1}
                    className={currentPage <= 1 ? 'pointer-events-none opacity-40' : ''}
                  />
                </PaginationItem>

                {Array.from({ length: totalPages }).map((_, i) => {
                  const page = i + 1
                  const isFirst = page === 1
                  const isLast = page === totalPages
                  const isNearCurrent = Math.abs(page - currentPage) <= 1
                  const showEllipsisBefore = !isFirst && page === currentPage - 2
                  const showEllipsisAfter = !isLast && page === currentPage + 2

                  if (showEllipsisBefore || showEllipsisAfter) {
                    return (
                      <PaginationItem key={`ellipsis-${page}`}>
                        <PaginationEllipsis />
                      </PaginationItem>
                    )
                  }

                  if (!isFirst && !isLast && !isNearCurrent && !showEllipsisBefore && !showEllipsisAfter) {
                    return null
                  }

                  return (
                    <PaginationItem key={page}>
                      <PaginationLink
                        href="#"
                        isActive={currentPage === page}
                        onClick={(e) => {
                          e.preventDefault()
                          setPage(page)
                          window.scrollTo({ top: 0, behavior: 'smooth' })
                        }}
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  )
                })}

                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={(e) => {
                      e.preventDefault()
                      if (currentPage < totalPages) {
                        setPage(currentPage + 1)
                        window.scrollTo({ top: 0, behavior: 'smooth' })
                      }
                    }}
                    aria-disabled={currentPage >= totalPages}
                    className={currentPage >= totalPages ? 'pointer-events-none opacity-40' : ''}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </div>

        {/* Right Column: Sidebar (4 Cols) */}
        <aside className="lg:col-span-4 space-y-8">
          {/* Top Trends (Popular Articles) */}
          <div className="rounded-2xl border border-border/40 bg-card/30 p-6 backdrop-blur-sm">
            <h3 className="mb-5 text-xs font-bold uppercase tracking-widest text-foreground/80 font-heading flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              Artículos Populares
            </h3>
            
            <div className="divide-y divide-border/20">
              {[...articles]
                .sort((a, b) => b.views - a.views)
                .slice(0, 5)
                .map((art, idx) => (
                  <div
                    key={art.id}
                    className="flex gap-4 py-4 first:pt-0 last:pb-0 group cursor-pointer"
                    onClick={() => handleArticleClick(art.id)}
                  >
                    <span className="text-3xl font-black font-heading text-primary/20 transition-colors group-hover:text-primary/40 leading-none">
                      {String(idx + 1).padStart(2, '0')}
                    </span>
                    <div className="space-y-1">
                      {art.category && (
                        <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: art.color }}>
                          {art.category.name}
                        </span>
                      )}
                      <h4 className="text-sm font-semibold leading-snug text-foreground transition-colors group-hover:text-primary font-heading line-clamp-2">
                        {art.title}
                      </h4>
                      <span className="text-[10px] text-muted-foreground block">
                        {art.views} visitas
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Newsletter Box */}
          <div className="rounded-2xl border border-border/40 bg-gradient-to-br from-primary/5 to-accent/5 p-6 backdrop-blur-sm relative overflow-hidden group">
            {/* Ambient Background Glow */}
            <div className="absolute -right-10 -bottom-10 h-32 w-32 rounded-full bg-primary/10 blur-2xl group-hover:bg-primary/15 transition-all duration-500" />
            
            <h3 className="text-sm font-bold font-heading mb-1.5 text-foreground flex items-center gap-1.5">
              Boletín Informativo
            </h3>
            <p className="text-xs leading-relaxed text-muted-foreground mb-4">
              Suscríbete para recibir los artículos más leídos y debates de actualidad en tu bandeja de entrada.
            </p>
            
            <form 
              onSubmit={(e) => {
                e.preventDefault()
                const form = e.currentTarget
                const input = form.elements.namedItem('email') as HTMLInputElement
                if (input.value) {
                  alert(`¡Gracias por suscribirte con: ${input.value}!`)
                  input.value = ''
                }
              }}
              className="space-y-2 relative z-10"
            >
              <Input
                name="email"
                type="email"
                placeholder="tu@email.com"
                required
                className="h-9 rounded-xl border-border bg-card/65 text-xs"
              />
              <Button type="submit" className="w-full h-9 rounded-xl text-xs font-semibold shadow-md shadow-primary/20">
                Suscribirse
              </Button>
            </form>
          </div>
        </aside>
      </div>
    </section>
  )
}
