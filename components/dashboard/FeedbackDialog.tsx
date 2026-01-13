import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { X, MessageSquare, Bug, Lightbulb, Send, Loader2, CheckCircle2 } from 'lucide-react'

interface FeedbackDialogProps {
    isOpen: boolean
    onClose: () => void
    userId?: string // Optional, we can get from session but passing it is faster if known
}

export const FeedbackDialog = ({ isOpen, onClose, userId }: FeedbackDialogProps) => {
    // const supabase = createClientComponentClient() // Removed
    const [message, setMessage] = useState('')
    const [category, setCategory] = useState<'bug' | 'feature' | 'other'>('bug')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isSuccess, setIsSuccess] = useState(false)

    if (!isOpen) return null

    const handleSubmit = async () => {
        if (!message.trim()) return

        setIsSubmitting(true)

        // If no userId passed, try to get from session (fallback)
        let effectiveUserId = userId
        if (!effectiveUserId) {
            const { data } = await supabase.auth.getUser()
            effectiveUserId = data.user?.id
        }

        if (!effectiveUserId) {
            alert("Please sign in to send feedback.")
            setIsSubmitting(false)
            return
        }

        const { error } = await supabase.from('feedback').insert({
            user_id: effectiveUserId,
            message: message,
            category: category,
            metadata: {
                userAgent: window.navigator.userAgent,
                url: window.location.href
            }
        })

        if (error) {
            console.error('Feedback error:', error)
            alert('Failed to send feedback. Please try again.')
        } else {
            setIsSuccess(true)
            setTimeout(() => {
                setIsSuccess(false)
                setMessage('')
                onClose()
            }, 2000)
        }
        setIsSubmitting(false)
    }

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

            <div className="relative bg-[#121212] border border-zinc-800 w-full max-w-md shadow-2xl rounded-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">

                {/* Header */}
                <div className="flex justify-between items-center bg-zinc-900/50 p-4 border-b border-zinc-800">
                    <span className="text-xs font-bold uppercase tracking-widest text-zinc-400 flex items-center gap-2">
                        <MessageSquare size={14} /> Send Feedback
                    </span>
                    <button onClick={onClose} className="text-zinc-500 hover:text-white">
                        <X size={16} />
                    </button>
                </div>

                <div className="p-6">
                    {isSuccess ? (
                        <div className="flex flex-col items-center justify-center py-8 text-emerald-500 animate-in fade-in slide-in-from-bottom-4">
                            <CheckCircle2 size={48} className="mb-4" />
                            <p className="font-bold text-sm uppercase tracking-wider">Feedback Sent!</p>
                            <p className="text-zinc-500 text-xs mt-2">Thank you for helping us improve.</p>
                        </div>
                    ) : (
                        <>
                            {/* Category Selector */}
                            <div className="flex gap-2 mb-6">
                                <button
                                    onClick={() => setCategory('bug')}
                                    className={`flex-1 flex flex-col items-center justify-center gap-2 p-3 rounded border text-xs font-bold uppercase tracking-wide transition-colors ${category === 'bug'
                                        ? 'bg-red-900/20 border-red-900 text-red-500'
                                        : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:bg-zinc-800'
                                        }`}
                                >
                                    <Bug size={16} /> Bug
                                </button>
                                <button
                                    onClick={() => setCategory('feature')}
                                    className={`flex-1 flex flex-col items-center justify-center gap-2 p-3 rounded border text-xs font-bold uppercase tracking-wide transition-colors ${category === 'feature'
                                        ? 'bg-emerald-900/20 border-emerald-900 text-emerald-500'
                                        : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:bg-zinc-800'
                                        }`}
                                >
                                    <Lightbulb size={16} /> Idea
                                </button>
                                <button
                                    onClick={() => setCategory('other')}
                                    className={`flex-1 flex flex-col items-center justify-center gap-2 p-3 rounded border text-xs font-bold uppercase tracking-wide transition-colors ${category === 'other'
                                        ? 'bg-blue-900/20 border-blue-900 text-blue-500'
                                        : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:bg-zinc-800'
                                        }`}
                                >
                                    <MessageSquare size={16} /> Other
                                </button>
                            </div>

                            <textarea
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder={category === 'bug' ? "What happened? Steps to reproduce?" : "What's on your mind?"}
                                className="w-full h-32 bg-zinc-900 border border-zinc-800 rounded p-3 text-sm text-white placeholder-zinc-600 focus:border-zinc-600 focus:outline-none resize-none mb-6"
                            />

                            <button
                                onClick={handleSubmit}
                                disabled={isSubmitting || !message.trim()}
                                className="w-full py-3 bg-white text-black font-bold uppercase tracking-widest text-xs rounded hover:bg-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors"
                            >
                                {isSubmitting ? (
                                    <Loader2 size={14} className="animate-spin" />
                                ) : (
                                    <Send size={14} />
                                )}
                                {isSubmitting ? 'Sending...' : 'Submit Feedback'}
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}
