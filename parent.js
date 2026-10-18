import { auth, db, A, F } from "./fb.js";
import { $, esc, slug } from "./common.js";
import { mountStudent } from "./studentview.js";

let kids = [], cur = null, stop = () => {};

A.onAuthStateChanged(auth, u => {
  // Giriş yok veya öğretmen hesabı ise giriş sayfasına dön
  if (!u || u.providerData.some(p => p.providerId === "password")) return location.replace("index.html");
  init(u);
});
$("#out").onclick = () => A.signOut(auth).then(() => location.replace("index.html"));

function init(u) {
  $("#who").textContent = u.displayName || u.email;

  $("#link").onsubmit = async e => {
    e.preventDefault();
    const id = slug($("#cn").value), msg = $("#msg");
    if (!id) return;
    msg.textContent = "";
    try {
      await F.setDoc(F.doc(db, "links", u.uid + "_" + id), { uid: u.uid, studentId: id, createdAt: F.serverTimestamp() });
      $("#cn").value = "";
    } catch {
      msg.textContent = "Bu isimde bir öğrenci bulunamadı. Adı ve soyadı hocanın kaydettiği şekilde yazın.";
    }
  };

  $("#kids").onclick = e => { const b = e.target.closest("button"); if (b) open(b.dataset.id); };

  F.onSnapshot(F.query(F.collection(db, "links"), F.where("uid", "==", u.uid)), async s => {
    const list = [];
    for (const d of s.docs) {
      const st = await F.getDoc(F.doc(db, "students", d.data().studentId));
      if (st.exists()) list.push({ id: st.id, ...st.data() });
    }
    kids = list;
    $("#kids").innerHTML = kids.map(k => `<button data-id="${k.id}" class="${k.id === cur ? "on" : ""}">${esc(k.name)}<small>${esc(k.grade)}</small></button>`).join("")
      || '<p class="mut">Henüz çocuk eklenmedi.</p>';
    if (!cur && kids.length) open(kids[0].id);
  });
}

function open(id) {
  stop();
  cur = id;
  const k = kids.find(x => x.id === id);
  $("#hd").innerHTML = `<h3>${esc(k.name)}</h3><p class="mut">${esc(k.grade)}</p>`;
  document.querySelectorAll("#kids button").forEach(b => b.classList.toggle("on", b.dataset.id === id));
  stop = mountStudent($("#main"), id, k, "veli");
}
