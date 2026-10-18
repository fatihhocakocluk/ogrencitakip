// ÖNEMLİ: Firebase Console > Project settings > Your apps > Web app bölümündeki gerçek config değerlerini buraya yapıştırın.
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import * as A from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import * as F from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "BURAYA",
  authDomain: "BURAYA",
  projectId: "BURAYA",
  storageBucket: "BURAYA",
  messagingSenderId: "BURAYA",
  appId: "BURAYA"
};

const app = initializeApp(firebaseConfig);
export const auth = A.getAuth(app);
export const db = F.getFirestore(app);
export { A, F };

// Öğretmen hesabı: bu e-posta ile Firebase'de oluşturulur (şifre kodda tutulmaz).
export const TEACHER_EMAIL = "fatiher45@icloud.com";
export const isTeacher = u => u.email === TEACHER_EMAIL && u.providerData.some(p => p.providerId === "password");
