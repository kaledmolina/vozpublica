'use client'

import React, { useEffect, useState } from 'react'
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Eye,
  Filter,
  Loader2,
  ImageOff,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useAdminStore, type Article } from '@/store/admin-store'
import { format } from 'date-fns'
import ArticleEditor from './ArticleEditor'

interface ArticleManagerProps {
  isAdmin: boolean
  userId: string
}

function getStatusBadgeColor(status: string) {
  switch (status) {
    case 'PUBLISHED':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
    case 'PENDING_REVIEW':
      return 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200'
    case 'DRAFT':
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    default:
      return ''
  }
}

export default function ArticleManager({ isAdmin, userId }: ArticleManagerProps) {
  const {
    articles,
    isLoadingArticles,
    fetchArticles,
    deleteArticle,
    articleStatusFilter,
    articleSearchQuery,
    setArticleStatusFilter,
    setArticleSearchQuery,
  } = useAdminStore()

  const [editorOpen, setEditorOpen] = useState(false)
  const [editingArticle, setEditingArticle] = useState<Article | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [articleToDelete, setArticleToDelete] = useState<Article | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    fetchArticles()
  }, [])

  // Filter articles for non-admin (own only)
  const displayedArticles = isAdmin
    ? articles
    : articles.filter((a) => a.authorId === userId)

  const filteredArticles = displayedArticles.filter((article) => {
    const matchesStatus = !articleStatusFilter || article.status === articleStatusFilter
    const matchesSearch =
      !articleSearchQuery ||
      article.title.toLowerCase().includes(articleSearchQuery.toLowerCase())
    return matchesStatus && matchesSearch
  })

  const handleCreate = () => {
    setEditingArticle(null)
    setEditorOpen(true)
  }

  const handleEdit = (article: Article) => {
    setEditingArticle(article)
    setEditorOpen(true)
  }

  const handleDeleteClick = (article: Article) => {
    setArticleToDelete(article)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!articleToDelete) return
    setIsDeleting(true)
    await deleteArticle(articleToDelete.id)
    setIsDeleting(false)
    setDeleteDialogOpen(false)
    setArticleToDelete(null)
  }

  const handleEditorClose = (changed?: boolean) => {
    setEditorOpen(false)
    setEditingArticle(null)
    if (changed) {
      fetchArticles()
    }
  }

  return (
    <div className="space-y-4">
      {/* Header & Actions */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold">Articles</h2>
          <p className="text-sm text-muted-foreground">
            {filteredArticles.length} article{filteredArticles.length !== 1 ? 's' : ''} found
          </p>
        </div>
        <Button onClick={handleCreate} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          New Article
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search articles..."
                value={articleSearchQuery}
                onChange={(e) => setArticleSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={articleStatusFilter} onValueChange={setArticleStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Status</SelectItem>
                <SelectItem value="DRAFT">Draft</SelectItem>
                <SelectItem value="PENDING_REVIEW">Pending Review</SelectItem>
                <SelectItem value="PUBLISHED">Published</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Articles Table */}
      <Card>
        <CardContent className="p-0">
          {isLoadingArticles ? (
            <div className="space-y-3 p-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="h-10 w-10 rounded" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                  <Skeleton className="h-6 w-20" />
                  <Skeleton className="h-8 w-24" />
                </div>
              ))}
            </div>
          ) : (
            <div className="max-h-[500px] overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="pl-6 w-[40px]"></TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead className="hidden sm:table-cell">Author</TableHead>
                    <TableHead className="hidden md:table-cell">Category</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="hidden lg:table-cell">Views</TableHead>
                    <TableHead className="hidden lg:table-cell text-right">Date</TableHead>
                    <TableHead className="pr-6 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredArticles.map((article) => (
                    <TableRow key={article.id}>
                      <TableCell className="pl-6">
                        {article.coverImage ? (
                          <img
                            src={article.coverImage}
                            alt=""
                            className="h-10 w-10 rounded object-cover"
                            onError={(e) => {
                              ;(e.target as HTMLImageElement).style.display = 'none'
                            }}
                          />
                        ) : (
                          <div className="flex h-10 w-10 items-center justify-center rounded bg-muted">
                            <ImageOff className="h-4 w-4 text-muted-foreground" />
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="max-w-[250px]">
                          <p className="font-medium truncate">{article.title}</p>
                          {article.isFeatured && (
                            <Badge variant="outline" className="text-[10px] mt-1">
                              Featured
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={article.author?.avatar || undefined} />
                            <AvatarFallback className="text-[10px]">
                              {article.author?.name?.[0] || '?'}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm text-muted-foreground truncate max-w-[100px]">
                            {article.author?.name || 'Unknown'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {article.category?.name ? (
                          <Badge variant="outline" className="text-xs">
                            {article.category.name}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground text-xs">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={`text-xs ${getStatusBadgeColor(article.status)}`}
                        >
                          {article.status === 'PENDING_REVIEW'
                            ? 'Pending'
                            : article.status.charAt(0) + article.status.slice(1).toLowerCase()}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-muted-foreground">
                        <div className="flex items-center gap-1 text-sm">
                          <Eye className="h-3 w-3" />
                          {article.views}
                        </div>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-right text-sm text-muted-foreground whitespace-nowrap">
                        {format(new Date(article.createdAt), 'MMM d, yyyy')}
                      </TableCell>
                      <TableCell className="pr-6">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleEdit(article)}
                            title="Edit"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => handleDeleteClick(article)}
                            title="Delete"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredArticles.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-12">
                        <div className="flex flex-col items-center gap-2">
                          <FileIcon className="h-8 w-8 text-muted-foreground" />
                          <p className="text-muted-foreground">No articles found.</p>
                          <Button variant="outline" size="sm" onClick={handleCreate}>
                            <Plus className="h-4 w-4 mr-1" />
                            Create your first article
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Article Editor Dialog */}
      <Dialog open={editorOpen} onOpenChange={(open) => !open && handleEditorClose()}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto p-0">
          <DialogHeader className="p-6 pb-0">
            <DialogTitle>
              {editingArticle ? 'Edit Article' : 'New Article'}
            </DialogTitle>
          </DialogHeader>
          <ArticleEditor
            article={editingArticle}
            onClose={handleEditorClose}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Article</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{articleToDelete?.title}&quot;? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

// Small placeholder icon component
function FileIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
      <polyline points="14 2 14 8 20 8" />
    </svg>
  )
}
