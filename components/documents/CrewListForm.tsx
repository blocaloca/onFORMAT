'use client'

import { useState, useEffect, forwardRef, useImperativeHandle } from 'react'

export interface CrewListFormHandle {
  getData: () => any
}

interface CrewListFormProps {
  content: any
  onChange: (content: any) => void
}

interface CrewMember {
  id: string
  department: string
  role: string
  name: string
  contact: string
  email: string
  rate: string
  notes: string
  confirmed: boolean
}

const departments = [
  { id: 'camera', name: 'Camera', icon: '📷', color: '#8EA091' },
  { id: 'lighting', name: 'G&E / Lighting', icon: '💡', color: '#8B7FA8' },
  { id: 'sound', name: 'Sound', icon: '🎤', color: '#B47864' },
  { id: 'production', name: 'Production', icon: '📋', color: '#7A94A8' },
  { id: 'art', name: 'Art Department', icon: '🎨', color: '#A8956D' },
  { id: 'wardrobe', name: 'Wardrobe/Styling', icon: '👗', color: '#D1758B' },
  { id: 'makeup', name: 'Hair & Makeup', icon: '💄', color: '#6B9080' },
  { id: 'talent', name: 'Talent', icon: '🎭', color: '#9C89B8' },
  { id: 'post', name: 'Post-Production', icon: '🎬', color: '#8EA091' },
  { id: 'other', name: 'Other', icon: '📌', color: '#999999' }
]

const CrewListForm = forwardRef<CrewListFormHandle, CrewListFormProps>(
  ({ content, onChange }, ref) => {
    const [crew, setCrew] = useState<CrewMember[]>(() => {
      if (content && Array.isArray(content.crew)) {
        return content.crew
      }
      return []
    })

    const [filterDepartment, setFilterDepartment] = useState<string>('all')
    const [projectInfo, setProjectInfo] = useState({
      projectName: content?.projectInfo?.projectName || '',
      shootDates: content?.projectInfo?.shootDates || '',
      callTime: content?.projectInfo?.callTime || '',
      location: content?.projectInfo?.location || ''
    })

    useImperativeHandle(ref, () => ({
      getData: () => ({ crew, projectInfo })
    }))

    useEffect(() => {
      onChange({ crew, projectInfo })
    }, [crew, projectInfo])

    const addCrewMember = (department: string = 'production') => {
      const newMember: CrewMember = {
        id: `crew-${Date.now()}`,
        department,
        role: '',
        name: '',
        contact: '',
        email: '',
        rate: '',
        notes: '',
        confirmed: false
      }
      setCrew([...crew, newMember])
    }

    const updateCrewMember = (id: string, field: keyof CrewMember, value: any) => {
      setCrew(crew.map(m => m.id === id ? { ...m, [field]: value } : m))
    }

    const removeCrewMember = (id: string) => {
      setCrew(crew.filter(m => m.id !== id))
    }

    const getDepartmentIcon = (deptId: string) => {
      return departments.find(d => d.id === deptId)?.icon || '📌'
    }

    const getDepartmentColor = (deptId: string) => {
      return departments.find(d => d.id === deptId)?.color || '#8EA091'
    }

    const filteredCrew = filterDepartment === 'all'
      ? crew
      : crew.filter(m => m.department === filterDepartment)

    const groupedCrew = departments.map(dept => ({
      ...dept,
      members: crew.filter(m => m.department === dept.id)
    })).filter(dept => dept.members.length > 0)

    return (
      <div className="bg-white rounded-xl border border-[#E5E5EA] shadow-sm overflow-hidden">
        <div className="p-4 border-b border-[#E5E5EA] bg-gradient-to-r from-blue-50 to-green-50">
          <h2 className="font-semibold text-[#1D1D1F] flex items-center gap-2">
            <span className="text-2xl">👥</span>
            Crew List
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Manage your team and crew ({crew.length} members total)
          </p>
        </div>

        {/* Project Info */}
        <div className="p-4 border-b border-[#E5E5EA] bg-gray-50">
          <h3 className="font-semibold text-gray-700 mb-3 text-sm">Project Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            <input
              type="text"
              value={projectInfo.projectName}
              onChange={(e) => setProjectInfo({ ...projectInfo, projectName: e.target.value })}
              className="px-3 py-2 border border-[#E5E5EA] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Project Name"
            />
            <input
              type="text"
              value={projectInfo.shootDates}
              onChange={(e) => setProjectInfo({ ...projectInfo, shootDates: e.target.value })}
              className="px-3 py-2 border border-[#E5E5EA] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Shoot Dates"
            />
            <input
              type="text"
              value={projectInfo.callTime}
              onChange={(e) => setProjectInfo({ ...projectInfo, callTime: e.target.value })}
              className="px-3 py-2 border border-[#E5E5EA] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Call Time"
            />
            <input
              type="text"
              value={projectInfo.location}
              onChange={(e) => setProjectInfo({ ...projectInfo, location: e.target.value })}
              className="px-3 py-2 border border-[#E5E5EA] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Location"
            />
          </div>
        </div>

        {/* Quick Add by Department */}
        <div className="p-4 border-b border-[#E5E5EA] bg-purple-50">
          <h3 className="font-semibold text-gray-700 mb-3 text-sm">Quick Add by Department</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
            {departments.map(dept => (
              <button
                key={dept.id}
                onClick={() => addCrewMember(dept.id)}
                className="px-3 py-2 bg-white border border-[#E5E5EA] rounded-lg hover:border-purple-500 transition text-sm flex items-center gap-2"
              >
                <span>{dept.icon}</span>
                <span className="truncate">{dept.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Crew List */}
        <div className="p-6 space-y-6">
          {crew.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-lg">
              <span className="text-6xl block mb-4">👥</span>
              <p className="text-gray-500 mb-2">No crew members yet</p>
              <p className="text-sm text-gray-400">Click a department above to add your first crew member</p>
            </div>
          ) : (
            groupedCrew.map(dept => (
              <div key={dept.id}>
                {/* Department Header */}
                <div
                  className="flex items-center gap-2 mb-3 pb-2 border-b-2"
                  style={{ borderColor: dept.color }}
                >
                  <span className="text-2xl">{dept.icon}</span>
                  <h3 className="font-bold" style={{ color: dept.color }}>
                    {dept.name}
                  </h3>
                  <span className="text-sm text-gray-500">({dept.members.length})</span>
                </div>

                {/* Department Members */}
                <div className="space-y-3">
                  {dept.members.map(member => (
                    <div
                      key={member.id}
                      className="border-2 rounded-lg p-4"
                      style={{ borderColor: dept.color + '40', backgroundColor: dept.color + '05' }}
                    >
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {/* Column 1: Role & Name */}
                        <div className="space-y-2">
                          <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1">
                              Role/Position
                            </label>
                            <input
                              type="text"
                              value={member.role}
                              onChange={(e) => updateCrewMember(member.id, 'role', e.target.value)}
                              className="w-full px-3 py-2 border border-[#E5E5EA] rounded-lg text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500"
                              placeholder="e.g., Director, DP, Gaffer"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1">
                              Name
                            </label>
                            <input
                              type="text"
                              value={member.name}
                              onChange={(e) => updateCrewMember(member.id, 'name', e.target.value)}
                              className="w-full px-3 py-2 border border-[#E5E5EA] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                              placeholder="Full name"
                            />
                          </div>
                        </div>

                        {/* Column 2: Contact & Rate */}
                        <div className="space-y-2">
                          <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1">
                              Phone
                            </label>
                            <input
                              type="text"
                              value={member.contact}
                              onChange={(e) => updateCrewMember(member.id, 'contact', e.target.value)}
                              className="w-full px-3 py-2 border border-[#E5E5EA] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                              placeholder="Phone number"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1">
                              Email
                            </label>
                            <input
                              type="email"
                              value={member.email}
                              onChange={(e) => updateCrewMember(member.id, 'email', e.target.value)}
                              className="w-full px-3 py-2 border border-[#E5E5EA] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                              placeholder="Email address"
                            />
                          </div>
                        </div>

                        {/* Column 3: Rate, Notes & Actions */}
                        <div className="space-y-2">
                          <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1">
                              Day Rate
                            </label>
                            <input
                              type="text"
                              value={member.rate}
                              onChange={(e) => updateCrewMember(member.id, 'rate', e.target.value)}
                              className="w-full px-3 py-2 border border-[#E5E5EA] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                              placeholder="e.g., $500/day"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1">
                              Notes
                            </label>
                            <input
                              type="text"
                              value={member.notes}
                              onChange={(e) => updateCrewMember(member.id, 'notes', e.target.value)}
                              className="w-full px-3 py-2 border border-[#E5E5EA] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                              placeholder="Availability, gear, etc."
                            />
                          </div>
                        </div>
                      </div>

                      {/* Bottom Row: Status & Delete */}
                      <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-200">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={member.confirmed}
                            onChange={(e) => updateCrewMember(member.id, 'confirmed', e.target.checked)}
                            className="w-4 h-4 text-green-600 rounded focus:ring-2 focus:ring-green-500"
                          />
                          <span className={`text-sm font-semibold ${member.confirmed ? 'text-green-600' : 'text-gray-500'}`}>
                            {member.confirmed ? '✓ Confirmed' : 'Pending Confirmation'}
                          </span>
                        </label>
                        <button
                          onClick={() => removeCrewMember(member.id)}
                          className="px-3 py-1 text-xs text-red-600 hover:bg-red-50 rounded transition"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Tips */}
        <div className="px-6 pb-6">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="font-semibold text-green-900 mb-2 text-sm">💡 Crew List Tips</h3>
            <ul className="text-sm text-green-800 space-y-1">
              <li>• Get confirmations in writing via email</li>
              <li>• Build relationships with reliable crew for future projects</li>
              <li>• Include backup options for key positions</li>
              <li>• Share the crew list with your team before shoot day</li>
            </ul>
          </div>
        </div>
      </div>
    )
  }
)

CrewListForm.displayName = 'CrewListForm'

export default CrewListForm
