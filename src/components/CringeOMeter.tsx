import React, { useState, useEffect } from 'react';
import { doc, updateDoc, setDoc, getDoc, Timestamp, runTransaction } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../App';
import { motion, AnimatePresence } from 'motion/react';
import { handleFirestoreError, OperationType } from '../utils/errorUtils';

interface CringeOMeterProps {
  entryId: string;
  currentScore?: number;
  currentCount?: number;
}

const CRINGE_LABELS = [
  "Biraz utandım",
  "Hafiften kızardım",
  "Gözlerimi kaçırdım",
  "Yüzümü kapattım",
  "Yer yarıldı içine girdim"
];

export default function CringeOMeter({ entryId, currentScore = 0, currentCount = 0 }: CringeOMeterProps) {
  const { user } = useAuth();
  const [userVote, setUserVote] = useState<number | null>(null);
  const [hoverValue, setHoverValue] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    
    const checkVote = async () => {
      const voteDoc = await getDoc(doc(db, 'entries', entryId, 'cringe_votes', user.uid));
      if (voteDoc.exists()) {
        setUserVote(voteDoc.data().score);
      }
    };
    
    checkVote();
  }, [user, entryId]);

  const handleVote = async (value: number) => {
    if (!user || userVote !== null || loading) return;
    
    setLoading(true);
    try {
      await runTransaction(db, async (transaction) => {
        const entryRef = doc(db, 'entries', entryId);
        const voteRef = doc(db, 'entries', entryId, 'cringe_votes', user.uid);
        
        const entryDoc = await transaction.get(entryRef);
        if (!entryDoc.exists()) throw new Error("Entry not found");
        
        const data = entryDoc.data();
        const newCount = (data.cringeCount || 0) + 1;
        const newScore = (data.cringeScore || 0) + value;
        
        transaction.set(voteRef, {
          score: value,
          userId: user.uid,
          createdAt: Timestamp.now()
        });
        
        transaction.update(entryRef, {
          cringeCount: newCount,
          cringeScore: newScore
        });
      });
      
      setUserVote(value);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `entries/${entryId}/vote`);
    } finally {
      setLoading(false);
    }
  };

  const average = currentCount > 0 ? currentScore / currentCount : 0;
  const percentage = (average / 5) * 100;

  const getCringeColor = (val: number) => {
    // Transition from Yellow (#FFD700) to Dark Red (#8B0000)
    const colors = [
      '#FFD700', // Level 1: Yellow
      '#FFB800', // Level 2: Amber
      '#FF7A00', // Level 3: Orange
      '#FF4B2B', // Level 4: Red
      '#8B0000'  // Level 5: Dark Red
    ];
    return colors[Math.min(Math.max(val - 1, 0), 4)];
  };

  const [sliderValue, setSliderValue] = useState<number>(3);
  const displayValue = userVote || hoverValue || sliderValue;
  const displayColor = getCringeColor(displayValue);

  // Update sliderValue when userVote changes
  useEffect(() => {
    if (userVote !== null) {
      setSliderValue(userVote);
    }
  }, [userVote]);

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value);
    setSliderValue(val);
    if (!userVote) {
      setHoverValue(val);
    }
  };

  return (
    <div className="space-y-6 pt-8 border-t-4 border-bauhaus-ink/10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4">
        <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-bauhaus-ink">UTANÇMETRE.</h4>
        {currentCount > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">
              {currentCount} OY / ORTALAMA: <span className="text-bauhaus-red">{CRINGE_LABELS[Math.max(0, Math.round(average) - 1)].toLocaleUpperCase('tr-TR')}</span>
            </span>
          </div>
        )}
      </div>

      <div className="relative py-10">
        {/* Min/Max Labels */}
        <div className="absolute top-0 left-0 right-0 flex justify-between px-0.5">
          <span className="text-[7px] font-black text-gray-400 uppercase tracking-[0.15em] leading-tight whitespace-nowrap">
            {CRINGE_LABELS[0]}
          </span>
          <span className="text-[7px] font-black text-gray-400 uppercase tracking-[0.15em] text-right leading-tight whitespace-nowrap">
            {CRINGE_LABELS[4]}
          </span>
        </div>

        {/* Slider Track */}
        <div className="relative h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
          <motion.div 
            className="absolute top-0 left-0 h-full"
            initial={false}
            animate={{ 
              width: `${((displayValue - 1) / 4) * 100}%`,
              backgroundColor: displayColor
            }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          />
        </div>
        
        {/* Slider Thumb */}
        <motion.div 
          className="absolute top-1/2 -translate-y-1/2 w-6 h-6 rounded-full border-4 border-white shadow-lg z-10 pointer-events-none"
          initial={false}
          animate={{ 
            left: `calc(${((displayValue - 1) / 4) * 100}% - 12px)`,
            backgroundColor: displayColor
          }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        />

        {/* Interactive Input Overlay */}
        <input 
          type="range" 
          min="1" 
          max="5" 
          step="1"
          value={displayValue}
          onChange={handleSliderChange}
          onMouseEnter={() => !userVote && setHoverValue(displayValue)}
          onMouseLeave={() => setHoverValue(null)}
          disabled={!user || loading || userVote !== null}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20 disabled:cursor-default"
        />
      </div>

      {/* Centered Label Text */}
      <div className="text-center min-h-[40px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={displayValue}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="flex flex-col items-center"
          >
            <span className="text-sm font-black uppercase tracking-[0.2em] font-sans" style={{ color: displayColor }}>
              {CRINGE_LABELS[displayValue - 1]}
            </span>
            {userVote !== null && (
              <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest mt-1">
                OYUNUZ KAYDEDİLDİ
              </span>
            )}
            {!user && userVote === null && (
              <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest mt-1">
                OYLAMAK İÇİN GİRİŞ YAPIN
              </span>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Vote Button */}
      {user && userVote === null && (
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => handleVote(sliderValue)}
          disabled={loading}
          className="w-full py-3 text-white text-[10px] font-black uppercase tracking-[0.3em] border-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ 
            backgroundColor: displayColor,
            borderColor: displayColor,
            boxShadow: `4px 4px 0px 0px #141414`
          }}
        >
          {loading ? 'KAYDEDİLİYOR...' : 'OY VER'}
        </motion.button>
      )}
    </div>
  );
}
