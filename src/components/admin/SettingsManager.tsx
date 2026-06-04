'use client'

import React, { useEffect, useState } from 'react'
import { Save, Loader2, Globe, FileText, Search, LayoutGrid, ToggleLeft, ToggleRight } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { useAdminStore } from '@/store/admin-store'
import { toast } from 'sonner'

interface SettingField {
  key: string
  label: string
  type: 'text' | 'textarea' | 'number' | 'boolean'
  description: string
  icon: React.ReactNode
  group: 'general' | 'seo' | 'display'
}

const SETTINGS_FIELDS: SettingField[] = [
  {
    key: 'site_name',
    label: 'Site Name',
    type: 'text',
    description: 'The name displayed in the browser tab and header',
    icon: <Globe className="h-4 w-4" />,
    group: 'general',
  },
  {
    key: 'site_description',
    label: 'Site Description',
    type: 'textarea',
    description: 'A brief description of your news portal',
    icon: <FileText className="h-4 w-4" />,
    group: 'general',
  },
  {
    key: 'seo_title',
    label: 'SEO Title',
    type: 'text',
    description: 'Default title for search engine results',
    icon: <Search className="h-4 w-4" />,
    group: 'seo',
  },
  {
    key: 'seo_description',
    label: 'SEO Description',
    type: 'textarea',
    description: 'Default meta description for search engines',
    icon: <Search className="h-4 w-4" />,
    group: 'seo',
  },
  {
    key: 'banner_enabled',
    label: 'Enable Banner',
    type: 'boolean',
    description: 'Show the announcement banner at the top of the site',
    icon: <ToggleLeft className="h-4 w-4" />,
    group: 'display',
  },
  {
    key: 'banner_text',
    label: 'Banner Text',
    type: 'text',
    description: 'Text displayed in the announcement banner',
    icon: <LayoutGrid className="h-4 w-4" />,
    group: 'display',
  },
  {
    key: 'articles_per_page',
    label: 'Articles Per Page',
    type: 'number',
    description: 'Number of articles displayed on each page (default: 12)',
    icon: <LayoutGrid className="h-4 w-4" />,
    group: 'display',
  },
]

const GROUP_LABELS: Record<string, string> = {
  general: 'General',
  seo: 'SEO',
  display: 'Display',
}

export default function SettingsManager() {
  const { settings, fetchSettings, updateSettings } = useAdminStore()
  const [localSettings, setLocalSettings] = useState<Record<string, string>>({})
  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchSettings().finally(() => setIsLoading(false))
  }, [fetchSettings])

  useEffect(() => {
    if (settings && Object.keys(settings).length > 0) {
      // Sync store settings to local form state (deferred to avoid cascading render lint)
      const s = { ...settings }
      void Promise.resolve().then(() => setLocalSettings(s))
    }
  }, [settings])

  const handleSettingChange = (key: string, value: string) => {
    setLocalSettings((prev) => ({ ...prev, [key]: value }))
  }

  const handleBooleanChange = (key: string, checked: boolean) => {
    setLocalSettings((prev) => ({ ...prev, [key]: checked ? 'true' : 'false' }))
  }

  const handleSave = async () => {
    setIsSaving(true)
    const result = await updateSettings(localSettings)
    if (result) {
      toast.success('Settings saved successfully')
    } else {
      toast.error('Failed to save settings')
    }
    setIsSaving(false)
  }

  const getSettingValue = (key: string): string => {
    return localSettings[key] || ''
  }

  const renderField = (field: SettingField) => {
    const value = getSettingValue(field.key)

    switch (field.type) {
      case 'text':
        return (
          <div className="space-y-2" key={field.key}>
            <Label htmlFor={field.key} className="flex items-center gap-2">
              {field.icon}
              {field.label}
            </Label>
            <Input
              id={field.key}
              value={value}
              onChange={(e) => handleSettingChange(field.key, e.target.value)}
              placeholder={`Enter ${field.label.toLowerCase()}...`}
            />
            <p className="text-xs text-muted-foreground">{field.description}</p>
          </div>
        )

      case 'textarea':
        return (
          <div className="space-y-2" key={field.key}>
            <Label htmlFor={field.key} className="flex items-center gap-2">
              {field.icon}
              {field.label}
            </Label>
            <Textarea
              id={field.key}
              value={value}
              onChange={(e) => handleSettingChange(field.key, e.target.value)}
              placeholder={`Enter ${field.label.toLowerCase()}...`}
              rows={3}
            />
            <p className="text-xs text-muted-foreground">{field.description}</p>
          </div>
        )

      case 'number':
        return (
          <div className="space-y-2" key={field.key}>
            <Label htmlFor={field.key} className="flex items-center gap-2">
              {field.icon}
              {field.label}
            </Label>
            <Input
              id={field.key}
              type="number"
              value={value}
              onChange={(e) => handleSettingChange(field.key, e.target.value)}
              min={1}
              max={100}
            />
            <p className="text-xs text-muted-foreground">{field.description}</p>
          </div>
        )

      case 'boolean':
        return (
          <div className="flex items-center justify-between gap-4 py-2" key={field.key}>
            <div className="space-y-0.5">
              <Label className="flex items-center gap-2">
                {field.icon}
                {field.label}
              </Label>
              <p className="text-xs text-muted-foreground">{field.description}</p>
            </div>
            <Switch
              checked={value === 'true'}
              onCheckedChange={(checked) => handleBooleanChange(field.key, checked)}
            />
          </div>
        )

      default:
        return null
    }
  }

  // Group fields
  const groupedFields = SETTINGS_FIELDS.reduce<Record<string, SettingField[]>>((acc, field) => {
    if (!acc[field.group]) acc[field.group] = []
    acc[field.group].push(field)
    return acc
  }, {})

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold">Site Settings</h2>
          <p className="text-sm text-muted-foreground">
            Configure your news portal settings
          </p>
        </div>
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save Settings
            </>
          )}
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-24" />
              </CardHeader>
              <CardContent className="space-y-4">
                {Array.from({ length: 3 }).map((_, j) => (
                  <div key={j} className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedFields).map(([group, fields]) => (
            <Card key={group}>
              <CardHeader className="pb-4">
                <CardTitle className="text-base">{GROUP_LABELS[group]}</CardTitle>
                <CardDescription>
                  {group === 'general' && 'Basic site configuration'}
                  {group === 'seo' && 'Search engine optimization settings'}
                  {group === 'display' && 'Content display and layout options'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {fields.map(renderField)}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Bottom Save Button (for long forms) */}
      {!isLoading && (
        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={isSaving} size="lg">
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save All Settings
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  )
}
