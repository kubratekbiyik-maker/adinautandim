import React, { useState } from 'react';
import { collection, addDoc, serverTimestamp, updateDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../App';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { handleFirestoreError, OperationType } from '../utils/errorUtils';
import { Send, AlertCircle } from 'lucide-react';

export default function NewEntryPage() {
  const { user, profile, loading: authLoading } = useAuth();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || !title.trim()) return;

    if (!user || !profile) {
      handleFirestoreError(new Error('Kullanıcı oturumu veya profil bilgisi bulunamadı. Lütfen tekrar giriş yapın.'), OperationType.CREATE, 'entries');
      return;
    }

    setLoading(true);
    try {
      await addDoc(collection(db, 'entries'), {
        title: title.trim(),
        content: content.trim(),
        authorId: user.uid,
        authorUsername: profile.username,
        status: 'pending',
        createdAt: serverTimestamp(),
        cringeScore: 0,
        cringeCount: 0
      });
      
      // Update user's last entry timestamp
      await updateDoc(doc(db, 'users', user.uid), {
        lastEntryAt: serverTimestamp()
      });

      setSuccess(true);
      setTimeout(() => navigate('/'), 3000);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'entries');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center py-40">
        <div className="w-8 h-8 border-2 border-brand-accent border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (success) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-40 space-y-12"
      >
        <div className="w-32 h-32 bg-bauhaus-yellow border-4 border-bauhaus-ink mx-auto flex items-center justify-center">
          <Send size={48} className="text-bauhaus-ink" />
        </div>
        <div className="space-y-4">
          <h2 className="text-5xl font-display font-black tracking-tighter uppercase">GÖNDERİLDİ.</h2>
          <p className="text-xl font-medium text-gray-600">Anın moderatör onayına gönderildi. Yakında yayınlanacak.</p>
        </div>
        <div className="flex justify-center gap-4">
          <div className="w-4 h-4 bg-bauhaus-red animate-bounce" />
          <div className="w-4 h-4 bg-bauhaus-yellow animate-bounce [animation-delay:0.2s]" />
          <div className="w-4 h-4 bg-bauhaus-blue animate-bounce [animation-delay:0.4s]" />
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -50 }}
      className="max-w-4xl mx-auto"
    >
      <header className="mb-20 space-y-6 border-l-8 border-bauhaus-red pl-10">
        <h4 className="text-xs font-bold uppercase tracking-[0.5em] text-bauhaus-ink">YENİ BİR HİKAYE</h4>
        <h1 className="text-6xl md:text-8xl font-display font-black leading-none tracking-tighter">BİR UTANÇ <br /> PAYLAŞ.</h1>
        <p className="text-xl font-medium text-gray-500 max-w-xl">
          Gördüğün o anı anlat. Kimsenin ismini vermemeye özen göster. Form fonksiyonu, utanç ise gerçeği takip eder.
        </p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-12">
        <div className="bauhaus-card space-y-12 bg-white">
          <div className="space-y-4">
            <label className="text-xs font-black uppercase tracking-widest text-bauhaus-red">BAŞLIK</label>
            <input
              required
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="KISA VE ÖZ BİR BAŞLIK..."
              className="w-full bg-bauhaus-bg border-4 border-bauhaus-ink p-6 focus:bg-white focus:outline-none font-display font-black text-2xl uppercase tracking-tighter transition-colors"
              maxLength={100}
            />
          </div>

          <div className="space-y-4">
            <label className="text-xs font-black uppercase tracking-widest text-bauhaus-blue">NELER OLDU?</label>
            <textarea
              required
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="ANLATMAYA BAŞLA..."
              className="w-full h-96 bg-bauhaus-bg border-4 border-bauhaus-ink p-8 focus:bg-white focus:outline-none font-medium text-xl leading-tight resize-none transition-colors"
              maxLength={2000}
            />
            <div className="flex justify-between items-center">
              <div className="flex gap-2">
                <div className="w-4 h-4 bg-bauhaus-red" />
                <div className="w-4 h-4 bg-bauhaus-yellow" />
                <div className="w-4 h-4 bg-bauhaus-blue" />
              </div>
              <span className="text-xs font-black uppercase tracking-widest">
                {content.length} / 2000
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-0 border-4 border-bauhaus-ink shadow-[12px_12px_0px_0px_rgba(20,20,20,1)]">
          <div className="md:col-span-2 bg-bauhaus-yellow flex items-center justify-center p-6 border-b-4 md:border-b-0 md:border-r-4 border-bauhaus-ink">
            <AlertCircle className="text-bauhaus-ink" size={48} />
          </div>
          <div className="md:col-span-10 bg-white p-8">
            <p className="text-sm font-bold uppercase tracking-widest leading-relaxed">
              PAYLAŞIMINIZ MODERATÖRLERİMİZ TARAFINDAN İNCELENECEKTİR. HAKARET, NEFRET SÖYLEMİ VEYA KİŞİSEL VERİ İÇEREN PAYLAŞIMLAR ONAYLANMAZ.
            </p>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || !content.trim() || !title.trim()}
          className="bauhaus-button w-full py-8 text-xl"
        >
          {loading ? 'GÖNDERİLİYOR...' : 'ONAYA GÖNDER'}
        </button>
      </form>
    </motion.div>
  );
}
