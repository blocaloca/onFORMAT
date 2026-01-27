import React, { useEffect, useState } from 'react';
import { DocumentLayout } from './DocumentLayout';
import { Trash2, Plus, GripVertical } from 'lucide-react';

type EventType = 'Arrive' | 'Set Up' | 'Shoot' | 'Break' | 'Meal' | 'Strike' | 'Wrap' | 'Move' | 'Other';

interface CallSheetEvent {
    id: string;
    time: string;
    type: string; // Allowing string to support custom or the union
    description: string;
    location: string;
}

interface CallSheetData {
    date: string;
    shootDay?: string;
    currentDay?: string;
    totalDays?: string;
    crewCall: string;
    breakfastTime: string;
    lunchTime: string;
    weather: string;
    hospital: string;
    events: CallSheetEvent[];
    notes: string;
    basecamp?: string;
    sunriseSunset: string;
}

interface MultiDayData extends Partial<CallSheetData> {
    days?: CallSheetData[];
}

interface CallSheetTemplateProps {
    data: MultiDayData;
    onUpdate: (data: MultiDayData) => void;
    isLocked?: boolean;
    plain?: boolean;
    orientation?: 'portrait' | 'landscape';
    metadata?: any;
    isPrinting?: boolean;
}

const WEATHER_CODES: Record<number, string> = {
    0: 'Clear sky',
    1: 'Mainly clear', 2: 'Partly cloudy', 3: 'Overcast',
    45: 'Fog', 48: 'Depositing rime fog',
    51: 'Light drizzle', 53: 'Moderate drizzle', 55: 'Dense drizzle',
    61: 'Slight rain', 63: 'Moderate rain', 65: 'Heavy rain',
    71: 'Slight snow', 73: 'Moderate snow', 75: 'Heavy snow',
    95: 'Thunderstorm', 96: 'Thunderstorm with hail', 99: 'Thunderstorm with heavy hail'
};

const DEFAULT_EVENT: CallSheetEvent = {
    id: 'evt-init', time: '', type: 'Shoot', description: '', location: ''
};

export const CallSheetTemplate = ({ data, onUpdate, isLocked = false, plain, orientation, metadata, isPrinting }: CallSheetTemplateProps) => {

    // --- Multi-Day Logic ---
    const [activeDayIdx, setActiveDayIdx] = useState(0);

    // Normalize: Check if legacy flat data or multi-day
    const rawDays: CallSheetData[] = (data.days && Array.isArray(data.days) && data.days.length > 0)
        ? data.days
        : [data as CallSheetData]; // self as Day 1 if no days array

    // Current Day Accessor
    const currentDayData = rawDays[activeDayIdx] || rawDays[0] || {};

    // Ensure vital fields exist
    const events = currentDayData.events || [];

    // Helper to push updates to the correct day
    const updateActiveDay = (changes: Partial<CallSheetData>) => {
        const newDays = [...rawDays];
        newDays[activeDayIdx] = { ...newDays[activeDayIdx], ...changes };
        // Flatten first day to root for backwards compat if needed, but primarily store 'days'
        // We will store everything in 'days' AND keep the root flat fields as a mirror of Day 1 (optional, but safe).
        // Actually, let's just commit active structure.
        onUpdate({
            ...newDays[0], // Mirror Day 0 to root for simple viewers
            days: newDays
        });
    };

    // Initialize Logic (Only if empty)
    useEffect(() => {
        if (!currentDayData.events || currentDayData.events.length === 0) {
            const schedule = (metadata as any)?.importedSchedule;

            // Priority: Imported Schedule > Current Date
            let initialDate = '';
            if (schedule?.date) {
                initialDate = schedule.date;
            } else {
                const now = new Date();
                const day = String(now.getDate()).padStart(2, '0');
                const month = String(now.getMonth() + 1).padStart(2, '0');
                const year = now.getFullYear();
                initialDate = `${month} /${day}/${year} `;
            }

            const locs = (metadata as any)?.importedLocations?.items || [];
            let newEvents = [
                { id: 'evt-1', time: '', type: 'Arrive', description: 'Crew Call', location: 'Basecamp' },
                { id: 'evt-2', time: '', type: 'Shoot', description: 'Scene 1', location: 'Set' }
            ];

            if (schedule?.items && schedule.items.length > 0) {
                newEvents = schedule.items.map((item: any, i: number) => {
                    let locName = item.set || item.location || '';
                    if (locs && locs.length > 0) {
                        const match = locs.find((l: any) =>
                            l.name && locName && l.name.toLowerCase().includes(locName.toLowerCase())
                        );
                        if (match && match.address) locName = `${locName} (${match.address})`;
                    }
                    return {
                        id: `evt - imp - ${Date.now()} -${i} `,
                        time: item.time || '',
                        type: item.type || 'Shoot',
                        description: item.description || (item.scene ? `Scene ${item.scene} ` : ''),
                        location: locName
                    };
                });
            }

            // Smart Fill Basecamp/Hospital
            let basecamp = currentDayData.basecamp || '';
            let hospital = currentDayData.hospital || '';

            if (locs && locs.length > 0) {
                const activeBasecamp = locs.find((l: any) =>
                    l.usageType === 'Basecamp' &&
                    (!l.activeDays || l.activeDays.includes(initialDate))
                );
                if (activeBasecamp) basecamp = `${activeBasecamp.name} - ${activeBasecamp.address} `;
                const activeHospital = locs.find((l: any) => l.usageType === 'Hospital');
                if (activeHospital) hospital = `${activeHospital.name} - ${activeHospital.address} `;
            }

            // Update
            updateActiveDay({
                date: initialDate,
                crewCall: currentDayData.crewCall || schedule?.callTime || '',
                events: newEvents,
                basecamp,
                hospital
            });
        }
    }, [metadata?.importedSchedule, metadata?.importedLocations, activeDayIdx, rawDays.length]); // Re-run if day changes and is empty


    // Add New Day Logic
    const handleAddDay = () => {
        const lastDay = rawDays[rawDays.length - 1];
        // Try to increment date
        let nextDate = '';
        if (lastDay.date) {
            try {
                const [mm, dd, yyyy] = lastDay.date.split('/').map(Number);
                const d = new Date(yyyy, mm - 1, dd); // Month is 0-indexed
                d.setDate(d.getDate() + 1);
                nextDate = `${String(d.getMonth() + 1).padStart(2, '0')} /${String(d.getDate()).padStart(2, '0')}/${d.getFullYear()} `;
            } catch (e) {
                console.error("Error incrementing date:", e);
            }
        }

        const newDay: CallSheetData = {
            date: nextDate,
            crewCall: lastDay.crewCall || '07:00',
            breakfastTime: lastDay.breakfastTime || '', lunchTime: lastDay.lunchTime || '',
            weather: '', hospital: lastDay.hospital || '',
            events: [{ id: `evt - ${Date.now()} `, time: lastDay.crewCall || '07:00', type: 'Arrive', description: 'Crew Call', location: lastDay.basecamp || 'Basecamp' }],
            notes: '',
            basecamp: lastDay.basecamp || '',
            sunriseSunset: ''
        };

        const newDays = [...rawDays, newDay];
        setActiveDayIdx(newDays.length - 1);
        onUpdate({
            ...newDays[0],
            days: newDays
        });
    };

    const [eventToDelete, setEventToDelete] = useState<string | null>(null);

    const formatDate = (val: string) => {
        const digits = val.replace(/\D/g, '');
        const chars = digits.split('');
        if (chars.length > 2) chars.splice(2, 0, '/');
        if (chars.length > 5) chars.splice(5, 0, '/');
        return chars.join('').slice(0, 10);
    };

    const formatTime = (value: string) => {
        // Allow deletion
        // Allow simple backspace handling
        if (value.length < 3 && value.includes(':')) {
            return value.replace(':', '');
        }

        const nums = value.replace(/[^\d]/g, '');
        if (nums.length <= 2) return nums;
        if (nums.length <= 4) return `${nums.slice(0, 2)}:${nums.slice(2)} `;
        return `${nums.slice(0, 2)}:${nums.slice(2, 4)} `;
    };

    // Handle click outside to close delete popup
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (eventToDelete && !(e.target as Element).closest('.delete-popup')) {
                setEventToDelete(null);
            }
        };
        window.addEventListener('click', handleClickOutside);
        return () => window.removeEventListener('click', handleClickOutside);
    }, [eventToDelete]);

    const updateField = (field: keyof CallSheetData, value: any) => {
        updateActiveDay({ [field]: value });
    };

    const handleAddEvent = () => {
        const newEvent: CallSheetEvent = {
            id: `evt - ${Date.now()} -${Math.random().toString(36).substr(2, 9)} `,
            time: '',
            type: 'Shoot',
            description: '',
            location: ''
        };
        onUpdate({ events: [...events, newEvent] });
    };

    const handleUpdateEvent = (index: number, updates: Partial<CallSheetEvent>) => {
        const newEvents = [...events];
        newEvents[index] = { ...newEvents[index], ...updates };
        onUpdate({ events: newEvents });
    };

    const handleDeleteEvent = (id: string) => {
        setEventToDelete(id);
    };

    const confirmDeleteEvent = (id: string) => {
        const newEvents = events.filter(e => e.id !== id);
        onUpdate({ events: newEvents });
        setEventToDelete(null);
    };

    const handleImportSchedule = () => {
        if (!metadata?.importedSchedule?.items) return;
        const count = metadata.importedSchedule.items.length;
        if (!confirm(`Add ${count} items from Schedule ? `)) return;

        const schedItems = metadata.importedSchedule.items as any[];
        const newEvents: CallSheetEvent[] = schedItems.map((item, i) => ({
            id: `evt - imp - ${Date.now()} -${i} `,
            time: item.time || '',
            type: 'Shoot',
            description: item.description || '',
            location: item.set || ''
        }));

        onUpdate({ events: [...events, ...newEvents] });
    };

    const [loadingWeather, setLoadingWeather] = useState(false);
    const [loadingHospital, setLoadingHospital] = useState(false);

    const handleAutoHospital = async () => {
        if (!data.basecamp) {
            alert('Please enter a Basecamp location first.');
            return;
        }
        setLoadingHospital(true);
        try {
            // Try Urgent Care first
            let res = await fetch(`https://nominatim.openstreetmap.org/search?q=Urgent+Care+near+${encodeURIComponent(data.basecamp)}&format=json&limit=1`);
            let json = await res.json();

            if (!json.length) {
                // Try Hospital
                res = await fetch(`https://nominatim.openstreetmap.org/search?q=Hospital+near+${encodeURIComponent(data.basecamp)}&format=json&limit=1`);
                json = await res.json();
            }

            if (json.length > 0) {
                onUpdate({ hospital: json[0].display_name });
            } else {
                alert('No hospitals found nearby.');
            }
        } catch (e) {
            console.error(e);
            alert('Error searching for hospital.');
        } finally {
            setLoadingHospital(false);
        }
    };

    const handleAutoWeather = async () => {
        if (!data.basecamp || !data.date) {
            alert('Please enter a Basecamp location and Shoot Date (MM-DD-YYYY) first.');
            return;
        }

        setLoadingWeather(true);
        try {
            // 1. Geocoding via Nominatim (OpenStreetMap)
            const geoRes = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(data.basecamp)}&format=json&limit=1`);
            const geoData = await geoRes.json();

            if (!geoData || geoData.length === 0) {
                alert('Could not find location. Please try a cleaner city name.');
                setLoadingWeather(false);
                return;
            }

            const { lat, lon } = geoData[0];

            // 2. Format Date: MM/DD/YYYY -> YYYY-MM-DD
            const [mm, dd, yyyy] = data.date.split('/');
            const isoDate = `${yyyy}-${mm}-${dd}`;

            // 3. Weather via Open-Meteo
            const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset&start_date=${isoDate}&end_date=${isoDate}&temperature_unit=fahrenheit&timezone=auto`;

            const weatherRes = await fetch(weatherUrl);
            const weatherData = await weatherRes.json();

            if (!weatherData.daily || !weatherData.daily.time || weatherData.daily.time.length === 0) {
                alert('No weather data available for this date.');
                setLoadingWeather(false);
                return;
            }

            const dayData = {
                code: weatherData.daily.weather_code[0],
                max: Math.round(weatherData.daily.temperature_2m_max[0]),
                min: Math.round(weatherData.daily.temperature_2m_min[0]),
                sunrise: weatherData.daily.sunrise[0],
                sunset: weatherData.daily.sunset[0]
            };

            const weatherDesc = WEATHER_CODES[dayData.code] || 'Unknown';
            const weatherString = `${dayData.max}° / ${dayData.min}° ${weatherDesc}`;

            const formatSunTime = (iso: string) => {
                const date = new Date(iso);
                return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }).replace(/^0/, '');
            };
            const sunString = `${formatSunTime(dayData.sunrise)} / ${formatSunTime(dayData.sunset)}`;

            onUpdate({
                weather: weatherString,
                sunriseSunset: sunString
            });

        } catch (error) {
            console.error(error);
            alert('Failed to retrieve weather.');
        } finally {
            setLoadingWeather(false);
        }
    };

    const ITEMS_FIRST_PAGE = 10;
    const ITEMS_OTHER_PAGES = 18;

    const remainingItems = Math.max(0, events.length - ITEMS_FIRST_PAGE);
    const extraPages = Math.ceil(remainingItems / ITEMS_OTHER_PAGES);
    const totalPages = 1 + extraPages;

    const pages = Array.from({ length: totalPages }, (_, i) => {
        if (i === 0) return events.slice(0, ITEMS_FIRST_PAGE);
        const start = ITEMS_FIRST_PAGE + (i - 1) * ITEMS_OTHER_PAGES;
        return events.slice(start, start + ITEMS_OTHER_PAGES);
    });

    return (
        <>
            {/* Day Tabs Navigation (Screen Only) */}
            {!isPrinting && (data.days && data.days.length > 0 || rawDays.length > 1) && (
                <div className="flex items-center gap-1 mb-4 print:hidden px-1 overflow-x-auto">
                    {rawDays.map((day, idx) => (
                        <button
                            key={idx}
                            onClick={() => setActiveDayIdx(idx)}
                            className={`px-3 py-1.5 rounded-t-sm text-[10px] font-bold uppercase tracking-wider transition-colors border-b-2 ${activeDayIdx === idx
                                ? 'bg-zinc-100 text-black border-black'
                                : 'text-zinc-400 border-transparent hover:text-zinc-600 hover:bg-zinc-50'
                                }`}
                        >
                            Day {idx + 1} {day.date ? `(${day.date.slice(0, 5)})` : ''}
                        </button>
                    ))}
                    <button
                        onClick={handleAddDay}
                        className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-indigo-500 hover:text-indigo-700 hover:bg-indigo-50 rounded-sm ml-2 flex items-center gap-1 transition-colors"
                    >
                        <Plus size={10} /> Add Day
                    </button>
                </div>
            )}

            {pages.map((pageItems, pageIndex) => (
                <DocumentLayout
                    key={pageIndex}
                    title="Call Sheet"
                    hideHeader={false}
                    plain={plain}
                    subtitle={pageIndex > 0 ? `Page ${pageIndex + 1}` : ''}
                    orientation={orientation}
                    metadata={metadata}
                >
                    <div className="space-y-6 text-xs font-sans h-full flex flex-col">

                        {/* Page 1 Header & Logistics Grid */}
                        {pageIndex === 0 && (
                            <div className="space-y-4">
                                {/* Header Grid: Date/Day + Vitals */}
                                <div className="grid grid-cols-[1fr_2fr] gap-6">
                                    <div className="space-y-2">
                                        <div className="border-b border-zinc-200">
                                            <input
                                                type="text"
                                                value={data.date || ''}
                                                onChange={(e) => updateField('date', formatDate(e.target.value))}
                                                placeholder="MM/DD/YYYY"
                                                className="block w-full bg-transparent text-2xl font-black uppercase placeholder:text-zinc-200 outline-none text-black tracking-tighter"
                                                disabled={isLocked}
                                            />
                                        </div>

                                    </div>

                                    {/* Vitals Grid: General Call & QR */}
                                    <div>
                                        <div className="flex justify-between items-end mb-1">
                                            <span className="text-[10px] font-bold uppercase text-zinc-400 tracking-widest">General Call</span>
                                            <span className="text-[9px] font-bold uppercase text-zinc-400 tracking-widest w-32 text-center">GET onSET MOBILE</span>
                                        </div>
                                        <div className="grid grid-cols-[1fr_auto] border border-zinc-200 rounded-sm overflow-hidden bg-white h-32">
                                            <div className="p-6 flex items-center">
                                                <input
                                                    type="text"
                                                    value={data.crewCall || (metadata as any)?.importedSchedule?.callTime || ''}
                                                    onChange={e => updateField('crewCall', formatTime(e.target.value))}
                                                    className="w-full bg-transparent font-sans text-6xl font-black outline-none text-black placeholder:text-zinc-100 tracking-tighter leading-none"
                                                    placeholder="00:00"
                                                    disabled={isLocked}
                                                />
                                            </div>
                                            <div className="w-32 bg-zinc-50 border-l border-zinc-100 p-3 flex items-center justify-center">
                                                <img
                                                    src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://onformat.io/onset/${metadata?.projectId || 'demo'}`}
                                                    alt="Set QR"
                                                    className="w-full h-full object-contain opacity-90 mix-blend-multiply"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Logistics Row */}
                                <div className="grid grid-cols-4 gap-4 bg-zinc-50 p-3 rounded-sm border border-zinc-100">
                                    <div className="col-span-1">
                                        <div className="flex justify-between items-center mb-1">
                                            <label className="block text-[9px] font-bold uppercase text-zinc-400">Weather</label>
                                            <button
                                                onClick={handleAutoWeather}
                                                disabled={loadingWeather}
                                                className="text-[8px] uppercase font-bold text-indigo-500 hover:text-indigo-700 disabled:opacity-50"
                                                title="Auto-fill from Basecamp & Date"
                                            >
                                                {loadingWeather ? '...' : 'Auto-fill'}
                                            </button>
                                        </div>
                                        {isPrinting ? (
                                            <div className="text-[10px] font-bold uppercase text-black pt-0.5 leading-normal block">{data.weather}</div>
                                        ) : (
                                            <input
                                                type="text"
                                                value={data.weather || ''}
                                                onChange={e => updateField('weather', e.target.value)}
                                                placeholder="75° Sunny"
                                                className="w-full bg-transparent outline-none font-bold text-xs"
                                                disabled={isLocked}
                                            />
                                        )}
                                    </div>
                                    <div className="col-span-1">
                                        <label className="block text-[9px] font-bold uppercase text-zinc-400 mb-1">Sun</label>
                                        {isPrinting ? (
                                            <div className="text-[10px] font-bold uppercase text-black pt-0.5 leading-normal block">{data.sunriseSunset}</div>
                                        ) : (
                                            <input
                                                type="text"
                                                value={data.sunriseSunset || ''}
                                                onChange={e => updateField('sunriseSunset', e.target.value)}
                                                placeholder="06:00 / 20:00"
                                                className="w-full bg-transparent outline-none font-bold text-xs"
                                                disabled={isLocked}
                                            />
                                        )}
                                    </div>
                                    <div className="col-span-2 border-l border-zinc-200 pl-4">
                                        <div className="flex justify-between items-center mb-1">
                                            <label className="block text-[9px] font-bold uppercase text-zinc-400">Nearest Hospital</label>
                                            <button
                                                onClick={handleAutoHospital}
                                                disabled={loadingHospital}
                                                className="text-[8px] uppercase font-bold text-red-500 hover:text-red-700 disabled:opacity-50"
                                                title="Find Nearest Urgent Care/Hospital"
                                            >
                                                {loadingHospital ? '...' : 'Find Nearest'}
                                            </button>
                                        </div>
                                        {isPrinting ? (
                                            <div className="text-[10px] font-bold uppercase text-red-600 pt-0.5 leading-normal block">{data.hospital}</div>
                                        ) : (
                                            <input
                                                type="text"
                                                value={data.hospital || ''}
                                                onChange={e => updateField('hospital', e.target.value)}
                                                placeholder="Hospital Name & Address"
                                                className="w-full bg-transparent outline-none font-bold text-xs text-red-600"
                                                disabled={isLocked}
                                            />
                                        )}
                                    </div>
                                </div>

                                {/* Notes & Basecamp Section */}
                                <div className="mt-6 mb-6 grid grid-cols-[2fr_1fr] gap-6">
                                    {/* Notes */}
                                    <div className="min-w-0">
                                        <h3 className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-2">Notes</h3>
                                        {isPrinting ? (
                                            <div className="w-full bg-zinc-50 border border-zinc-200 p-2 text-xs rounded-sm whitespace-pre-wrap break-words leading-relaxed block">{data.notes}</div>
                                        ) : (
                                            <textarea
                                                value={data.notes || ''}
                                                onChange={(e) => updateField('notes', e.target.value)}
                                                className="w-full bg-zinc-50 border border-zinc-200 p-2 text-xs rounded-sm outline-none focus:border-zinc-400 resize-none overflow-hidden leading-relaxed"
                                                placeholder="General production notes..."
                                                rows={3}
                                                disabled={isLocked}
                                            />
                                        )}
                                    </div>

                                    {/* Basecamp */}
                                    <div className="min-w-0">
                                        <h3 className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-2">Basecamp</h3>
                                        {isPrinting ? (
                                            <div className="w-full bg-zinc-50 border border-zinc-200 p-2 text-xs rounded-sm whitespace-pre-wrap break-words leading-relaxed block">{data.basecamp}</div>
                                        ) : (
                                            <textarea
                                                value={data.basecamp || ''}
                                                onChange={(e) => updateField('basecamp', e.target.value)}
                                                className="w-full bg-zinc-50 border border-zinc-200 p-2 text-xs rounded-sm outline-none focus:border-zinc-400 resize-none overflow-hidden leading-relaxed"
                                                placeholder="Basecamp Address..."
                                                rows={3}
                                                disabled={isLocked}
                                            />
                                        )}
                                    </div>
                                </div>

                                {/* Events List */}
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between border-b border-black pb-1 mb-3">
                                        <div className="flex items-center gap-2">
                                            <h3 className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Schedule</h3>
                                        </div>
                                        {!isLocked && metadata?.importedSchedule && (
                                            <button onClick={handleImportSchedule} className="text-[9px] font-bold uppercase text-indigo-500 hover:text-indigo-700">
                                                Add from Schedule
                                            </button>
                                        )}
                                    </div>
                                    {/* Header Row */}
                                    <div className="grid grid-cols-[50px_100px_1.5fr_1fr_30px] gap-4 px-2 ml-4 text-[9px] font-bold uppercase text-zinc-400">
                                        <div>Time</div>
                                        <div>Type</div>
                                        <div>Description</div>
                                        <div>Location</div>
                                        <div></div>
                                    </div>

                                    <div className="space-y-0 relative border-l border-zinc-200 ml-2 pl-4 pt-0">
                                        {pageItems.map((item, localIdx) => {
                                            const globalIdx = (pageIndex === 0) ? localIdx : ITEMS_FIRST_PAGE + ((pageIndex - 1) * ITEMS_OTHER_PAGES) + localIdx;
                                            return (
                                                <div key={item.id} className={`relative group grid grid-cols-[50px_100px_1.5fr_1fr_30px] gap-4 mb-0.5 items-start ${eventToDelete === item.id ? 'z-50' : ''}`}>
                                                    <div>
                                                        {isPrinting ? (
                                                            <div className="text-[9px] font-bold uppercase text-black pt-0.5 leading-normal block">{item.time}</div>
                                                        ) : (
                                                            <input
                                                                type="text"
                                                                value={item.time}
                                                                onChange={(e) => handleUpdateEvent(globalIdx, { time: formatTime(e.target.value) })}
                                                                placeholder="00:00"
                                                                className="w-full text-[10px] font-bold uppercase bg-transparent outline-none placeholder:text-zinc-300 pt-0.5"
                                                                disabled={isLocked}
                                                            />
                                                        )}
                                                    </div>

                                                    {/* Type Dropdown */}
                                                    <div className="relative">
                                                        <select
                                                            value={item.type || 'Other'}
                                                            onChange={(e) => handleUpdateEvent(globalIdx, { type: e.target.value })}
                                                            className={`w-full text-[10px] font-bold uppercase bg-transparent outline-none appearance-none cursor-pointer pt-0.5 text-zinc-600 hover:text-black ${isPrinting ? 'hidden' : ''} print:hidden`}
                                                            disabled={isLocked}
                                                        >
                                                            <option value="Arrive">Arrive</option>
                                                            <option value="Set Up">Set Up</option>
                                                            <option value="Shoot">Shoot</option>
                                                            <option value="Break">Break</option>
                                                            <option value="Meal">Meal</option>
                                                            <option value="Strike">Strike</option>
                                                            <option value="Move">Move</option>
                                                            <option value="Other">Other</option>
                                                        </select>
                                                        <div className={`text-[9px] font-bold uppercase text-black pt-0.5 pb-0.5 leading-normal ${isPrinting ? 'block' : 'hidden'} print:block`}>
                                                            {item.type || 'Other'}
                                                        </div>
                                                    </div>

                                                    <div>
                                                        <textarea
                                                            value={item.description}
                                                            onChange={(e) => handleUpdateEvent(globalIdx, { description: e.target.value })}
                                                            style={{ resize: 'none' }}
                                                            placeholder="Description"
                                                            rows={1}
                                                            onInput={(e) => {
                                                                const target = e.target as HTMLTextAreaElement;
                                                                target.style.height = 'auto';
                                                                target.style.height = target.scrollHeight + 'px';
                                                            }}
                                                            className={`w-full text-[10px] font-medium uppercase bg-transparent outline-none placeholder:text-zinc-300 pt-0.5 overflow-hidden ${isPrinting ? 'hidden' : ''} print:hidden`}
                                                            disabled={isLocked}
                                                        />
                                                        <div className={`text-[9px] font-medium uppercase text-black pt-0.5 pb-0.5 whitespace-pre-wrap leading-normal ${isPrinting ? 'block' : 'hidden'} print:block`}>
                                                            {item.description}
                                                        </div>
                                                    </div>

                                                    <div>
                                                        <input
                                                            type="text"
                                                            value={item.location}
                                                            onChange={(e) => handleUpdateEvent(globalIdx, { location: e.target.value })}
                                                            placeholder="Location"
                                                            className={`w-full text-[10px] font-bold uppercase bg-transparent outline-none placeholder:text-zinc-300 pt-0.5 ${isPrinting ? 'hidden' : ''} print:hidden`}
                                                            disabled={isLocked}
                                                        />
                                                        <div className={`text-[9px] font-bold uppercase text-black pt-0.5 pb-0.5 leading-normal ${isPrinting ? 'block' : 'hidden'} print:block`}>
                                                            {item.location}
                                                        </div>
                                                    </div>

                                                    {!isLocked && (
                                                        <div className={`relative pt-0.5 ${eventToDelete === item.id ? 'z-50' : ''}`}>
                                                            {eventToDelete === item.id ? (
                                                                <div className="absolute right-0 top-[-8px] z-50 bg-white border border-zinc-200 shadow-xl p-2 rounded-sm w-[100px] flex flex-col gap-2 animate-in fade-in zoom-in duration-200 origin-top-right delete-popup">
                                                                    <div className="text-[8px] font-bold uppercase text-zinc-900 text-center leading-tight">Remove?</div>
                                                                    <button type="button" onClick={(e) => { e.preventDefault(); confirmDeleteEvent(item.id); }} className="w-full bg-red-500 hover:bg-red-600 text-white text-[8px] font-bold uppercase py-1 rounded-sm">Delete</button>
                                                                </div>
                                                            ) : (
                                                                <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleDeleteEvent(item.id); }} className="opacity-0 group-hover:opacity-100 text-zinc-300 hover:text-red-500">
                                                                    <Trash2 size={12} />
                                                                </button>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            )
                                        })}

                                        {/* Actions */}
                                        {!isLocked && (pageIndex === totalPages - 1) && (
                                            <div className="pt-4 flex items-center gap-4 print:hidden border-t border-zinc-100 mt-2">
                                                <button
                                                    onClick={handleAddEvent}
                                                    className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-zinc-400 hover:text-black hover:bg-zinc-50 px-3 py-2 rounded-sm transition-colors border border-transparent hover:border-zinc-200"
                                                >
                                                    <Plus size={10} /> Add Item
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Page > 0 Schedule View */}
                        {pageIndex > 0 && (
                            <div className="flex-1">
                                <h3 className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 border-b border-black mb-3 pb-1">Schedule (Cont.)</h3>
                                <div className="grid grid-cols-[50px_100px_1.5fr_1fr_30px] gap-4 px-2 ml-4 text-[9px] font-bold uppercase text-zinc-400 mb-1">
                                    <div>Time</div>
                                    <div>Type</div>
                                    <div>Description</div>
                                    <div>Location</div>
                                    <div></div>
                                </div>
                                <div className="space-y-0 relative border-l border-zinc-200 ml-2 pl-4 pt-0">
                                    {pageItems.map((item, localIdx) => {
                                        const globalIdx = ITEMS_FIRST_PAGE + ((pageIndex - 1) * ITEMS_OTHER_PAGES) + localIdx;
                                        return (
                                            <div key={item.id} className={`relative group grid grid-cols-[50px_100px_1.5fr_1fr_30px] gap-4 mb-0.5 items-start ${eventToDelete === item.id ? 'z-50' : ''}`}>
                                                <div>
                                                    {isPrinting ? (
                                                        <div className="text-[9px] font-bold uppercase text-black pt-0.5 leading-normal block">{item.time}</div>
                                                    ) : (
                                                        <input
                                                            type="text"
                                                            value={item.time}
                                                            onChange={(e) => handleUpdateEvent(globalIdx, { time: formatTime(e.target.value) })}
                                                            placeholder="00:00"
                                                            className="w-full text-[10px] font-bold uppercase bg-transparent outline-none placeholder:text-zinc-300 pt-0.5"
                                                            disabled={isLocked}
                                                        />
                                                    )}
                                                </div>

                                                {/* Type Dropdown */}
                                                <div className="relative">
                                                    {isPrinting ? (
                                                        <div className="text-[9px] font-bold uppercase text-black pt-0.5 pb-0.5 leading-normal block">{item.type || 'Other'}</div>
                                                    ) : (
                                                        <select
                                                            value={item.type || 'Other'}
                                                            onChange={(e) => handleUpdateEvent(globalIdx, { type: e.target.value })}
                                                            className="w-full text-[10px] font-bold uppercase bg-transparent outline-none appearance-none cursor-pointer pt-0.5 text-zinc-600 hover:text-black"
                                                            disabled={isLocked}
                                                        >
                                                            <option value="Arrive">Arrive</option>
                                                            <option value="Set Up">Set Up</option>
                                                            <option value="Shoot">Shoot</option>
                                                            <option value="Break">Break</option>
                                                            <option value="Meal">Meal</option>
                                                            <option value="Strike">Strike</option>
                                                            <option value="Wrap">Wrap</option>
                                                            <option value="Move">Move</option>
                                                            <option value="Other">Other</option>
                                                        </select>
                                                    )}
                                                </div>

                                                <div>
                                                    {isPrinting ? (
                                                        <div className="text-[9px] font-medium uppercase text-black pt-0.5 pb-0.5 whitespace-pre-wrap leading-normal block">{item.description}</div>
                                                    ) : (
                                                        <textarea
                                                            value={item.description}
                                                            onChange={(e) => handleUpdateEvent(globalIdx, { description: e.target.value })}
                                                            style={{ resize: 'none' }}
                                                            placeholder="Description"
                                                            rows={1}
                                                            onInput={(e) => {
                                                                const target = e.target as HTMLTextAreaElement;
                                                                target.style.height = 'auto';
                                                                target.style.height = target.scrollHeight + 'px';
                                                            }}
                                                            className="w-full text-[10px] font-medium uppercase bg-transparent outline-none placeholder:text-zinc-300 pt-0.5 overflow-hidden"
                                                            disabled={isLocked}
                                                        />
                                                    )}
                                                </div>

                                                <div>
                                                    {isPrinting ? (
                                                        <div className="text-[9px] font-bold uppercase text-black pt-0.5 pb-0.5 leading-normal block">{item.location}</div>
                                                    ) : (
                                                        <input
                                                            type="text"
                                                            value={item.location}
                                                            onChange={(e) => handleUpdateEvent(globalIdx, { location: e.target.value })}
                                                            placeholder="Location"
                                                            className="w-full text-[10px] font-bold uppercase bg-transparent outline-none placeholder:text-zinc-300 pt-0.5"
                                                            disabled={isLocked}
                                                        />
                                                    )}
                                                </div>

                                                {!isLocked && (
                                                    <div className={`relative pt-0.5 ${eventToDelete === item.id ? 'z-50' : ''}`}>
                                                        {eventToDelete === item.id ? (
                                                            <div className="absolute right-0 top-[-8px] z-50 bg-white border border-zinc-200 shadow-xl p-2 rounded-sm w-[100px] flex flex-col gap-2 animate-in fade-in zoom-in duration-200 origin-top-right delete-popup">
                                                                <div className="text-[8px] font-bold uppercase text-zinc-900 text-center leading-tight">Remove?</div>
                                                                <button type="button" onClick={(e) => { e.preventDefault(); confirmDeleteEvent(item.id); }} className="w-full bg-red-500 hover:bg-red-600 text-white text-[8px] font-bold uppercase py-1 rounded-sm">Delete</button>
                                                            </div>
                                                        ) : (
                                                            <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleDeleteEvent(item.id); }} className="opacity-0 group-hover:opacity-100 text-zinc-300 hover:text-red-500">
                                                                <Trash2 size={12} />
                                                            </button>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        )
                                    })}

                                    {!isLocked && (pageIndex === totalPages - 1) && (
                                        <div className="pt-4 flex items-center gap-4 print:hidden border-t border-zinc-100 mt-2">
                                            <button
                                                onClick={handleAddEvent}
                                                className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-zinc-400 hover:text-black hover:bg-zinc-50 px-3 py-2 rounded-sm transition-colors border border-transparent hover:border-zinc-200"
                                            >
                                                <Plus size={10} /> Add Item
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {pageIndex === totalPages - 1 && (
                            <div className="mt-auto pt-4 border-t border-zinc-100">
                                {/* Notes removed from bottom */}
                            </div>
                        )}

                    </div>
                </DocumentLayout>
            ))}

        </>
    );
};
