'use client'

import { useState, useEffect, forwardRef, useImperativeHandle } from 'react'

export interface RichTextFormHandle {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getData: () => any
}

interface RichTextFormProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  content: any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onChange: (content: any) => void
}

const RichTextForm = forwardRef<RichTextFormHandle, RichTextFormProps>(({ content, onChange }, ref) => {
  const [text, setText] = useState(() => {
    if (typeof content === 'string') return content
    if (content && content.text) return content.text
    return ''
  })

  useImperativeHandle(ref, () => ({
    getData: () => ({ text })
  }))

  useEffect(() => {
    onChange({ text })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text])

  return (
    <div className="bg-white rounded-xl border border-[#E5E5EA] shadow-sm overflow-hidden">
      <div className="p-4 border-b border-[#E5E5EA] bg-gray-50">
        <h2 className="font-semibold text-[#1D1D1F]">Content</h2>
        <p className="text-xs text-gray-500 mt-1">
          Write your content below. Formatting is preserved.
        </p>
      </div>

      <div className="p-6">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="w-full min-h-[600px] p-4 border border-[#E5E5EA] rounded-lg text-[#1D1D1F] focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none font-sans"
          placeholder="Start writing here...

For scripts, use standard screenplay format:

INT. LOCATION - DAY

Character action or scene description.

CHARACTER NAME
Dialogue goes here.

For notes, write freely with clear structure."
          style={{ lineHeight: '1.6' }}
        />
      </div>

      <div className="px-6 pb-6">
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <h3 className="font-semibold text-purple-900 mb-2 text-sm">💡 Writing Tips</h3>
          <ul className="text-sm text-purple-800 space-y-1">
            <li>• Use clear headings to organize sections</li>
            <li>• Break long content into paragraphs</li>
            <li>• For scripts: INT/EXT, location, time of day</li>
            <li>• For notes: Include timestamps, names, and action items</li>
          </ul>
        </div>
      </div>
    </div>
  )
})

RichTextForm.displayName = 'RichTextForm'

export default RichTextForm
