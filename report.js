import { db, F } from "./fb.js";
import { $, esc, CFG } from "./common.js";

const tbl = (c, rows) => rows.length
  ? `<table><thead><tr>${CFG[c].head.map(h => `<th>${h}</th>`).join("")}</tr></thead><tbody>${rows.map(r => `<tr>${CFG[c].row(r).map(v => `<td>${esc(v)}</td>`).join("")}</tr>`).join("")}</tbody></table>`
  : '<p class="mut">Kayıt yok.</p>';

async function loadAll(sid) {
  const out = {};
  for (const c of ["lessons", "exams", "books"]) {
    const s = await F.getDocs(F.query(F.collection(db, "students", sid, c), F.orderBy("createdAt", "asc")));
    out[c] = s.docs.map(d => d.data());
  }
  return out;
}

const html = (st, d, comment, date) => `<div class="rpt">
  <h1>Öğrenci Gelişim Raporu</h1>
  <p><b>${esc(st.name)}</b> — ${esc(st.grade)} — ${date}</p>
  <h2>Dersler ve Konular</h2>${tbl("lessons", d.lessons)}
  <h2>Deneme Takibi</h2>${tbl("exams", d.exams)}
  <h2>Okunan Kitaplar</h2>${tbl("books", d.books)}
  <h2>Hoca Yorumu</h2><p>${esc(comment || "—").replace(/\n/g, "<br>")}</p></div>`;

// Raporu bilgisayara PDF olarak indirir
async function pdf(st, d, comment, date) {
  const w = document.createElement("div");
  w.style.cssText = "position:fixed;left:-10000px;top:0;width:760px;background:#fff";
  w.innerHTML = html(st, d, comment, date);
  document.body.append(w);
  try {
    await window.html2pdf().set({
      margin: 10,
      filename: `${st.name} - rapor - ${date.replace(/\./g, "-")}.pdf`,
      image: { type: "jpeg", quality: 0.95 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: "mm", format: "a4" },
      pagebreak: { mode: ["css", "legacy"], avoid: ["tr", "h2"] }
    }).from(w).save();
  } finally { w.remove(); }
}

export function mountReport(host, sid, st, teacher) {
  const ref = F.collection(db, "students", sid, "reports"), today = () => new Date().toLocaleDateString("tr-TR");
  let reports = [];
  host.innerHTML = `<h3>${teacher ? "Veli raporu" : "Raporlar"}</h3>
    ${teacher ? `<label>Hocanın yorumu<textarea id="cm" rows="6" placeholder="Öğrenci hakkındaki yorumunuz veli raporunda görünür"></textarea></label>
    <button id="mk" class="btn">Raporun PDF'ini oluştur</button>` : ""}
    <h4 style="margin-top:20px">Kayıtlı raporlar</h4><div id="rl"></div>`;

  if (teacher) $("#mk", host).onclick = async e => {
    const b = e.target, cm = $("#cm", host), c = cm.value.trim();
    b.disabled = true; b.textContent = "Hazırlanıyor...";
    try {
      const d = await loadAll(sid);
      if (c) await F.addDoc(ref, { comment: c, dateText: today(), createdAt: F.serverTimestamp() });
      await pdf(st, d, c, today());
      cm.value = "";
    } catch (x) { alert("Rapor oluşturulamadı: " + x.message); }
    b.disabled = false; b.textContent = "Raporun PDF'ini oluştur";
  };

  $("#rl", host).onclick = async e => {
    const i = e.target.dataset.i; if (i === undefined) return;
    e.target.disabled = true;
    try { await pdf(st, await loadAll(sid), reports[i].comment, reports[i].dateText); } catch (x) { alert(x.message); }
    e.target.disabled = false;
  };

  return F.onSnapshot(F.query(ref, F.orderBy("createdAt", "desc")), s => {
    reports = s.docs.map(d => d.data());
    $("#rl", host).innerHTML = reports.map((r, i) => `<div class="rc"><b>${esc(r.dateText)}</b>
      <p>${esc(r.comment).replace(/\n/g, "<br>")}</p><button class="btn" data-i="${i}">PDF indir</button></div>`).join("")
      || '<p class="mut">Henüz kayıtlı rapor yok.</p>';
  });
}
