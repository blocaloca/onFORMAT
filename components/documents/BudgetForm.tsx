'use client'

import { useState, useEffect, forwardRef, useImperativeHandle } from 'react'
import { ParsedBudgetItem } from '@/lib/ai-parsers'

export interface BudgetLineItem {
  category: string
  description: string
  amount: number
}

export interface BudgetData {
  lineItems: BudgetLineItem[]
  contingency: number
  subtotal: number
  total: number
}

interface BudgetFormProps {
  content: any
  onChange: (content: BudgetData) => void
}

export interface BudgetFormHandle {
  addBudgetItems: (parsedItems: ParsedBudgetItem[]) => void
}

const BudgetForm = forwardRef<BudgetFormHandle, BudgetFormProps>(({ content, onChange }, ref) => {
  const [budgetData, setBudgetData] = useState<BudgetData>(() => {
    // Initialize from content or use defaults
    if (content && content.lineItems) {
      return content
    }
    return {
      lineItems: [
        { category: 'Crew', description: '', amount: 0 },
        { category: 'Equipment', description: '', amount: 0 },
        { category: 'Location', description: '', amount: 0 }
      ],
      contingency: 10,
      subtotal: 0,
      total: 0
    }
  })

  // Calculate totals whenever line items or contingency changes
  useEffect(() => {
    console.log('🧮 BudgetForm useEffect triggered')
    console.log('Current line items:', budgetData.lineItems)
    console.log('Current contingency:', budgetData.contingency)

    const subtotal = budgetData.lineItems.reduce((sum, item) => sum + (item.amount || 0), 0)
    const contingencyAmount = Math.round(subtotal * (budgetData.contingency / 100))
    const total = subtotal + contingencyAmount

    // Only update if totals have actually changed to prevent infinite loop
    if (budgetData.subtotal !== subtotal || budgetData.total !== total) {
      const updatedData = {
        ...budgetData,
        subtotal,
        total
      }

      console.log('📊 Calculated totals:', { subtotal, contingencyAmount, total })
      console.log('📦 Updated data object:', JSON.stringify(updatedData, null, 2))

      setBudgetData(updatedData)
      console.log('✅ Called setBudgetData - triggering state update')
      onChange(updatedData)
      console.log('✅ Called onChange - parent should receive this data')
    }
  }, [budgetData])

  // Expose method to add budget items from AI responses
  useImperativeHandle(ref, () => ({
    addBudgetItems: (parsedItems: ParsedBudgetItem[]) => {
      console.log('💰 BudgetForm.addBudgetItems called')
      console.log('Parsed items from AI:', parsedItems)

      // Map parsed AI budget items to our BudgetLineItem interface
      const newLineItems: BudgetLineItem[] = parsedItems.map((parsedItem) => {
        // Combine item name with rate and quantity info for description
        const description = `${parsedItem.item}${parsedItem.rate ? ` (${parsedItem.rate} × ${parsedItem.quantity})` : ''}`

        return {
          category: parsedItem.category,
          description: description,
          amount: parseFloat(parsedItem.total) || 0
        }
      })

      console.log('📝 Mapped to BudgetLineItem format:', newLineItems)
      console.log('Current lineItems count:', budgetData.lineItems.length)
      console.log('After adding, will have:', budgetData.lineItems.length + newLineItems.length)

      setBudgetData({
        ...budgetData,
        lineItems: [...budgetData.lineItems, ...newLineItems]
      })
      console.log('✅ Called setBudgetData with new items - useEffect should trigger')
    }
  }))

  const addLineItem = () => {
    setBudgetData({
      ...budgetData,
      lineItems: [...budgetData.lineItems, { category: '', description: '', amount: 0 }]
    })
  }

  const removeLineItem = (index: number) => {
    const newLineItems = budgetData.lineItems.filter((_, i) => i !== index)
    setBudgetData({
      ...budgetData,
      lineItems: newLineItems
    })
  }

  const updateLineItem = (index: number, field: keyof BudgetLineItem, value: string | number) => {
    const newLineItems = [...budgetData.lineItems]
    newLineItems[index] = {
      ...newLineItems[index],
      [field]: value
    }
    setBudgetData({
      ...budgetData,
      lineItems: newLineItems
    })
  }

  const updateContingency = (value: number) => {
    setBudgetData({
      ...budgetData,
      contingency: value
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  return (
    <div className="bg-white rounded-xl border border-[#E5E5EA] overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-[#E5E5EA] bg-gray-50">
        <h2 className="font-semibold text-[#1D1D1F]">Budget</h2>
        <p className="text-xs text-gray-500 mt-1">
          Manage line items and calculate project totals
        </p>
      </div>

      {/* Line Items Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-[#E5E5EA]">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Category
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Description
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Amount
              </th>
              <th className="px-4 py-3 w-12"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E5E5EA]">
            {budgetData.lineItems.map((item, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <input
                    type="text"
                    value={item.category}
                    onChange={(e) => updateLineItem(index, 'category', e.target.value)}
                    placeholder="e.g., Crew"
                    className="w-full px-3 py-2 bg-[#F9F9F9] border border-[#E5E5EA] rounded-lg text-sm text-[#1D1D1F] focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </td>
                <td className="px-4 py-3">
                  <input
                    type="text"
                    value={item.description}
                    onChange={(e) => updateLineItem(index, 'description', e.target.value)}
                    placeholder="e.g., Director, DP, AC"
                    className="w-full px-3 py-2 bg-[#F9F9F9] border border-[#E5E5EA] rounded-lg text-sm text-[#1D1D1F] focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </td>
                <td className="px-4 py-3">
                  <input
                    type="number"
                    value={item.amount || ''}
                    onChange={(e) => updateLineItem(index, 'amount', parseFloat(e.target.value) || 0)}
                    placeholder="0"
                    className="w-full px-3 py-2 bg-[#F9F9F9] border border-[#E5E5EA] rounded-lg text-sm text-[#1D1D1F] text-right focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => removeLineItem(index)}
                    className="text-red-500 hover:text-red-700 text-lg font-bold"
                    title="Remove line item"
                  >
                    ✕
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Line Item Button */}
      <div className="p-4 border-t border-[#E5E5EA]">
        <button
          onClick={addLineItem}
          className="text-purple-600 hover:text-purple-700 font-medium text-sm flex items-center gap-2"
        >
          <span className="text-lg">+</span> Add Line Item
        </button>
      </div>

      {/* Totals Section */}
      <div className="p-6 border-t border-[#E5E5EA] bg-gray-50">
        <div className="max-w-md ml-auto space-y-3">
          {/* Subtotal */}
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600">Subtotal:</span>
            <span className="font-semibold text-[#1D1D1F]">
              {formatCurrency(budgetData.subtotal)}
            </span>
          </div>

          {/* Contingency */}
          <div className="flex justify-between items-center text-sm">
            <div className="flex items-center gap-2">
              <span className="text-gray-600">Contingency:</span>
              <input
                type="number"
                value={budgetData.contingency}
                onChange={(e) => updateContingency(parseFloat(e.target.value) || 0)}
                min="0"
                max="100"
                className="w-16 px-2 py-1 bg-white border border-[#E5E5EA] rounded text-sm text-center focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <span className="text-gray-600">%</span>
            </div>
            <span className="font-semibold text-[#1D1D1F]">
              {formatCurrency(Math.round(budgetData.subtotal * (budgetData.contingency / 100)))}
            </span>
          </div>

          {/* Total */}
          <div className="flex justify-between items-center pt-3 border-t-2 border-[#E5E5EA]">
            <span className="font-bold text-[#1D1D1F] text-lg">TOTAL:</span>
            <span className="font-bold text-[#1D1D1F] text-2xl">
              {formatCurrency(budgetData.total)}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
})

BudgetForm.displayName = 'BudgetForm'

export default BudgetForm
