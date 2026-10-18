# Öğrenci Takip Sitesi — klasörsüz GitHub sürümü

Bu sürümde HTML, CSS ve JavaScript dosyalarının tamamı depo ana dizinindedir. Dosyaları tek tek GitHub'a yüklerken klasör oluşturman gerekmez.

## Dosyalar
- index.html
- teacher.html
- parent.html
- style.css
- fb.js
- login.js
- common.js
- teacher.js
- parent.js
- records.js
- report.js
- studentview.js
- firebase.json
- firestore.rules

## Firebase kurulumu
1. `fb.js` dosyasını aç ve Firebase Console > Project settings > General > Your apps > Web app bölümündeki gerçek `firebaseConfig` değerlerini `BURAYA` alanlarına yaz.
2. Authentication > Sign-in method bölümünde Email/Password ve Google yöntemlerini etkinleştir.
3. Authentication > Settings > Authorized domains bölümüne kendi GitHub Pages alan adını ekle.
4. Authentication > Users bölümünde öğretmen e-postası için hesap oluştur.
5. Firestore Database oluştur ve `firestore.rules` içeriğini Rules sekmesine koyup Publish/Yayınla'ya bas.

## GitHub Pages
Settings > Pages > Deploy from a branch > main > /(root) seç.
