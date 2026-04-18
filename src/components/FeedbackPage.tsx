import React, { useState } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { useAuth } from '../App';
import { motion, AnimatePresence } from 'motion/react';
import { Send, MessageSquare, CheckCircle2 } from 'lucide-react';
import { handleFirestoreError, OperationType } from '../utils/errorUtils';

export default function FeedbackPage() {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !content.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const feedbackPath = 'feedback';
      await addDoc(collection(db, feedbackPath), {
        content: content.trim(),
        authorId: user.uid,
        authorEmail: user.email,
        createdAt: serverTimestamp(),
      });
      setSubmitted(true);
      setContent('');
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'feedback');
      setError('Geri bildirim gönderilirken bir hata oluştu. Lütfen tekrar dene.');
    } finally {
      setLoading(false);
    }
  };

  const handleCloseDialog = () => {
    setSubmitted(false);
    setContent('');
    setError(null);
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-3xl mx-auto space-y-16 py-10"
      >
        <header className="grid grid-cols-1 md:grid-cols-12 gap-0 border-4 border-bauhaus-ink shadow-[12px_12px_0px_0px_rgba(20,20,20,1)] bg-white">
          <div className="md:col-span-4 bg-bauhaus-blue p-10 flex items-center justify-center border-b-4 md:border-b-0 md:border-r-4 border-bauhaus-ink">
            <MessageSquare className="w-16 h-16 text-white" />
          </div>
          <div className="md:col-span-8 p-10 space-y-4">
            <h1 className="text-6xl font-display font-black tracking-tighter uppercase leading-none">Bize Yaz.</h1>
            <p className="text-sm font-black uppercase tracking-widest text-gray-500">
              Önerilerin, şikayetlerin veya sadece merhaba demek için... Admin ekibimiz tüm mesajlarını dikkatle okur.
            </p>
          </div>
        </header>

        <form onSubmit={handleSubmit} className="space-y-10 bg-white p-12 border-4 border-bauhaus-ink shadow-[16px_16px_0px_0px_rgba(255,184,0,1)]">
          <div className="space-y-6">
            <label className="text-xs font-black uppercase tracking-[0.4em] text-bauhaus-ink flex items-center gap-3">
              <div className="w-3 h-3 bg-bauhaus-red" />
              MESAJINIZ
            </label>
            <textarea
              required
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Fikirlerini buraya yaz..."
              rows={8}
              className="w-full bg-bauhaus-bg border-4 border-bauhaus-ink p-8 text-xl font-medium focus:bg-white outline-none resize-none transition-colors"
            />
          </div>

          {error && (
            <div className="p-4 bg-bauhaus-red text-white font-black uppercase text-xs border-2 border-bauhaus-ink">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !content.trim()}
            className="bauhaus-button w-full flex items-center justify-center gap-4 py-6 text-xl"
          >
            {loading ? 'GÖNDERİLİYOR...' : (
              <>
                GÖNDER <Send className="w-6 h-6" />
              </>
            )}
          </button>
        </form>

        <footer className="text-center bg-bauhaus-ink text-white p-6 border-4 border-bauhaus-ink">
          <p className="text-[10px] font-black uppercase tracking-[0.3em]">
            Anonimlik esastır ancak geri bildirimlerinde e-posta adresin admin tarafından görülebilir.
          </p>
        </footer>
      </motion.div>

      <AnimatePresence>
        {submitted && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleCloseDialog}
              className="absolute inset-0 bg-bauhaus-ink/80 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              exit={{ opacity: 0, scale: 0.8, rotate: 5 }}
              className="relative bg-white w-full max-w-md p-12 border-8 border-bauhaus-ink shadow-[24px_24px_0px_0px_rgba(0,86,179,1)] space-y-10 text-center"
            >
              <div className="inline-block p-6 bg-bauhaus-blue border-4 border-bauhaus-ink">
                <CheckCircle2 className="w-16 h-16 text-white" />
              </div>
              <div className="space-y-6">
                <h3 className="text-4xl font-display font-black tracking-tighter uppercase leading-none">MESAJINIZ GÖNDERİLDİ.</h3>
                <p className="text-sm font-black uppercase tracking-widest text-gray-500 leading-relaxed">
                  Adminler mesajına e-posta adresine dönüş yapacak.
                </p>
              </div>
              <button
                onClick={handleCloseDialog}
                className="bauhaus-button-yellow w-full py-4 text-lg"
              >
                KAPAT
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
