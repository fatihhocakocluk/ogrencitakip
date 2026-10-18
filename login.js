import { auth, A, isTeacher } from "./fb.js";
import { $ } from "./common.js";

const err = m => $("#err").textContent = m;

document.querySelectorAll(".tab").forEach(b => b.onclick = () => {
  document.querySelectorAll(".tab").forEach(x => x.classList.toggle("on", x === b));
  $("#tf").hidden = b.dataset.t !== "t";
  $("#vf").hidden = b.dataset.t !== "v";
  err("");
});

// Zaten giriş yapılmışsa rolüne göre yönlendir
A.onAuthStateChanged(auth, u => { if (u) location.replace(isTeacher(u) ? "teacher.html" : "parent.html"); });

$("#tf").onsubmit = async e => {
  e.preventDefault(); err("");
  try {
    await A.signInWithEmailAndPassword(auth, $("#u").value.trim().toLowerCase(), $("#p").value);
  } catch { err("E-posta veya şifre hatalı."); }
};

$("#g").onclick = async () => {
  err("");
  try { await A.signInWithPopup(auth, new A.GoogleAuthProvider()); }
  catch { err("Google girişi tamamlanamadı. Tekrar deneyin."); }
};
