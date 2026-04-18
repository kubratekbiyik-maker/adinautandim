import React, { useEffect, useState } from 'react';
import { collection, query, where, orderBy, onSnapshot, updateDoc, doc, deleteDoc, addDoc, Timestamp } from 'firebase/firestore';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { db } from '../firebase';
import { Entry } from '../App';
import { motion, AnimatePresence } from 'motion/react';
import { handleFirestoreError, OperationType } from '../utils/errorUtils';
import { Check, X, Trash2, Clock, MessageSquare, Mail } from 'lucide-react';

interface Feedback {
  id: string;
  content: string;
  authorId: string;
  authorEmail: string;
  createdAt: any;
}

export default function AdminPage() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [stats, setStats] = useState<{ name: string; value: number; color: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [seedStatus, setSeedStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  useEffect(() => {
    // Listen to all entries for stats
    const qAll = query(collection(db, 'entries'));
    const unsubscribeStats = onSnapshot(qAll, (snapshot) => {
      const counts = {
        pending: 0,
        approved: 0,
        rejected: 0
      };
      snapshot.docs.forEach(doc => {
        const data = doc.data() as Entry;
        if (data.status === 'pending') counts.pending++;
        else if (data.status === 'approved') counts.approved++;
        else if (data.status === 'rejected') counts.rejected++;
      });
      setStats([
        { name: 'Bekleyen', value: counts.pending, color: '#FFB800' }, // Bauhaus Yellow
        { name: 'Onaylanan', value: counts.approved, color: '#0056B3' }, // Bauhaus Blue
        { name: 'Reddedilen', value: counts.rejected, color: '#FF4B2B' } // Bauhaus Red
      ]);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'entries');
    });

    // Listen to pending entries for the list
    const qPending = query(
      collection(db, 'entries'),
      where('status', '==', 'pending'),
      orderBy('createdAt', 'asc')
    );

    const unsubscribePending = onSnapshot(qPending, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Entry[];
      setEntries(data);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'entries');
    });

    // Listen to feedbacks
    const qFeedback = query(
      collection(db, 'feedback'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribeFeedback = onSnapshot(qFeedback, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Feedback[];
      setFeedbacks(data);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'feedback');
    });

    return () => {
      unsubscribeStats();
      unsubscribePending();
      unsubscribeFeedback();
    };
  }, []);

  const handleStatus = async (id: string, status: 'approved' | 'rejected') => {
    try {
      await updateDoc(doc(db, 'entries', id), { status });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `entries/${id}`);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Bu entryi tamamen silmek istediğine emin misin?')) return;
    try {
      await deleteDoc(doc(db, 'entries', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `entries/${id}`);
    }
  };

  const handleDeleteFeedback = async (id: string) => {
    if (!window.confirm('Bu geri bildirimi silmek istediğine emin misin?')) return;
    try {
      await deleteDoc(doc(db, 'feedback', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `feedback/${id}`);
    }
  };

  const seedData = async () => {
    if (seedStatus === 'loading') return;
    setSeedStatus('loading');
    
    const initialData = [
      {
        title: "CEO ile Akrabalık Denemesi",
        content: "Metroda yanımda oturan genç, telefonla öyle bir bağırarak konuşuyor ki tüm vagon hissedar olduk. \"Abi o start-up'ı 5 milyona exit yapmazsak Elon üzülür\" dediği an telefonu kapandı ve ekranında \"Annem Arıyor\" yazısı belirdi. Göz göze geldik. Ben yerin dibine girdim, o ise hala 'global vizyon' kasmaya devam ediyordu.",
        authorUsername: "PlazaKusu",
        createdAt: new Date('2026-03-12'),
        status: 'approved',
        authorId: 'system'
      },
      {
        title: "Yanlış Masa, Yanlış Buket",
        content: "Şık bir restoranda adamın biri masaya diz çöktü, cebinden yüzük çıkardı. Yan masadaki kız çığlık atıp \"Evet!\" dedi. Sorun şu ki; adam aslında kendi masasındaki sevgilisine değil, garsona sipariş verirken anahtarlığını düşürmüştü ve onu alıyordu. Kızın o \"Evet\"ten sonraki sessizliği... Ben garsonun yerine istifa edip orayı terk etmek istedim.",
        authorUsername: "KahveSever34",
        createdAt: new Date('2026-03-15'),
        status: 'approved',
        authorId: 'system'
      },
      {
        title: "Uçakta 'Kaptan' Tribi",
        content: "Uçak piste teker koyar koymaz bir abi ayağa kalkıp \"Arkadaşlar panik yapmayın, güvenle indik\" diye anons geçer gibi bağırdı. Hostes nazikçe yerine oturmasını söyleyince \"Ben sivil havacılık mezunuyum\" diye savunma yaptı. Adamın ceketinin cebinde \"Simülatör Sertifikası\" broşürü vardı. Kaptan pilot adına ben terledim.",
        authorUsername: "ModernSeyyah",
        createdAt: new Date('2026-03-18'),
        status: 'approved',
        authorId: 'system'
      },
      {
        title: "Spor Salonunda Klip Çekimi",
        content: "Spor salonunda bir çocuk, ağırlıkların önünde tripod kurmuş, sanki olimpiyatlara hazırlanıyor gibi poz veriyordu. Arkadan geçen teyze \"Yavrum belini incitme, gel şu pazar poşetlerini taşı da güçlen\" dedi. Çocuk videoyu kapatamadı, ben aynaya bakıp yüzümün kızarmasını izledim.",
        authorUsername: "Pilateszede",
        createdAt: new Date('2026-03-20'),
        status: 'approved',
        authorId: 'system'
      },
      {
        title: "İnfluencer'ın Dramı",
        content: "Galata'nın ara sokaklarında bir kız, boş bir duvarın önünde hayali biriyle kavga ediyormuş gibi video çekiyordu. \"Beni asla yıkamazsınız!\" diye bağırırken duvardaki klimadan üzerine su damladı ve kız \"Ay anne üstüm ıslandı\" diye ağlamaya başladı. Yanındaki annesi \"Kızım takipçilerin bekliyor, hadi devam\" dedi. Ben sokaktan kaçarak uzaklaştım.",
        authorUsername: "GalataSakin",
        createdAt: new Date('2026-03-21'),
        status: 'approved',
        authorId: 'system'
      },
      {
        title: "Toplantıda Yanlış Ekran",
        content: "Online toplantıda müdür \"Vizyonumuz çok net\" derken ekran paylaşımını kapatmayı unuttu. O sırada Google'da \"Emeklilikte ne kadar tazminat alırım?\" ve \"İstifa dilekçesi nasıl yazılır (duygusal)\" aramaları kabak gibi çıktı. Kimse bir şey diyemedi, 40 kişi aynı anda öksürerek ekranı kapatmasını bekledik.",
        authorUsername: "BeyazYakaDram",
        createdAt: new Date('2026-03-22'),
        status: 'approved',
        authorId: 'system'
      },
      {
        title: "Yanlış Selam, Büyük Gurur",
        content: "Yolda yürürken bir çocuk karşıdan gelene coşkuyla el salladı. Karşıdaki de karşılık verdi. Tam sarılacaklardı ki, meğer arkadaki başkasına sallıyormuş. Çocuk havada kalan eliyle sanki görünmez bir sineği kovalıyormuş gibi yapıp 360 derece döndü. O anın boşluğunu ben kendi içimde doldurdum, çok ağırdı.",
        authorUsername: "KediBabasi",
        createdAt: new Date('2026-03-23'),
        status: 'approved',
        authorId: 'system'
      },
      {
        title: "Müzede 'Entel' Yorumu",
        content: "Modern sanat müzesinde bir adam, duvardaki yangın söndürme tüpünün önünde durup yanındakine \"Bu eserdeki endüstriyel soğukluk ve varoluşsal kriz beni benden aldı\" dedi. Güvenlik gelip \"Beyefendi o acil durum tüpü, eserler karşı odada\" deyince adam \"İşte bu meta-eleştiri!\" diye üste çıktı. Müze adına ben istifa ettim.",
        authorUsername: "SanatSever",
        createdAt: new Date('2026-03-24'),
        status: 'approved',
        authorId: 'system'
      },
      {
        title: "İlk Randevu ve Gurme Tribi",
        content: "Kahvecide ilk randevuda olan bir çocuk, kıza kahve çekirdeklerinin rakımından ve asiditesinden bahsediyordu. \"Ben sadece 2000 rakım üstü içerim\" dediği an, baristanın \"Sütlü neskafen hazır kardeşim\" sesiyle irkildi. Kızın o andaki \"Vay canına\" bakışı... O süt köpüğü benim boğazımda düğümlendi.",
        authorUsername: "LatteKiz",
        createdAt: new Date('2026-03-25'),
        status: 'approved',
        authorId: 'system'
      },
      {
        title: "Kütüphanede 'Sessiz' Kavga",
        content: "Sessiz kütüphanede bir çift fısıltıyla kavga ediyordu. Çocuk \"Beni dinlemiyorsun!\" diye fısıldarken o kadar hırslandı ki, sinirden masadaki boş su şişesini sıktı. Çıkan o \"çat-çut\" sesi 200 kişilik salonda yankılandı. Herkes onlara baktı, çocuk şişeyi kulağına götürüp \"Alo?\" dedi. Telefon niyetine su şişesi... Ben kitabı kapatıp çıktım.",
        authorUsername: "SinyalYok",
        createdAt: new Date('2026-03-26'),
        status: 'approved',
        authorId: 'system'
      }
    ];

    try {
      for (const data of initialData) {
        await addDoc(collection(db, 'entries'), {
          ...data,
          createdAt: Timestamp.fromDate(data.createdAt),
          cringeScore: 0,
          cringeCount: 0
        });
      }
      setSeedStatus('success');
      setTimeout(() => setSeedStatus('idle'), 3000);
    } catch (error) {
      setSeedStatus('error');
      handleFirestoreError(error, OperationType.WRITE, 'entries');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-12 h-12 border-4 border-bauhaus-ink border-t-bauhaus-red animate-spin" />
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      className="space-y-24 py-10"
    >
      <header className="grid grid-cols-1 md:grid-cols-12 gap-0 border-4 border-bauhaus-ink shadow-[12px_12px_0px_0px_rgba(20,20,20,1)] bg-white">
        <div className="md:col-span-3 bg-bauhaus-yellow p-10 flex items-center justify-center border-b-4 md:border-b-0 md:border-r-4 border-bauhaus-ink">
          <Clock className="w-16 h-16 text-bauhaus-ink" />
        </div>
        <div className="md:col-span-9 p-10 space-y-6">
          <h4 className="text-xs font-black uppercase tracking-[0.5em] text-bauhaus-red">ADMİN.</h4>
          <h1 className="text-5xl md:text-7xl font-display font-black leading-none tracking-tighter uppercase">Moderatör Paneli.</h1>
          <div className="flex flex-wrap gap-4 pt-4">
            <div className="px-6 py-3 bg-bauhaus-ink text-white text-xs font-black uppercase tracking-widest border-2 border-bauhaus-ink">
              {entries.length} BEKLEYEN
            </div>
            <button 
              onClick={seedData}
              disabled={seedStatus === 'loading'}
              className="px-6 py-3 bg-white text-bauhaus-ink text-xs font-black uppercase tracking-widest border-2 border-bauhaus-ink hover:bg-bauhaus-bg transition-colors disabled:opacity-50"
            >
              {seedStatus === 'loading' ? 'Yükleniyor...' : 
               seedStatus === 'success' ? 'BAŞARILI!' :
               seedStatus === 'error' ? 'HATA!' :
               'ÖRNEK VERİLERİ YÜKLE'}
            </button>
          </div>
        </div>
      </header>

      <section className="bg-white border-4 border-bauhaus-ink p-12 space-y-12 shadow-[16px_16px_0px_0px_rgba(0,86,179,1)]">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-end">
          <div className="space-y-4">
            <h2 className="text-5xl font-display font-black tracking-tighter uppercase leading-none">İstatistikler.</h2>
            <p className="text-sm font-black uppercase tracking-widest text-gray-500">Paylaşım Dağılımı ve Sistem Durumu</p>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {stats.map((stat) => (
              <div key={stat.name} className="p-4 border-2 border-bauhaus-ink bg-bauhaus-bg">
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1">{stat.name}</p>
                <p className="text-3xl font-display font-black leading-none">{stat.value}</p>
              </div>
            ))}
          </div>
        </div>
        
        <div className="h-[400px] w-full bg-bauhaus-bg p-8 border-4 border-bauhaus-ink relative">
          <div className="absolute top-4 right-4 flex gap-2">
            <div className="w-3 h-3 bg-bauhaus-red border border-bauhaus-ink" />
            <div className="w-3 h-3 bg-bauhaus-yellow border border-bauhaus-ink" />
            <div className="w-3 h-3 bg-bauhaus-blue border border-bauhaus-ink" />
          </div>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stats} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="0" vertical={false} stroke="#141414" strokeOpacity={0.1} />
              <XAxis 
                dataKey="name" 
                axisLine={{ stroke: '#141414', strokeWidth: 2 }} 
                tickLine={false} 
                tick={{ fontSize: 10, fontWeight: 900, fill: '#141414' }}
                dy={15}
              />
              <YAxis 
                axisLine={{ stroke: '#141414', strokeWidth: 2 }} 
                tickLine={false} 
                tick={{ fontSize: 10, fontWeight: 900, fill: '#141414' }}
              />
              <Tooltip 
                cursor={{ fill: 'rgba(20,20,20,0.05)' }}
                contentStyle={{ 
                  borderRadius: '0', 
                  border: '4px solid #141414',
                  backgroundColor: '#fff',
                  fontSize: '12px',
                  fontWeight: '900',
                  textTransform: 'uppercase',
                  padding: '12px'
                }}
              />
              <Bar dataKey="value" barSize={80}>
                {stats.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} stroke="#141414" strokeWidth={2} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-20">
        <section className="space-y-12">
          <div className="flex items-center gap-6 border-b-8 border-bauhaus-red pb-6">
            <Clock className="w-10 h-10 text-bauhaus-red" />
            <h2 className="text-5xl font-display font-black tracking-tighter uppercase leading-none">Bekleyen Paylaşımlar.</h2>
          </div>
          <AnimatePresence mode="popLayout">
            {entries.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-32 border-8 border-dashed border-bauhaus-ink/10 bg-bauhaus-bg/30"
              >
                <p className="text-bauhaus-ink/30 font-display font-black text-4xl uppercase tracking-tighter">Şu an bekleyen paylaşım yok.</p>
              </motion.div>
            ) : (
              <div className="grid grid-cols-1 gap-12">
                {entries.map((entry) => (
                  <motion.div
                    key={entry.id}
                    layout
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="bg-white border-4 border-bauhaus-ink p-12 space-y-10 shadow-[12px_12px_0px_0px_rgba(20,20,20,1)] relative overflow-hidden"
                  >
                    <div className="absolute top-0 left-0 w-4 h-full bg-bauhaus-yellow" />
                    <div className="flex items-center justify-between border-b-4 border-bauhaus-ink pb-8">
                      <div className="flex items-center gap-6">
                        <span className="text-xs font-black uppercase tracking-widest text-gray-500">
                          {entry.createdAt?.toDate().toLocaleString('tr-TR')}
                        </span>
                        <div className="w-2 h-2 bg-bauhaus-red rounded-full" />
                        <span className="text-xs font-black uppercase tracking-widest text-bauhaus-ink">
                          @{entry.authorUsername}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-6">
                      {entry.title && (
                        <h2 className="text-3xl font-display font-black tracking-tighter uppercase text-bauhaus-red leading-none">
                          {entry.title}.
                        </h2>
                      )}
                      <p className="text-xl font-medium leading-tight text-bauhaus-ink">
                        {entry.content}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6">
                      <button
                        onClick={() => handleStatus(entry.id, 'approved')}
                        className="bauhaus-button bg-emerald-500 text-white flex items-center justify-center gap-3 py-5"
                      >
                        <Check size={24} strokeWidth={3} />
                        ONAYLA
                      </button>
                      <button
                        onClick={() => handleStatus(entry.id, 'rejected')}
                        className="bauhaus-button bg-bauhaus-red text-white flex items-center justify-center gap-3 py-5"
                      >
                        <X size={24} strokeWidth={3} />
                        REDDET
                      </button>
                      <button
                        onClick={() => handleDelete(entry.id)}
                        className="bauhaus-button bg-gray-200 text-gray-500 hover:bg-bauhaus-ink hover:text-white flex items-center justify-center gap-3 py-5"
                      >
                        <Trash2 size={24} strokeWidth={3} />
                        SİL
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </AnimatePresence>
        </section>

        <section className="space-y-12 pt-20 border-t-8 border-bauhaus-ink">
          <div className="flex items-center gap-6 border-b-8 border-bauhaus-blue pb-6">
            <MessageSquare className="w-10 h-10 text-bauhaus-blue" />
            <h2 className="text-5xl font-display font-black tracking-tighter uppercase leading-none">Geri Bildirimler.</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {feedbacks.length === 0 ? (
              <div className="col-span-full text-center py-32 border-8 border-dashed border-bauhaus-ink/10 bg-bauhaus-bg/30">
                <p className="text-bauhaus-ink/30 font-display font-black text-4xl uppercase tracking-tighter">Henüz geri bildirim yok.</p>
              </div>
            ) : (
              feedbacks.map((fb) => (
                <motion.div
                  key={fb.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white border-4 border-bauhaus-ink p-10 space-y-8 shadow-[8px_8px_0px_0px_rgba(0,86,179,1)] relative group"
                >
                  <div className="flex items-center justify-between border-b-2 border-bauhaus-ink/10 pb-6">
                    <div className="flex items-center gap-4">
                      <Mail size={18} className="text-bauhaus-blue" />
                      <span className="text-xs font-black uppercase tracking-widest text-bauhaus-ink truncate max-w-[200px]">
                        {fb.authorEmail}
                      </span>
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                      {fb.createdAt?.toDate().toLocaleDateString('tr-TR')}
                    </span>
                  </div>
                  <p className="text-lg font-medium leading-tight text-bauhaus-ink italic">
                    "{fb.content}"
                  </p>
                  <button
                    onClick={() => handleDeleteFeedback(fb.id)}
                    className="absolute -top-4 -right-4 w-10 h-10 bg-bauhaus-red text-white flex items-center justify-center border-4 border-bauhaus-ink opacity-0 group-hover:opacity-100 transition-all shadow-lg"
                  >
                    <Trash2 size={18} strokeWidth={3} />
                  </button>
                </motion.div>
              ))
            )}
          </div>
        </section>
      </div>
    </motion.div>
  );
}
