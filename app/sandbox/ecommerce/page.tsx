'use client';

import React, { useState, useRef } from 'react';
import { GripVertical, Image as ImageIcon, CheckCircle2, UploadCloud, Smartphone, Monitor, RotateCcw, Plus, X } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import ExcelJS from 'exceljs';

type ProductRow = {
  _id: string;
  _status: 'Prep' | 'On Rack' | 'On Set' | 'Wrapped';
  _selects: string;
  _thumbnail: string | null;
  _deliverables: string;
  _location: string;
  _notes: string;
  [key: string]: any;
};

const DEFAULT_COLUMNS = ['Shot Number', 'SKU', 'Product Name', 'Variant'];
const DELIVERABLE_OPTIONS = ['Stills', 'Video', 'Stills + Video', '360 Spin', 'Social'];

export default function ECommerceSandbox() {
  const [data, setData] = useState<ProductRow[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [draggedRowIndex, setDraggedRowIndex] = useState<number | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Parse CSV or XLSX
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.name.endsWith('.csv')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        const lines = text.split('\n').filter((l) => l.trim().length > 0);
        if (lines.length < 2) return;
        const headers = lines[0].split(',').map((h) => h.trim());
        setColumns(headers);
        const parsedData: ProductRow[] = lines.slice(1).map((line, index) => {
          const values = line.split(',').map((v) => v.trim());
          const rowData = createBaseRow(index);
          headers.forEach((header, i) => {
            rowData[header] = values[i] || '';
          });
          return rowData;
        });
        setData(parsedData);
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
          setColumns(headers);
        } else {
          const rowData = createBaseRow(rowNumber);
          headers.forEach((header, i) => {
            rowData[header] = row.getCell(i + 1).text || '';
          });
          parsedData.push(rowData);
        }
      });
      setData(parsedData);
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
    setColumns(DEFAULT_COLUMNS);
    setData([createBaseRow(0)]);
  };

  const addRow = () => {
    const newRow = createBaseRow(data.length);
    columns.forEach((col) => {
      newRow[col] = '';
    });
    setData((prev) => [...prev, newRow]);
  };

  const updateRow = (id: string, updates: Partial<ProductRow>) => {
    setData((prev) =>
      prev.map((r) => {
        if (r._id === id) return { ...r, ...updates };
        return r;
      })
    );
  };

  const markComplete = (id: string) => {
    setData((prev) => {
      const updated = prev.map((r) => (r._id === id ? { ...r, _status: 'Wrapped' as const } : r));
      const incomplete = updated.filter((r) => r._status !== 'Wrapped');
      const wrapped = updated.filter((r) => r._status === 'Wrapped');
      return [...incomplete, ...wrapped];
    });
  };

  const markRedo = (id: string) => {
    setData((prev) => {
      const updated = prev.map((r) => (r._id === id ? { ...r, _status: 'Prep' as const } : r));
      const incomplete = updated.filter((r) => r._status !== 'Wrapped');
      const wrapped = updated.filter((r) => r._status === 'Wrapped');
      return [...incomplete, ...wrapped];
    });
  };

  const removeRow = (id: string) => {
    setData((prev) => prev.filter(r => r._id !== id));
  };

  const handleThumbnailUpload = (id: string, file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      updateRow(id, { _thumbnail: event.target?.result as string });
    };
    reader.readAsDataURL(file);
  };

  // Drag and Drop
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedRowIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', e.currentTarget.parentNode as any);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    const draggedOverItem = data[index];
    if (draggedOverItem._status === 'Wrapped') return;
    if (draggedRowIndex === null || draggedRowIndex === index) return;

    const items = [...data];
    const draggedItemContent = items[draggedRowIndex];
    items.splice(draggedRowIndex, 1);
    items.splice(index, 0, draggedItemContent);
    setDraggedRowIndex(index);
    setData(items);
  };

  const handleDragEnd = () => {
    setDraggedRowIndex(null);
  };

  const activeShot = data.find((r) => r._status !== 'Wrapped');

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 p-4 md:p-8 font-sans">
      <div className="max-w-[1400px] mx-auto space-y-6">
        {/* Header & Controls */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 border-b border-slate-800 pb-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-400 to-rose-500 bg-clip-text text-transparent">
              eComm Production Module
            </h1>
            <p className="text-slate-400 text-sm mt-1">Spreadsheet on Steroids Sandbox</p>
          </div>

          <div className="flex bg-slate-900 border border-slate-800 rounded-lg p-1">
            <button
              onClick={() => setViewMode('desktop')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm transition-all ${
                viewMode === 'desktop' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-300'
              }`}
            >
              <Monitor size={16} /> Dash
            </button>
            <button
              onClick={() => setViewMode('mobile')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm transition-all ${
                viewMode === 'mobile' ? 'bg-slate-800 text-orange-400' : 'text-slate-400 hover:text-slate-300'
              }`}
            >
              <Smartphone size={16} /> Mobile
            </button>
          </div>
        </div>

        {/* Empty State / Upload Options */}
        {data.length === 0 && (
          <GlassCard className="p-12 text-center flex flex-col items-center gap-4 mt-12 border-dashed border-2 border-slate-700 bg-slate-900/50">
            <div className="p-4 bg-slate-800 rounded-full border border-slate-700">
              <UploadCloud size={32} className="text-orange-400" />
            </div>
            <h2 className="text-xl font-semibold text-slate-200">Initialize Shot List</h2>
            <p className="text-slate-400 text-sm max-w-md">
              Upload a standard CSV or Excel file. The module automatically maps your headers into a dynamic row schema.
            </p>
            
            <div className="flex gap-4 mt-4">
              <div className="relative">
                <input
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  onChange={handleFileUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <button className="px-6 py-2.5 bg-orange-500 hover:bg-orange-600 active:scale-95 transition-all text-white rounded-md font-medium shadow-lg shadow-orange-500/20">
                  Upload CSV/XLSX
                </button>
              </div>
              <button 
                onClick={initializeBlank}
                className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 active:scale-95 transition-all rounded-md font-medium border border-slate-700"
              >
                Create Blank List
              </button>
            </div>
          </GlassCard>
        )}

        {/* Desktop Data Grid */}
        {data.length > 0 && viewMode === 'desktop' && (
          <div className="overflow-x-auto pb-32">
            <div className="min-w-max border border-slate-800 rounded-xl bg-slate-900/40 backdrop-blur-md overflow-hidden">
              
              {/* Table Header Row */}
              <div className="grid grid-flow-col auto-cols-max items-center gap-3 px-4 py-3 bg-slate-900 border-b border-slate-800 text-xs font-semibold text-slate-400 tracking-wider uppercase">
                <div className="w-6"></div>
                {columns.map((col) => (
                  <div key={col} className="w-32">{col}</div>
                ))}
                <div className="w-32">Location</div>
                <div className="w-36">Deliverables</div>
                <div className="w-28">Status</div>
                <div className="w-40">Selects</div>
                <div className="w-48">Retouching Notes</div>
                <div className="w-16 flex justify-center">Thumb</div>
                <div className="w-24 text-right">Action</div>
              </div>

               {/* Table Body Rows */}
              <div className="divide-y divide-slate-800/50">
                {data.map((row, i) => {
                  const isWrapped = row._status === 'Wrapped';
                  return (
                    <div
                      key={row._id}
                      draggable={!isWrapped}
                      onDragStart={(e) => handleDragStart(e, i)}
                      onDragOver={(e) => handleDragOver(e, i)}
                      onDragEnd={handleDragEnd}
                      className={`group grid grid-flow-col auto-cols-max items-center gap-3 px-4 py-2 transition-all duration-300 relative
                      ${isWrapped ? 'bg-slate-900/20 opacity-60 scale-[0.99] grayscale pointer-events-auto' : 'bg-slate-900/60 hover:bg-slate-800/80 hover:shadow-lg'}
                      ${draggedRowIndex === i ? 'opacity-50 scale-95' : ''}
                      `}
                    >
                      <div className="w-6 flex justify-center text-slate-600 cursor-grab active:cursor-grabbing hover:text-orange-400">
                        <GripVertical size={16} />
                      </div>

                      {/* Completely editable dynamic columns */}
                      {columns.map((col) => (
                        <div key={col} className="w-32">
                          <input
                            type="text"
                            className="w-full bg-transparent border border-transparent rounded px-2 py-1 text-sm text-slate-300 font-medium focus:outline-none focus:bg-slate-950 focus:border-slate-700 hover:border-slate-800 transition-colors"
                            value={row[col]}
                            onChange={(e) => updateRow(row._id, { [col]: e.target.value })}
                            placeholder={col}
                            disabled={isWrapped}
                          />
                        </div>
                      ))}

                      {/* Location Input (Editable) */}
                      <div className="w-32">
                        <input
                           type="text"
                           placeholder="Ex: Set A"
                           className="w-full bg-transparent border border-transparent rounded px-2 py-1 text-sm text-slate-300 focus:outline-none focus:bg-slate-950 focus:border-slate-700 hover:border-slate-800 transition-colors"
                           value={row._location}
                           onChange={(e) => updateRow(row._id, { _location: e.target.value })}
                           disabled={isWrapped}
                        />
                      </div>

                      {/* Deliverables Pulldown */}
                      <div className="w-36">
                        <select
                          className="w-full bg-slate-950 border border-slate-800 text-slate-300 text-sm rounded px-2 py-1 focus:outline-none focus:border-orange-500"
                          value={row._deliverables}
                          onChange={(e) => updateRow(row._id, { _deliverables: e.target.value })}
                          disabled={isWrapped}
                        >
                          {DELIVERABLE_OPTIONS.map(opt => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </select>
                      </div>

                      {/* Status Dropdown */}
                      <div className="w-28">
                        <select
                          className={`w-full text-xs font-semibold rounded py-1 px-2 appearance-none text-center outline-none
                          ${row._status === 'Prep' ? 'bg-blue-500/10 border border-blue-500/20 text-blue-400' : ''}
                          ${row._status === 'On Rack' ? 'bg-amber-500/10 border border-amber-500/20 text-amber-400' : ''}
                          ${row._status === 'On Set' ? 'bg-rose-500/10 border border-rose-500/20 text-rose-400' : ''}
                          ${row._status === 'Wrapped' ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' : ''}
                          `}
                          value={row._status}
                          onChange={(e) => updateRow(row._id, { _status: e.target.value as any })}
                          disabled={isWrapped}
                        >
                          <option value="Prep">Prep</option>
                          <option value="On Rack">On Rack</option>
                          <option value="On Set">On Set</option>
                          <option value="Wrapped">Wrapped</option>
                        </select>
                      </div>

                      {/* Selects Input */}
                      <div className="w-40">
                        <input
                          type="text"
                          placeholder="e.g. 0102, 0104"
                          className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-sm text-slate-300 focus:outline-none focus:border-orange-500/50 transition-colors placeholder:text-slate-700"
                          value={row._selects}
                          onChange={(e) => updateRow(row._id, { _selects: e.target.value })}
                          disabled={isWrapped}
                        />
                      </div>

                      {/* Retouching Notes */}
                      <div className="w-48">
                         <input
                          type="text"
                          placeholder="Needs mask, remove fuzz..."
                          className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-sm text-slate-300 focus:outline-none focus:border-orange-500/50 transition-colors placeholder:text-slate-700"
                          value={row._notes}
                          onChange={(e) => updateRow(row._id, { _notes: e.target.value })}
                          disabled={isWrapped}
                        />
                      </div>

                      {/* Thumbnail with inline upload */}
                      <div className="w-16 flex justify-center relative">
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
                        {row._thumbnail ? (
                          <img src={row._thumbnail} alt="thumb" className="w-10 h-10 object-cover rounded shadow-lg border border-slate-700/50 block" />
                        ) : (
                          <button className="h-10 w-10 border border-dashed border-slate-700 rounded bg-slate-900 flex items-center justify-center text-slate-500 hover:text-slate-300 hover:border-slate-500 transition-colors pointer-events-none">
                            <ImageIcon size={16} />
                          </button>
                        )}
                      </div>

                      {/* Actions: Done / Redo */}
                      <div className="w-24 flex justify-end gap-2 items-center">
                        {!isWrapped ? (
                          <button
                            onClick={() => markComplete(row._id)}
                            className="bg-emerald-500 hover:bg-emerald-400 text-emerald-950 px-3 py-1.5 rounded-md text-sm font-bold shadow-lg shadow-emerald-500/20 transition-all hover:scale-105 active:scale-95 flex items-center gap-1.5 hover:ring-2 hover:ring-emerald-500/30"
                          >
                            <CheckCircle2 size={16} />
                            Done
                          </button>
                        ) : (
                          <button
                            onClick={() => markRedo(row._id)}
                            className="bg-slate-700 hover:bg-slate-600 text-slate-200 px-3 py-1.5 rounded-md text-sm font-bold transition-all flex items-center gap-1.5 hover:text-white"
                          >
                            <RotateCcw size={14} />
                            Redo
                          </button>
                        )}
                        {!isWrapped && (
                           <button 
                            onClick={() => removeRow(row._id)}
                            className="text-slate-600 hover:text-rose-500 transition-colors ml-1 p-1 hover:bg-slate-800 rounded"
                            title="Delete Row"
                           >
                             <X size={14} />
                           </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            
            {/* Add Row Button */}
            <div className="mt-4 flex">
               <button 
                onClick={addRow}
                className="flex items-center gap-2 px-4 py-2 bg-slate-800/50 hover:bg-slate-800 border border-slate-700 text-slate-300 rounded-lg text-sm font-medium transition-colors"
               >
                 <Plus size={16} /> Add Row
               </button>
            </div>
          </div>
        )}

        {/* Mobile View */}
        {data.length > 0 && viewMode === 'mobile' && (
          <div className="max-w-md mx-auto relative pb-24">
            {!activeShot ? (
              <div className="text-center p-12 text-emerald-400 font-medium">✨ All shots wrapped!</div>
            ) : (
              <div className="space-y-4">
                <div className="text-center">
                  <span className="text-xs uppercase tracking-wider text-orange-400 font-bold bg-orange-400/10 px-3 py-1 rounded-full border border-orange-400/20">
                    Live On Set
                  </span>
                </div>
                
                <GlassCard className="p-6 border-slate-700 shadow-2xl relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-br from-slate-800/50 to-slate-900/50 z-0"></div>
                  
                  <div className="relative z-10 space-y-6">
                    {/* Primary Identifier */}
                    <div className="border-b border-slate-700/50 pb-4 flex justify-between items-start">
                      <div>
                        <p className="text-slate-400 text-xs uppercase tracking-wider mb-1">Current</p>
                        <h3 className="text-3xl font-bold text-white tracking-tight">
                          {activeShot[columns[0]] || 'New Shot'}
                        </h3>
                        <p className="text-slate-300 mt-1 text-lg">
                          {columns.length > 1 ? activeShot[columns[1]] : ''}
                        </p>
                      </div>
                      
                      {/* Mobile Thumbnail Render */}
                      <div className="w-20 h-20 bg-slate-950 rounded-lg border border-slate-700 flex items-center justify-center overflow-hidden shrink-0 relative">
                        <input 
                           type="file" 
                           accept="image/*" 
                           capture="environment" // Hint for mobile to use camera
                           className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                           onChange={(e) => {
                             if (e.target.files?.[0]) handleThumbnailUpload(activeShot._id, e.target.files[0]);
                           }}
                        />
                        {activeShot._thumbnail ? (
                           <img src={activeShot._thumbnail} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="text-slate-600 flex flex-col items-center">
                            <ImageIcon size={20} />
                            <span className="text-[10px] uppercase mt-1">Snap</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Metadata Grid */}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      {columns.slice(2, 4).map(col => (
                        <div key={col}>
                          <p className="text-slate-500 text-xs uppercase">{col}</p>
                          <p className="text-slate-200 font-medium">{activeShot[col] || '-'}</p>
                        </div>
                      ))}
                      <div>
                        <p className="text-slate-500 text-xs uppercase">Location</p>
                        <p className="text-slate-200 font-medium">{activeShot._location}</p>
                      </div>
                      <div>
                        <p className="text-slate-500 text-xs uppercase">Deliverables</p>
                        <span className="text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded box-border text-[11px] font-bold border border-indigo-500/20">
                          {activeShot._deliverables}
                        </span>
                      </div>
                    </div>

                    {/* Inputs */}
                    <div className="space-y-4 pt-4 border-t border-slate-700/50">
                      <div>
                        <label className="text-slate-400 text-xs uppercase mb-1 block">Quick Selects Logs</label>
                        <input
                          type="text"
                          pattern="\\d*"
                          placeholder="e.g. 1024, 1027"
                          className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-lg text-white focus:outline-none focus:border-orange-500 transition-colors placeholder:text-slate-600"
                          value={activeShot._selects}
                          onChange={(e) => updateRow(activeShot._id, { _selects: e.target.value })}
                        />
                      </div>
                       <div>
                        <label className="text-slate-400 text-xs uppercase mb-1 block">Retouching Notes</label>
                        <textarea
                          placeholder="Add detail notes..."
                          rows={2}
                          className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-orange-500 transition-colors placeholder:text-slate-600 resize-none"
                          value={activeShot._notes}
                          onChange={(e) => updateRow(activeShot._id, { _notes: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>
                </GlassCard>

                {/* Big Complete Button */}
                <button
                  onClick={() => markComplete(activeShot._id)}
                  className="w-full bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-bold text-lg py-5 rounded-xl shadow-[0_0_40px_-10px_rgba(16,185,129,0.5)] active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  <CheckCircle2 size={24} />
                  MARK COMPLETE (SYNC)
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
