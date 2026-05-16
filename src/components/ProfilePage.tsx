import React, { useEffect, useState } from 'react';
import { collection, query, where, orderBy, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { Entry, useAuth } from '../App';
import { motion } from 'motion/react';
import { User, Mail, Calendar, Edit3, Check, X, Clock } from 'lucide-react';
import { handleFirestoreError, OperationType } from '../utils/errorUtils';

export default function ProfilePage() {
  const { user, profile, profileLoading } = useAuth();
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loadingEntries, setLoadingEntries] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [newUsername, setNewUsername] = useState(profile?.username || '');
  const [updateLoading, setUpdateLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (profile?.username) {
      setNewUsername(profile.username);
    }
  }, [profile]);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'entries'),
      where('authorId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Entry[];
      setEntries(data);
      setLoadingEntries(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'entries');
      setLoadingEntries(false);
    });

    return () => unsubscribe();
  }, [user]);

  const handleUpdateUsername = async () => {
    if (!user || !newUsername.trim()) return;
    if (newUsername.trim().length < 3 || newUsername.trim().length > 30) {
      setError('Kullanıcı adı 3-30 karakter arasında olmalıdır.');
      return;
    }

    setUpdateLoading(true);
    setError('');

    try {
      await updateDoc(doc(db, 'users', user.uid), {
        username: newUsername.trim()
      });
      setIsEditing(false);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setUpdateLoading(false);
    }
  };

  if (profileLoading) {
    return (
      <div className="flex justify-center py-32">
        <div className="w-12 h-12 border-4 border-bauhaus-ink border-t-bauhaus-red animate-spin" />
      </div>
    );
  }

  if (!user || !profile) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-16"
    >
      <header className="space-y-8">
        <div className="flex items-center gap-4">
          <div className="w-4 h-4 bg-bauhaus-red rounded-full" />
          <h4 className="text-xs font-bold uppercase tracking-[0.4em] text-bauhaus-ink">PROFİLİNİZ</h4>
        </div>
        <h1 className="text-6xl md:text-8xl font-display font-black leading-[0.9] tracking-tighter">
          KENDİNE <br />
          <span className="text-bauhaus-red">BAKMA</span> <br />
          VAKTİ.
        </h1>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Profile Card */}
        <div className="lg:col-span-5">
          <div className="bauhaus-card h-full space-y-10 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-bauhaus-yellow -mr-16 -mt-16 rotate-45 pointer-events-none" />
            
            <div className="flex flex-col items-center gap-6 relative z-10">
              <div className="w-24 h-24 bg-bauhaus-bg border-4 border-bauhaus-ink rounded-full flex items-center justify-center relative shadow-[8px_8px_0px_0px_rgba(20,20,20,1)]">
                <User size={48} className="text-bauhaus-ink" />
              </div>
              
              <div className="text-center space-y-2 w-full">
                {isEditing ? (
                  <div className="flex flex-col gap-2">
                    <div className="relative">
                      <input 
                        type="text" 
                        value={newUsername}
                        onChange={(e) => setNewUsername(e.target.value)}
                        className="w-full bg-bauhaus-bg border-4 border-bauhaus-ink p-3 font-display font-black text-2xl tracking-tighter uppercase focus:outline-none focus:bg-white transition-colors"
                        autoFocus
                      />
                      <div className="absolute top-full left-0 mt-2 flex gap-2">
                        <button 
                          onClick={handleUpdateUsername}
                          disabled={updateLoading}
                          className="bg-bauhaus-ink text-white p-2 hover:bg-bauhaus-blue transition-colors shadow-[4px_4px_0px_0px_rgba(20,20,20,1)] hover:shadow-none"
                        >
                          <Check size={20} />
                        </button>
                        <button 
                          onClick={() => {
                            setIsEditing(false);
                            setNewUsername(profile.username);
                            setError('');
                          }}
                          className="bg-white border-2 border-bauhaus-ink p-2 hover:bg-bauhaus-red hover:text-white transition-colors shadow-[4px_4px_0px_0px_rgba(20,20,20,1)] hover:shadow-none"
                        >
                          <X size={20} />
                        </button>
                      </div>
                    </div>
                    {error && <p className="text-[10px] font-bold text-bauhaus-red uppercase tracking-widest text-left">{error}</p>}
                  </div>
                ) : (
                  <div className="group flex items-center justify-center gap-3">
                    <h2 className="text-4xl font-display font-black tracking-tighter uppercase">{profile.username}</h2>
                    <button 
                      onClick={() => setIsEditing(true)}
                      className="p-1 hover:text-bauhaus-red transition-colors"
                    >
                      <Edit3 size={20} />
                    </button>
                  </div>
                )}
                <p className="text-xs font-black uppercase tracking-[0.3em] text-gray-400">{profile.role}</p>
              </div>
            </div>

            <div className="space-y-4 pt-10 border-t-4 border-bauhaus-ink">
              <div className="flex items-center gap-4 text-sm font-bold">
                <div className="w-10 h-10 border-2 border-bauhaus-ink flex items-center justify-center bg-bauhaus-yellow">
                  <Mail size={18} />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] text-gray-500 uppercase tracking-widest">E-POSTA</span>
                  <span className="tracking-tighter">{profile.email}</span>
                </div>
              </div>

              <div className="flex items-center gap-4 text-sm font-bold">
                <div className="w-10 h-10 border-2 border-bauhaus-ink flex items-center justify-center bg-bauhaus-blue text-white">
                  <Calendar size={18} />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] text-gray-400 uppercase tracking-widest">ÜYELİK TARİHİ</span>
                  <span className="tracking-tighter">
                    {profile.createdAt ? profile.createdAt.toDate().toLocaleDateString('tr-TR', { day: '2-digit', month: 'long', year: 'numeric' }) : '...'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-4 text-sm font-bold">
                <div className="w-10 h-10 border-2 border-bauhaus-ink flex items-center justify-center bg-bauhaus-red text-white">
                  <Clock size={18} />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] text-gray-400 uppercase tracking-widest">SON GİRİŞ</span>
                  <span className="tracking-tighter">
                    {profile.lastLoginAt ? profile.lastLoginAt.toDate().toLocaleString('tr-TR', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short' }) : '...'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Entries List */}
        <div className="lg:col-span-7 space-y-10">
          <div className="flex items-center justify-between border-b-4 border-bauhaus-ink pb-6">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-bauhaus-red rounded-full" />
              <h3 className="text-xl font-display font-black tracking-tighter uppercase">UTANÇLARIM</h3>
            </div>
            <span className="text-xs font-black uppercase tracking-[0.3em] text-gray-500">
              TOPLAM {entries.length}
            </span>
          </div>

          <div className="space-y-8">
            {loadingEntries ? (
              <div className="flex justify-center py-12">
                <div className="w-8 h-8 border-4 border-bauhaus-ink border-t-bauhaus-yellow animate-spin" />
              </div>
            ) : entries.length === 0 ? (
              <div className="text-center py-20 border-4 border-bauhaus-ink bg-bauhaus-bg/50">
                <p className="font-display font-bold text-lg uppercase tracking-widest">Henüz bir utanç paylaşmadın.</p>
              </div>
            ) : (
              entries.map((entry, index) => (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white border-2 border-bauhaus-ink p-6 shadow-[8px_8px_0px_0px_rgba(20,20,20,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all"
                >
                  <div className="flex justify-between items-center mb-4 border-b-2 border-bauhaus-bg pb-3">
                    <div className={`text-[8px] font-black uppercase tracking-[0.2em] px-2 py-0.5 border border-bauhaus-ink ${
                      entry.status === 'approved' ? 'bg-bauhaus-yellow' : 
                      entry.status === 'pending' ? 'bg-gray-200' : 'bg-bauhaus-red text-white'
                    }`}>
                      {entry.status === 'approved' ? 'ONAYLANDI' : 
                       entry.status === 'pending' ? 'BEKLEMEDE' : 'REDDEDİLDİ'}
                    </div>
                    <span className="text-[10px] font-bold text-gray-400">
                      {entry.createdAt ? entry.createdAt.toDate().toLocaleDateString('tr-TR') : '...'}
                    </span>
                  </div>
                  <h4 className="font-display font-black text-lg mb-2">{entry.title || 'Başlıksız'}</h4>
                  <p className="text-sm line-clamp-3 text-gray-700">{entry.content}</p>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

