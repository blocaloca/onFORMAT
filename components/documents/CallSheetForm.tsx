'use client'

import { useState, useEffect, forwardRef, useImperativeHandle } from 'react'
import { ParsedCallSheetCrew, ParsedCallSheetTalent } from '@/lib/ai-parsers'

interface CrewMember {
  role: string
  name: string
  call: string
  phone: string
}

interface TalentMember {
  role: string
  name: string
  call: string
  notes: string
}

interface CallSheetData {
  shootDate: string
  callTime: string
  location: string
  weather: string
  crew: CrewMember[]
  talent: TalentMember[]
}

interface CallSheetFormProps {
  content: any
  onChange: (content: CallSheetData) => void
}

export interface CallSheetFormHandle {
  addCallSheetData: (data: { crew: ParsedCallSheetCrew[], talent: ParsedCallSheetTalent[] }) => void
}

const CallSheetForm = forwardRef<CallSheetFormHandle, CallSheetFormProps>(({ content, onChange }, ref) => {
  const [callSheetData, setCallSheetData] = useState<CallSheetData>(() => {
    if (content && content.shootDate) {
      return content
    }
    return {
      shootDate: new Date().toISOString().split('T')[0],
      callTime: '06:00',
      location: '',
      weather: '',
      crew: [{ role: 'Director', name: '', call: '06:00', phone: '' }],
      talent: [{ role: 'Lead', name: '', call: '07:00', notes: '' }]
    }
  })

  useEffect(() => {
    console.log('🎬 CallSheetForm useEffect triggered')
    console.log('Current call sheet data:', JSON.stringify(callSheetData, null, 2))
    onChange(callSheetData)
    console.log('✅ Called onChange - parent should receive this data')
  }, [callSheetData])

  // Expose method to add call sheet data from AI responses
  useImperativeHandle(ref, () => ({
    addCallSheetData: (data: { crew: ParsedCallSheetCrew[], talent: ParsedCallSheetTalent[] }) => {
      console.log('📋 CallSheetForm.addCallSheetData called')
      console.log('Parsed crew from AI:', data.crew)
      console.log('Parsed talent from AI:', data.talent)

      // Map parsed AI crew to our CrewMember interface
      const newCrew: CrewMember[] = data.crew.map((parsedCrew) => ({
        role: parsedCrew.role,
        name: parsedCrew.name,
        call: parsedCrew.callTime,
        phone: parsedCrew.phone
      }))

      // Map parsed AI talent to our TalentMember interface
      const newTalent: TalentMember[] = data.talent.map((parsedTalent) => ({
        role: parsedTalent.role,
        name: parsedTalent.talent,
        call: parsedTalent.callTime,
        notes: parsedTalent.readyTime ? `Ready: ${parsedTalent.readyTime}` : ''
      }))

      console.log('📝 Mapped crew members:', newCrew)
      console.log('📝 Mapped talent members:', newTalent)
      console.log('Current crew count:', callSheetData.crew.length)
      console.log('Current talent count:', callSheetData.talent.length)
      console.log('After adding - crew:', callSheetData.crew.length + newCrew.length, 'talent:', callSheetData.talent.length + newTalent.length)

      setCallSheetData({
        ...callSheetData,
        crew: [...callSheetData.crew, ...newCrew],
        talent: [...callSheetData.talent, ...newTalent]
      })
      console.log('✅ Called setCallSheetData - useEffect should trigger')
    }
  }))

  const updateField = (field: keyof CallSheetData, value: any) => {
    setCallSheetData({ ...callSheetData, [field]: value })
  }

  const addCrewMember = () => {
    setCallSheetData({
      ...callSheetData,
      crew: [...callSheetData.crew, { role: '', name: '', call: '06:00', phone: '' }]
    })
  }

  const removeCrewMember = (index: number) => {
    const newCrew = callSheetData.crew.filter((_, i) => i !== index)
    setCallSheetData({ ...callSheetData, crew: newCrew })
  }

  const updateCrewMember = (index: number, field: keyof CrewMember, value: string) => {
    const newCrew = [...callSheetData.crew]
    newCrew[index] = { ...newCrew[index], [field]: value }
    setCallSheetData({ ...callSheetData, crew: newCrew })
  }

  const addTalentMember = () => {
    setCallSheetData({
      ...callSheetData,
      talent: [...callSheetData.talent, { role: '', name: '', call: '07:00', notes: '' }]
    })
  }

  const removeTalentMember = (index: number) => {
    const newTalent = callSheetData.talent.filter((_, i) => i !== index)
    setCallSheetData({ ...callSheetData, talent: newTalent })
  }

  const updateTalentMember = (index: number, field: keyof TalentMember, value: string) => {
    const newTalent = [...callSheetData.talent]
    newTalent[index] = { ...newTalent[index], [field]: value }
    setCallSheetData({ ...callSheetData, talent: newTalent })
  }

  return (
    <div className="space-y-6">
      {/* Shoot Info Card */}
      <div className="bg-white rounded-xl border border-[#E5E5EA] overflow-hidden">
        <div className="p-4 border-b border-[#E5E5EA] bg-gray-50">
          <h2 className="font-semibold text-[#1D1D1F]">Shoot Information</h2>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Shoot Date
              </label>
              <input
                type="date"
                value={callSheetData.shootDate}
                onChange={(e) => updateField('shootDate', e.target.value)}
                className="w-full px-3 py-2 bg-[#F9F9F9] border border-[#E5E5EA] rounded-lg text-sm text-[#1D1D1F] focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Call Time
              </label>
              <input
                type="time"
                value={callSheetData.callTime}
                onChange={(e) => updateField('callTime', e.target.value)}
                className="w-full px-3 py-2 bg-[#F9F9F9] border border-[#E5E5EA] rounded-lg text-sm text-[#1D1D1F] focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Location
            </label>
            <input
              type="text"
              value={callSheetData.location}
              onChange={(e) => updateField('location', e.target.value)}
              placeholder="e.g., 123 Main St, Los Angeles, CA"
              className="w-full px-3 py-2 bg-[#F9F9F9] border border-[#E5E5EA] rounded-lg text-sm text-[#1D1D1F] focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Weather
            </label>
            <input
              type="text"
              value={callSheetData.weather}
              onChange={(e) => updateField('weather', e.target.value)}
              placeholder="e.g., Partly Cloudy, 72°F"
              className="w-full px-3 py-2 bg-[#F9F9F9] border border-[#E5E5EA] rounded-lg text-sm text-[#1D1D1F] focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>
      </div>

      {/* Crew Table */}
      <div className="bg-white rounded-xl border border-[#E5E5EA] overflow-hidden">
        <div className="p-4 border-b border-[#E5E5EA] bg-gray-50">
          <h2 className="font-semibold text-[#1D1D1F]">Crew</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-[#E5E5EA]">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Role</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Name</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Call</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Phone</th>
                <th className="px-4 py-3 w-12"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E5EA]">
              {callSheetData.crew.map((member, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <input
                      type="text"
                      value={member.role}
                      onChange={(e) => updateCrewMember(index, 'role', e.target.value)}
                      placeholder="Director"
                      className="w-full px-3 py-2 bg-[#F9F9F9] border border-[#E5E5EA] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <input
                      type="text"
                      value={member.name}
                      onChange={(e) => updateCrewMember(index, 'name', e.target.value)}
                      placeholder="Jane Smith"
                      className="w-full px-3 py-2 bg-[#F9F9F9] border border-[#E5E5EA] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <input
                      type="time"
                      value={member.call}
                      onChange={(e) => updateCrewMember(index, 'call', e.target.value)}
                      className="w-full px-3 py-2 bg-[#F9F9F9] border border-[#E5E5EA] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <input
                      type="tel"
                      value={member.phone}
                      onChange={(e) => updateCrewMember(index, 'phone', e.target.value)}
                      placeholder="555-1234"
                      className="w-full px-3 py-2 bg-[#F9F9F9] border border-[#E5E5EA] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => removeCrewMember(index)}
                      className="text-red-500 hover:text-red-700 text-lg font-bold"
                    >
                      ✕
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t border-[#E5E5EA]">
          <button
            onClick={addCrewMember}
            className="text-purple-600 hover:text-purple-700 font-medium text-sm flex items-center gap-2"
          >
            <span className="text-lg">+</span> Add Crew Member
          </button>
        </div>
      </div>

      {/* Talent Table */}
      <div className="bg-white rounded-xl border border-[#E5E5EA] overflow-hidden">
        <div className="p-4 border-b border-[#E5E5EA] bg-gray-50">
          <h2 className="font-semibold text-[#1D1D1F]">Talent</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-[#E5E5EA]">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Role</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Name</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Call</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Notes</th>
                <th className="px-4 py-3 w-12"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E5EA]">
              {callSheetData.talent.map((member, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <input
                      type="text"
                      value={member.role}
                      onChange={(e) => updateTalentMember(index, 'role', e.target.value)}
                      placeholder="Lead"
                      className="w-full px-3 py-2 bg-[#F9F9F9] border border-[#E5E5EA] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <input
                      type="text"
                      value={member.name}
                      onChange={(e) => updateTalentMember(index, 'name', e.target.value)}
                      placeholder="John Doe"
                      className="w-full px-3 py-2 bg-[#F9F9F9] border border-[#E5E5EA] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <input
                      type="time"
                      value={member.call}
                      onChange={(e) => updateTalentMember(index, 'call', e.target.value)}
                      className="w-full px-3 py-2 bg-[#F9F9F9] border border-[#E5E5EA] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <input
                      type="text"
                      value={member.notes}
                      onChange={(e) => updateTalentMember(index, 'notes', e.target.value)}
                      placeholder="Wardrobe ready"
                      className="w-full px-3 py-2 bg-[#F9F9F9] border border-[#E5E5EA] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => removeTalentMember(index)}
                      className="text-red-500 hover:text-red-700 text-lg font-bold"
                    >
                      ✕
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t border-[#E5E5EA]">
          <button
            onClick={addTalentMember}
            className="text-purple-600 hover:text-purple-700 font-medium text-sm flex items-center gap-2"
          >
            <span className="text-lg">+</span> Add Talent
          </button>
        </div>
      </div>
    </div>
  )
})

CallSheetForm.displayName = 'CallSheetForm'

export default CallSheetForm
