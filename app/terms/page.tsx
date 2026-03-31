import Link from 'next/link';
import { ArrowLeft, Shield } from 'lucide-react';

export default function TermsPage() {
    return (
        <div className="min-h-screen bg-black text-zinc-400 font-sans selection:bg-emerald-500 selection:text-black">
            <nav className="fixed top-0 w-full z-50 px-8 py-6 flex items-center justify-between bg-black/80 backdrop-blur-xl border-b border-white/5">
                <Link href="/account" className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-white hover:text-emerald-500 transition-colors">
                    <ArrowLeft size={14} /> Back
                </Link>
                <div className="text-xs font-mono text-zinc-500 hidden md:block">LAST UPDATED: MARCH 31, 2026</div>
            </nav>

            <main className="max-w-3xl mx-auto pt-32 pb-24 px-8">
                <div className="mb-12">
                    <div className="w-16 h-16 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center mb-6">
                        <Shield className="text-emerald-500" size={32} />
                    </div>
                    <h1 className="text-4xl text-white font-black tracking-tight mb-2 uppercase">TERMS OF SERVICE</h1>
                    <p className="text-sm font-bold text-emerald-500 mb-8 uppercase tracking-widest">
                        Provided by David Casteel Pictures
                    </p>
                    <p className="text-[13px] text-zinc-400 leading-relaxed font-mono">
                        Welcome to onFORMAT. By accessing or using our websites, applications, and related services (collectively, the "Service" or "Platform"), you agree to the following Terms of Service ("Terms"). If you do not agree to these terms, you may not use the Service.
                    </p>
                </div>

                <div className="space-y-6 text-[14px] leading-relaxed text-zinc-300">

                    <section className="bg-white/5 p-8 rounded-3xl border border-white/5 hover:border-white/10 transition-colors">
                        <h3 className="text-white font-black uppercase tracking-widest mb-4 flex items-center gap-3">
                            <span className="text-emerald-500 font-mono text-xs">01</span> Accept Terms
                        </h3>
                        <p>By creating an account, inviting crew members, or interacting with the Platform, you accept and agree to be bound by these Terms.</p>
                    </section>

                    <section className="bg-white/5 p-8 rounded-3xl border border-white/5 hover:border-white/10 transition-colors">
                        <h3 className="text-white font-black uppercase tracking-widest mb-4 flex items-center gap-3">
                            <span className="text-emerald-500 font-mono text-xs">02</span> User Responsibility
                        </h3>
                        <p className="mb-4">onFORMAT operates as a management, productivity, and document-generation platform tailored for professional film, photo, and commercial production.</p>
                        <ul className="list-disc pl-5 space-y-2 text-zinc-400 text-sm">
                            <li><strong className="text-zinc-200">No Fiduciary Duty:</strong> The Service is a tool. We do not act as your producer, line producer, safety officer, or legal counsel.</li>
                            <li><strong className="text-zinc-200">Complete Responsibility:</strong> The User bears full, unequivocal responsibility for all production decisions, financial calculations, scheduling choices, and safety protocols implemented based on data from the Service.</li>
                        </ul>
                    </section>

                    <section className="bg-white/5 p-8 rounded-3xl border border-white/5 hover:border-white/10 transition-colors">
                        <h3 className="text-white font-black uppercase tracking-widest mb-4 flex items-center gap-3">
                            <span className="text-emerald-500 font-mono text-xs">03</span> Artificial Intelligence Disclaimer
                        </h3>
                        <p className="mb-4">The platform utilizes Artificial Intelligence ("AI Liaison") to generate text, schedules, budgets, and creative assets.</p>
                        <ul className="list-disc pl-5 space-y-2 text-zinc-400 text-sm">
                            <li><strong className="text-zinc-200">Probabilistic Nature:</strong> AI is probabilistic and can hallucinate or make errors. Any AI-generated content is a suggestion, not authoritative or professional advice.</li>
                            <li><strong className="text-zinc-200">Verification Required:</strong> You must manually verify all AI outputs (especially logistics, safety warnings, and financial estimates) before taking real-world action.</li>
                        </ul>
                    </section>

                    <section className="bg-white/5 p-8 rounded-3xl border border-white/5 hover:border-white/10 transition-colors">
                        <h3 className="text-white font-black uppercase tracking-widest mb-4 flex items-center gap-3">
                            <span className="text-emerald-500 font-mono text-xs">04</span> Intellectual Property
                        </h3>
                        <ul className="list-disc pl-5 space-y-2 text-zinc-400 text-sm">
                            <li><strong className="text-zinc-200">Your Ownership:</strong> You retain full ownership and intellectual property rights over all scripts, treatments, images, documents, and production data you upload or generate on the Platform ("User Content").</li>
                            <li><strong className="text-zinc-200">License to Operate:</strong> You grant us a limited, worldwide, non-exclusive license to host, store, and process your User Content strictly for the purpose of operating the Service for you.</li>
                            <li><strong className="text-zinc-200">Privacy:</strong> We will never sell your User Content or feed your proprietary scripts to public AI models without your explicit opt-in.</li>
                        </ul>
                    </section>

                    <section className="bg-white/5 p-8 rounded-3xl border border-white/5 hover:border-white/10 transition-colors">
                        <h3 className="text-white font-black uppercase tracking-widest mb-4 flex items-center gap-3">
                            <span className="text-emerald-500 font-mono text-xs">05</span> Billing & Subscriptions
                        </h3>
                        <ul className="list-disc pl-5 space-y-2 text-zinc-400 text-sm">
                            <li><strong className="text-zinc-200">Subscriptions:</strong> Access to premium tiers requires an active subscription. By providing payment information, you authorize our payment processor to bill you on a recurring basis.</li>
                            <li><strong className="text-zinc-200">Cancellations:</strong> You may cancel your subscription at any time via the Account tab. Your access will remain active until the end of your current billing cycle.</li>
                            <li><strong className="text-zinc-200">No Refunds:</strong> Because we grant immediate access to digital infrastructure and AI server resources, all payments are non-refundable unless legally required.</li>
                        </ul>
                    </section>

                    <section className="bg-red-500/10 p-8 rounded-3xl border border-red-500/20 hover:border-red-500/30 transition-colors">
                        <h3 className="text-red-500 font-black uppercase tracking-widest mb-4 flex items-center gap-3">
                            <span className="font-mono text-xs">06</span> Limitation of Liability
                        </h3>
                        <p className="font-bold text-white mb-4 uppercase text-[11px] tracking-widest leading-relaxed">
                            To the fullest extent permitted by law, David Casteel Pictures shall not be liable for any indirect, incidental, special, consequential, or punitive damages.
                        </p>
                        <p className="mb-2 text-sm">Specifically, we are <strong className="text-red-400">NOT LIABLE</strong> for:</p>
                        <ul className="list-disc pl-5 space-y-2 text-red-100/70 text-sm">
                            <li><strong className="text-red-400">Budget Overruns:</strong> Any financial estimates provided by templates or AI are purely for planning. You must verify all costs.</li>
                            <li><strong className="text-red-400">Scheduling Failures:</strong> Missed shots, overtime penalties, or logistics failures resulting from reliance on our schedules.</li>
                            <li><strong className="text-red-400">On-Set Safety:</strong> Call sheets and risk assessments generated by the platform do not replace the active judgment of qualified safety personnel on set.</li>
                        </ul>
                    </section>

                    <div className="pt-12 border-t border-white/10">
                        <p className="text-xs text-zinc-600 font-mono uppercase tracking-widest leading-relaxed">
                            Questions? Contact legal@casteelfoto.com<br />
                            © 2026 David Casteel Pictures. All Rights Reserved.
                        </p>
                    </div>

                </div>
            </main>
        </div>
    );
}
