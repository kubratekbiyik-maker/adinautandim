import React from 'react';

export interface BlogPost {
  id: number;
  category: string;
  title: string;
  readTime: string;
  teaser: string;
  content: React.ReactNode;
  color: string;
}

export const blogPosts: BlogPost[] = [
  {
    id: 1,
    category: "Psikolojik Derinlik",
    title: "İkinci El Utanç: Neden O Rezil Oldu da Yüzü Senin Kızardı?",
    readTime: "3 Dakika",
    teaser: "Başkası adına utanmak, aslında çok gelişmiş bir empatinin yan ürünüdür. Beynimiz, o an o kişinin yaşadığı sosyal riski algılıyor ve bizi korumak için alarm veriyor.",
    content: (
      <div className="space-y-6">
        <p>
          Hiç başınıza geldi mi? Toplu taşımada birisi telefonla son ses, tüm vagona özel hayatını anlatıyor. O an, 
          o kişinin yerinde olmak istemeyeceğiniz kadar garip bir duygu içinizi kaplıyor. Onun değil, sizin
          yüzünüz kızarıyor, bakışlarınızı kaçıracak yer arıyorsunuz. Psikologlar buna <strong>"ikinci el utanç"</strong> (vicarious 
          embarrassment / cringe) diyor.
        </p>
        <p>
          Bu, aslında çok gelişmiş bir empatinin yan ürünü. Beynimiz, o an o kişinin yaşadığı (ya da yaşaması 
          gereken) sosyal riski algılıyor ve bizi korumak için alarm veriyor. Yani aslında, başkası adına utanmak, 
          sizin hala bir sosyal vicdana ve toplumsal bir sağduyuya sahip olduğunuzun kanıtı.
        </p>
        <p>
          Biz bu sitede, o anın yükünü tek başına taşımanızı istemiyoruz. Yazın, paylaşın, beraber kızaralım ve o 
          tuhaf anı üzerimizden atıp hayatımıza devam edelim.
        </p>
      </div>
    ),
    color: "bg-bauhaus-red"
  },
  {
    id: 2,
    category: "Toplumsal Farkındalık & Oyunun Kuralları",
    title: "Linç Değil, Terapi: Neden Bireyleri Değil, Davranışları Konuşuyoruz?",
    readTime: "2 Dakika",
    teaser: "Sitemizde isimler, adresler veya kişisel bilgiler yasak. Biz bireyleri hedef tahtasına oturtmuyoruz; o bireyin o anki davranışını tartışıyoruz.",
    content: (
      <div className="space-y-6">
        <p>
          "Senin Adına Utandım" platformunu kurarken tek bir amacımız vardı: Toplumu düzeltmek değil, o anki 
          absürtlüğün fotoğrafını çekmek. Bu yüzden, sitemizde isimler, adresler veya kişisel bilgiler yasak. Biz 
          bireyleri hedef tahtasına oturtmuyoruz; o bireyin o anki <strong>davranışını</strong> tartışıyoruz.
        </p>
        <p>
          Modern dünyada utanç duygusu zayıfladıkça, kaba ve yanlış davranışlar normalleşiyor. Aynayı 
          suratlara tutmak istiyoruz ancak o aynayı kırmak niyetinde değiliz. Eğer bir gün burada kendinizi 
          okursanız, darılmayın. Hepimiz bazen başkalarını utandıracak kadar garip davranabiliriz.
        </p>
        <p>
          Buradaki moderasyonun amacı da bu: Linç gürültüsünü, zekice bir eleştiriden ayırmak. Kaliteli, 
          anonim ve güvenli bir utanç terapisi alanı yaratmak için buradayız.
        </p>
      </div>
    ),
    color: "bg-bauhaus-yellow"
  },
  {
    id: 3,
    category: "Araştırma Odaklı",
    title: "\"Cringe\" Haritası: Başkası Adına Utanç Yaratan En Yaygın Sosyal Suçlar (Fiktif Bir Araştırma)",
    readTime: "4 Dakika",
    teaser: "Platformumuzun laboratuvar ekibi, sitenin açılışından bu yana biriken verileri analiz etti. İşte modern insanın en çok hangi durumlarda yerin dibine girmek istediğinin haritası.",
    content: (
      <div className="space-y-8">
        <p>
          Platformumuzun laboratuvar ekibi (yani biz), sitenin açılışından bu yana biriken entry'leri ve kullanıcı 
          oylarını ("Kızarma Butonu" verilerini) analiz etti. Ortaya çıkan tablo, modern insanın en çok hangi 
          durumlarda "yerin dibine girmek" istediğini net bir şekilde gösteriyor. İşte, literatüre kazandırdığımız 
          en yaygın kategoriler:
        </p>

        <div className="space-y-6 border-l-4 border-bauhaus-blue pl-6">
          <h4 className="font-bold uppercase tracking-wider">Kategori 1: Dijital Kasıntı & "Plazakusu" Global Vizyon</h4>
          <ul className="list-disc list-inside space-y-2 text-sm">
            <li><strong>İstatistik:</strong> Toplam entry'lerin %35'i bu kategoriye giriyor.</li>
            <li><strong>Tespit:</strong> Metroda, kafede veya online toplantıda, yanındaki kişinin telefonuyla konuşurken takındığı o "global vizyon" takıntısı.</li>
            <li><strong>Örnek:</strong> CEO ile akrabalık denemesi yapan genç veya toplantıda "Vizyonumuz net" derken "İstifa dilekçesi nasıl yazılır" araması yapan müdür.</li>
          </ul>
        </div>

        <div className="space-y-6 border-l-4 border-bauhaus-red pl-6">
          <h4 className="font-bold uppercase tracking-wider">Kategori 2: Romantik Fiyaskolar ve Yanlış Masa Terapisi</h4>
          <ul className="list-disc list-inside space-y-2 text-sm">
            <li><strong>İstatistik:</strong> Entry'lerin %25'ini oluşturuyor.</li>
            <li><strong>Tespit:</strong> Toplum önünde yapılan, aşırı dramatik veya yanlış anlaşılan romantik jestler.</li>
            <li><strong>Örnek:</strong> Yan masadaki kızın "Evet!" diye bağırdığı ama adamın aslında sipariş verirken anahtarlığını düşürdüğü o an.</li>
          </ul>
        </div>

        <div className="space-y-6 border-l-4 border-bauhaus-yellow pl-6">
          <h4 className="font-bold uppercase tracking-wider">Kategori 3: Entel Tribi ve "Sivil Havacılık" Vakaları</h4>
          <ul className="list-disc list-inside space-y-2 text-sm">
            <li><strong>İstatistik:</strong> %20'lik bir paya sahip.</li>
            <li><strong>Tespit:</strong> Bir konuda uzmanmış gibi davranıp, aslında hiçbir şey bilmediğinin saniyeler içinde ortaya çıkması.</li>
            <li><strong>Örnek:</strong> Uçakta "Kaptan tribi" atan simülatör sertifikalı abi veya müzede yangın söndürme tüpüne "meta-eleştiri" yapan entel.</li>
          </ul>
        </div>

        <div className="space-y-6 border-l-4 border-bauhaus-ink pl-6">
          <h4 className="font-bold uppercase tracking-wider">Kategori 4: "Mikro-Utançlar" (Hala İnsan mıyız?)</h4>
          <ul className="list-disc list-inside space-y-2 text-sm">
            <li><strong>İstatistik:</strong> Kalan %20.</li>
            <li><strong>Tespit:</strong> Günlük hayattaki o küçük, absürt ama yıkıcı anlar.</li>
            <li><strong>Örnek:</strong> Kütüphanede "sessiz" kavga edip su şişesini telefon niyetine kullanan çift.</li>
          </ul>
        </div>

        <p className="font-bold italic pt-4">
          Sonuç Olarak: Araştırmamız gösteriyor ki; en yaygın utanç konuları, yapaylık, aşırı gurur ve sosyal 
          normların absürt bir şekilde çiğnenmesi üzerine kurulu. Bu veriler, sitenin "farkındalık yaratma" 
          misyonunu destekliyor.
        </p>
      </div>
    ),
    color: "bg-bauhaus-blue"
  }
];
