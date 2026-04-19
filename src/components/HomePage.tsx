import React, { useEffect, useState, useMemo, useRef } from 'react';
import { collection, query, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { Entry, useAuth } from '../App';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { handleFirestoreError, OperationType } from '../utils/errorUtils';
import { ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import CringeOMeter from './CringeOMeter';

const ENTRIES_PER_PAGE = 6;

type SortOption = 'newest' | 'oldest' | 'cringe-high' | 'cringe-low';

export default function HomePage() {
  const { user } = useAuth();
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const entriesContainerRef = useRef<HTMLDivElement>(null);

  const sortedEntries = useMemo(() => {
    const sorted = [...entries].sort((a, b) => {
      if (sortBy === 'newest') {
        const timeA = a.createdAt?.toMillis?.() || 0;
        const timeB = b.createdAt?.toMillis?.() || 0;
        return timeB - timeA;
      }
      if (sortBy === 'oldest') {
        const timeA = a.createdAt?.toMillis?.() || 0;
        const timeB = b.createdAt?.toMillis?.() || 0;
        return timeA - timeB;
      }
      
      const avgA = (a.cringeCount && a.cringeCount > 0) ? (a.cringeScore! / a.cringeCount) : 0;
      const avgB = (b.cringeCount && b.cringeCount > 0) ? (b.cringeScore! / b.cringeCount) : 0;
      
      if (sortBy === 'cringe-high') {
        return avgB - avgA;
      }
      if (sortBy === 'cringe-low') {
        return avgA - avgB;
      }
      return 0;
    });
    return sorted;
  }, [entries, sortBy]);

  const totalPages = Math.ceil(sortedEntries.length / ENTRIES_PER_PAGE);
  
  const paginatedEntries = useMemo(() => {
    const start = (currentPage - 1) * ENTRIES_PER_PAGE;
    return sortedEntries.slice(start, start + ENTRIES_PER_PAGE);
  }, [sortedEntries, currentPage]);

  // Scroll to entries when page changes
  useEffect(() => {
    if (!loading && entriesContainerRef.current) {
      const navHeight = 96; // Navbar height (h-24 = 96px)
      const elementPosition = entriesContainerRef.current.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - navHeight - 20;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  }, [currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [sortBy]);

  useEffect(() => {
    const q = query(
      collection(db, 'entries'),
      where('status', '==', 'approved'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Entry[];
      setEntries(data);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'entries');
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-32">
        <div className="w-12 h-12 border-4 border-bauhaus-ink border-t-bauhaus-red animate-spin" />
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="space-y-32"
    >
      <header className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div className="space-y-8">
          <div className="flex items-center gap-4">
            <div className="w-4 h-4 bg-bauhaus-red rounded-full" />
            <h4 className="text-xs font-bold uppercase tracking-[0.4em] text-bauhaus-ink">KOLEKTİF HAFIZA</h4>
          </div>
          <h1 className="text-6xl md:text-8xl font-display font-black leading-[0.9] tracking-tighter">
            BUGÜN DE <br />
            <span className="text-bauhaus-red">BAŞKASI</span> <br />
            ADINA <br />
            UTANDIK.
          </h1>
          <p className="text-xl text-gray-600 font-medium leading-relaxed max-w-lg">
            Başkası adına utandığımız her şeyi buraya yazıyoruz. Belki birileri okuyup da kendileri adına utanır.
          </p>
          {!user && (
            <div className="flex flex-wrap gap-6 pt-4">
              <Link 
                to="/auth" 
                state={{ isLogin: true }}
                className="bauhaus-button"
              >
                GİRİŞ YAP
              </Link>
              <Link 
                to="/auth" 
                state={{ isLogin: false }}
                className="bauhaus-button-yellow"
              >
                KAYIT OL
              </Link>
            </div>
          )}
        </div>
        <div className="hidden lg:flex justify-center relative">
          <div className="w-64 h-64 md:w-80 md:h-80 bg-bauhaus-yellow border-4 border-bauhaus-ink relative z-10 flex items-center justify-center">
            <div className="w-32 h-32 md:w-40 md:h-40 bg-bauhaus-red rounded-full border-4 border-bauhaus-ink" />
            <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-bauhaus-blue border-4 border-bauhaus-ink -rotate-12" />
          </div>
        </div>
      </header>

      <div ref={entriesContainerRef} className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-t-4 border-bauhaus-ink pt-8">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-bauhaus-yellow rounded-full" />
            <h4 className="text-xs font-bold uppercase tracking-[0.3em] text-bauhaus-ink">SIRALAMA</h4>
          </div>
          <div className="relative inline-block w-full md:w-64">
            <select 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="w-full appearance-none bg-white border-2 border-bauhaus-ink p-3 pr-10 font-display font-bold text-sm uppercase tracking-widest focus:outline-none focus:bg-bauhaus-yellow transition-colors cursor-pointer"
            >
              <option value="newest">Yeniden Eskiye</option>
              <option value="oldest">Eskiden Yeniye</option>
              <option value="cringe-high">Utanç: Azalan</option>
              <option value="cringe-low">Utanç: Artan</option>
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <ChevronDown size={18} className="text-bauhaus-ink" />
            </div>
          </div>
        </div>
        <div className="hidden md:block text-right">
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">
            TOPLAM {entries.length} UTANÇ
          </span>
        </div>
      </div>

      {entries.length === 0 ? (
        <div className="text-center py-40 border-4 border-bauhaus-ink bg-white/50 backdrop-blur-sm">
          <p className="text-bauhaus-ink font-display font-bold text-2xl uppercase tracking-widest">Henüz onaylanmış bir utanç yok.</p>
        </div>
      ) : (
        <div className="space-y-24">
          <div className="flex flex-col gap-16 max-w-4xl mx-auto">
            {paginatedEntries.map((entry, index) => (
              <motion.article
                key={entry.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bauhaus-card group flex flex-col justify-between"
              >
                <div className="space-y-10">
                  <div className="flex justify-between items-start border-b-4 border-bauhaus-ink pb-6">
                    <div className="space-y-2">
                      <p className="text-sm font-black uppercase tracking-widest">@{entry.authorUsername}</p>
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[8px] font-bold uppercase tracking-[0.3em] text-bauhaus-red">YAYINLANMA TARİHİ</span>
                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">
                          {entry.createdAt ? entry.createdAt.toDate().toLocaleString('tr-TR', { 
                            day: '2-digit', 
                            month: '2-digit', 
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          }) : '...'}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <div className="w-4 h-4 bg-bauhaus-red rounded-full" />
                      <div className="w-4 h-4 bg-bauhaus-yellow rounded-full" />
                      <div className="w-4 h-4 bg-bauhaus-blue rounded-full" />
                    </div>
                  </div>
                  
                  <div className="space-y-6">
                    {entry.title && (
                      <h2 className="text-2xl font-display font-black leading-none text-bauhaus-ink group-hover:text-bauhaus-red transition-colors">
                        {entry.title}
                      </h2>
                    )}
                    <p className="text-lg font-medium leading-tight text-gray-800">
                      {entry.content}
                    </p>
                  </div>
                </div>
                
                <div className="mt-6 space-y-10">
                  <CringeOMeter 
                    entryId={entry.id} 
                    currentScore={entry.cringeScore} 
                    currentCount={entry.cringeCount} 
                  />
                </div>
              </motion.article>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex flex-col items-center gap-8 pt-12 border-t-4 border-bauhaus-ink">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => {
                    setCurrentPage(prev => Math.max(1, prev - 1));
                  }}
                  disabled={currentPage === 1}
                  className="w-12 h-12 border-4 border-bauhaus-ink flex items-center justify-center bg-white hover:bg-bauhaus-yellow disabled:opacity-30 disabled:hover:bg-white transition-colors"
                >
                  <ChevronLeft size={24} />
                </button>
                
                <div className="flex items-center gap-2 px-6 py-2 bg-bauhaus-ink text-white font-display font-black text-xl tracking-tighter">
                  <span>{currentPage}</span>
                  <span className="text-bauhaus-red">/</span>
                  <span>{totalPages}</span>
                </div>

                <button
                  onClick={() => {
                    setCurrentPage(prev => Math.min(totalPages, prev + 1));
                  }}
                  disabled={currentPage === totalPages}
                  className="w-12 h-12 border-4 border-bauhaus-ink flex items-center justify-center bg-white hover:bg-bauhaus-blue hover:text-white disabled:opacity-30 disabled:hover:bg-white disabled:hover:text-bauhaus-ink transition-colors"
                >
                  <ChevronRight size={24} />
                </button>
              </div>
              
              <div className="flex gap-2">
                {Array.from({ length: totalPages }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setCurrentPage(i + 1);
                    }}
                    className={`w-3 h-3 border-2 border-bauhaus-ink transition-all ${
                      currentPage === i + 1 ? 'bg-bauhaus-red scale-125' : 'bg-white hover:bg-gray-200'
                    }`}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}
