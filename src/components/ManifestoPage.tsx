import React from 'react';
import { motion } from 'motion/react';
import { Logo } from '../App';

export default function ManifestoPage() {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="max-w-5xl mx-auto space-y-32 py-10"
    >
      <header className="grid grid-cols-1 md:grid-cols-12 gap-0 border-4 border-bauhaus-ink shadow-[16px_16px_0px_0px_rgba(20,20,20,1)] bg-white">
        <div className="md:col-span-4 bg-bauhaus-red p-12 flex items-center justify-center border-b-4 md:border-b-0 md:border-r-4 border-bauhaus-ink">
          <Logo size="lg" className="text-white" />
        </div>
        <div className="md:col-span-8 p-12 space-y-6">
          <h4 className="text-xs font-black uppercase tracking-[0.5em] text-bauhaus-red">MANİFESTO.</h4>
          <h1 className="text-5xl md:text-7xl font-display font-black leading-none tracking-tighter">
            ADINA UTANDIM: <br /> BİR KAMU HİZMETİ.
          </h1>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
        <section className="space-y-8 border-t-8 border-bauhaus-yellow pt-10">
          <h2 className="text-4xl font-display font-black tracking-tighter uppercase">Mesele Nedir?</h2>
          <p className="text-xl font-medium leading-tight text-gray-700">
            Bir kafede, toplu taşımada veya ofiste birine şahit olursun; öyle bir şey yapar ki, o değil ama sen yerin dibine girersin. 
            İşte biz o "ikinci el utanç" (cringe) dediğimiz, insanın içini gıcıklayan o hissin dijital sığınağıyız. 
            Kimsenin doğrusu kimseden üstün değil ama kabul edelim; bazı anlar gerçekten "yok artık" dedirtiyor.
          </p>
        </section>

        <section className="space-y-8 border-t-8 border-bauhaus-blue pt-10">
          <h2 className="text-4xl font-display font-black tracking-tighter uppercase">Neden Buradayız?</h2>
          <p className="text-xl font-medium leading-tight text-gray-700">
            Toplumu düzeltmeye falan gelmedik, o kadar vaktimiz yok. Sadece o anki o tuhaf yükü tek başına taşıma istedik. 
            Paylaşalım, beraber "hadi canım" diyelim ve üzerimizden atıp hayatımıza devam edelim. 
            Kızarmak güzeldir; insanın hala bir kalbi (ve biraz da sağduyusu) olduğunu hatırlatır.
          </p>
        </section>

        <section className="md:col-span-2 space-y-12 bg-bauhaus-ink text-white p-16 border-4 border-bauhaus-ink">
          <h2 className="text-5xl font-display font-black tracking-tighter uppercase text-bauhaus-yellow">Oyunun Kuralları</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="space-y-4">
              <div className="w-8 h-8 bg-bauhaus-red" />
              <h3 className="text-lg font-black uppercase tracking-widest">Anonimlik Esastır</h3>
              <p className="text-sm font-medium text-gray-400 leading-relaxed">
                Kimse kimsenin peşine düşmesin diye buradayız. İsimler bizde kalsın, biz sadece olaya odaklanalım.
              </p>
            </div>

            <div className="space-y-4">
              <div className="w-8 h-8 bg-bauhaus-yellow" />
              <h3 className="text-lg font-black uppercase tracking-widest">Minimalizm Candır</h3>
              <p className="text-sm font-medium text-gray-400 leading-relaxed">
                Kimseyi yormak istemiyoruz. Sadece bir başlık ve "yok artık" dedirten o anı paylaşıyoruz.
              </p>
            </div>

            <div className="space-y-4">
              <div className="w-8 h-8 bg-bauhaus-blue" />
              <h3 className="text-lg font-black uppercase tracking-widest">Adminin Rolü</h3>
              <p className="text-sm font-medium text-gray-400 leading-relaxed">
                Admin burada bir "yargıç" değil, sadece "vibe check" yapan bir moderatör. 
                Amacımız linç değil, kaliteli ve zekice bir eğlence.
              </p>
            </div>
          </div>
        </section>

        <section className="md:col-span-2 space-y-8 border-l-8 border-bauhaus-yellow pl-12 py-12">
          <h2 className="text-4xl font-display font-black tracking-tighter uppercase">Sonuç Olarak</h2>
          <p className="text-2xl font-medium leading-tight text-bauhaus-ink max-w-3xl">
            Bireyleri hedef tahtasına oturtmuyoruz; o anki absürtlüğün fotoğrafını çekiyoruz. 
            Eğer bir gün burada kendini okursan, darılma. Hepimiz bazen başkalarını utandıracak kadar garip davranabiliriz.
          </p>
        </section>

        <footer className="md:col-span-2 text-center pt-10">
          <p className="text-6xl font-display font-black tracking-tighter text-bauhaus-red uppercase">GEL, BERABER UTANALIM.</p>
        </footer>
      </div>
    </motion.div>
  );
}
