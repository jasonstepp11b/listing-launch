// Updates <head> meta tags in place via querySelector.
// Using setAttribute on existing elements guarantees there is always exactly
// one of each tag — no duplicates are possible.

export interface PageMetaOptions {
  title: string
  description?: string
  ogTitle?: string
  ogDescription?: string
  ogImage?: string
  ogUrl?: string
  ogType?: string
  canonical?: string
  articlePublishedTime?: string
  articleAuthor?: string
  keywords?: string
}

const SITE_URL = 'https://listingignite.com'
const DEFAULT_IMAGE = `${SITE_URL}/og-image.png`

function upsertMeta(selector: string, attrToSet: string, value: string) {
  let el = document.querySelector<HTMLElement>(selector)
  if (!el) {
    if (selector.startsWith('meta[property=')) {
      el = document.createElement('meta')
      const prop = selector.slice('meta[property="'.length, -2)
      el.setAttribute('property', prop)
    } else if (selector.startsWith('meta[name=')) {
      el = document.createElement('meta')
      const name = selector.slice('meta[name="'.length, -2)
      el.setAttribute('name', name)
    } else if (selector === 'link[rel="canonical"]') {
      el = document.createElement('link')
      el.setAttribute('rel', 'canonical')
    }
    if (el) document.head.appendChild(el)
  }
  el?.setAttribute(attrToSet, value)
}

export function setPageMeta(opts: PageMetaOptions) {
  const ogTitle = opts.ogTitle ?? opts.title
  const ogDesc = opts.ogDescription ?? opts.description ?? ''
  const ogImage = opts.ogImage ?? DEFAULT_IMAGE
  const ogUrl = opts.ogUrl ?? SITE_URL
  const ogType = opts.ogType ?? 'website'

  document.title = opts.title

  if (opts.description) upsertMeta('meta[name="description"]', 'content', opts.description)
  if (opts.keywords)    upsertMeta('meta[name="keywords"]',     'content', opts.keywords)

  upsertMeta('meta[property="og:title"]',       'content', ogTitle)
  upsertMeta('meta[property="og:description"]', 'content', ogDesc)
  upsertMeta('meta[property="og:image"]',       'content', ogImage)
  upsertMeta('meta[property="og:url"]',         'content', ogUrl)
  upsertMeta('meta[property="og:type"]',        'content', ogType)
  upsertMeta('meta[property="og:site_name"]',   'content', 'ListingIgnite')

  if (opts.articlePublishedTime) upsertMeta('meta[property="article:published_time"]', 'content', opts.articlePublishedTime)
  if (opts.articleAuthor)        upsertMeta('meta[property="article:author"]',          'content', opts.articleAuthor)

  upsertMeta('meta[name="twitter:card"]',        'content', 'summary_large_image')
  upsertMeta('meta[name="twitter:title"]',       'content', ogTitle)
  upsertMeta('meta[name="twitter:description"]', 'content', ogDesc)
  upsertMeta('meta[name="twitter:image"]',       'content', ogImage)

  if (opts.canonical) upsertMeta('link[rel="canonical"]', 'href', opts.canonical)
}

// ─── JSON-LD structured data ──────────────────────────────────────────────────
// Each schema is identified by a `data-schema-id` attribute so it can be
// updated in place (slug changes) or removed on unmount — no duplicates.

export function injectJsonLd(id: string, schema: Record<string, unknown>): void {
  const attr = 'data-schema-id'
  let el = document.querySelector<HTMLScriptElement>(`script[${attr}="${id}"]`)
  if (!el) {
    el = document.createElement('script')
    el.type = 'application/ld+json'
    el.setAttribute(attr, id)
    document.head.appendChild(el)
  }
  el.textContent = JSON.stringify(schema)
}

export function removeJsonLd(id: string): void {
  document.querySelector(`script[data-schema-id="${id}"]`)?.remove()
}
