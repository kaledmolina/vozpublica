'use client'

import React, { useEffect, useState } from 'react'
import { Plus, Trash2, Loader2, Tag as TagIcon } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
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
import { useAdminStore, type Tag } from '@/store/admin-store'
import { toast } from 'sonner'

export default function TagsManager() {
  const { tags, fetchTags, createTag, deleteTag } = useAdminStore()

  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [tagName, setTagName] = useState('')
  const [deletingTag, setDeletingTag] = useState<Tag | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')

  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchTags().finally(() => setIsLoading(false))
  }, [fetchTags])

  const openCreateDialog = () => {
    setTagName('')
    setError('')
    setCreateDialogOpen(true)
  }

  const handleCreate = async () => {
    if (!tagName.trim()) {
      setError('Tag name is required')
      return
    }
    setIsSaving(true)
    const result = await createTag(tagName.trim())
    if (result) {
      toast.success(`Tag "${tagName.trim()}" created`)
      setCreateDialogOpen(false)
    } else {
      toast.error('Failed to create tag (it may already exist)')
    }
    setIsSaving(false)
  }

  const handleDelete = async () => {
    if (!deletingTag) return
    setIsSaving(true)
    const result = await deleteTag(deletingTag.id)
    if (result) {
      toast.success(`Tag "${deletingTag.name}" deleted`)
    } else {
      toast.error('Failed to delete tag')
    }
    setIsSaving(false)
    setDeleteDialogOpen(false)
    setDeletingTag(null)
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold">Tags</h2>
          <p className="text-sm text-muted-foreground">
            {tags.length} tag{tags.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Button onClick={openCreateDialog} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add Tag
        </Button>
      </div>

      {/* Tags Grid */}
      {isLoading ? (
        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-5 w-20" />
                  <Skeleton className="h-5 w-5" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {tags.map((tag) => (
            <Card key={tag.id} className="group hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <TagIcon className="h-4 w-4 text-muted-foreground shrink-0" />
                    <div className="min-w-0">
                      <p className="font-medium text-sm truncate">{tag.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {tag.articleCount ?? 0} article{(tag.articleCount ?? 0) !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                    onClick={() => {
                      setDeletingTag(tag)
                      setDeleteDialogOpen(true)
                    }}
                    title="Delete tag"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          {tags.length === 0 && (
            <div className="col-span-full text-center py-12 text-muted-foreground">
              <TagIcon className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
              <p>No tags yet.</p>
              <Button variant="outline" size="sm" onClick={openCreateDialog} className="mt-3">
                <Plus className="h-4 w-4 mr-1" />
                Create your first tag
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Create Tag Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Create Tag</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="tag-name">Tag Name *</Label>
              <Input
                id="tag-name"
                value={tagName}
                onChange={(e) => {
                  setTagName(e.target.value)
                  setError('')
                }}
                placeholder="e.g. Technology"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleCreate()
                }}
              />
              {error && <p className="text-sm text-destructive">{error}</p>}
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreate} disabled={isSaving}>
                {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Create Tag
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Tag</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the tag &quot;{deletingTag?.name}&quot;? It will be removed
              from all articles using it.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isSaving}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
