'use client'

import { useState, useEffect, forwardRef, useImperativeHandle } from 'react'

export interface GenericListFormHandle {
  getData: () => any
  addItems?: (items: any[]) => void
}

interface GenericListFormProps {
  content: any
  onChange: (content: any) => void
  documentType: string
}

interface ListItem {
  id: string
  category: string
  name: string
  details: string
  notes: string
}

const GenericListForm = forwardRef<GenericListFormHandle, GenericListFormProps>(
  ({ content, onChange, documentType }, ref) => {
    const [items, setItems] = useState<ListItem[]>(() => {
      if (content && Array.isArray(content.items)) {
        return content.items
      }
      return []
    })

    useImperativeHandle(ref, () => ({
      getData: () => ({ items }),
      addItems: (newItems: any[]) => {
        const formattedItems = newItems.map((item, index) => ({
          id: `item-${Date.now()}-${index}`,
          category: item.category || '',
          name: item.name || item.title || '',
          details: item.details || item.description || '',
          notes: item.notes || ''
        }))
        setItems([...items, ...formattedItems])
      }
    }))

    useEffect(() => {
      onChange({ items })
    }, [items])

    const addItem = () => {
      const newItem: ListItem = {
        id: `item-${Date.now()}`,
        category: '',
        name: '',
        details: '',
        notes: ''
      }
      setItems([...items, newItem])
    }

    const updateItem = (id: string, field: keyof ListItem, value: string) => {
      setItems(items.map(item => item.id === id ? { ...item, [field]: value } : item))
    }

    const removeItem = (id: string) => {
      setItems(items.filter(item => item.id !== id))
    }

    const getPlaceholders = () => {
      const type = documentType.toLowerCase()

      if (type.includes('crew') || type.includes('casting') || type.includes('talent')) {
        return {
          category: 'Department (e.g., Camera, G&E)',
          name: 'Name or Role',
          details: 'Contact / Rate',
          notes: 'Availability / Notes'
        }
      }

      if (type.includes('equipment') || type.includes('gear')) {
        return {
          category: 'Category (e.g., Camera, Lighting)',
          name: 'Item Name',
          details: 'Specifications / Quantity',
          notes: 'Source / Notes'
        }
      }

      if (type.includes('location')) {
        return {
          category: 'Location Type',
          name: 'Location Name',
          details: 'Address',
          notes: 'Permits / Contact'
        }
      }

      if (type.includes('schedule') || type.includes('calendar')) {
        return {
          category: 'Date',
          name: 'Activity / Content',
          details: 'Time / Duration',
          notes: 'Platform / Notes'
        }
      }

      return {
        category: 'Category',
        name: 'Item Name',
        details: 'Details',
        notes: 'Notes'
      }
    }

    const placeholders = getPlaceholders()

    return (
      <div className="bg-white rounded-xl border border-[#E5E5EA] shadow-sm overflow-hidden">
        <div className="p-4 border-b border-[#E5E5EA] bg-gray-50 flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-[#1D1D1F]">
              {documentType.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              Add and organize items below ({items.length} items)
            </p>
          </div>
          <button
            onClick={addItem}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-semibold hover:bg-purple-700 transition"
          >
            + Add Item
          </button>
        </div>

        <div className="p-6 space-y-4">
          {items.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-lg">
              <p className="text-gray-500 mb-4">No items yet</p>
              <button
                onClick={addItem}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition"
              >
                + Add First Item
              </button>
            </div>
          ) : (
            items.map((item, index) => (
              <div key={item.id} className="bg-gray-50 border border-[#E5E5EA] rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <span className="text-sm font-semibold text-gray-600">#{index + 1}</span>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="text-red-500 hover:text-red-700 text-sm"
                  >
                    ✕ Remove
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-gray-600 mb-1 block">
                      {placeholders.category}
                    </label>
                    <input
                      type="text"
                      value={item.category}
                      onChange={(e) => updateItem(item.id, 'category', e.target.value)}
                      className="w-full px-3 py-2 border border-[#E5E5EA] rounded-lg text-sm text-[#1D1D1F] focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder={placeholders.category}
                    />
                  </div>

                  <div>
                    <label className="text-xs font-medium text-gray-600 mb-1 block">
                      {placeholders.name}
                    </label>
                    <input
                      type="text"
                      value={item.name}
                      onChange={(e) => updateItem(item.id, 'name', e.target.value)}
                      className="w-full px-3 py-2 border border-[#E5E5EA] rounded-lg text-sm text-[#1D1D1F] focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder={placeholders.name}
                    />
                  </div>

                  <div>
                    <label className="text-xs font-medium text-gray-600 mb-1 block">
                      {placeholders.details}
                    </label>
                    <input
                      type="text"
                      value={item.details}
                      onChange={(e) => updateItem(item.id, 'details', e.target.value)}
                      className="w-full px-3 py-2 border border-[#E5E5EA] rounded-lg text-sm text-[#1D1D1F] focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder={placeholders.details}
                    />
                  </div>

                  <div>
                    <label className="text-xs font-medium text-gray-600 mb-1 block">
                      {placeholders.notes}
                    </label>
                    <input
                      type="text"
                      value={item.notes}
                      onChange={(e) => updateItem(item.id, 'notes', e.target.value)}
                      className="w-full px-3 py-2 border border-[#E5E5EA] rounded-lg text-sm text-[#1D1D1F] focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder={placeholders.notes}
                    />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {items.length > 0 && (
          <div className="px-6 pb-6">
            <button
              onClick={addItem}
              className="w-full px-4 py-3 border-2 border-dashed border-purple-300 text-purple-600 rounded-lg font-semibold hover:bg-purple-50 transition"
            >
              + Add Another Item
            </button>
          </div>
        )}
      </div>
    )
  }
)

GenericListForm.displayName = 'GenericListForm'

export default GenericListForm
