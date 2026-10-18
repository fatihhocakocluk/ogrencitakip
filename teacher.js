import { auth, db, A, F, isTeacher } from "./fb.js";
import { $, esc, slug, GRADES } from "./common.js";
import { mountStudent } from "./studentview.js";

let students = [], cur = null, stop = () => {};

A.onAuthStateChanged(auth, u => {
  if (!u || !isTeacher(u)) return location.replace("index.html");
  init();
});
$("#out").onclick = () => A.signOut(auth).then(() => location.replace("index.html"));

function init() {
  $("#grade").innerHTML = GRADES.map(g => `<option>${g}</option>`).join("");

  $("#add").onsubmit = async e => {
    e.preventDefault();
    const name = $("#nm").value.trim().replace(/\s+/g, " "), id = slug(name);
    if (!id) return;
    const r = F.doc(db, "students", id);
    if ((await F.getDoc(r)).exists())
      return alert('Bu isimde bir dosya zaten var. İki öğrenciyi ayırmak için isme şube ekleyin (örn. "Ahmet Yılmaz 12A").');
    await F.setDoc(r, { name, grade: $("#grade").value, archived: false, createdAt: F.serverTimestamp() });
    e.target.reset();
    open(id);
  };

  $("#q").oninput = $("#arch").onchange = render;
  $("#list").onclick = e => { const b = e.target.closest("button"); if (b) open(b.dataset.id); };

  F.onSnapshot(F.query(F.collection(db, "students"), F.orderBy("name")), s => {
    students = s.docs.map(d => ({ id: d.id, ...d.data() }));
    render();
    if (cur) head();
  });
}

function render() {
  const q = $("#q").value.trim().toLocaleLowerCase("tr"), all = $("#arch").checked;
  $("#list").innerHTML = students
    .filter(s => (all || !s.archived) && s.name.toLocaleLowerCase("tr").includes(q))
    .map(s => `<button data-id="${s.id}" class="${s.id === cur ? "on" : ""}">${esc(s.name)}<small>${esc(s.grade)}${s.archived ? " · arşiv" : ""}</small></button>`)
    .join("") || '<p class="mut">Öğrenci yok.</p>';
}

function head() {
  const s = students.find(x => x.id === cur);
  if (!s) return;
  $("#hd").innerHTML = `<div class="row" style="justify-content:space-between;align-items:center;margin-bottom:12px">
    <div><h3 style="margin:0">${esc(s.name)}</h3><span class="mut">${esc(s.grade)}${s.archived ? " · arşivde" : ""}</span></div>
    <button class="btn" id="ar" style="margin:0">${s.archived ? "Arşivden çıkar" : "Arşivle"}</button></div>`;
  $("#ar").onclick = () => F.updateDoc(F.doc(db, "students", cur), { archived: !s.archived });
}

// Not: öğrenci dosyaları silinmez, yalnızca arşivlenir.
function open(id) {
  stop();
  cur = id;
  head();
  render();
  stop = mountStudent($("#main"), id, students.find(x => x.id === id), "ogretmen");
}
