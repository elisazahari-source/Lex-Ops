import React, { useRef, useState, useEffect, useCallback } from 'react';
import { useLegal } from '../context/LegalContext';
import {
  LayoutGrid,
  FileText,
  Scale,
  Building2,
  BookmarkCheck,
  CreditCard,
  ShieldCheck,
  Building,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { ActiveTab } from '../types/legal';

export const SubTabBar: React.FC = () => {
  const { activeTab, setActiveTab, counts } = useLegal();
  const scrollRef = useRef<HTMLDivElement>(null);
  const activeTabRef = useRef<HTMLButtonElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const tabs: { id: ActiveTab; label: string; count?: number; icon: React.ReactNode }[] = [
    { id: 'overview', label: 'Matter Overview', icon: <LayoutGrid className="w-3.5 h-3.5" /> },
    { id: 'agreements', label: '1. Agreements & LDRF', count: counts.agreements, icon: <FileText className="w-3.5 h-3.5" /> },
    { id: 'lods', label: '2. LOD Dispute Tracker', count: counts.lods, icon: <Scale className="w-3.5 h-3.5" /> },
    { id: 'property', label: '3. Property Matters', count: counts.properties, icon: <Building2 className="w-3.5 h-3.5" /> },
    { id: 'ip', label: '4. Intellectual Property', count: counts.ips, icon: <BookmarkCheck className="w-3.5 h-3.5" /> },
    { id: 'payments', label: '5. Invoices & Finance', count: counts.lateFinanceInvoices > 0 ? counts.lateFinanceInvoices : undefined, icon: <CreditCard className="w-3.5 h-3.5" /> },
    { id: 'compliance', label: '6. Compliance Audits', icon: <ShieldCheck className="w-3.5 h-3.5" /> },
    { id: 'counsel', label: '7. External Counsel', count: counts.externalLawFirms, icon: <Building className="w-3.5 h-3.5" /> },
  ];

  const checkScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const hasOverflow = el.scrollWidth > el.clientWidth + 1;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(hasOverflow && el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    checkScroll();

    const handleScroll = () => checkScroll();
    el.addEventListener('scroll', handleScroll, { passive: true });

    // Enable mouse wheel vertical-to-horizontal scrolling over the tab strip
    const handleWheel = (e: WheelEvent) => {
      if (e.deltaY !== 0 && el.scrollWidth > el.clientWidth) {
        e.preventDefault();
        el.scrollLeft += e.deltaY;
      }
    };
    el.addEventListener('wheel', handleWheel, { passive: false });

    // Resize observer to track window or drawer resizing
    const resizeObserver = new ResizeObserver(() => checkScroll());
    resizeObserver.observe(el);

    return () => {
      el.removeEventListener('scroll', handleScroll);
      el.removeEventListener('wheel', handleWheel);
      resizeObserver.disconnect();
    };
  }, [checkScroll]);

  // Smoothly scroll active tab into view when selected
  useEffect(() => {
    if (activeTabRef.current) {
      activeTabRef.current.scrollIntoView({
        behavior: 'smooth',
        inline: 'nearest',
        block: 'nearest',
      });
    }
    // Re-check after tab change
    setTimeout(checkScroll, 200);
  }, [activeTab, checkScroll]);

  const scrollByAmount = (offset: number) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  return (
    <div className="relative mb-4 group/tabbar select-none">
      {/* Scroll Left Button */}
      {canScrollLeft && (
        <button
          type="button"
          onClick={() => scrollByAmount(-200)}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-7 h-7 flex items-center justify-center bg-white/95 text-slate-700 shadow-md border border-slate-200 rounded-full hover:bg-slate-100 hover:text-slate-900 transition-all cursor-pointer backdrop-blur-xs"
          title="Scroll tabs left"
          aria-label="Scroll tabs left"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      )}

      {/* Main Tab Strip Container */}
      <div
        ref={scrollRef}
        className="flex items-center gap-1.5 border border-slate-200/90 mb-0 overflow-x-auto no-scrollbar bg-slate-50/80 p-1 rounded-lg scroll-smooth shadow-2xs"
      >
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              ref={isActive ? activeTabRef : undefined}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-[12.5px] font-medium transition-all rounded-md whitespace-nowrap cursor-pointer relative shrink-0 ${
                isActive
                  ? 'bg-white text-blue-700 font-semibold shadow-xs border border-slate-200/90'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/70'
              }`}
            >
              <span className={isActive ? 'text-blue-600' : 'text-slate-400'}>
                {tab.icon}
              </span>
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full tabular-nums ${
                    isActive
                      ? 'bg-blue-600 text-white font-semibold'
                      : 'bg-slate-200/80 text-slate-700'
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Scroll Right Button */}
      {canScrollRight && (
        <button
          type="button"
          onClick={() => scrollByAmount(200)}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-7 h-7 flex items-center justify-center bg-white/95 text-slate-700 shadow-md border border-slate-200 rounded-full hover:bg-slate-100 hover:text-slate-900 transition-all cursor-pointer backdrop-blur-xs"
          title="Scroll tabs right"
          aria-label="Scroll tabs right"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};
