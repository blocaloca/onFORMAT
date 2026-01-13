'use client'

import { useState, useEffect, forwardRef, useImperativeHandle } from 'react'

interface Shot {
  number: string
  subject: string
  composition: string
  lighting: string
  styling: string
  notes: string
}

interface ShotBookData {
  shots: Shot[]
}

interface ShotBookFormProps {
  content: any
  onChange: (content: ShotBookData) => void
}

export interface ShotBookFormHandle {
  // Add methods here if needed for AI integration later
}

const compositionTypes = [
  'Full Length',
  'Three-Quarter',
  'Half Length',
  'Head & Shoulders',
  'Close-Up',
  'Detail Shot',
  'Flat Lay',
  'Overhead',
  'Low Angle',
  'High Angle',
  'Profile',
  'Other'
]

const lightingSetups = [
  'Natural Light',
  'Single Key',
  'Three-Point',
  'Butterfly',
  'Rembrandt',
  'Split',
  'Broad',
  'Short',
  'Rim',
  'High Key',
  'Low Key',
  'Other'
]

const ShotBookForm = forwardRef<ShotBookFormHandle, ShotBookFormProps>(({ content, onChange }, ref) => {
  const [shotBookData, setShotBookData] = useState<ShotBookData>(() => {
    if (content && content.shots) {
      return content
    }
    return {
      shots: [
        { number: '1', subject: '', composition: 'Full Length', lighting: 'Natural Light', styling: '', notes: '' }
      ]
    }
  })

  useEffect(() => {
    console.log('📸 ShotBookForm useEffect triggered')
    console.log('Current shot book data:', JSON.stringify(shotBookData, null, 2))
    onChange(shotBookData)
    console.log('✅ Called onChange - parent should receive this data')
  }, [shotBookData])

  useImperativeHandle(ref, () => ({}))

  const addShot = () => {
    const nextNumber = (shotBookData.shots.length + 1).toString()
    setShotBookData({
      ...shotBookData,
      shots: [...shotBookData.shots, { number: nextNumber, subject: '', composition: 'Full Length', lighting: 'Natural Light', styling: '', notes: '' }]
    })
  }

  const removeShot = (index: number) => {
    const newShots = shotBookData.shots.filter((_, i) => i !== index)
    // Renumber remaining shots
    const renumberedShots = newShots.map((shot, i) => ({ ...shot, number: (i + 1).toString() }))
    setShotBookData({ ...shotBookData, shots: renumberedShots })
  }

  const updateShot = (index: number, field: keyof Shot, value: string) => {
    const newShots = [...shotBookData.shots]
    newShots[index] = { ...newShots[index], [field]: value }
    setShotBookData({ ...shotBookData, shots: newShots })
  }

  const moveShotUp = (index: number) => {
    if (index === 0) return
    const newShots = [...shotBookData.shots]
    const temp = newShots[index]
    newShots[index] = newShots[index - 1]
    newShots[index - 1] = temp
    const renumberedShots = newShots.map((shot, i) => ({ ...shot, number: (i + 1).toString() }))
    setShotBookData({ ...shotBookData, shots: renumberedShots })
  }

  const moveShotDown = (index: number) => {
    if (index === shotBookData.shots.length - 1) return
    const newShots = [...shotBookData.shots]
    const temp = newShots[index]
    newShots[index] = newShots[index + 1]
    newShots[index + 1] = temp
    const renumberedShots = newShots.map((shot, i) => ({ ...shot, number: (i + 1).toString() }))
    setShotBookData({ ...shotBookData, shots: renumberedShots })
  }

  return (
    <div className="bg-white rounded-xl border border-[#E5E5EA] overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-[#E5E5EA] bg-gray-50">
        <h2 className="font-semibold text-[#1D1D1F]">Shot Book</h2>
        <p className="text-xs text-gray-500 mt-1">
          Plan your photography shots with composition, lighting, and styling details
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
                Subject
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Composition
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Lighting
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Styling
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
            {shotBookData.shots.map((shot, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div className="w-12 px-3 py-2 bg-gray-100 border border-[#E5E5EA] rounded-lg text-sm text-center font-semibold text-gray-700">
                    {shot.number}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <input
                    type="text"
                    value={shot.subject}
                    onChange={(e) => updateShot(index, 'subject', e.target.value)}
                    placeholder="e.g., Model in red dress"
                    className="w-full px-3 py-2 bg-[#F9F9F9] border border-[#E5E5EA] rounded-lg text-sm text-[#1D1D1F] focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </td>
                <td className="px-4 py-3">
                  <select
                    value={shot.composition}
                    onChange={(e) => updateShot(index, 'composition', e.target.value)}
                    className="w-full px-3 py-2 bg-[#F9F9F9] border border-[#E5E5EA] rounded-lg text-sm text-[#1D1D1F] focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    {compositionTypes.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </td>
                <td className="px-4 py-3">
                  <select
                    value={shot.lighting}
                    onChange={(e) => updateShot(index, 'lighting', e.target.value)}
                    className="w-full px-3 py-2 bg-[#F9F9F9] border border-[#E5E5EA] rounded-lg text-sm text-[#1D1D1F] focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    {lightingSetups.map((setup) => (
                      <option key={setup} value={setup}>{setup}</option>
                    ))}
                  </select>
                </td>
                <td className="px-4 py-3">
                  <input
                    type="text"
                    value={shot.styling}
                    onChange={(e) => updateShot(index, 'styling', e.target.value)}
                    placeholder="e.g., Minimal jewelry"
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
                      disabled={index === shotBookData.shots.length - 1}
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

ShotBookForm.displayName = 'ShotBookForm'

export default ShotBookForm
