// Eagerly import all markdown files as raw strings at Vite build time.
// eager: true means files are resolved synchronously — no Node.js fs at runtime.
const modules = import.meta.glob('../content/blog/*.md', { query: '?raw', import: 'default', eager: true })

export interface PostFrontmatter {
  title: string
  date: string
  excerpt: string
  featuredImage?: string
  author: string
  tags: string[]
  published: boolean
}

export interface PostMeta extends PostFrontmatter {
  slug: string
}

export interface Post extends PostMeta {
  content: string
}

// ─── Lightweight frontmatter parser ──────────────────────────────────────────
// gray-matter uses Node.js Buffer, which is not available in the browser.
// Our frontmatter is simple YAML — string values, booleans, and string arrays.
// This covers everything we need without any Node.js dependency.

function parseFrontmatter(raw: string): { data: Record<string, unknown>; content: string } {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/)
  if (!match) return { data: {}, content: raw.trim() }

  const yamlStr = match[1]
  const content = match[2].trim()
  const data: Record<string, unknown> = {}
  const lines = yamlStr.split('\n')

  let i = 0
  while (i < lines.length) {
    const line = lines[i]
    const colonIdx = line.indexOf(':')
    if (colonIdx === -1) { i++; continue }

    const key = line.slice(0, colonIdx).trim()
    const rest = line.slice(colonIdx + 1).trim()

    if (rest === '' || rest === '[]') {
      // Block sequence — collect indented "- item" lines that follow
      const arr: string[] = []
      i++
      while (i < lines.length && /^\s*-\s/.test(lines[i])) {
        arr.push(lines[i].replace(/^\s*-\s*/, '').replace(/^["']|["']$/g, '').trim())
        i++
      }
      data[key] = arr
      continue
    }

    if (rest.startsWith('[')) {
      // Flow sequence: ["a", "b", "c"]
      data[key] = rest
        .slice(1, rest.lastIndexOf(']'))
        .split(',')
        .map(s => s.trim().replace(/^["']|["']$/g, ''))
        .filter(Boolean)
    } else if (rest === 'true') {
      data[key] = true
    } else if (rest === 'false') {
      data[key] = false
    } else {
      // Plain string — strip surrounding quotes if present
      data[key] = rest.replace(/^["']|["']$/g, '')
    }

    i++
  }

  return { data, content }
}

// ─── Public API ───────────────────────────────────────────────────────────────

function toPostFrontmatter(data: Record<string, unknown>): PostFrontmatter {
  return {
    title:          typeof data.title          === 'string'  ? data.title          : '',
    date:           typeof data.date           === 'string'  ? data.date           : '',
    excerpt:        typeof data.excerpt        === 'string'  ? data.excerpt        : '',
    author:         typeof data.author         === 'string'  ? data.author         : '',
    featuredImage:  typeof data.featuredImage  === 'string'  ? data.featuredImage  : undefined,
    tags:           Array.isArray(data.tags)                 ? (data.tags as string[]) : [],
    published:      typeof data.published      === 'boolean' ? data.published      : false,
  }
}

/** Returns all published posts sorted by date descending. */
export function getAllPosts(): PostMeta[] {
  const posts: PostMeta[] = []

  for (const path in modules) {
    const raw = modules[path] as string
    const { data } = parseFrontmatter(raw)
    if (!data.published) continue
    const slug = path.replace('../content/blog/', '').replace('.md', '')
    posts.push({ slug, ...toPostFrontmatter(data) })
  }

  return posts.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )
}

/** Returns a single published post by slug, or null if not found / unpublished. */
export function getPostBySlug(slug: string): Post | null {
  const path = `../content/blog/${slug}.md`
  const raw = modules[path] as string | undefined
  if (!raw) return null

  const { data, content } = parseFrontmatter(raw)
  if (!data.published) return null

  return { slug, content, ...toPostFrontmatter(data) }
}
