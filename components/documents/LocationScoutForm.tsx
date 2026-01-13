'use client'

import { useState, useEffect, forwardRef, useImperativeHandle } from 'react'

export interface LocationScoutFormHandle {
  getData: () => any
}

interface LocationScoutFormProps {
  content: any
  onChange: (content: any) => void
}

interface Location {
  id: string
  name: string
  address: string
  type: string
  description: string
  pros: string
  cons: string
  parking: string
  permits: string
  power: string
  restrooms: string
  cost: string
  contact: string
  availability: string
  photos: string[]
  notes: string
  status: 'scouted' | 'approved' | 'booked' | 'rejected'
}

const locationTypes = [
  'Interior', 'Exterior', 'Studio', 'Office', 'Warehouse', 'Residence',
  'Restaurant', 'Store', 'Park', 'Street', 'Beach', 'Other'
]

const LocationScoutForm = forwardRef<LocationScoutFormHandle, LocationScoutFormProps>(
  ({ content, onChange }, ref) => {
    const [locations, setLocations] = useState<Location[]>(() => {
      if (content && Array.isArray(content.locations)) {
        return content.locations
      }
      return []
    })

    const [newPhotoUrl, setNewPhotoUrl] = useState<{ [key: string]: string }>({})

    useImperativeHandle(ref, () => ({
      getData: () => ({ locations })
    }))

    useEffect(() => {
      onChange({ locations })
    }, [locations])

    const addLocation = () => {
      const newLocation: Location = {
        id: `loc-${Date.now()}`,
        name: '',
        address: '',
        type: 'Interior',
        description: '',
        pros: '',
        cons: '',
        parking: '',
        permits: '',
        power: '',
        restrooms: '',
        cost: '',
        contact: '',
        availability: '',
        photos: [],
        notes: '',
        status: 'scouted'
      }
      setLocations([...locations, newLocation])
    }

    const updateLocation = (id: string, field: keyof Location, value: any) => {
      setLocations(locations.map(loc => loc.id === id ? { ...loc, [field]: value } : loc))
    }

    const removeLocation = (id: string) => {
      setLocations(locations.filter(loc => loc.id !== id))
    }

    const addPhoto = (locationId: string) => {
      const url = newPhotoUrl[locationId]
      if (!url?.trim()) return

      const location = locations.find(loc => loc.id === locationId)
      if (location) {
        updateLocation(locationId, 'photos', [...location.photos, url.trim()])
        setNewPhotoUrl({ ...newPhotoUrl, [locationId]: '' })
      }
    }

    const removePhoto = (locationId: string, photoIndex: number) => {
      const location = locations.find(loc => loc.id === locationId)
      if (location) {
        const newPhotos = location.photos.filter((_, i) => i !== photoIndex)
        updateLocation(locationId, 'photos', newPhotos)
      }
    }

    const getStatusColor = (status: string) => {
      switch (status) {
        case 'scouted': return 'bg-gray-100 text-gray-700'
        case 'approved': return 'bg-blue-100 text-blue-700'
        case 'booked': return 'bg-green-100 text-green-700'
        case 'rejected': return 'bg-red-100 text-red-700'
        default: return 'bg-gray-100 text-gray-700'
      }
    }

    return (
      <div className="bg-white rounded-xl border border-[#E5E5EA] shadow-sm overflow-hidden">
        <div className="p-4 border-b border-[#E5E5EA] bg-gradient-to-r from-green-50 to-blue-50">
          <h2 className="font-semibold text-[#1D1D1F] flex items-center gap-2">
            <span className="text-2xl">📍</span>
            Location Scout
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Track and evaluate potential filming locations ({locations.length} locations)
          </p>
        </div>

        {/* Add Location Button */}
        <div className="p-4 border-b border-[#E5E5EA] bg-gray-50">
          <button
            onClick={addLocation}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition text-sm"
          >
            + Add Location
          </button>
        </div>

        {/* Locations List */}
        <div className="p-6 space-y-6">
          {locations.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-lg">
              <span className="text-6xl block mb-4">📍</span>
              <p className="text-gray-500 mb-2">No locations yet</p>
              <p className="text-sm text-gray-400">Click "Add Location" to start scouting</p>
            </div>
          ) : (
            locations.map((location) => (
              <div
                key={location.id}
                className="border-2 border-gray-200 rounded-lg overflow-hidden"
              >
                {/* Location Header */}
                <div className="px-4 py-3 bg-gray-50 flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <input
                      type="text"
                      value={location.name}
                      onChange={(e) => updateLocation(location.id, 'name', e.target.value)}
                      className="flex-1 px-3 py-2 border border-[#E5E5EA] rounded-lg font-bold text-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Location Name"
                    />
                    <select
                      value={location.status}
                      onChange={(e) => updateLocation(location.id, 'status', e.target.value)}
                      className={`px-3 py-2 rounded-lg text-sm font-semibold ${getStatusColor(location.status)}`}
                    >
                      <option value="scouted">Scouted</option>
                      <option value="approved">Approved</option>
                      <option value="booked">Booked</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>
                  <button
                    onClick={() => removeLocation(location.id)}
                    className="ml-3 px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded transition"
                  >
                    Remove
                  </button>
                </div>

                {/* Location Details */}
                <div className="p-4 space-y-4">
                  {/* Basic Info */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-xs font-semibold text-gray-600 mb-1">
                        Address
                      </label>
                      <input
                        type="text"
                        value={location.address}
                        onChange={(e) => updateLocation(location.id, 'address', e.target.value)}
                        className="w-full px-3 py-2 border border-[#E5E5EA] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="Full address with city, state, zip"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">
                        Type
                      </label>
                      <select
                        value={location.type}
                        onChange={(e) => updateLocation(location.id, 'type', e.target.value)}
                        className="w-full px-3 py-2 border border-[#E5E5EA] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                      >
                        {locationTypes.map(type => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">
                      Description
                    </label>
                    <textarea
                      value={location.description}
                      onChange={(e) => updateLocation(location.id, 'description', e.target.value)}
                      className="w-full px-3 py-2 border border-[#E5E5EA] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                      rows={2}
                      placeholder="Describe the location, aesthetic, size, features..."
                    />
                  </div>

                  {/* Pros & Cons */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-green-600 mb-1">
                        ✓ Pros
                      </label>
                      <textarea
                        value={location.pros}
                        onChange={(e) => updateLocation(location.id, 'pros', e.target.value)}
                        className="w-full px-3 py-2 border border-green-200 bg-green-50 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                        rows={3}
                        placeholder="What's great about this location?"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-red-600 mb-1">
                        ✗ Cons
                      </label>
                      <textarea
                        value={location.cons}
                        onChange={(e) => updateLocation(location.id, 'cons', e.target.value)}
                        className="w-full px-3 py-2 border border-red-200 bg-red-50 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                        rows={3}
                        placeholder="What are the challenges or drawbacks?"
                      />
                    </div>
                  </div>

                  {/* Logistics */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">
                        Parking
                      </label>
                      <input
                        type="text"
                        value={location.parking}
                        onChange={(e) => updateLocation(location.id, 'parking', e.target.value)}
                        className="w-full px-3 py-2 border border-[#E5E5EA] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="Parking availability and details"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">
                        Permits Required
                      </label>
                      <input
                        type="text"
                        value={location.permits}
                        onChange={(e) => updateLocation(location.id, 'permits', e.target.value)}
                        className="w-full px-3 py-2 border border-[#E5E5EA] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="Filming permits needed"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">
                        Power Access
                      </label>
                      <input
                        type="text"
                        value={location.power}
                        onChange={(e) => updateLocation(location.id, 'power', e.target.value)}
                        className="w-full px-3 py-2 border border-[#E5E5EA] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="Power outlets, generators needed?"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">
                        Restrooms
                      </label>
                      <input
                        type="text"
                        value={location.restrooms}
                        onChange={(e) => updateLocation(location.id, 'restrooms', e.target.value)}
                        className="w-full px-3 py-2 border border-[#E5E5EA] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="Restroom facilities available?"
                      />
                    </div>
                  </div>

                  {/* Cost & Contact */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">
                        Cost
                      </label>
                      <input
                        type="text"
                        value={location.cost}
                        onChange={(e) => updateLocation(location.id, 'cost', e.target.value)}
                        className="w-full px-3 py-2 border border-[#E5E5EA] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="Location fee"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">
                        Contact Person
                      </label>
                      <input
                        type="text"
                        value={location.contact}
                        onChange={(e) => updateLocation(location.id, 'contact', e.target.value)}
                        className="w-full px-3 py-2 border border-[#E5E5EA] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="Name and phone"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">
                        Availability
                      </label>
                      <input
                        type="text"
                        value={location.availability}
                        onChange={(e) => updateLocation(location.id, 'availability', e.target.value)}
                        className="w-full px-3 py-2 border border-[#E5E5EA] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="Available dates/times"
                      />
                    </div>
                  </div>

                  {/* Photos */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-2">
                      Location Photos ({location.photos.length})
                    </label>
                    <div className="flex gap-2 mb-3">
                      <input
                        type="text"
                        value={newPhotoUrl[location.id] || ''}
                        onChange={(e) => setNewPhotoUrl({ ...newPhotoUrl, [location.id]: e.target.value })}
                        onKeyPress={(e) => e.key === 'Enter' && addPhoto(location.id)}
                        className="flex-1 px-3 py-2 border border-[#E5E5EA] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="Paste image URL and press Enter"
                      />
                      <button
                        onClick={() => addPhoto(location.id)}
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition text-sm"
                      >
                        Add
                      </button>
                    </div>
                    {location.photos.length > 0 && (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {location.photos.map((photo, index) => (
                          <div key={index} className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden group">
                            <img
                              src={photo}
                              alt={`Location ${index + 1}`}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23ddd" width="100" height="100"/%3E%3Ctext fill="%23999" x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle"%3ENo Image%3C/text%3E%3C/svg%3E'
                              }}
                            />
                            <button
                              onClick={() => removePhoto(location.id, index)}
                              className="absolute top-1 right-1 bg-red-500 text-white w-6 h-6 rounded-full opacity-0 group-hover:opacity-100 transition text-xs"
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">
                      Additional Notes
                    </label>
                    <textarea
                      value={location.notes}
                      onChange={(e) => updateLocation(location.id, 'notes', e.target.value)}
                      className="w-full px-3 py-2 border border-[#E5E5EA] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                      rows={2}
                      placeholder="Any other important information..."
                    />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Tips */}
        <div className="px-6 pb-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2 text-sm">💡 Location Scouting Tips</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Take photos at the same time of day you'll be shooting</li>
              <li>• Test cell phone reception and wifi availability</li>
              <li>• Check noise levels (traffic, construction, etc.)</li>
              <li>• Confirm backup locations for weather-dependent shoots</li>
              <li>• Get everything in writing (permits, fees, restrictions)</li>
            </ul>
          </div>
        </div>
      </div>
    )
  }
)

LocationScoutForm.displayName = 'LocationScoutForm'

export default LocationScoutForm
