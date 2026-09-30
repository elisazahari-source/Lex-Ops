import React from 'react';
import { useLegal } from '../context/LegalContext';
import {
  Sparkles,
  Plus,
  FileCheck2,
  Trash2,
  Shield,
  Layers,
  ArrowRight,
  HelpCircle,
} from 'lucide-react';

export const NewUserOnboardingBanner: React.FC = () => {
  const {
    agreements,
    lods,
    properties,
    ips,
    activeUser,
    seedStarterTemplate,
    clearAllPersonalMatters,
    setIsNewIntakeModalOpen,
    setNewIntakeDefaultType,
    setIsQuickLdrfOpen,
  } = useLegal();

  const totalMatters = agreements.length + lods.length + properties.length + ips.length;
  const isBlankAccount = totalMatters === 0;

  // Case 1: Brand new blank account (0 matters)
  if (isBlankAccount) {
    return (
      <div className="mb-4 bg-gradient-to-r from-blue-900 via-indigo-950 to-slate-900 rounded-xl p-5 text-white shadow-sm border border-blue-800/60 relative overflow-hidden animate-fadeIn">
        {/* Subtle background glow */}
        <div className="absolute right-0 top-0 bottom-0 w-80 bg-blue-500/10 blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-500/20 border border-blue-400/30 text-[11px] font-bold text-blue-200 tracking-wide uppercase font-mono">
              <Sparkles className="w-3 h-3 text-amber-300" />
              <span>Akaun Baharu / New Counsel Workspace</span>
            </div>

            <h2 className="text-[17px] font-extrabold text-white tracking-tight">
              Selamat Datang, {activeUser?.name || 'Peguam Korporat'}!
            </h2>

            <p className="text-[12.5px] text-blue-100/90 leading-relaxed">
              Papan pemuka ini adalah <strong>ruang kerja peribadi (isolated tracker)</strong> yang masih kosong. Anda boleh mula memasukkan perjanjian pertama anda sekarang, atau muatkan <strong>sampel data lengkap Media Prima</strong> dengan satu klik untuk melihat simulasi aliran kerja 6-peringkat, pengiraan TAT automatik, dan sistem amaran.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 shrink-0">
            <button
              onClick={seedStarterTemplate}
              className="px-4 py-2 bg-amber-400 hover:bg-amber-300 active:bg-amber-500 text-slate-950 text-[12.5px] font-bold rounded-lg transition-all shadow-sm flex items-center gap-1.5 cursor-pointer hover:scale-[1.02]"
            >
              <Sparkles className="w-4 h-4 text-amber-900" />
              <span>Muatkan Sampel Data</span>
            </button>

            <button
              onClick={() => {
                setNewIntakeDefaultType('agreement');
                setIsNewIntakeModalOpen(true);
              }}
              className="px-3.5 py-2 bg-white/10 hover:bg-white/20 active:bg-white/15 text-white border border-white/20 text-[12.5px] font-medium rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>+ Perjanjian Baharu</span>
            </button>

            <button
              onClick={() => setIsQuickLdrfOpen(true)}
              className="px-3 py-2 bg-white/5 hover:bg-white/10 text-blue-200 border border-white/10 text-[12px] font-medium rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
            >
              <FileCheck2 className="w-3.5 h-3.5" />
              <span>LDRF Intake</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Case 2: When user has sample data loaded, show a handy management bar
  return (
    <div className="mb-3 px-3.5 py-2 rounded-lg bg-blue-50/80 border border-blue-200/80 flex items-center justify-between gap-3 text-[12px]">
      <div className="flex items-center gap-2 min-w-0">
        <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
        <span className="font-semibold text-blue-950 truncate">
          Tracker Peribadi ({totalMatters} urusan undang-undang aktif)
        </span>
        <span className="text-slate-500 hidden sm:inline">&bull;</span>
        <span className="text-slate-600 hidden sm:inline truncate">
          Pangkalan data terasing untuk akaun {activeUser?.email}
        </span>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={clearAllPersonalMatters}
          title="Kosongkan semua data untuk memulakan tracker bersih anda sendiri"
          className="inline-flex items-center gap-1 text-[11.5px] font-medium text-slate-600 hover:text-red-700 hover:bg-red-50 px-2.5 py-1 rounded transition-colors cursor-pointer border border-slate-200 hover:border-red-200"
        >
          <Trash2 className="w-3 h-3 text-slate-500" />
          <span>Kosongkan ke Akaun Asal (Reset)</span>
        </button>

        <button
          onClick={seedStarterTemplate}
          title="Muat semula templat sampel Media Prima"
          className="inline-flex items-center gap-1 text-[11.5px] font-medium text-blue-700 hover:bg-blue-100/70 px-2 py-1 rounded transition-colors cursor-pointer"
        >
          <Sparkles className="w-3 h-3 text-blue-600" />
          <span className="hidden md:inline">Muat Semula Sampel</span>
        </button>
      </div>
    </div>
  );
};
