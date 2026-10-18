import { db, F } from "./fb.js";
import { $, esc, CFG } from "./common.js";

const field = f => {
  let c;
  if (f.t === "select") c = `<select name="${f.k}">${f.o.map(o => `<option>${o}</option>`).join("")}</select>`;
  else c = `<input name="${f.k}" type="${f.t || "text"}" ${f.t === "number" ? 'step="0.25"' : ""} ${f.req ? "required" : ""}>`;
  return `<label>${f.l}${c}</label>`;
};

// Kayıt listesi (ders/deneme/kitap). Öğretmen ekleyip silebilir, veli sadece görür.
export function mountCollection(host, sid, col, canEdit) {
  const c = CFG[col], ref = F.collection(db, "students", sid, col);
  host.innerHTML = `<h3>${c.title}</h3>
    ${canEdit ? `<form class="grid">${c.fields.map(field).join("")}<button class="btn">Ekle</button></form>` : ""}
    <div class="tw"><table><thead><tr>${c.head.map(h => `<th>${h}</th>`).join("")}${canEdit ? "<th></th>" : ""}</tr></thead><tbody></tbody></table></div>`;
  const tb = $("tbody", host);
  if (canEdit) {
    $("form", host).onsubmit = async e => {
      e.preventDefault();
      const f = e.target, d = {};
      c.fields.forEach(x => {
        const v = f.elements[x.k].value.trim();
        if (v === "") return;
        if (x.t === "number") { const n = parseFloat(v.replace(",", ".")); if (!isNaN(n)) d[x.k] = n; }
        else d[x.k] = v;
      });
      await F.addDoc(ref, { ...d, createdAt: F.serverTimestamp() });
      f.reset();
    };
    tb.onclick = async e => {
      const id = e.target.dataset.id;
      if (id && confirm("Bu kayıt silinsin mi?")) await F.deleteDoc(F.doc(ref, id));
    };
  }
  return F.onSnapshot(F.query(ref, F.orderBy("createdAt", "desc")), s => {
    tb.innerHTML = s.docs.map(d => `<tr>${c.row(d.data()).map(v => `<td>${esc(v)}</td>`).join("")}${canEdit ? `<td><button class="x" data-id="${d.id}">Sil</button></td>` : ""}</tr>`).join("")
      || `<tr><td colspan="9" class="mut">Henüz kayıt yok.</td></tr>`;
  });
}

// Veli - öğretmen mesajlaşması
export function mountChat(host, sid, role) {
  const ref = F.collection(db, "students", sid, "messages");
  host.innerHTML = `<h3>Mesajlar</h3><div class="chat"></div>
    <form class="row"><input placeholder="Mesajınızı yazın" required><button class="btn">Gönder</button></form>`;
  const box = $(".chat", host);
  $("form", host).onsubmit = async e => {
    e.preventDefault();
    const i = e.target.querySelector("input");
    await F.addDoc(ref, { from: role, text: i.value.trim(), createdAt: F.serverTimestamp() });
    i.value = "";
  };
  return F.onSnapshot(F.query(ref, F.orderBy("createdAt", "asc")), s => {
    box.innerHTML = s.docs.map(d => {
      const m = d.data(), t = m.createdAt?.toDate?.().toLocaleString("tr-TR") || "";
      return `<div class="msg ${m.from === role ? "me" : ""}"><b>${m.from === "ogretmen" ? "Hoca" : "Veli"}</b> <small class="mut">${t}</small><p>${esc(m.text)}</p></div>`;
    }).join("") || '<p class="mut">Henüz mesaj yok.</p>';
    box.scrollTop = box.scrollHeight;
  });
}
