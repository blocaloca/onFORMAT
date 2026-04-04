import React, { useState, useRef, useEffect } from 'react';
import { GripVertical, Image as ImageIcon, CheckCircle2, UploadCloud, Smartphone, Monitor, RotateCcw, Plus, X } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import ExcelJS from 'exceljs';
import { DocumentLayout } from './DocumentLayout';

export type ProductRow = {
    _id: string;
    _status: 'Prep' | 'On Rack' | 'On Set' | 'Wrapped';
    _selects: string;
    _thumbnail: string | null;
    _deliverables: string;
    _location: string;
    _notes: string;
    [key: string]: any;
};

interface ECommShotListData {
    columns: string[];
    rows: ProductRow[];
}

interface ECommShotListTemplateProps {
    data: Partial<ECommShotListData>;
    onUpdate: (data: Partial<ECommShotListData>) => void;
    isLocked?: boolean;
    plain?: boolean;
    orientation?: 'portrait' | 'landscape';
    metadata?: any;
    isPrinting?: boolean;
    defaultViewMode?: 'desktop' | 'mobile';
    hideControls?: boolean;
}

const DEFAULT_COLUMNS = ['Shot Number', 'SKU', 'Product Name', 'Variant'];
const DELIVERABLE_OPTIONS = ['Stills', 'Video', 'Stills + Video', '360 Spin', 'Social'];

export const ECommShotListTemplate = ({ data, onUpdate, isLocked = false, plain, orientation, metadata, isPrinting, defaultViewMode = 'desktop', hideControls = false }: ECommShotListTemplateProps) => {

    const columns = data.columns || [];
    const rows = data.rows || [];

    const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>(defaultViewMode);
    const [draggedRowIndex, setDraggedRowIndex] = useState<number | null>(null);
    const [completingId, setCompletingId] = useState<string | null>(null);

    // Initialization Effect
    useEffect(() => {
        if (!data.columns && !data.rows) {
            onUpdate({ columns: [], rows: [] });
        }
    }, [data.columns, data.rows, onUpdate]);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (isLocked) return;
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.name.endsWith('.csv')) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const text = event.target?.result as string;
                const lines = text.split('\n').filter((l) => l.trim().length > 0);
                if (lines.length < 2) return;
                const headers = lines[0].split(',').map((h) => h.trim());
                const parsedData: ProductRow[] = lines.slice(1).map((line, index) => {
                    const values = line.split(',').map((v) => v.trim());
                    const rowData = createBaseRow(index);
                    headers.forEach((header, i) => {
                        rowData[header] = values[i] || '';
                    });
                    return rowData;
                });
                onUpdate({ columns: headers, rows: parsedData });
            };
            reader.readAsText(file);
        } else if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
            const arrayBuffer = await file.arrayBuffer();
            const workbook = new ExcelJS.Workbook();
            await workbook.xlsx.load(arrayBuffer);
            const worksheet = workbook.worksheets[0];
            if (!worksheet) return;

            const headers: string[] = [];
            const parsedData: ProductRow[] = [];

            worksheet.eachRow((row, rowNumber) => {
                if (rowNumber === 1) {
                    row.eachCell((cell) => headers.push(cell.text));
                } else {
                    const rowData = createBaseRow(rowNumber);
                    headers.forEach((header, i) => {
                        rowData[header] = row.getCell(i + 1).text || '';
                    });
                    parsedData.push(rowData);
                }
            });
            onUpdate({ columns: headers, rows: parsedData });
        }
    };

    const createBaseRow = (index: number): ProductRow => ({
        _id: `row_${Date.now()}_${index}`,
        _status: 'Prep',
        _selects: '',
        _thumbnail: null,
        _deliverables: 'Stills',
        _location: 'Main Studio',
        _notes: '',
    });

    const initializeBlank = () => {
        if (isLocked) return;
        onUpdate({ columns: DEFAULT_COLUMNS, rows: [createBaseRow(0)] });
    };

    const addRow = () => {
        if (isLocked) return;
        const newRow = createBaseRow(rows.length);
        columns.forEach((col) => {
            newRow[col] = '';
        });
        onUpdate({ columns, rows: [...rows, newRow] });
    };

    const updateRowState = (id: string, updates: Partial<ProductRow>) => {
        if (isLocked && !hideControls) return;
        const newRows = rows.map((r) => r._id === id ? { ...r, ...updates } : r);
        onUpdate({ columns, rows: newRows });
    };

    const markComplete = (id: string) => {
        if (isLocked && !hideControls) return;
        
        // If in mobile mode, animate it before sinking
        if (hideControls) {
            setCompletingId(id);
            setTimeout(() => {
                const updated = rows.map((r) => (r._id === id ? { ...r, _status: 'Wrapped' as const } : r));
                const incomplete = updated.filter((r) => r._status !== 'Wrapped');
                const wrapped = updated.filter((r) => r._status === 'Wrapped');
                onUpdate({ columns, rows: [...incomplete, ...wrapped] });
                setCompletingId(null);
            }, 500);
        } else {
            const updated = rows.map((r) => (r._id === id ? { ...r, _status: 'Wrapped' as const } : r));
            const incomplete = updated.filter((r) => r._status !== 'Wrapped');
            const wrapped = updated.filter((r) => r._status === 'Wrapped');
            onUpdate({ columns, rows: [...incomplete, ...wrapped] });
        }
    };

    const markRedo = (id: string) => {
        if (isLocked && !hideControls) return;
        const updated = rows.map((r) => (r._id === id ? { ...r, _status: 'Prep' as const } : r));
        const incomplete = updated.filter((r) => r._status !== 'Wrapped');
        const wrapped = updated.filter((r) => r._status === 'Wrapped');
        onUpdate({ columns, rows: [...incomplete, ...wrapped] });
    };

    const removeRow = (id: string) => {
        if (isLocked) return;
        const newRows = rows.filter(r => r._id !== id);
        onUpdate({ columns, rows: newRows });
    };

    const handleThumbnailUpload = (id: string, file: File) => {
        if (isLocked && !hideControls) return;
        
        // Use an image compressor to prevent JSON/Postgres payload overflow from iPhone 10MB raw captures
        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;
                const MAX_DIMENSION = 600; // Resize to max 600px safely

                if (width > height) {
                    if (width > MAX_DIMENSION) {
                        height *= MAX_DIMENSION / width;
                        width = MAX_DIMENSION;
                    }
                } else {
                    if (height > MAX_DIMENSION) {
                        width *= MAX_DIMENSION / height;
                        height = MAX_DIMENSION;
                    }
                }

                canvas.width = Math.max(1, Math.floor(width));
                canvas.height = Math.max(1, Math.floor(height));
                const ctx = canvas.getContext('2d');
                if (ctx) {
                    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                    const compressedBase64 = canvas.toDataURL('image/jpeg', 0.65);
                    updateRowState(id, { _thumbnail: compressedBase64 });
                }
            };
            img.src = event.target?.result as string;
        };
        reader.readAsDataURL(file);
    };

    // Drag and Drop
    const handleDragStart = (e: React.DragEvent, index: number) => {
        if (isLocked) return;
        setDraggedRowIndex(index);
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/html', e.currentTarget.parentNode as any);
    };

    const handleDragOver = (e: React.DragEvent, index: number) => {
        if (isLocked) return;
        e.preventDefault();
        const draggedOverItem = rows[index];
        if (draggedOverItem._status === 'Wrapped') return;
        if (draggedRowIndex === null || draggedRowIndex === index) return;

        const items = [...rows];
        const draggedItemContent = items[draggedRowIndex];
        items.splice(draggedRowIndex, 1);
        items.splice(index, 0, draggedItemContent);
        setDraggedRowIndex(index);
        onUpdate({ columns, rows: items });
    };

    const handleDragEnd = () => {
        setDraggedRowIndex(null);
    };

    const activeShot = rows.find((r) => r._status !== 'Wrapped');

    const innerContent = (
        <div className={`w-full font-sans ${hideControls ? 'pb-24 pt-4' : 'min-h-[80vh] dark:bg-slate-950 dark:text-slate-200 bg-white text-slate-800 p-2 md:p-4 rounded-lg'}`}>
            <div className="w-full space-y-6">


                    {/* Empty State */}
                    {rows.length === 0 && !isPrinting && (
                        <GlassCard className="p-12 text-center flex flex-col items-center gap-4 mt-12 border-dashed border-2 dark:border-slate-700 border-slate-300 bg-slate-50 dark:bg-slate-900/50">
                            <div className="p-4 rounded-full dark:bg-slate-800 bg-slate-200 border dark:border-slate-700 border-slate-300">
                                <UploadCloud size={32} className="text-orange-500" />
                            </div>
                            <h2 className="text-xl font-semibold dark:text-slate-200 text-slate-800">Initialize eComm Runbook</h2>
                            <p className="dark:text-slate-400 text-slate-500 text-sm max-w-md">
                                Upload a standard CSV or Excel file. The module automatically maps your headers into a dynamic row schema.
                            </p>

                            {!isLocked && (
                                <div className="flex gap-4 mt-4">
                                    <div className="relative">
                                        <input
                                            type="file"
                                            accept=".csv,.xlsx,.xls"
                                            onChange={handleFileUpload}
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                        />
                                        <button className="px-6 py-2.5 bg-orange-500 hover:bg-orange-600 active:scale-95 transition-all text-white rounded-md font-medium shadow-lg shadow-orange-500/20 text-sm">
                                            Upload CSV/XLSX
                                        </button>
                                    </div>
                                    <button
                                        onClick={initializeBlank}
                                        className="px-6 py-2.5 dark:bg-slate-800 bg-slate-200 hover:bg-slate-300 dark:hover:bg-slate-700 dark:text-slate-200 text-slate-700 active:scale-95 transition-all rounded-md font-medium border dark:border-slate-700 border-slate-300 text-sm"
                                    >
                                        Create Blank List
                                    </button>
                                </div>
                            )}
                        </GlassCard>
                    )}

                    {/* Print Table View (Responsive Letter sizing) */}
                    {rows.length > 0 && isPrinting && (
                        <div className="w-full pb-8">
                            <table className="w-full text-left text-[9px] border-collapse border border-slate-300 table-fixed">
                                <thead>
                                    <tr className="bg-slate-100">
                                        {columns.map(col => <th key={col} className="border border-slate-300 p-1.5 font-bold uppercase tracking-wider text-slate-700 break-words">{col}</th>)}
                                        <th className="border border-slate-300 p-1.5 font-bold uppercase tracking-wider text-slate-700 w-16">Location</th>
                                        <th className="border border-slate-300 p-1.5 font-bold uppercase tracking-wider text-slate-700 w-16">Deliver</th>
                                        <th className="border border-slate-300 p-1.5 font-bold uppercase tracking-wider text-slate-700 w-12 text-center">Status</th>
                                        <th className="border border-slate-300 p-1.5 font-bold uppercase tracking-wider text-slate-700 w-24">Selects</th>
                                        <th className="border border-slate-300 p-1.5 font-bold uppercase tracking-wider text-slate-700 w-32">Notes</th>
                                        <th className="border border-slate-300 p-1.5 font-bold uppercase tracking-wider text-slate-700 w-12 text-center">Thumb</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {rows.map(row => (
                                        <tr key={row._id} className={row._status === 'Wrapped' ? 'opacity-50 grayscale bg-slate-50' : 'bg-white'}>
                                            {columns.map(col => <td key={col} className="border border-slate-300 p-1.5 whitespace-normal break-words font-medium text-slate-800">{row[col]}</td>)}
                                            <td className="border border-slate-300 p-1.5 whitespace-normal break-words text-slate-700">{row._location}</td>
                                            <td className="border border-slate-300 p-1.5 whitespace-normal break-words text-slate-700">{row._deliverables}</td>
                                            <td className="border border-slate-300 p-1.5 font-black uppercase text-[7px] text-center tracking-widest text-slate-600 leading-tight">{row._status}</td>
                                            <td className="border border-slate-300 p-1.5 whitespace-normal break-words text-slate-700 font-medium">{row._selects}</td>
                                            <td className="border border-slate-300 p-1.5 whitespace-normal break-words text-slate-700">{row._notes}</td>
                                            <td className="border border-slate-300 p-1 text-center align-middle">
                                                {row._thumbnail ? <div className="w-full flex justify-center"><img src={row._thumbnail} className="w-8 h-8 object-cover object-center rounded shadow-sm border border-slate-200" /></div> : '-'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Desktop View */}
                    {rows.length > 0 && viewMode === 'desktop' && !isPrinting && (
                        <div className="overflow-x-auto pb-12 w-full">
                            <div className="min-w-max border dark:border-slate-800 border-slate-200 rounded-xl dark:bg-slate-900/40 bg-slate-50 overflow-hidden w-full">
                                {/* Table Header Row */}
                                <div className="flex items-center gap-3 px-4 py-3 dark:bg-slate-900 bg-slate-100 border-b dark:border-slate-800 border-slate-200 text-xs font-semibold dark:text-slate-400 text-slate-500 tracking-wider uppercase">
                                    <div className="w-6 shrink-0"></div>
                                    {columns.map((col) => (
                                        <div key={col} className="w-32 shrink-0">{col}</div>
                                    ))}
                                    <div className="w-32 shrink-0">Location</div>
                                    <div className="w-32 shrink-0">Deliverables</div>
                                    <div className="w-24 shrink-0">Status</div>
                                    <div className="w-40 shrink-0">Selects</div>
                                    <div className="w-48 shrink-0">Retouching Notes</div>
                                    <div className="w-16 shrink-0 flex justify-center">Thumb</div>
                                    {!isPrinting && <div className="w-24 shrink-0 text-right">Action</div>}
                                </div>

                                {/* Table Body Rows */}
                                <div className="divide-y dark:divide-slate-800/50 divide-slate-200">
                                    {rows.map((row, i) => {
                                        const isWrapped = row._status === 'Wrapped';
                                        return (
                                            <div
                                                key={row._id}
                                                draggable={!isWrapped && !isLocked}
                                                onDragStart={(e) => handleDragStart(e, i)}
                                                onDragOver={(e) => handleDragOver(e, i)}
                                                onDragEnd={handleDragEnd}
                                                className={`group flex items-center gap-3 px-4 py-2 transition-all duration-300 relative
                                                    ${isWrapped ? 'dark:bg-slate-900/20 bg-slate-100/50 opacity-60 scale-[0.99] grayscale pointer-events-auto' : 'dark:bg-slate-900/60 dark:hover:bg-slate-800/80 hover:bg-slate-100'}
                                                    ${draggedRowIndex === i ? 'opacity-50 scale-95' : ''}
                                                `}
                                            >
                                                <div className="w-6 shrink-0 flex justify-center text-slate-400 dark:text-slate-600 cursor-grab active:cursor-grabbing hover:text-orange-500">
                                                    {!isPrinting && <GripVertical size={14} />}
                                                </div>

                                                {/* Editable dynamic columns */}
                                                {columns.map((col) => (
                                                    <div key={col} className="w-32 shrink-0">
                                                        {isPrinting ? (
                                                            <div className="px-1.5 py-1 text-xs text-slate-800 font-medium whitespace-normal">{row[col]}</div>
                                                        ) : (
                                                            <input
                                                                type="text"
                                                                className="w-full bg-transparent border border-transparent rounded px-1.5 py-1 text-xs dark:text-slate-300 text-slate-700 font-medium focus:outline-none dark:focus:bg-slate-950 focus:bg-white dark:focus:border-slate-700 focus:border-slate-300 dark:hover:border-slate-800 hover:border-slate-200 transition-colors"
                                                                value={row[col]}
                                                                onChange={(e) => updateRowState(row._id, { [col]: e.target.value })}
                                                                placeholder={col}
                                                                disabled={isWrapped || isLocked}
                                                            />
                                                        )}
                                                    </div>
                                                ))}

                                                {/* Location Input (Editable) */}
                                                <div className="w-32 shrink-0">
                                                    {isPrinting ? (
                                                        <div className="px-1.5 py-1 text-xs text-slate-800 font-medium whitespace-normal">{row._location}</div>
                                                    ) : (
                                                        <input
                                                            type="text"
                                                            placeholder="Ex: Set A"
                                                            className="w-full bg-transparent border border-transparent rounded px-1.5 py-1 text-xs dark:text-slate-300 text-slate-700 focus:outline-none dark:focus:bg-slate-950 focus:bg-white dark:focus:border-slate-700 focus:border-slate-300 dark:hover:border-slate-800 hover:border-slate-200 transition-colors"
                                                            value={row._location}
                                                            onChange={(e) => updateRowState(row._id, { _location: e.target.value })}
                                                            disabled={isWrapped || isLocked}
                                                        />
                                                    )}
                                                </div>

                                                {/* Deliverables Pulldown */}
                                                <div className="w-32 shrink-0">
                                                    {isPrinting ? (
                                                        <div className="px-1.5 py-1 text-xs font-semibold text-slate-700 dark:text-slate-300">{row._deliverables}</div>
                                                    ) : (
                                                        <select
                                                            className="w-full dark:bg-slate-950 bg-white border dark:border-slate-800 border-slate-300 dark:text-slate-300 text-slate-700 text-xs rounded px-1.5 py-1 focus:outline-none focus:border-orange-500"
                                                            value={row._deliverables}
                                                            onChange={(e) => updateRowState(row._id, { _deliverables: e.target.value })}
                                                            disabled={isWrapped || isLocked}
                                                        >
                                                            {DELIVERABLE_OPTIONS.map(opt => (
                                                                <option key={opt} value={opt}>{opt}</option>
                                                            ))}
                                                        </select>
                                                    )}
                                                </div>

                                                {/* Status Dropdown */}
                                                <div className="w-24 shrink-0">
                                                    {isPrinting ? (
                                                        <div className="text-[10px] font-bold uppercase">{row._status}</div>
                                                    ) : (
                                                        <select
                                                            className={`w-full text-[10px] font-bold rounded py-1 px-1.5 appearance-none text-center outline-none uppercase tracking-wider
                                                            ${row._status === 'Prep' ? 'bg-blue-500/10 border border-blue-500/20 text-blue-500 dark:text-blue-400' : ''}
                                                            ${row._status === 'On Rack' ? 'bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400' : ''}
                                                            ${row._status === 'On Set' ? 'bg-rose-500/10 border border-rose-500/20 text-rose-500 dark:text-rose-400' : ''}
                                                            ${row._status === 'Wrapped' ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400' : ''}
                                                            `}
                                                            value={row._status}
                                                            onChange={(e) => updateRowState(row._id, { _status: e.target.value as any })}
                                                            disabled={isWrapped || isLocked}
                                                        >
                                                            <option value="Prep">Prep</option>
                                                            <option value="On Rack">On Rack</option>
                                                            <option value="On Set">On Set</option>
                                                            <option value="Wrapped">Wrapped</option>
                                                        </select>
                                                    )}
                                                </div>

                                                {/* Selects Input */}
                                                <div className="w-40 shrink-0">
                                                    {isPrinting ? (
                                                        <div className="whitespace-normal text-xs">{row._selects}</div>
                                                    ) : (
                                                        <input
                                                            type="text"
                                                            placeholder="e.g. 0102, 0104"
                                                            className="w-full dark:bg-slate-950 bg-white border dark:border-slate-800 border-slate-300 rounded px-2 py-1 text-xs dark:text-slate-300 text-slate-800 focus:outline-none focus:border-orange-500/50 transition-colors"
                                                            value={row._selects}
                                                            onChange={(e) => updateRowState(row._id, { _selects: e.target.value })}
                                                            disabled={isWrapped || isLocked}
                                                        />
                                                    )}
                                                </div>

                                                {/* Retouching Notes */}
                                                <div className="w-48 shrink-0">
                                                    {isPrinting ? (
                                                        <div className="whitespace-normal text-xs">{row._notes}</div>
                                                    ) : (
                                                        <input
                                                            type="text"
                                                            placeholder="Format edits..."
                                                            className="w-full dark:bg-slate-950 bg-white border dark:border-slate-800 border-slate-300 rounded px-2 py-1 text-xs dark:text-slate-300 text-slate-800 focus:outline-none focus:border-orange-500/50 transition-colors"
                                                            value={row._notes}
                                                            onChange={(e) => updateRowState(row._id, { _notes: e.target.value })}
                                                            disabled={isWrapped || isLocked}
                                                        />
                                                    )}
                                                </div>

                                                {/* Thumbnail */}
                                                <div className="w-16 shrink-0 flex justify-center relative">
                                                    {!isLocked && !isPrinting && (
                                                        <input
                                                            type="file"
                                                            accept="image/*"
                                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                                            title="Upload Image"
                                                            disabled={isWrapped}
                                                            onChange={(e) => {
                                                                if (e.target.files?.[0]) handleThumbnailUpload(row._id, e.target.files[0]);
                                                            }}
                                                        />
                                                    )}
                                                    {row._thumbnail ? (
                                                        <img src={row._thumbnail} alt="thumb" className="w-8 h-8 object-cover rounded shadow border dark:border-slate-700/50 border-slate-200 block" />
                                                    ) : (
                                                        <div className="h-8 w-8 border border-dashed dark:border-slate-700 border-slate-300 rounded dark:bg-slate-900 bg-slate-50 flex items-center justify-center dark:text-slate-500 text-slate-400">
                                                            <ImageIcon size={14} />
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Actions */}
                                                {!isPrinting && (
                                                    <div className="w-24 shrink-0 flex justify-end gap-2 items-center">
                                                        {!isWrapped ? (
                                                            <button
                                                                onClick={() => markComplete(row._id)}
                                                                disabled={isLocked}
                                                                className="bg-emerald-500 hover:bg-emerald-400 text-emerald-950 px-2 py-1 rounded text-[10px] font-bold shadow-sm transition-all flex items-center gap-1 hover:ring-2 hover:ring-emerald-500/30 disabled:opacity-50"
                                                            >
                                                                <CheckCircle2 size={12} />
                                                                Done
                                                            </button>
                                                        ) : (
                                                            <button
                                                                onClick={() => markRedo(row._id)}
                                                                disabled={isLocked}
                                                                className="dark:bg-slate-700 bg-slate-200 dark:hover:bg-slate-600 hover:bg-slate-300 dark:text-slate-200 text-slate-700 px-2 py-1 rounded text-[10px] font-bold transition-all flex items-center gap-1 disabled:opacity-50"
                                                            >
                                                                <RotateCcw size={12} />
                                                                Redo
                                                            </button>
                                                        )}
                                                        {!isWrapped && !isLocked && (
                                                            <button
                                                                onClick={() => removeRow(row._id)}
                                                                className="text-slate-400 hover:text-rose-500 transition-colors p-1 rounded"
                                                                title="Delete Row"
                                                            >
                                                                <X size={12} />
                                                            </button>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Add Row Button */}
                            {!isLocked && !isPrinting && (
                                <div className="mt-4 flex">
                                    <button
                                        onClick={addRow}
                                        className="flex items-center gap-1.5 px-3 py-1.5 dark:bg-slate-800/50 bg-slate-100 hover:bg-slate-200 dark:hover:bg-slate-800 border dark:border-slate-700 border-slate-300 dark:text-slate-300 text-slate-700 rounded-md text-xs font-semibold transition-colors shadow-sm"
                                    >
                                        <Plus size={14} /> Add Row
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Mobile Tactical View */}
                    {rows.length > 0 && viewMode === 'mobile' && !isPrinting && (
                        <div className="w-full mx-auto pb-24 font-sans space-y-4 pt-2">
                            {!activeShot ? (
                                <div className="text-center p-12 text-emerald-500 font-medium bg-white dark:bg-white rounded-[24px] shadow-sm border border-zinc-100">✨ All shots wrapped!</div>
                            ) : (
                                <div className="space-y-4">
                                    <div className={`bg-white dark:bg-white rounded-[24px] p-6 border border-zinc-100 dark:border-zinc-200 shadow-sm relative overflow-hidden transform transition-all duration-500 origin-top
                                        ${completingId === activeShot._id ? 'opacity-0 scale-95 translate-y-12' : 'opacity-100 scale-100 translate-y-0'}
                                    `}>
                                        
                                        <div className="flex justify-between items-start mb-6">
                                            <div>
                                                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1 block mb-1">Current Shot</span>
                                                <h3 className="text-3xl font-black uppercase tracking-tight text-zinc-900 dark:text-black leading-none">
                                                    {activeShot[columns[0]] || 'New'}
                                                </h3>
                                                <p className="text-zinc-500 font-bold mt-1 ml-1 text-xs">
                                                    {columns.length > 1 ? activeShot[columns[1]] : ''}
                                                </p>
                                            </div>
                                            
                                                <button
                                                    onClick={() => markComplete(activeShot._id)}
                                                    className="bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors px-3 py-1.5 rounded-md text-[10px] font-black uppercase tracking-widest"
                                                >
                                                    Complete
                                                </button>
                                        </div>

                                        {/* Metadata Cards Format (Like Call Sheet) */}
                                        <div className="grid grid-cols-2 gap-3 mb-6">
                                            {columns.slice(2, 4).map(col => (
                                                <div key={col} className="bg-zinc-50 dark:bg-zinc-50 p-4 rounded-[16px] border border-zinc-100">
                                                    <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400 mb-1">{col}</p>
                                                    <p className="text-zinc-900 dark:text-black font-bold text-sm truncate">{activeShot[col] || '-'}</p>
                                                </div>
                                            ))}
                                            <div className="bg-zinc-50 dark:bg-zinc-50 p-4 rounded-[16px] border border-zinc-100">
                                                <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400 mb-1">Location</p>
                                                <p className="text-zinc-900 dark:text-black font-bold text-sm truncate">{activeShot._location}</p>
                                            </div>
                                            <div className="bg-zinc-50 dark:bg-zinc-50 p-4 rounded-[16px] border border-zinc-100">
                                                <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400 mb-1">Deliver</p>
                                                <p className="text-blue-600 dark:text-blue-600 font-bold text-sm truncate">{activeShot._deliverables}</p>
                                            </div>
                                        </div>

                                        {/* First Notes Field (Read Only) */}
                                        {columns.length > 4 && (() => {
                                            const noteCol = columns.find(c => c.toLowerCase().includes('note') || c.toLowerCase().includes('direction')) || columns[4];
                                            if (activeShot[noteCol] && activeShot[noteCol].trim() !== '') {
                                                return (
                                                    <div className="bg-zinc-50 dark:bg-zinc-50 p-4 rounded-[16px] border border-zinc-100 mb-6">
                                                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2 block">{noteCol}</label>
                                                        <p className="text-zinc-900 dark:text-black font-semibold text-sm whitespace-pre-wrap">{activeShot[noteCol]}</p>
                                                    </div>
                                                );
                                            }
                                            return null;
                                        })()}

                                        {/* Mobile Thumbnail Render */}
                                        <div className="mb-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1 block mb-2">Reference Thumbnail</label>
                                            <div className="w-full h-32 bg-zinc-50 dark:bg-zinc-50 border border-zinc-100 rounded-[16px] flex items-center justify-center relative overflow-hidden">
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    capture="environment"
                                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                                    onChange={(e) => {
                                                        if (e.target.files?.[0]) handleThumbnailUpload(activeShot._id, e.target.files[0]);
                                                    }}
                                                />
                                                {activeShot._thumbnail ? (
                                                    <img src={activeShot._thumbnail} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="text-zinc-300 flex flex-col items-center">
                                                        <ImageIcon size={24} />
                                                        <span className="text-[9px] uppercase mt-2 font-black tracking-widest text-zinc-400">Tap to Snap</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
    );

    if (hideControls) {
        return innerContent;
    }

    return (
        <DocumentLayout
            title="eComm Shot List"
            hideHeader={false}
            plain={plain}
            orientation={orientation}
            metadata={metadata}
            isPrinting={isPrinting}
        >
            {innerContent}
        </DocumentLayout>
    );
};
