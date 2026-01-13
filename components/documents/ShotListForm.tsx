'use client'

import { useState, useEffect, forwardRef, useImperativeHandle } from 'react'
import { ParsedShotListItem } from '@/lib/ai-parsers'

interface Shot {
  number: string
  type: string
  location: string
  description: string
  equipment: string
  notes: string
}

interface ShotListData {
  shots: Shot[]
}

interface ShotListFormProps {
  content: any
  onChange: (content: ShotListData) => void
}

export interface ShotListFormHandle {
  addShots: (parsedShots: ParsedShotListItem[]) => void
}

const shotTypes = [
  'Wide Shot',
  'Medium Shot',
  'Close-Up',
  'Extreme Close-Up',
  'Over the Shoulder',
  'POV',
  'Establishing Shot',
  'Cutaway',
  'Insert',
  'Two Shot',
  'Aerial',
  'Tracking Shot',
  'Other'
]

const ShotListForm = forwardRef<ShotListFormHandle, ShotListFormProps>(({ content, onChange }, ref) => {
  const [shotListData, setShotListData] = useState<ShotListData>(() => {
    if (content && content.shots) {
      return content
    }
    return {
      shots: [
        { number: '1', type: 'Wide Shot', location: '', description: '', equipment: '', notes: '' }
      ]
    }
  })

  useEffect(() => {
    console.log('📸 ShotListForm useEffect triggered')
    console.log('Current shot list data:', JSON.stringify(shotListData, null, 2))
    onChange(shotListData)
    console.log('✅ Called onChange - parent should receive this data')
  }, [shotListData])

  // Expose method to add shots from AI responses
  useImperativeHandle(ref, () => ({
    addShots: (parsedShots: ParsedShotListItem[]) => {
      console.log('🎥 ShotListForm.addShots called')
      console.log('Parsed shots from AI:', parsedShots)

      const currentShotCount = shotListData.shots.length

      // Map parsed AI shots to our Shot interface
      const newShots: Shot[] = parsedShots.map((parsedShot, index) => {
        // Map AI shot size/angle to our shot type
        const type = mapShotSizeToType(parsedShot.size)

        return {
          number: (currentShotCount + index + 1).toString(),
          type: type,
          location: '', // AI doesn't provide location, user can fill in
          description: parsedShot.description,
          equipment: parsedShot.movement !== 'Static' && parsedShot.movement !== 'Locked off'
            ? parsedShot.movement
            : '',
          notes: `Duration: ${parsedShot.duration}${parsedShot.size ? `, Size: ${parsedShot.size}` : ''}`
        }
      })

      console.log('📝 Mapped to Shot format:', newShots)
      console.log('Current shot count:', currentShotCount)
      console.log('After adding, will have:', currentShotCount + newShots.length)

      setShotListData({
        ...shotListData,
        shots: [...shotListData.shots, ...newShots]
      })
      console.log('✅ Called setShotListData - useEffect should trigger')
    }
  }))

  // Helper function to map AI shot sizes to our shot types
  const mapShotSizeToType = (size: string): string => {
    const sizeLower = size.toLowerCase()
    if (sizeLower.includes('wide') || sizeLower.includes('ws')) return 'Wide Shot'
    if (sizeLower.includes('medium') || sizeLower.includes('ms')) return 'Medium Shot'
    if (sizeLower.includes('close') || sizeLower.includes('cu')) return 'Close-Up'
    if (sizeLower.includes('extreme')) return 'Extreme Close-Up'
    if (sizeLower.includes('over') || sizeLower.includes('ots')) return 'Over the Shoulder'
    if (sizeLower.includes('pov')) return 'POV'
    if (sizeLower.includes('establish')) return 'Establishing Shot'
    if (sizeLower.includes('cutaway')) return 'Cutaway'
    if (sizeLower.includes('insert')) return 'Insert'
    if (sizeLower.includes('two')) return 'Two Shot'
    if (sizeLower.includes('aerial')) return 'Aerial'
    if (sizeLower.includes('track')) return 'Tracking Shot'
    return 'Other'
  }

  const addShot = () => {
    const nextNumber = (shotListData.shots.length + 1).toString()
    setShotListData({
      ...shotListData,
      shots: [...shotListData.shots, { number: nextNumber, type: 'Wide Shot', location: '', description: '', equipment: '', notes: '' }]
    })
  }

  const removeShot = (index: number) => {
    const newShots = shotListData.shots.filter((_, i) => i !== index)
    // Renumber remaining shots
    const renumberedShots = newShots.map((shot, i) => ({ ...shot, number: (i + 1).toString() }))
    setShotListData({ ...shotListData, shots: renumberedShots })
  }

  const updateShot = (index: number, field: keyof Shot, value: string) => {
    const newShots = [...shotListData.shots]
    newShots[index] = { ...newShots[index], [field]: value }
    setShotListData({ ...shotListData, shots: newShots })
  }

  const moveShotUp = (index: number) => {
    if (index === 0) return // Already at top
    const newShots = [...shotListData.shots]
    // Swap with previous shot
    const temp = newShots[index]
    newShots[index] = newShots[index - 1]
    newShots[index - 1] = temp
    // Renumber all shots
    const renumberedShots = newShots.map((shot, i) => ({ ...shot, number: (i + 1).toString() }))
    setShotListData({ ...shotListData, shots: renumberedShots })
  }

  const moveShotDown = (index: number) => {
    if (index === shotListData.shots.length - 1) return // Already at bottom
    const newShots = [...shotListData.shots]
    // Swap with next shot
    const temp = newShots[index]
    newShots[index] = newShots[index + 1]
    newShots[index + 1] = temp
    // Renumber all shots
    const renumberedShots = newShots.map((shot, i) => ({ ...shot, number: (i + 1).toString() }))
    setShotListData({ ...shotListData, shots: renumberedShots })
  }

  return (
    <div className="bg-white rounded-xl border border-[#E5E5EA] overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-[#E5E5EA] bg-gray-50">
        <h2 className="font-semibold text-[#1D1D1F]">Shot List</h2>
        <p className="text-xs text-gray-500 mt-1">
          Plan and organize all shots for your production
        </p>
      </div>

      {/* Shots Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-[#E5E5EA]">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-16">
                #
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Type
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Location
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Description
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Equipment
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Notes
              </th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider w-20">
                Order
              </th>
              <th className="px-4 py-3 w-12"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E5E5EA]">
            {shotListData.shots.map((shot, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div className="w-12 px-3 py-2 bg-gray-100 border border-[#E5E5EA] rounded-lg text-sm text-center font-semibold text-gray-700">
                    {shot.number}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <select
                    value={shot.type}
                    onChange={(e) => updateShot(index, 'type', e.target.value)}
                    className="w-full px-3 py-2 bg-[#F9F9F9] border border-[#E5E5EA] rounded-lg text-sm text-[#1D1D1F] focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    {shotTypes.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </td>
                <td className="px-4 py-3">
                  <input
                    type="text"
                    value={shot.location}
                    onChange={(e) => updateShot(index, 'location', e.target.value)}
                    placeholder="e.g., Studio A"
                    className="w-full px-3 py-2 bg-[#F9F9F9] border border-[#E5E5EA] rounded-lg text-sm text-[#1D1D1F] focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </td>
                <td className="px-4 py-3">
                  <input
                    type="text"
                    value={shot.description}
                    onChange={(e) => updateShot(index, 'description', e.target.value)}
                    placeholder="Shot description"
                    className="w-full px-3 py-2 bg-[#F9F9F9] border border-[#E5E5EA] rounded-lg text-sm text-[#1D1D1F] focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </td>
                <td className="px-4 py-3">
                  <input
                    type="text"
                    value={shot.equipment}
                    onChange={(e) => updateShot(index, 'equipment', e.target.value)}
                    placeholder="e.g., Slider, Gimbal"
                    className="w-full px-3 py-2 bg-[#F9F9F9] border border-[#E5E5EA] rounded-lg text-sm text-[#1D1D1F] focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </td>
                <td className="px-4 py-3">
                  <input
                    type="text"
                    value={shot.notes}
                    onChange={(e) => updateShot(index, 'notes', e.target.value)}
                    placeholder="Additional notes"
                    className="w-full px-3 py-2 bg-[#F9F9F9] border border-[#E5E5EA] rounded-lg text-sm text-[#1D1D1F] focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-center gap-1">
                    <button
                      onClick={() => moveShotUp(index)}
                      disabled={index === 0}
                      className="p-1 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded transition disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-gray-600"
                      title="Move up"
                    >
                      ↑
                    </button>
                    <button
                      onClick={() => moveShotDown(index)}
                      disabled={index === shotListData.shots.length - 1}
                      className="p-1 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded transition disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-gray-600"
                      title="Move down"
                    >
                      ↓
                    </button>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => removeShot(index)}
                    className="text-red-500 hover:text-red-700 text-lg font-bold"
                    title="Remove shot"
                  >
                    ✕
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Shot Button */}
      <div className="p-4 border-t border-[#E5E5EA]">
        <button
          onClick={addShot}
          className="text-purple-600 hover:text-purple-700 font-medium text-sm flex items-center gap-2"
        >
          <span className="text-lg">+</span> Add Shot
        </button>
      </div>
    </div>
  )
})

ShotListForm.displayName = 'ShotListForm'

export default ShotListForm
