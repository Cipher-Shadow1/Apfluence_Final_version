'use client'

import { useState, useEffect, useCallback } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuLabel } from '@/components/ui/dropdown-menu'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { getBrandEmailTemplates, saveBrandEmailTemplate, deleteBrandEmailTemplate, type EmailTemplate } from '@/lib/queries/email-templates'
import { StarterKit } from '@tiptap/starter-kit'
import { Underline as UnderlineExt } from '@tiptap/extension-underline'
import { TextAlign } from '@tiptap/extension-text-align'
import { TextStyle } from '@tiptap/extension-text-style'
import { Color } from '@tiptap/extension-color'
import { FontFamily } from '@tiptap/extension-font-family'
import { Link as LinkExt } from '@tiptap/extension-link'
import { Image as ImageExt } from '@tiptap/extension-image'
import { TableKit } from '@tiptap/extension-table'
import InsertLinkModal from './InsertLinkModal'
import {
  Bold, Italic, Underline, AlignLeft, AlignCenter,
  AlignRight, List, ListOrdered, Link, Image as ImageIcon,
  Code, Star, ChevronDown, Eraser,
  Paperclip, Trash2, Loader2
} from 'lucide-react'
import { Extension } from '@tiptap/core'
import { cn } from '@/lib/utils'
import { buildDefaultSignatureHtml } from '@/lib/email/signature'

const FontSize = Extension.create({
  name: 'fontSize',
  addOptions() {
    return { types: ['textStyle'] }
  },
  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          fontSize: {
            default: null,
            parseHTML: (element: any) => element.style.fontSize.replace(/['"]+/g, ''),
            renderHTML: (attributes: any) => {
              if (!attributes.fontSize) return {}
              return { style: `font-size: ${attributes.fontSize}` }
            },
          },
        },
      },
    ]
  },
  addCommands() {
    return {
      setFontSize: (fontSize: string) => ({ chain }: any) => {
        return chain().setMark('textStyle', { fontSize }).run()
      },
      unsetFontSize: () => ({ chain }: any) => {
        return chain().setMark('textStyle', { fontSize: null }).removeEmptyTextStyle().run()
      },
    }
  },
})

interface EmailBodyEditorProps {
  value: string
  onChange: (html: string) => void
  onInsertToken?: (insertFn: (token: string) => void) => void
  brandId?: string
  subject?: string
  onSubjectChange?: (subject: string) => void
}

// Toolbar button helper
function ToolbarBtn({
  onClick, active, disabled, title, children
}: {
  onClick: () => void
  active?: boolean
  disabled?: boolean
  title?: string
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={cn(
        'p-1.5 rounded transition-all duration-100 flex-shrink-0',
        'hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed',
        active ? 'bg-gray-200 text-gray-900' : 'text-gray-600'
      )}
    >
      {children}
    </button>
  )
}

// Toolbar divider
function Divider() {
  return <div className="w-px h-5 bg-gray-200 mx-1 flex-shrink-0" />
}

export default function EmailBodyEditor({
  value, onChange, onInsertToken, brandId, subject, onSubjectChange
}: EmailBodyEditorProps) {

  // Link modal state
  const [linkModalOpen, setLinkModalOpen] = useState(false)
  const [linkInitialText, setLinkInitialText] = useState('')
  const [linkInitialUrl, setLinkInitialUrl] = useState('')

  // Template state
  const [templates, setTemplates] = useState<EmailTemplate[]>([])
  const [saveModalOpen, setSaveModalOpen] = useState(false)
  const [newTemplateName, setNewTemplateName] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  const fetchTemplates = useCallback(async () => {
    if (!brandId) return
    const data = await getBrandEmailTemplates(brandId)
    setTemplates(data)
  }, [brandId])

  useEffect(() => {
    fetchTemplates()
  }, [fetchTemplates])

  const handleSaveTemplate = async () => {
    if (!brandId || !newTemplateName.trim()) return
    setIsSaving(true)
    await saveBrandEmailTemplate(brandId, newTemplateName.trim(), subject || '', value || '')
    setIsSaving(false)
    setSaveModalOpen(false)
    setNewTemplateName('')
    fetchTemplates()
  }

  const handleDeleteTemplate = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    await deleteBrandEmailTemplate(id)
    fetchTemplates()
  }

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      UnderlineExt,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      TextStyle,
      Color,
      FontFamily,
      FontSize,
      LinkExt.configure({ openOnClick: false }),
      ImageExt.configure({
        allowBase64: true,
        HTMLAttributes: {
          style:
            "display:block;width:72px;height:72px;object-fit:contain;border-radius:8px",
        },
      }),
      TableKit.configure({
        // Keep tables simple; we only need signature layout.
        table: { HTMLAttributes: { style: 'border-collapse:collapse' } },
      }),
    ],
    content: value || [
      `<p>Hi <span style="color:#6366F1;font-weight:600 font-size:20px">{{first_name}}</span>,</p>`,
      `<p></p>`,
      `<p></p>`,
      buildDefaultSignatureHtml(),
    ].join(''),
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class: 'prose prose-base max-w-none outline-none min-h-[320px] px-6 py-5 text-base text-gray-800 leading-relaxed [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:mb-1',
      },
    },
  })

  // Expose insert function to parent
  const insertToken = useCallback((token: string) => {
    if (!editor) return
    editor.chain().focus().insertContent(
      `<span style="color: #6366F1; font-weight: 600">${token}</span>`
    ).run()
  }, [editor])

  useEffect(() => {
    if (onInsertToken) {
      onInsertToken(insertToken)
    }
  }, [insertToken, onInsertToken])

  // Keep editor content in sync when parent initializes/changes template.
  useEffect(() => {
    if (!editor) return
    const next = value || ''
    const current = editor.getHTML()
    if (next && current !== next) {
      editor.commands.setContent(next, { emitUpdate: false })
    }
  }, [editor, value])

  if (!editor) return null

  return (
    <div className="flex flex-col border border-gray-200 rounded-xl
                    overflow-hidden bg-white shadow-sm">

      {/* Toolbar */}
      <div className="flex items-center gap-0.5 px-3 py-2.5 border-b
                      border-gray-100 bg-gray-50 flex-wrap">

        {/* Templates dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg
                         hover:bg-gray-200 text-gray-600 text-xs font-medium
                         transition-colors mr-1"
            >
              <Star size={13} className="text-amber-400" />
              Templates
              <ChevronDown size={12} />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56 z-[120]">
            <DropdownMenuItem onClick={() => setSaveModalOpen(true)}>
              <Star size={14} className="mr-2 text-amber-400" />
              Save current as template...
            </DropdownMenuItem>
            {templates.length > 0 && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuLabel>Saved Templates</DropdownMenuLabel>
                {templates.map(t => (
                  <DropdownMenuItem
                    key={t.id}
                    className="flex justify-between items-center group cursor-pointer"
                    onClick={() => {
                      if (t.subject && onSubjectChange) onSubjectChange(t.subject)
                      if (t.body) onChange(t.body)
                    }}
                  >
                    <span className="truncate flex-1">{t.name}</span>
                    <button
                      type="button"
                      onClick={(e) => handleDeleteTemplate(e, t.id)}
                      className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500 transition-opacity"
                      title="Delete template"
                    >
                      <Trash2 size={13} />
                    </button>
                  </DropdownMenuItem>
                ))}
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        <Divider />

        {/* Text formatting */}
        <ToolbarBtn
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive('bold')}
          title="Bold"
        >
          <Bold size={14} />
        </ToolbarBtn>

        <ToolbarBtn
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive('italic')}
          title="Italic"
        >
          <Italic size={14} />
        </ToolbarBtn>

        <ToolbarBtn
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          active={editor.isActive('underline')}
          title="Underline"
        >
          <Underline size={14} />
        </ToolbarBtn>

        <ToolbarBtn
          onClick={() => editor.chain().focus().unsetAllMarks().run()}
          title="Clear formatting"
        >
          <Eraser size={14} />
        </ToolbarBtn>

        <Divider />

        {/* Color picker */}
        <div className="relative flex-shrink-0 flex items-center justify-center w-6 h-6 rounded border border-gray-300 overflow-hidden hover:border-gray-400 transition-colors cursor-pointer" title="Text color">
          <input
            type="color"
            onInput={event => editor.chain().focus().setColor((event.target as HTMLInputElement).value).run()}
            value={editor.getAttributes('textStyle').color || '#000000'}
            className="absolute inset-[-10px] w-[200%] h-[200%] cursor-pointer opacity-0"
          />
          <div
            className="w-full h-full pointer-events-none"
            style={{ backgroundColor: editor.getAttributes('textStyle').color || '#000000' }}
          />
        </div>

        <Divider />

        {/* Font family */}
        <select
          onChange={(e) => editor.chain().focus().setFontFamily(e.target.value).run()}
          value={editor.getAttributes('textStyle').fontFamily || ''}
          className="bg-transparent text-xs text-gray-600 px-1 py-1 rounded hover:bg-gray-200 transition-colors outline-none cursor-pointer"
        >
          <option value="">Default Font</option>
          <option value="Inter">Inter</option>
          <option value="Arial">Arial</option>
          <option value="Georgia">Georgia</option>
          <option value="Courier New">Courier New</option>
        </select>

        {/* Font size */}
        <select
          onChange={(e) => (editor.commands as any).setFontSize(e.target.value)}
          value={editor.getAttributes('textStyle').fontSize || ''}
          className="bg-transparent text-xs text-gray-600 px-1 py-1 rounded hover:bg-gray-200 transition-colors outline-none cursor-pointer"
        >
          <option value="">Size</option>
          <option value="12px">12px</option>
          <option value="14px">14px</option>
          <option value="16px">16px</option>
          <option value="18px">18px</option>
          <option value="20px">20px</option>
          <option value="24px">24px</option>
          <option value="30px">30px</option>
        </select>

        <Divider />

        {/* Alignment */}
        <ToolbarBtn
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          active={editor.isActive({ textAlign: 'left' })}
          title="Align left"
        >
          <AlignLeft size={14} />
        </ToolbarBtn>

        <ToolbarBtn
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          active={editor.isActive({ textAlign: 'center' })}
          title="Align center"
        >
          <AlignCenter size={14} />
        </ToolbarBtn>

        <ToolbarBtn
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          active={editor.isActive({ textAlign: 'right' })}
          title="Align right"
        >
          <AlignRight size={14} />
        </ToolbarBtn>

        <Divider />

        {/* Lists */}
        <ToolbarBtn
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive('bulletList')}
          title="Bullet list"
        >
          <List size={14} />
        </ToolbarBtn>

        <ToolbarBtn
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={editor.isActive('orderedList')}
          title="Ordered list"
        >
          <ListOrdered size={14} />
        </ToolbarBtn>

        <Divider />

        {/* Link */}
        <ToolbarBtn
          onClick={() => {
            const previousUrl = editor.getAttributes('link').href
            const selectedText = editor.state.doc.textBetween(editor.state.selection.from, editor.state.selection.to, ' ')
            setLinkInitialUrl(previousUrl || '')
            setLinkInitialText(selectedText || '')
            setLinkModalOpen(true)
          }}
          active={editor.isActive('link')}
          title="Insert link"
        >
          <Link size={14} />
        </ToolbarBtn>

        {/* Image placeholder */}
        <ToolbarBtn
          onClick={() => { }}
          title="Insert image"
        >
          <ImageIcon size={14} />
        </ToolbarBtn>

        {/* HTML source */}
        <ToolbarBtn
          onClick={() => { }}
          title="HTML source"
        >
          <Code size={14} />
        </ToolbarBtn>
      </div>

      {/* Editor content area */}
      <div className="flex-1 overflow-y-auto min-h-[320px] max-h-[480px]">
        <EditorContent editor={editor} />
      </div>

      {/* Bottom bar — Attachment */}
      <div className="flex items-center justify-end px-4 py-2.5
                      border-t border-gray-100 bg-gray-50">
        <button
          type="button"
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg
                     text-xs font-medium text-gray-500 hover:text-gray-700
                     hover:bg-gray-200 transition-colors border border-gray-200"
        >
          <Paperclip size={13} />
          Attachment
        </button>
      </div>

      <InsertLinkModal
        isOpen={linkModalOpen}
        onClose={() => setLinkModalOpen(false)}
        initialText={linkInitialText}
        initialUrl={linkInitialUrl}
        onSave={(text, url, newTab) => {
          if (!url) {
            editor.chain().focus().extendMarkRange('link').unsetLink().run()
            return
          }

          if (text) {
            editor.chain().focus()
              .insertContent(`<a href="${url}" ${newTab ? 'target="_blank" rel="noopener noreferrer"' : ''}>${text}</a>`)
              .run()
          } else {
            editor.chain().focus().extendMarkRange('link').setLink({ href: url, target: newTab ? '_blank' : null }).run()
          }
        }}
      />

      {/* Save Template Modal */}
      <Dialog open={saveModalOpen} onOpenChange={setSaveModalOpen}>
        <DialogContent className="z-[9999] sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Save Email Template</DialogTitle>
            <DialogDescription>
              Save the current subject and body as a template to reuse later.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-4">
            <div className="flex flex-col gap-2">
              <label htmlFor="name" className="text-sm font-medium">Template Name</label>
              <Input
                id="name"
                value={newTemplateName}
                onChange={(e) => setNewTemplateName(e.target.value)}
                placeholder="e.g. Initial Outreach, Follow Up..."
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && newTemplateName.trim()) {
                    e.preventDefault();
                    handleSaveTemplate();
                  }
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSaveModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveTemplate} disabled={!newTemplateName.trim() || isSaving}>
              {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Save Template
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
