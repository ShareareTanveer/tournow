/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/set-state-in-effect */
'use client'

import { useEffect, useMemo, useState } from 'react'
import MediaUploader from '@/components/admin/MediaUploader'
import DestinationBuilderSectionIcon from '@/components/admin/destinations/DestinationBuilderSectionIcon'
import { DESTINATION_BUILDER_SECTION_TYPES } from '@/components/admin/destinations/DestinationBuilderSectionTypes'
import TailwindHtmlBlock from '@/components/ui/TailwindHtmlBlock'
import { applyHtmlTemplateBindings, extractHtmlTemplateFields } from '@/lib/html-template'

const DEFAULT_STYLE = {
  bgColor: '',
  bgImage: '',
  paddingTop: 72,
  paddingBottom: 72,
}

export default function DestinationBuilderSectionEditor({
  section,
  onSave,
}: {
  section: any
  onSave: (payload: any) => void
}) {
  const [title, setTitle] = useState(section.title || '')
  const [mode, setMode] = useState<'template' | 'html'>(section.mode === 'html' ? 'html' : 'template')
  const [content, setContent] = useState<any>(section.content || {})
  const [style, setStyle] = useState<any>({ ...DEFAULT_STYLE, ...(section.style || {}) })
  const [canvasText, setCanvasText] = useState(JSON.stringify(section.canvas || { rows: [] }, null, 2))
  const [promptCopied, setPromptCopied] = useState(false)
  const [showHtmlPreview, setShowHtmlPreview] = useState(false)
  const [htmlTab, setHtmlTab] = useState<'html' | 'fields'>('html')

  useEffect(() => {
    setTitle(section.title || '')
    setMode(section.mode === 'html' ? 'html' : 'template')
    setContent(section.content || {})
    setStyle({ ...DEFAULT_STYLE, ...(section.style || {}) })
    setCanvasText(JSON.stringify(section.canvas || { rows: [] }, null, 2))
    setPromptCopied(false)
    setShowHtmlPreview(false)
    setHtmlTab('html')
  }, [section])

  const typeConfig = useMemo(
    () => DESTINATION_BUILDER_SECTION_TYPES.find((item) => item.type === section.sectionType),
    [section.sectionType]
  )
  const htmlTemplateFields = useMemo(
    () => extractHtmlTemplateFields(String(content.htmlContent || '')),
    [content.htmlContent]
  )
  const renderedHtmlPreview = useMemo(
    () => applyHtmlTemplateBindings(String(content.htmlContent || ''), content.htmlBindings as Record<string, unknown> | undefined),
    [content.htmlContent, content.htmlBindings]
  )

  function updateContent(key: string, value: any) {
    setContent((prev: any) => ({ ...prev, [key]: value }))
  }

  function updateArrayItem(arrayKey: string, index: number, field: string, value: any) {
    setContent((prev: any) => {
      const next = [...(prev[arrayKey] || [])]
      next[index] = { ...next[index], [field]: value }
      return { ...prev, [arrayKey]: next }
    })
  }

  function addArrayItem(arrayKey: string, template: any) {
    setContent((prev: any) => ({
      ...prev,
      [arrayKey]: [...(prev[arrayKey] || []), template],
    }))
  }

  function removeArrayItem(arrayKey: string, index: number) {
    setContent((prev: any) => ({
      ...prev,
      [arrayKey]: (prev[arrayKey] || []).filter((_: any, i: number) => i !== index),
    }))
  }

  function handleSave() {
    let nextCanvas = section.canvas ?? null

    if (section.sectionType === 'canvas') {
      try {
        nextCanvas = JSON.parse(canvasText)
      } catch {
        return
      }
    }

    onSave({
      title,
      presetKey: section.presetKey ?? null,
      mode,
      content,
      style,
      canvas: nextCanvas,
    })
  }

  async function handleCopyHtmlPrompt() {
    const prompt = `Create a single responsive HTML section using Tailwind CSS utility classes only.

Rules:
- Return HTML only
- Do not return markdown fences
- Do not include <html>, <head>, or <body>
- Use Tailwind classes for all styling, spacing, layout, typography, colors, borders, shadows, gradients, and responsive behavior
- Make the section production-ready for desktop and mobile
- Keep the layout visually polished and modern
- If needed, use placeholder images from https://images.unsplash.com or https://picsum.photos
- Use accessible markup where possible

Project context:
- This HTML will be injected into a destination page
- Tailwind classes are supported
- The section should feel premium and travel-focused unless I say otherwise
- Use placeholders for editable fields, for example:
  - {{heroTitle}}
  - {{heroText}}
  - {{primaryButtonText}}
  - {{primaryButtonLink}}
  - {{heroImage}}

My content brief:
[Write the content type here. Example: destination highlight section, visa process section, testimonial strip, CTA banner, itinerary teaser]

My design brief:
[Write the design direction here. Example: luxury dark section with gold accents, airy editorial layout, tropical bright card grid, minimal corporate block]

Output:
- One complete HTML snippet only`

    try {
      await navigator.clipboard.writeText(prompt)
      setPromptCopied(true)
      window.setTimeout(() => setPromptCopied(false), 2000)
    } catch {
      setPromptCopied(false)
    }
  }

  function renderContentFields() {
    if (section.sectionType === 'canvas') {
      return (
        <div className="space-y-2">
          <FieldLabel label="Canvas JSON" />
          <textarea
            value={canvasText}
            onChange={(event) => setCanvasText(event.target.value)}
            className="mt-1 h-80 w-full rounded-lg border border-gray-200 bg-white p-3 font-mono text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-xs text-gray-400">
            This builder follows the `ccbd` editing structure. Canvas sections can still be edited here as raw JSON.
          </p>
        </div>
      )
    }

    if (mode === 'html' || section.sectionType === 'html-block') {
      return (
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setHtmlTab('html')}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition ${
                  htmlTab === 'html'
                    ? 'bg-blue-100 text-blue-700'
                    : 'border border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                HTML
              </button>
              <button
                type="button"
                onClick={() => setHtmlTab('fields')}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition ${
                  htmlTab === 'fields'
                    ? 'bg-blue-100 text-blue-700'
                    : 'border border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                Fields {htmlTemplateFields.length > 0 ? `(${htmlTemplateFields.length})` : ''}
              </button>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowHtmlPreview(true)}
                className="rounded-md border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
              >
                Preview
              </button>
              <button
                type="button"
                onClick={handleCopyHtmlPrompt}
                className="rounded-md border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
              >
                {promptCopied ? 'Prompt Copied' : 'Copy Design Prompt'}
              </button>
            </div>
          </div>
          {htmlTab === 'html' ? (
            <>
              <p className="text-xs text-gray-400">
                Custom HTML supports full Tailwind utility classes. Use placeholders like {'{{heroTitle}}'} and {'{{heroImage}}'} to generate editable fields.
              </p>
              <textarea
                value={content.htmlContent || ''}
                onChange={(event) => updateContent('htmlContent', event.target.value)}
                className="mt-1 h-64 w-full rounded-lg border border-gray-200 bg-white p-3 font-mono text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="<div>Your custom HTML...</div>"
              />
            </>
          ) : (
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
              <div className="mb-3">
                <p className="text-sm font-semibold text-gray-800">Generated Fields</p>
                <p className="mt-1 text-xs text-gray-400">
                  These fields come from placeholders in your HTML template.
                </p>
              </div>
              {htmlTemplateFields.length > 0 ? (
                <div className="space-y-4">
                  {htmlTemplateFields.map((field) => (
                    <div key={field.key}>
                      {field.kind === 'image' ? (
                        <FieldImageUpload
                          label={field.label}
                          value={String(content.htmlBindings?.[field.key] ?? '')}
                          onChange={(value) =>
                            updateContent('htmlBindings', {
                              ...(content.htmlBindings || {}),
                              [field.key]: value,
                            })
                          }
                        />
                      ) : field.kind === 'textarea' ? (
                        <FieldTextarea
                          label={field.label}
                          value={String(content.htmlBindings?.[field.key] ?? '')}
                          onChange={(value) =>
                            updateContent('htmlBindings', {
                              ...(content.htmlBindings || {}),
                              [field.key]: value,
                            })
                          }
                          rows={4}
                        />
                      ) : (
                        <FieldInput
                          label={field.label}
                          value={String(content.htmlBindings?.[field.key] ?? '')}
                          onChange={(value) =>
                            updateContent('htmlBindings', {
                              ...(content.htmlBindings || {}),
                              [field.key]: value,
                            })
                          }
                        />
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-lg border border-dashed border-gray-300 bg-white p-6 text-sm text-gray-500">
                  <p className="font-medium text-gray-700">No editable fields detected yet.</p>
                  <p className="mt-2">
                    Add placeholders inside your HTML, then come back here.
                  </p>
                  <pre className="mt-3 overflow-x-auto rounded-md bg-slate-950 p-3 text-xs text-slate-100">
{`<h2>{{heroTitle}}</h2>
<p>{{heroText}}</p>
<img src="{{heroImage}}" alt="{{heroTitle}}" />
<a href="{{primaryButtonLink}}">{{primaryButtonText}}</a>`}
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>
      )
    }

    switch (section.sectionType) {
      case 'hero':
        return (
          <div className="space-y-4">
            <FieldInput label="Eyebrow" value={content.eyebrow} onChange={(value) => updateContent('eyebrow', value)} />
            <FieldInput label="Title" value={content.title} onChange={(value) => updateContent('title', value)} />
            <FieldTextarea label="Subtitle" value={content.subtitle} onChange={(value) => updateContent('subtitle', value)} />
            <FieldImageUpload label="Hero Image" value={content.image} onChange={(value) => updateContent('image', value)} />
            <div className="grid grid-cols-2 gap-3">
              <FieldInput label="CTA Text" value={content.primaryCtaText} onChange={(value) => updateContent('primaryCtaText', value)} />
              <FieldInput label="CTA Link" value={content.primaryCtaLink} onChange={(value) => updateContent('primaryCtaLink', value)} />
            </div>
          </div>
        )

      case 'quick-facts':
        return (
          <div className="space-y-4">
            <FieldInput label="Section Title" value={content.title} onChange={(value) => updateContent('title', value)} />
            <FactsEditor
              items={content.facts || []}
              onUpdate={(index, field, value) => updateArrayItem('facts', index, field, value)}
              onAdd={() => addArrayItem('facts', { label: '', value: '', icon: 'map-pin' })}
              onRemove={(index) => removeArrayItem('facts', index)}
            />
            <FieldInput label="CTA Title" value={content.ctaTitle} onChange={(value) => updateContent('ctaTitle', value)} />
            <FieldTextarea label="CTA Text" value={content.ctaText} onChange={(value) => updateContent('ctaText', value)} />
            <div className="grid grid-cols-2 gap-3">
              <FieldInput label="CTA Button Text" value={content.ctaButtonText} onChange={(value) => updateContent('ctaButtonText', value)} />
              <FieldInput label="CTA Button Link" value={content.ctaButtonLink} onChange={(value) => updateContent('ctaButtonLink', value)} />
            </div>
          </div>
        )

      case 'story':
        return (
          <div className="space-y-4">
            <FieldInput label="Heading" value={content.heading} onChange={(value) => updateContent('heading', value)} />
            <FieldTextarea label="Body" value={content.body} onChange={(value) => updateContent('body', value)} rows={8} />
          </div>
        )

      case 'highlights':
        return (
          <div className="space-y-4">
            <FieldInput label="Heading" value={content.heading} onChange={(value) => updateContent('heading', value)} />
            <FieldTextarea label="Subheading" value={content.subheading} onChange={(value) => updateContent('subheading', value)} />
            <HighlightItemsEditor
              items={content.items || []}
              onUpdate={(index, field, value) => updateArrayItem('items', index, field, value)}
              onAdd={() => addArrayItem('items', { title: '', description: '', image: '' })}
              onRemove={(index) => removeArrayItem('items', index)}
            />
          </div>
        )

      case 'gallery':
        return (
          <div className="space-y-4">
            <FieldInput label="Heading" value={content.heading} onChange={(value) => updateContent('heading', value)} />
            <FieldTextarea label="Subheading" value={content.subheading} onChange={(value) => updateContent('subheading', value)} />
            <ImageListEditor
              items={content.images || []}
              onChange={(images) => updateContent('images', images)}
            />
          </div>
        )

      case 'stats-strip':
        return (
          <StatsEditor
            items={content.items || []}
            onUpdate={(index, field, value) => updateArrayItem('items', index, field, value)}
            onAdd={() => addArrayItem('items', { value: '', label: '' })}
            onRemove={(index) => removeArrayItem('items', index)}
          />
        )

      case 'packages':
        return (
          <div className="space-y-4">
            <FieldInput label="Heading" value={content.heading} onChange={(value) => updateContent('heading', value)} />
            <FieldTextarea label="Subheading" value={content.subheading} onChange={(value) => updateContent('subheading', value)} />
            <FieldInput label="Empty Title" value={content.emptyTitle} onChange={(value) => updateContent('emptyTitle', value)} />
            <FieldTextarea label="Empty Text" value={content.emptyText} onChange={(value) => updateContent('emptyText', value)} />
            <FieldInput label="CTA Text" value={content.ctaText} onChange={(value) => updateContent('ctaText', value)} />
            <p className="text-xs text-gray-400">Data is pulled automatically from destination-linked packages.</p>
          </div>
        )

      case 'tours':
        return (
          <div className="space-y-4">
            <FieldInput label="Heading" value={content.heading} onChange={(value) => updateContent('heading', value)} />
            <FieldTextarea label="Subheading" value={content.subheading} onChange={(value) => updateContent('subheading', value)} />
            <p className="text-xs text-gray-400">Data is pulled automatically from destination-linked tours.</p>
          </div>
        )

      case 'faq':
        return (
          <div className="space-y-4">
            <FieldInput label="Heading" value={content.heading} onChange={(value) => updateContent('heading', value)} />
            <FaqEditor
              items={content.items || []}
              onUpdate={(index, field, value) => updateArrayItem('items', index, field, value)}
              onAdd={() => addArrayItem('items', { question: '', answer: '' })}
              onRemove={(index) => removeArrayItem('items', index)}
            />
          </div>
        )

      case 'testimonial':
        return (
          <div className="space-y-4">
            <FieldInput label="Heading" value={content.heading} onChange={(value) => updateContent('heading', value)} />
            <FieldTextarea label="Quote" value={content.quote} onChange={(value) => updateContent('quote', value)} />
            <div className="grid grid-cols-2 gap-3">
              <FieldInput label="Author" value={content.author} onChange={(value) => updateContent('author', value)} />
              <FieldInput label="Role" value={content.role} onChange={(value) => updateContent('role', value)} />
            </div>
            <FieldImageUpload label="Image" value={content.image} onChange={(value) => updateContent('image', value)} />
          </div>
        )

      case 'cta':
        return (
          <div className="space-y-4">
            <FieldInput label="Eyebrow" value={content.eyebrow} onChange={(value) => updateContent('eyebrow', value)} />
            <FieldInput label="Heading" value={content.heading} onChange={(value) => updateContent('heading', value)} />
            <FieldTextarea label="Body" value={content.body} onChange={(value) => updateContent('body', value)} />
            <div className="grid grid-cols-2 gap-3">
              <FieldInput label="Primary CTA Text" value={content.primaryCtaText} onChange={(value) => updateContent('primaryCtaText', value)} />
              <FieldInput label="Primary CTA Link" value={content.primaryCtaLink} onChange={(value) => updateContent('primaryCtaLink', value)} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <FieldInput label="Secondary CTA Text" value={content.secondaryCtaText} onChange={(value) => updateContent('secondaryCtaText', value)} />
              <FieldInput label="Secondary CTA Link" value={content.secondaryCtaLink} onChange={(value) => updateContent('secondaryCtaLink', value)} />
            </div>
          </div>
        )

      default:
        return (
          <div>
            <FieldLabel label="Raw JSON Content" />
            <textarea
              value={JSON.stringify(content, null, 2)}
              onChange={(event) => {
                try {
                  setContent(JSON.parse(event.target.value))
                } catch {}
              }}
              className="mt-1 h-56 w-full rounded-lg border border-gray-200 bg-white p-3 font-mono text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        )
    }
  }

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
      <div className="flex items-center justify-between border-b border-gray-200 p-4">
        <div className="flex items-center gap-2">
          <DestinationBuilderSectionIcon iconName={typeConfig?.iconName} className="h-5 w-5 text-gray-400" />
          <div>
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              className="h-8 border-none p-0 text-sm font-semibold text-gray-900 focus:outline-none"
              placeholder="Section title"
            />
            <p className="text-[11px] text-gray-400">{section.sectionType}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleSave}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
        >
          Save Section
        </button>
      </div>

      {section.sectionType !== 'canvas' && section.sectionType !== 'html-block' && (
        <div className="flex items-center gap-4 border-b border-gray-100 px-4 py-3">
          <FieldLabel label="Mode:" inline />
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setMode('template')}
              className={`rounded-md px-3 py-1 text-xs transition ${
                mode === 'template' ? 'bg-blue-100 text-blue-700' : 'text-gray-500 hover:bg-gray-100'
              }`}
            >
              Template
            </button>
            <button
              type="button"
              onClick={() => setMode('html')}
              className={`rounded-md px-3 py-1 text-xs transition ${
                mode === 'html' ? 'bg-blue-100 text-blue-700' : 'text-gray-500 hover:bg-gray-100'
              }`}
            >
              Custom HTML
            </button>
          </div>
        </div>
      )}

      <div className="max-h-[calc(100vh-340px)] overflow-y-auto p-4">{renderContentFields()}</div>

      <div className="border-t border-gray-100 px-4 py-3">
        <p className="mb-3 text-xs font-semibold text-gray-500">Style</p>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <FieldInput label="BG Color" value={style.bgColor} onChange={(value) => setStyle({ ...style, bgColor: value })} />
          <FieldInput label="BG Image" value={style.bgImage} onChange={(value) => setStyle({ ...style, bgImage: value })} />
          <FieldInput label="Padding Top" value={style.paddingTop} onChange={(value) => setStyle({ ...style, paddingTop: Number(value) || 0 })} type="number" />
          <FieldInput label="Padding Bottom" value={style.paddingBottom} onChange={(value) => setStyle({ ...style, paddingBottom: Number(value) || 0 })} type="number" />
        </div>
      </div>

      {showHtmlPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="max-h-[90vh] w-full max-w-6xl overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
              <div>
                <p className="text-base font-semibold text-gray-900">HTML Preview</p>
                <p className="mt-1 text-xs text-gray-400">
                  Tailwind-rendered preview using the same output path as the destination page.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowHtmlPreview(false)}
                className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
              >
                Close
              </button>
            </div>
            <div className="max-h-[calc(90vh-80px)] overflow-y-auto bg-gray-50 p-4">
              {renderedHtmlPreview.trim() ? (
                <TailwindHtmlBlock html={renderedHtmlPreview} className="rounded-xl bg-white" minHeight={420} />
              ) : (
                <div className="rounded-xl border border-dashed border-gray-300 bg-white p-10 text-center text-sm text-gray-400">
                  Add HTML content first to preview it.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function FieldLabel({ label, inline = false }: { label: string; inline?: boolean }) {
  return <label className={inline ? 'text-xs text-gray-500' : 'text-xs font-medium text-gray-700'}>{label}</label>
}

function FieldInput({
  label,
  value,
  onChange,
  type = 'text',
}: {
  label: string
  value: any
  onChange: (value: string) => void
  type?: string
}) {
  return (
    <div>
      <FieldLabel label={label} />
      <input
        type={type}
        value={value ?? ''}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1 h-9 w-full rounded-md border border-gray-200 px-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  )
}

function FieldTextarea({
  label,
  value,
  onChange,
  rows = 3,
}: {
  label: string
  value: any
  onChange: (value: string) => void
  rows?: number
}) {
  return (
    <div>
      <FieldLabel label={label} />
      <textarea
        value={value ?? ''}
        onChange={(event) => onChange(event.target.value)}
        rows={rows}
        className="mt-1 w-full rounded-md border border-gray-200 p-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  )
}

function FieldImageUpload({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (value: string) => void
}) {
  return (
    <div className="space-y-2">
      <FieldLabel label={label} />
      <MediaUploader
        value={value || ''}
        onChange={onChange}
        label={label}
      />
    </div>
  )
}

function FactsEditor({
  items,
  onUpdate,
  onAdd,
  onRemove,
}: {
  items: any[]
  onUpdate: (index: number, field: string, value: string) => void
  onAdd: () => void
  onRemove: (index: number) => void
}) {
  return (
    <SectionArrayShell label="Facts" addLabel="+ Add Fact" onAdd={onAdd}>
      {items.map((item, index) => (
        <div key={`fact-${index}`} className="mt-2 rounded-lg border border-gray-200 p-3">
          <div className="grid gap-2 md:grid-cols-3">
            <FieldInput label="Label" value={item.label} onChange={(value) => onUpdate(index, 'label', value)} />
            <FieldInput label="Value" value={item.value} onChange={(value) => onUpdate(index, 'value', value)} />
            <FieldInput label="Icon" value={item.icon} onChange={(value) => onUpdate(index, 'icon', value)} />
          </div>
          <RemoveButton onClick={() => onRemove(index)} />
        </div>
      ))}
    </SectionArrayShell>
  )
}

function HighlightItemsEditor({
  items,
  onUpdate,
  onAdd,
  onRemove,
}: {
  items: any[]
  onUpdate: (index: number, field: string, value: string) => void
  onAdd: () => void
  onRemove: (index: number) => void
}) {
  return (
    <SectionArrayShell label="Highlight Items" addLabel="+ Add Highlight" onAdd={onAdd}>
      {items.map((item, index) => (
        <div key={`highlight-${index}`} className="mt-2 space-y-2 rounded-lg border border-gray-200 p-3">
          <FieldInput label="Title" value={item.title} onChange={(value) => onUpdate(index, 'title', value)} />
          <FieldTextarea label="Description" value={item.description} onChange={(value) => onUpdate(index, 'description', value)} />
          <FieldImageUpload label="Image" value={item.image || ''} onChange={(value) => onUpdate(index, 'image', value)} />
          <RemoveButton onClick={() => onRemove(index)} />
        </div>
      ))}
    </SectionArrayShell>
  )
}

function ImageListEditor({
  items,
  onChange,
}: {
  items: string[]
  onChange: (items: string[]) => void
}) {
  return (
    <SectionArrayShell
      label="Images"
      addLabel="+ Add Image"
      onAdd={() => onChange([...(items || []), ''])}
    >
      {(items || []).map((item, index) => (
        <div key={`image-${index}`} className="mt-2 rounded-lg border border-gray-200 p-3">
          <FieldImageUpload
            label={`Image ${index + 1}`}
            value={item || ''}
            onChange={(value) => onChange(items.map((current, i) => (i === index ? value : current)))}
          />
          <RemoveButton onClick={() => onChange(items.filter((_, i) => i !== index))} />
        </div>
      ))}
    </SectionArrayShell>
  )
}

function StatsEditor({
  items,
  onUpdate,
  onAdd,
  onRemove,
}: {
  items: any[]
  onUpdate: (index: number, field: string, value: string) => void
  onAdd: () => void
  onRemove: (index: number) => void
}) {
  return (
    <SectionArrayShell label="Stats" addLabel="+ Add Stat" onAdd={onAdd}>
      {items.map((item, index) => (
        <div key={`stat-${index}`} className="mt-2 rounded-lg border border-gray-200 p-3">
          <div className="grid gap-2 md:grid-cols-2">
            <FieldInput label="Value" value={item.value} onChange={(value) => onUpdate(index, 'value', value)} />
            <FieldInput label="Label" value={item.label} onChange={(value) => onUpdate(index, 'label', value)} />
          </div>
          <RemoveButton onClick={() => onRemove(index)} />
        </div>
      ))}
    </SectionArrayShell>
  )
}

function FaqEditor({
  items,
  onUpdate,
  onAdd,
  onRemove,
}: {
  items: any[]
  onUpdate: (index: number, field: string, value: string) => void
  onAdd: () => void
  onRemove: (index: number) => void
}) {
  return (
    <SectionArrayShell label="FAQ Items" addLabel="+ Add FAQ" onAdd={onAdd}>
      {items.map((item, index) => (
        <div key={`faq-${index}`} className="mt-2 rounded-lg border border-gray-200 p-3">
          <FieldInput label="Question" value={item.question} onChange={(value) => onUpdate(index, 'question', value)} />
          <FieldTextarea label="Answer" value={item.answer} onChange={(value) => onUpdate(index, 'answer', value)} />
          <RemoveButton onClick={() => onRemove(index)} />
        </div>
      ))}
    </SectionArrayShell>
  )
}

function SectionArrayShell({
  label,
  addLabel,
  onAdd,
  children,
}: {
  label: string
  addLabel: string
  onAdd: () => void
  children: React.ReactNode
}) {
  return (
    <div>
      <div className="flex items-center justify-between">
        <FieldLabel label={label} />
        <button type="button" onClick={onAdd} className="text-xs text-blue-500 hover:text-blue-600">
          {addLabel}
        </button>
      </div>
      {children}
    </div>
  )
}

function RemoveButton({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="mt-2 text-xs text-red-500 hover:text-red-600">
      Remove
    </button>
  )
}
