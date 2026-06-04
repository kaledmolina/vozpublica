'use client'

import { useCallback } from 'react'
import { motion } from 'framer-motion'
import { Newspaper } from 'lucide-react'
import { usePublicStore } from '@/store/public-store'
import { ArticleCard } from './ArticleCard'
import { CategoryBadge } from './CategoryBadge'
import { Skeleton } from '@/components/ui/skeleton'
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
        <h3 className="mb-2 text-lg font-semibold text-foreground">No articles found</h3>
        <p className="mb-4 text-sm text-muted-foreground">
          {selectedCategory
            ? 'No articles in this category yet.'
            : 'Start by publishing your first article.'}
        </p>
        {selectedCategory && (
          <button
            onClick={() => handleCategorySelect(null)}
            className="text-sm font-medium text-destructive hover:underline"
          >
            View all articles
          </button>
        )}
      </section>
    )
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Category Filter Tabs */}
      {categories.length > 0 && (
        <div className="mb-8 flex flex-wrap gap-2">
          <button
            onClick={() => handleCategorySelect(null)}
            className={`rounded-sm px-3 py-1.5 text-xs font-semibold uppercase tracking-wider transition-all ${
              selectedCategory === null
                ? 'bg-foreground text-background'
                : 'bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground'
            }`}
          >
            All
          </button>
          {categories.map((cat) => (
            <CategoryBadge
              key={cat.id}
              name={cat.name}
              color={cat.color}
              slug={cat.slug}
              onClick={() => handleCategorySelect(cat.slug)}
              className={
                selectedCategory === cat.slug
                  ? 'ring-1 ring-offset-1'
                  : 'opacity-70 hover:opacity-100'
              }
            />
          ))}
        </div>
      )}

      {/* Section header */}
      <div className="mb-6 flex items-center gap-3">
        <div className="h-px flex-1 bg-border" />
        <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          {selectedCategory
            ? categories.find((c) => c.slug === selectedCategory)?.name || 'Latest'
            : 'Latest Stories'}
        </h2>
        <div className="h-px flex-1 bg-border" />
      </div>

      {/* Article Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {articles.map((article, index) => (
          <ArticleCard
            key={article.id}
            article={article}
            onClick={() => handleArticleClick(article.id)}
          />
        ))}
      </div>

      {/* Loading more indicator */}
      {isLoading && articles.length > 0 && (
        <div className="mt-8 flex justify-center">
          <div className="h-1 w-32 overflow-hidden rounded-full bg-muted">
            <motion.div
              className="h-full bg-destructive"
              animate={{ x: ['-100%', '100%'] }}
              transition={{ repeat: Infinity, duration: 1, ease: 'easeInOut' }}
            />
          </div>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination className="mt-10">
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
    </section>
  )
}
