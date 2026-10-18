export const $ = (s, r = document) => r.querySelector(s);
export const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

// Öğrenci belge kimliği: addan türetilir ("Ahmet Yılmaz" -> "ahmet-yilmaz"). Veli adı yazınca aynı kimlik üretilir.
export const slug = n => n.trim().toLocaleLowerCase("tr")
  .replace(/ı/g, "i").replace(/ş/g, "s").replace(/ğ/g, "g").replace(/ü/g, "u").replace(/ö/g, "o").replace(/ç/g, "c")
  .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export const GRADES = ["5. Sınıf", "6. Sınıf", "7. Sınıf", "8. Sınıf", "9. Sınıf", "10. Sınıf", "11. Sınıf", "12. Sınıf", "Mezun"];

export const NET_FIELDS = [
  ["tyt_tr", "TYT Türkçe"], ["tyt_sos", "TYT Sosyal"], ["tyt_mat", "TYT Matematik"], ["tyt_fen", "TYT Fen"],
  ["ayt_mat", "AYT Matematik"], ["ayt_fiz", "AYT Fizik"], ["ayt_kim", "AYT Kimya"], ["ayt_biy", "AYT Biyoloji"],
  ["ayt_edb", "AYT Edebiyat"], ["ayt_tar", "AYT Tarih"], ["ayt_cog", "AYT Coğrafya"]
];
const fd = s => (s ? s.split("-").reverse().join(".") : "");
const nets = r => NET_FIELDS.filter(([k]) => typeof r[k] === "number")
  .map(([k, l]) => `${l.replace(/^(TYT|AYT) /, "")}: ${r[k]}`).join(", ");
const total = r => NET_FIELDS.reduce((t, [k]) => t + (typeof r[k] === "number" ? r[k] : 0), 0);

// Kayıt türleri: form alanları + tablo başlıkları/satırları (arayüz ve PDF aynı tanımı kullanır)
export const CFG = {
  lessons: {
    title: "Dersler ve Konular",
    fields: [
      { k: "bolum", l: "Bölüm", t: "select", o: ["TYT", "AYT", "Okul"] },
      { k: "ders", l: "Ders", req: 1 },
      { k: "konu", l: "Konu", req: 1 },
      { k: "durum", l: "Durum", t: "select", o: ["Başlanmadı", "Devam ediyor", "Tamamlandı"] },
      { k: "not", l: "Not" }
    ],
    head: ["Bölüm", "Ders", "Konu", "Durum", "Not"],
    row: r => [r.bolum, r.ders, r.konu, r.durum, r.not]
  },
  exams: {
    title: "Deneme Takibi",
    fields: [
      { k: "tarih", l: "Tarih", t: "date", req: 1 },
      { k: "ad", l: "Deneme adı", req: 1 },
      { k: "tur", l: "Tür", t: "select", o: ["TYT", "AYT"] },
      ...NET_FIELDS.map(([k, l]) => ({ k, l: l + " neti", t: "number" }))
    ],
    head: ["Tarih", "Deneme", "Tür", "Netler", "Toplam net"],
    row: r => [fd(r.tarih), r.ad, r.tur, nets(r), total(r)]
  },
  books: {
    title: "Okunan Kitaplar",
    fields: [
      { k: "kitap", l: "Kitap", req: 1 },
      { k: "yazar", l: "Yazar" },
      { k: "durum", l: "Durum", t: "select", o: ["Okuyor", "Bitirdi"] },
      { k: "tarih", l: "Tarih", t: "date" }
    ],
    head: ["Kitap", "Yazar", "Durum", "Tarih"],
    row: r => [r.kitap, r.yazar, r.durum, fd(r.tarih)]
  }
};
