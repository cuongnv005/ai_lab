import React from 'react'

/**
 * Strips all BBCode tags cleanly, including contents of [img] / [youtube] / [similar] tags
 */
export function cleanBBCode(text: string): string {
  if (!text) return ''
  return text
    .replace(/\[img\]([\s\S]*?)\[\/img\]/gi, '')
    .replace(/\[youtube\]([\s\S]*?)\[\/youtube\]/gi, '')
    .replace(/\[similar\]([\s\S]*?)\[\/similar\]/gi, '')
    .replace(/\[\/?\s*\w+.*?\]/gi, '')
    .trim()
}

/**
 * Renders BBCode formatting tags into HTML safely
 */
export function renderBBCode(text: string): React.ReactNode {
  if (!text) return ''
  let parsed = text

  // Strip [prebreak]...[/prebreak]
  parsed = parsed.replace(/\[prebreak\]([\s\S]*?)\[\/prebreak\]/gi, '')

  // Align (strip [left] completely as default is left-aligned)
  parsed = parsed.replace(/\[\/?left\]/gi, '')
  parsed = parsed.replace(/\[center\]([\s\S]*?)\[\/center\]/gi, '<div class="text-center flex flex-col items-center">$1</div>')
  parsed = parsed.replace(/\[right\]([\s\S]*?)\[\/right\]/gi, '<div class="text-right">$1</div>')
  parsed = parsed.replace(/\[justify\]([\s\S]*?)\[\/justify\]/gi, '<div class="text-justify">$1</div>')

  // Images [img]...[/img]
  parsed = parsed.replace(
    /\[img\]([\s\S]*?)\[\/img\]/gi,
    '<div class="my-3 flex justify-center"><img src="$1" class="max-w-full h-auto rounded-lg shadow-xs max-h-[400px]" /></div>',
  )

  // Gallery of multiple images
  parsed = parsed.replace(/\[gallery\]([\s\S]*?)\[\/gallery\]/gi, (match, content) => {
    const imagesHtml = content.replace(
      /\[img\]([\s\S]*?)\[\/img\]/gi,
      '<img src="$1" class="h-32 object-cover rounded-lg shadow-xs border border-border" />',
    )
    return `<div class="flex flex-wrap gap-2 justify-center my-3">${imagesHtml}</div>`
  })

  // Basic tags
  parsed = parsed
    .replace(/\[b\]([\s\S]*?)\[\/b\]/g, '<strong>$1</strong>')
    .replace(/\[i\]([\s\S]*?)\[\/i\]/g, '<em>$1</em>')
    .replace(/\[u\]([\s\S]*?)\[\/u\]/g, '<u>$1</u>')
    .replace(/\[sub\]([\s\S]*?)\[\/sub\]/g, '<sub>$1</sub>')
    .replace(/\[sup\]([\s\S]*?)\[\/sup\]/g, '<sup>$1</sup>')
    .replace(/\[strike\]([\s\S]*?)\[\/strike\]/g, '<s>$1</s>')
    .replace(/\[s\]([\s\S]*?)\[\/s\]/g, '<s>$1</s>')
    .replace(/\[code\]([\s\S]*?)\[\/code\]/g, '<pre class="bg-muted p-3 rounded-lg overflow-x-auto font-mono my-3 text-xs border border-border">$1</pre>')
    .replace(/\[url\]([\s\S]*?)\[\/url\]/g, (match, url) => {
      const cleanUrl = url.trim()
      return `<a href="${cleanUrl}" target="_blank" rel="noopener noreferrer" class="text-blue-500 hover:underline font-semibold">${cleanUrl}</a>`
    })
    .replace(/\[url=([^\]]+)\]([\s\S]*?)\[\/url\]/g, (match, url, content) => {
      const cleanUrl = url.trim()
      const text = content.trim() || cleanUrl
      return `<a href="${cleanUrl}" target="_blank" rel="noopener noreferrer" class="text-blue-500 hover:underline font-semibold">${text}</a>`
    })

  // Lists
  parsed = parsed.replace(/\[quote\]([\s\S]*?)\[\/quote\]/gi, '<blockquote class="border-l-4 border-primary/40 pl-4 py-1 my-3 italic text-foreground/80 bg-muted/30 rounded-r-md">$1</blockquote>')
  parsed = parsed.replace(/\[quote=([^\]]+)\]([\s\S]*?)\[\/quote\]/gi, '<blockquote class="border-l-4 border-primary/40 pl-4 py-1 my-3 italic text-foreground/80 bg-muted/30 rounded-r-md"><span class="block text-xs font-bold not-italic text-foreground/60 mb-1">$1 viết:</span>$2</blockquote>')

  parsed = parsed.replace(/\[li\]([\s\S]*?)\[\/li\]/gi, '<li class="my-1">$1</li>')
  parsed = parsed.replace(/\[ul\]([\s\S]*?)\[\/ul\]/gi, (match, content) => {
    const cleaned = content.trim().replace(/<\/li>\s+/g, '</li>')
    return `<ul class="list-disc pl-5 my-2">${cleaned}</ul>`
  })
  parsed = parsed.replace(/\[ol\]([\s\S]*?)\[\/ol\]/gi, (match, content) => {
    const cleaned = content.trim().replace(/<\/li>\s+/g, '</li>')
    return `<ol class="list-decimal pl-5 my-2">${cleaned}</ol>`
  })

  // Clean up newlines/whitespace inside [table] blocks to prevent invalid HTML inside tables
  parsed = parsed.replace(/\[table\]([\s\S]*?)\[\/table\]/gi, (match, content) => {
    const cleanContent = content
      .replace(/\s*\[tr\]/gi, '[tr]')
      .replace(/\[\/tr\]\s*/gi, '[/tr]')
      .replace(/\s*\[td\]/gi, '[td]')
      .replace(/\[\/td\]\s*/gi, '[/td]')
      .replace(/\s*\[th\]/gi, '[th]')
      .replace(/\[\/th\]\s*/gi, '[/th]');
    return `[table]${cleanContent}[/table]`;
  });

  // Render table tags
  parsed = parsed.replace(/\[table\]([\s\S]*?)\[\/table\]/gi, '<div class="overflow-x-auto my-4"><table class="min-w-full border border-border text-left">$1</table></div>')
  parsed = parsed.replace(/\[tr\]([\s\S]*?)\[\/tr\]/gi, '<tr class="border-b border-border">$1</tr>')
  parsed = parsed.replace(/\[td\]([\s\S]*?)\[\/td\]/gi, '<td class="px-4 py-2 border border-border text-sm">$1</td>')
  parsed = parsed.replace(/\[th\]([\s\S]*?)\[\/th\]/gi, '<th class="px-4 py-2 border border-border text-sm font-bold bg-muted">$1</th>')

  // Render hr tag
  parsed = parsed.replace(/\[hr\]/gi, '<hr class="my-6 border-t border-border" />')

  // Color style
  let oldHtml
  do {
    oldHtml = parsed
    parsed = parsed.replace(/\[color=([^\]]+)\]([\s\S]*?)\[\/color\]/gi, '<span style="color: $1">$2</span>')
  } while (parsed !== oldHtml)

  // Font family style
  do {
    oldHtml = parsed
    parsed = parsed.replace(/\[font=([^\]]+)\]([\s\S]*?)\[\/font\]/gi, (match, fontFace, content) => {
      const safeFont = fontFace.replace(/"/g, "'")
      return `<span style="font-family: ${safeFont}">${content}</span>`
    })
  } while (parsed !== oldHtml)

  // Size style
  do {
    oldHtml = parsed
    parsed = parsed.replace(/\[size=([^\]]+)\]([\s\S]*?)\[\/size\]/gi, (match, size, content) => {
      const sizeMap: Record<string, string> = {
        '1': '10px',
        '2': '12px',
        '3': '14px',
        '4': '16px',
        '5': '18px',
        '6': '24px',
        '7': '32px',
      }
      const fontSize = sizeMap[size.trim()] || (isNaN(Number(size)) ? size.trim() : `${size.trim()}px`)
      return `<span style="font-size: ${fontSize}">${content}</span>`
    })
  } while (parsed !== oldHtml)

  // Youtube Embed
  parsed = parsed.replace(/\[youtube\]([\s\S]*?)\[\/youtube\]/gi, (match, videoIdOrUrl) => {
    const trimmed = videoIdOrUrl.trim()
    let videoId = trimmed
    const urlMatch = trimmed.match(
      /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?\s]+)/i,
    )
    if (urlMatch && urlMatch[1]) {
      videoId = urlMatch[1]
    }
    return `<div class="my-3 flex justify-center"><div class="w-full max-w-xl aspect-video rounded-lg overflow-hidden shadow-xs border border-border"><iframe class="w-full h-full" src="https://www.youtube.com/embed/${videoId}" frameborder="0" allowfullscreen></iframe></div></div>`
  })

  // New lines to br
  parsed = parsed.replace(/\n/g, '<br />')

  // Strip hardcoded dark colors from style attributes so they default to the theme text color (fixes readability in dark mode)
  parsed = parsed.replace(/color:\s*(#000000|#000|#1b1b1b|#1a1a1a|#2b2b2b|#2c2c2c|#333333|#333|#222222|#222|#111111|#111|#444444|#444|black|rgb\(\s*0\s*,\s*0\s*,\s*0\s*\)|rgb\(\s*27\s*,\s*27\s*,\s*27\s*\)|rgb\(\s*43\s*,\s*43\s*,\s*43\s*\))[;]?/gi, '')
  parsed = parsed.replace(/style="\s*;?\s*"/gi, '')

  return <span dangerouslySetInnerHTML={{ __html: parsed }} />
}
