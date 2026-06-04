'use client'

import { Github, Twitter, Rss, Heart } from 'lucide-react'
import { usePublicStore } from '@/store/public-store'
import { Separator } from '@/components/ui/separator'

export function PublicFooter() {
  const categories = usePublicStore((s) => s.categories)
  const tags = usePublicStore((s) => s.tags)

  const currentYear = new Date().getFullYear()

  return (
    <footer className="mt-auto border-t border-border bg-card">
      {/* Main Footer Content */}
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="mb-3 flex items-center gap-2">
              <span
                className="text-destructive"
                style={{ fontFamily: 'Georgia, serif', fontSize: '1.75rem', fontWeight: 900 }}
              >
                N
              </span>
              <span className="text-lg font-extrabold tracking-tight">NewsPortal</span>
            </div>
            <p className="mb-4 max-w-xs text-sm leading-relaxed text-muted-foreground">
              Your trusted source for breaking news, in-depth analysis, and compelling stories
              from around the world.
            </p>
            {/* Social Links */}
            <div className="flex gap-2">
              <a
                href="#"
                className="flex h-9 w-9 items-center justify-center rounded-md bg-muted text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                aria-label="Twitter"
              >
                <Twitter className="h-4 w-4" />
              </a>
              <a
                href="#"
                className="flex h-9 w-9 items-center justify-center rounded-md bg-muted text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                aria-label="GitHub"
              >
                <Github className="h-4 w-4" />
              </a>
              <a
                href="#"
                className="flex h-9 w-9 items-center justify-center rounded-md bg-muted text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                aria-label="RSS Feed"
              >
                <Rss className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Categories */}
          <div>
            <h4 className="mb-3 text-xs font-semibold uppercase tracking-widest text-foreground">
              Categories
            </h4>
            <ul className="space-y-2">
              {categories.slice(0, 6).map((cat) => (
                <li key={cat.id}>
                  <button
                    onClick={() => usePublicStore.getState().selectCategory(cat.slug)}
                    className="text-sm text-muted-foreground transition-colors hover:text-destructive"
                  >
                    {cat.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="mb-3 text-xs font-semibold uppercase tracking-widest text-foreground">
              Quick Links
            </h4>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-sm text-muted-foreground transition-colors hover:text-destructive">
                  About Us
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-muted-foreground transition-colors hover:text-destructive">
                  Contact
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-muted-foreground transition-colors hover:text-destructive">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-muted-foreground transition-colors hover:text-destructive">
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>

          {/* Tag Cloud */}
          <div>
            <h4 className="mb-3 text-xs font-semibold uppercase tracking-widest text-foreground">
              Popular Tags
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {tags.slice(0, 10).map((tag) => (
                <span
                  key={tag.id}
                  className="rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                >
                  #{tag.name}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <Separator />
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-4 sm:flex-row sm:px-6 lg:px-8">
        <p className="text-xs text-muted-foreground">
          © {currentYear} NewsPortal. All rights reserved.
        </p>
        <p className="flex items-center gap-1 text-xs text-muted-foreground">
          Made with <Heart className="h-3 w-3 text-destructive" /> for journalism
        </p>
      </div>
    </footer>
  )
}
