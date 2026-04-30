'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import Underline from '@tiptap/extension-underline'
import TextAlign from '@tiptap/extension-text-align'
import { TextStyle } from '@tiptap/extension-text-style'
import Color from '@tiptap/extension-color'
import Placeholder from '@tiptap/extension-placeholder'
import { useEffect, useRef, useState } from 'react'
import {
  FiBold, FiItalic, FiUnderline, FiList, FiLink, FiImage,
  FiAlignLeft, FiAlignCenter, FiAlignRight, FiCode,
} from 'react-icons/fi'

interface Props {
  value: string
  onChange: (html: string) => void
  placeholder?: string
  className?: string
}

export default function RichTextEditor({ value, onChange, placeholder = 'Write here…', className = '' }: Props) {
  const [linkUrl, setLinkUrl] = useState('')
  const [showLink, setShowLink] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Underline,
      TextStyle,
      Color,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Image.configure({ inline: false, allowBase64: true }),
      Link.configure({ openOnClick: false }),
      Placeholder.configure({ placeholder }),
    ],
    content: value,
    onUpdate({ editor }) {
      onChange(editor.getHTML())
    },
  })

  // Sync value if changed externally
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value, { emitUpdate: false })
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])

  if (!editor) return (
    <div className={`border border-gray-200 rounded-xl min-h-[200px] bg-gray-50 ${className}`} />
  )

  function addLink() {
    if (!linkUrl) return
    editor!.chain().focus().setLink({ href: linkUrl }).run()
    setLinkUrl('')
    setShowLink(false)
  }

  async function handleImageUpload(file: File) {
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('folder', 'content')
      const res = await fetch('/api/media/upload', { method: 'POST', body: fd })
      if (!res.ok) throw new Error('Upload failed')
      const { url } = await res.json()
      editor!.chain().focus().setImage({ src: url }).run()
    } catch {
      alert('Image upload failed')
    } finally {
      setUploading(false)
    }
  }

  const btn = (active: boolean, onClick: () => void, icon: React.ReactNode, title: string) => (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={`p-2 rounded-lg transition-colors text-sm ${active
        ? 'bg-indigo-100 text-indigo-600'
        : 'text-gray-600 hover:bg-gray-100'}`}
    >
      {icon}
    </button>
  )

  return (
    <div className={`border border-gray-200 rounded-xl overflow-hidden ${className}`}>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 px-2 py-1.5 border-b border-gray-100 bg-gray-50">
        {btn(editor.isActive('bold'), () => editor.chain().focus().toggleBold().run(), <FiBold size={14} />, 'Bold')}
        {btn(editor.isActive('italic'), () => editor.chain().focus().toggleItalic().run(), <FiItalic size={14} />, 'Italic')}
        {btn(editor.isActive('underline'), () => editor.chain().focus().toggleUnderline().run(), <FiUnderline size={14} />, 'Underline')}

        <div className="w-px h-5 bg-gray-200 mx-1" />

        {btn(editor.isActive('heading', { level: 2 }), () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
          <span className="text-xs font-bold">H2</span>, 'Heading 2')}
        {btn(editor.isActive('heading', { level: 3 }), () => editor.chain().focus().toggleHeading({ level: 3 }).run(),
          <span className="text-xs font-bold">H3</span>, 'Heading 3')}

        <div className="w-px h-5 bg-gray-200 mx-1" />

        {btn(editor.isActive('bulletList'), () => editor.chain().focus().toggleBulletList().run(), <FiList size={14} />, 'Bullet list')}
        {btn(editor.isActive('orderedList'), () => editor.chain().focus().toggleOrderedList().run(),
          <span className="text-xs font-bold">1.</span>, 'Ordered list')}
        {btn(editor.isActive('blockquote'), () => editor.chain().focus().toggleBlockquote().run(),
          <span className="text-xs font-bold">"</span>, 'Blockquote')}
        {btn(editor.isActive('code'), () => editor.chain().focus().toggleCode().run(), <FiCode size={14} />, 'Inline code')}

        <div className="w-px h-5 bg-gray-200 mx-1" />

        {btn(editor.isActive({ textAlign: 'left' }), () => editor.chain().focus().setTextAlign('left').run(), <FiAlignLeft size={14} />, 'Align left')}
        {btn(editor.isActive({ textAlign: 'center' }), () => editor.chain().focus().setTextAlign('center').run(), <FiAlignCenter size={14} />, 'Align center')}
        {btn(editor.isActive({ textAlign: 'right' }), () => editor.chain().focus().setTextAlign('right').run(), <FiAlignRight size={14} />, 'Align right')}

        <div className="w-px h-5 bg-gray-200 mx-1" />

        <button type="button" title="Link" onClick={() => setShowLink(!showLink)}
          className={`p-2 rounded-lg transition-colors ${editor.isActive('link') ? 'bg-indigo-100 text-indigo-600' : 'text-gray-600 hover:bg-gray-100'}`}>
          <FiLink size={14} />
        </button>

        <button type="button" title="Insert image" disabled={uploading}
          onClick={() => fileRef.current?.click()}
          className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-50">
          <FiImage size={14} />
        </button>

        {/* Color picker */}
        <input
          type="color"
          title="Text color"
          className="w-6 h-6 rounded border-0 cursor-pointer"
          onInput={e => editor.chain().focus().setColor((e.target as HTMLInputElement).value).run()}
        />
      </div>

      {/* Link input */}
      {showLink && (
        <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-100 bg-blue-50">
          <input
            type="url"
            value={linkUrl}
            onChange={e => setLinkUrl(e.target.value)}
            placeholder="https://…"
            className="flex-1 text-sm border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:border-blue-400"
            onKeyDown={e => e.key === 'Enter' && addLink()}
          />
          <button type="button" onClick={addLink}
            className="text-xs font-semibold text-white bg-indigo-500 hover:bg-blue-600 px-3 py-1.5 rounded-lg transition-colors">
            Add
          </button>
          <button type="button" onClick={() => setShowLink(false)}
            className="text-xs text-gray-500 hover:text-gray-700">Cancel</button>
        </div>
      )}

      {/* Editor area */}
      <EditorContent
        editor={editor}
        className="prose prose-sm max-w-none min-h-[200px] px-4 py-3 focus:outline-none [&_.tiptap]:outline-none [&_.tiptap]:min-h-[200px]"
      />

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={e => {
          const file = e.target.files?.[0]
          if (file) handleImageUpload(file)
        }}
      />
    </div>
  )
}
