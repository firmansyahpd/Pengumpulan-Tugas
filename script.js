
"use strict";

// ========================================
// DATA & PENGATURAN
// ========================================
const KEY="kuliahku_white_lime_v1";
const SESSION_KEY="kuliahku_user_v1";
const $=id=>document.getElementById(id);
const id=()=>crypto.randomUUID();
const now=()=>new Date().toISOString();
const day=n=>{
  let d=new Date();
  d.setDate(d.getDate()+n);
  return d.toISOString().slice(0,10);
};
const safe=s=>String(s??"").replace(/[&<>"']/g,c=>({
  "&":"&amp;","<":"&lt;",">":"&gt;",
  '"':"&quot;","'":"&#39;"
}[c]));
const formatDate=s=>s?new Date(s).toLocaleDateString(
  "id-ID",{day:"numeric",month:"long",year:"numeric"}):"-";

const initial={
  users:[],
  courses:[
    {id:"c1",code:"IF301",name:"Pemrograman Web",lecturer:"Dr. Budi Santoso",semester:5},
    {id:"c2",code:"IF302",name:"Basis Data",lecturer:"Siti Rahma, M.Kom.",semester:5},
    {id:"c3",code:"IF303",name:"Rekayasa Perangkat Lunak",lecturer:"Ahmad Fauzi, M.Kom.",semester:5}
  ],
  materials:[
    {id:"m1",courseId:"c1",title:"Pengenalan HTML",description:"Dasar HTML dan struktur halaman web.",category:"Modul",meeting:1,public:true,url:"https://developer.mozilla.org/en-US/docs/Web/HTML",fileName:"",fileData:"",author:"Tim Akademik",updatedAt:now()},
    {id:"m2",courseId:"c2",title:"Konsep Database",description:"Relasi, tabel, primary key dan foreign key.",category:"Referensi",meeting:1,public:true,url:"https://www.postgresql.org/docs/",fileName:"",fileData:"",author:"Tim Akademik",updatedAt:now()}
  ],
  tasks:[
    {id:"t1",courseId:"c1",title:"Membuat Landing Page",description:"Buat landing page responsif menggunakan HTML dan CSS.",deadline:day(2),status:"Belum Dikerjakan"},
    {id:"t2",courseId:"c2",title:"Normalisasi Database",description:"Normalisasi studi kasus hingga 3NF.",deadline:day(6),status:"Sedang Dikerjakan"}
  ],
  announcements:[
    {id:"a1",title:"Informasi Perkuliahan",category:"Akademik",content:"Pastikan Anda memeriksa informasi kuliah dan tugas secara berkala.",date:day(0),important:true}
  ]
};

let db;
try{
  db=JSON.parse(localStorage.getItem(KEY))||structuredClone(initial);
}catch{
  db=structuredClone(initial);
}
let userId=localStorage.getItem(SESSION_KEY);
let page="home",search="",filter="all";
const user=()=>db.users.find(x=>x.id===userId);
const logged=()=>!!user();
const course=x=>db.courses.find(c=>c.id===x);
const cn=x=>course(x)?.name||"Mata kuliah tidak ditemukan";

function save(){
  try{
    localStorage.setItem(KEY,JSON.stringify(db));
    return true;
  }catch(e){
    alert("Penyimpanan penuh. Kurangi ukuran file.");
    return false;
  }
}
function toast(s){
  $("toastRoot").innerHTML=`<div class="toast">${safe(s)}</div>`;
  setTimeout(()=>$("toastRoot").innerHTML="",3000);
}
function go(p){
  page=p;
  search="";
  filter="all";
  $("navlinks").classList.remove("open");
  render();
  window.scrollTo({top:0,behavior:"smooth"});
}
function needLogin(){
  if(logged())return true;
  toast("Silakan login untuk mengelola konten.");
  go("login");
  return false;
}
function head(title,desc,actions=""){
  return `<div class="section-heading">
    <div><h2>${title}</h2><p>${desc}</p></div>${actions}
  </div>`;
}
function button(label,action,cls=""){
  return `<button class="btn ${cls}" onclick="${action}">${label}</button>`;
}
function courseOptions(selected=""){
  return db.courses.map(c=>`
    <option value="${safe(c.id)}" ${selected===c.id?"selected":""}>
      ${safe(c.name)}
    </option>`).join("");
}
function adminButtons(type,item){
  if(!logged())return "";
  return `${button("Edit",`openEditor('${type}','${item}')`,"outline small")}
    ${button("Hapus",`removeItem('${type}','${item}')`,"danger small")}`;
}
function renderNav(){
  $("navActions").innerHTML=logged()
    ?`${button(safe(user().name.split(" ")[0]),"go('profile')","outline small")}
      ${button("Keluar","logout()","small")}`
    :`${button("Masuk","go('login')","small")}`;
  $("profileNav").style.display=logged()?"":"none";
}
function render(){
  renderNav();
  ({
    home:homePage,
    courses:coursesPage,
    materials:materialsPage,
    tasks:tasksPage,
    announcements:announcementsPage,
    profile:profilePage,
    login:loginPage,
    register:registerPage
  }[page]||homePage)();
}

// ========================================
// BERANDA
// ========================================
function homePage(){
  let recent=[...db.materials]
    .filter(m=>m.public||logged())
    .slice(-3).reverse();

  let latest=[...db.tasks]
    .sort((a,b)=>a.deadline.localeCompare(b.deadline))
    .slice(0,3);

  $("content").innerHTML=`
  <section class="container hero">
    <div class="hero-copy">
      <div class="eyebrow">THE NEXT GENERATION ACADEMIC PLATFORM</div>
      <h1>Your Campus.<br>Your <span class="marker">Knowledge.</span></h1>
      <p>KULIAHKU adalah ruang digital mahasiswa untuk berbagi materi perkuliahan, mengelola tugas, memantau deadline, dan mendapatkan informasi akademik dalam satu tempat.</p>
      <div class="hero-buttons">
        ${button("Jelajahi Materi →","go('materials')")}
        ${button("Lihat Tugas ↗","go('tasks')","outline")}
      </div>
    </div>
    <div class="hero-image">
      <img src="https://images.unsplash.com/photo-1487958449943-2429e8be8625?w=1200&q=85"
           alt="Arsitektur gedung modern sebagai visual futuristik">
      <div class="hero-overlay">LEARN. SHARE. GROW.</div>
    </div>
  </section>

  <div class="feature-strip">
    <div class="container feature-strip-inner">
      <div class="strip-item"><span class="strip-icon">◈</span> AKSES MATERI LEBIH MUDAH</div>
      <div class="strip-item"><span class="strip-icon">◷</span> PANTAU DEADLINE TUGAS</div>
      <div class="strip-item"><span class="strip-icon">◎</span> TERHUBUNG DENGAN INFORMASI KAMPUS</div>
    </div>
  </div>

  <section class="container content-section">
    ${head("Study smarter.<br>Not harder.","Semua kebutuhan akademik dalam satu workspace.")}
    <div class="grid">
      <article class="card">
        <span class="chip lime">01 / LEARN</span>
        <h3>Materi Kuliah</h3>
        <p>Jelajahi dan unduh materi berdasarkan mata kuliah dan pertemuan.</p>
        ${button("Explore →","go('materials')","outline small")}
      </article>
      <article class="card">
        <span class="chip lime">02 / ORGANIZE</span>
        <h3>Manajemen Tugas</h3>
        <p>Lihat instruksi, ubah status, dan pantau deadline.</p>
        ${button("Explore →","go('tasks')","outline small")}
      </article>
      <article class="card">
        <span class="chip lime">03 / STAY UPDATED</span>
        <h3>Pengumuman</h3>
        <p>Baca informasi akademik penting tanpa melewatkan pembaruan.</p>
        ${button("Explore →","go('announcements')","outline small")}
      </article>
    </div>
  </section>

  <section class="container content-section">
    ${head("Materi <span class='marker'>terbaru.</span>",
      "Referensi dan materi untuk kegiatan belajar.",
      button("Lihat Semua →","go('materials')","outline"))}
    <div class="grid">
      ${recent.map(materialCard).join("")||"<p>Belum ada materi.</p>"}
    </div>
  </section>

  <section class="container content-section">
    ${head("Upcoming deadlines.",
      "Jangan lewatkan batas pengumpulan tugas.",
      button("Lihat Tugas →","go('tasks')","outline"))}
    <div class="grid">
      ${latest.map(taskCard).join("")||"<p>Belum ada tugas.</p>"}
    </div>
  </section>`;
}

// ========================================
// MATA KULIAH
// ========================================
function coursesPage(){
  const list=db.courses.filter(c=>
    (c.name+" "+c.code+" "+c.lecturer)
      .toLowerCase().includes(search));

  $("content").innerHTML=`
  <section class="container content-section">
    ${head("Mata <span class='marker'>Kuliah.</span>",
      "Jelajahi daftar mata kuliah yang tersedia.",
      logged()?button("+ Tambah Mata Kuliah","openEditor('courses')"):"")}
    <div class="filters">
      <input id="search" placeholder="Cari mata kuliah..."
        value="${safe(search)}" oninput="updateSearch(this.value)">
    </div>
    <div class="grid">
      ${list.map(c=>`
        <article class="card">
          <div class="card-top">
            <span class="chip lime">${safe(c.code)}</span>
            <span class="muted">Semester ${safe(c.semester)}</span>
          </div>
          <h3>${safe(c.name)}</h3>
          <p>Dosen: ${safe(c.lecturer)}</p>
          <p>${db.materials.filter(x=>x.courseId===c.id).length}
            materi tersedia</p>
          <div class="card-actions">
            ${button("Lihat Materi",`filterCourse('${c.id}')`,"small")}
            ${adminButtons("courses",c.id)}
          </div>
        </article>`).join("")||empty()}
    </div>
  </section>`;
  focusSearch();
}
function filterCourse(cid){
  page="materials";
  filter=cid;
  search="";
  render();
}

// ========================================
// MATERI KULIAH
// ========================================
function materialCard(m){
  const attached=!!(m.fileKey||m.fileData||m.url);
  return `<article class="card">
    <div class="card-top">
      <span class="chip lime">${safe(m.category||"Materi")}</span>
      <span class="chip">
        ${m.fileKey||m.fileData?"FILE":m.url?"LINK":"CATATAN"}
      </span>
    </div>
    <h3>${safe(m.title)}</h3>
    <p>${safe(cn(m.courseId))} · Pertemuan ${safe(m.meeting)}</p>
    <p>${safe(m.description).slice(0,145)}</p>
    <p style="font-size:11px">
      Oleh ${safe(m.author||"Akademik")} ·
      Diperbarui ${formatDate(m.updatedAt)}
    </p>
    <div class="card-actions">
      ${button("Detail",`detailMaterial('${m.id}')`,"outline small")}
      ${attached?button("Buka ↗",`openMaterial('${m.id}')`,"small"):""}
      ${attached?button("↓ Unduh",`downloadMaterial('${m.id}')`,"outline small"):""}
      ${adminButtons("materials",m.id)}
    </div>
  </article>`;
}

function materialsPage(){
  const list=db.materials.filter(m=>
    (logged()||m.public)&&
    (filter==="all"||m.courseId===filter)&&
    (m.title+" "+m.description+" "+cn(m.courseId))
      .toLowerCase().includes(search));

  $("content").innerHTML=`
  <section class="container content-section">
    ${head("Explore <span class='marker'>Knowledge.</span>",
      "Akses, unduh, dan bagikan materi kuliah.",
      logged()
        ?button("+ Tambah Materi","openEditor('materials')")
        :button("Masuk untuk Berbagi","go('login')"))}
    <div class="filters">
      <input id="search" placeholder="Cari materi..."
        value="${safe(search)}" oninput="updateSearch(this.value)">
      <select onchange="filter=this.value;materialsPage()">
        <option value="all">Semua Mata Kuliah</option>
        ${courseOptions(filter)}
      </select>
    </div>
    <div class="grid">
      ${list.map(materialCard).join("")||empty()}
    </div>
  </section>`;
  focusSearch();
}

function detailMaterial(idValue){
  const m=db.materials.find(x=>x.id===idValue);
  if(!m)return;
  if(!m.public&&!logged())return needLogin();

  const attached=!!(m.fileKey||m.fileData||m.url);
  modal(`
    <h2>${safe(m.title)}</h2>
    <p class="muted">
      ${safe(cn(m.courseId))} · Pertemuan ${safe(m.meeting)}
    </p>
    <p>${safe(m.description)}</p>
    <p><strong>Kategori:</strong> ${safe(m.category)}</p>
    <p><strong>Pembuat:</strong> ${safe(m.author||"-")}</p>
    <p><strong>Terakhir diubah:</strong> ${formatDate(m.updatedAt)}</p>
    <p><strong>Akses:</strong> ${m.public?"Publik":"Pengguna login"}</p>
    <div class="card-actions">
      ${attached?button("Buka Materi ↗",`openMaterial('${m.id}')`):""}
      ${attached?button("↓ Unduh Materi",`downloadMaterial('${m.id}')`,"outline"):""}
    </div>`);
}

function openMaterial(idValue){
  const m=db.materials.find(x=>x.id===idValue);
  if(!m)return;
  if(!m.public&&!logged())return needLogin();

  if(m.fileKey)return openFile(m.fileKey);
  if(m.fileData)return window.open(m.fileData,"_blank");
  if(m.url)return openExternal(m.url);

  toast("Tidak ada file untuk dibuka.");
}

function downloadMaterial(idValue){
  const m=db.materials.find(x=>x.id===idValue);
  if(!m)return;
  if(!m.public&&!logged())return needLogin();

  if(m.fileKey)return downloadFile(m.fileKey,m.fileName);
  if(m.fileData){
    const a=document.createElement("a");
    a.href=m.fileData;
    a.download=m.fileName||"materi";
    document.body.appendChild(a);
    a.click();
    a.remove();
    return;
  }
  if(m.url){
    openExternal(m.url);
    return toast("Tautan eksternal dibuka; unduh dari situs sumber.");
  }
  toast("Tidak ada file untuk diunduh.");
}

// ========================================
// TUGAS
// ========================================
function taskCard(t){
  const n=Math.ceil(
    (new Date(t.deadline+"T23:59:59")-new Date())/86400000
  );
  const status=t.submissions?.[userId]?"Selesai":t.status;

  return `<article class="card">
    <div class="card-top">
      <span class="chip">${safe(status)}</span>
      <span class="chip lime">${safe(cn(t.courseId))}</span>
    </div>
    <h3>${safe(t.title)}</h3>
    <p>${safe(t.description).slice(0,155)}</p>
    <p class="${n<=3&&status!=="Selesai"?"deadline":""}">
      Deadline: ${formatDate(t.deadline)}
      ${n<0?"(Lewat)":n<=3?"(Segera)":""}
    </p>
    <div class="card-actions">
      ${button("Detail / Upload",`detailTask('${t.id}')`,"small")}
      ${t.fileKey?button("Buka ↗",`openTaskAttachment('${t.id}')`,"outline small"):""}
      ${t.fileKey?button("↓ Unduh",`downloadTaskAttachment('${t.id}')`,"outline small"):""}
      ${adminButtons("tasks",t.id)}
    </div>
  </article>`;
}

function tasksPage(){
  const list=db.tasks.filter(t=>
    (filter==="all"||t.courseId===filter)&&
    (t.title+" "+t.description).toLowerCase().includes(search));

  $("content").innerHTML=`
  <section class="container content-section">
    ${head("Task <span class='marker'>Tracker.</span>",
      "Pantau pekerjaan dan deadline setiap mata kuliah.",
      logged()?button("+ Tambah Tugas","openEditor('tasks')"):"")}
    <div class="filters">
      <input id="search" placeholder="Cari tugas..."
        value="${safe(search)}" oninput="updateSearch(this.value)">
      <select onchange="filter=this.value;tasksPage()">
        <option value="all">Semua Mata Kuliah</option>
        ${courseOptions(filter)}
      </select>
    </div>
    <div class="grid">
      ${list.map(taskCard).join("")||empty()}
    </div>
  </section>`;
  focusSearch();
}

function detailTask(idValue){
  const t=db.tasks.find(x=>x.id===idValue);
  if(!t)return;

  const submission=logged()?t.submissions?.[userId]:null;
  const status=submission?"Selesai":t.status;

  modal(`
    <h2>${safe(t.title)}</h2>
    <p>${safe(cn(t.courseId))}</p>
    <p>${safe(t.description)}</p>
    <p><strong>Deadline:</strong> ${formatDate(t.deadline)}</p>

    <div class="notice">
      <strong>Lampiran Instruksi Tugas</strong>
      <p>${t.fileName?safe(t.fileName):"Belum ada lampiran."}</p>
      <div class="card-actions">
        ${t.fileKey?button("Buka ↗",`openTaskAttachment('${t.id}')`):""}
        ${t.fileKey?button("↓ Unduh",`downloadTaskAttachment('${t.id}')`,"outline"):""}
      </div>
    </div>

    ${logged()?`
      <label>
        Status pengerjaan
        <select id="taskStatus">
          ${["Belum Dikerjakan","Sedang Dikerjakan","Selesai"]
            .map(s=>`<option ${s===status?"selected":""}>${s}</option>`)
            .join("")}
        </select>
      </label>

      ${button("Simpan Status",`changeStatus('${t.id}')`,"outline")}

      <hr>
      <h3>Kumpulkan Hasil Tugas</h3>
      <p class="muted">
        Pilih file hasil pengerjaan (maksimal 25 MB).
      </p>
      <label>
        File hasil tugas
        <input id="submissionUpload" type="file"
          accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.zip,.jpg,.jpeg,.png">
      </label>
      ${button("Upload & Kumpulkan",`submitAssignment('${t.id}')`,"lime")}

      ${submission?`
        <div class="notice">
          <strong>Sudah Dikumpulkan</strong>
          <p>${safe(submission.fileName)} · ${formatDate(submission.uploadedAt)}</p>
          <div class="card-actions">
            ${button("Buka ↗",`openSubmission('${t.id}')`)}
            ${button("↓ Unduh",`downloadSubmission('${t.id}')`,"outline")}
          </div>
        </div>`:""}
    `:`
      <p>Login untuk mengumpulkan tugas.</p>
      ${button("Masuk","closeModal();go('login')")}
    `}
  `);
}

function changeStatus(idValue){
  if(!needLogin())return;
  const t=db.tasks.find(x=>x.id===idValue);
  if(!t)return;

  const previous=t.status;
  t.status=$("taskStatus").value;

  if(!save()){
    t.status=previous;
    return;
  }
  closeModal();
  render();
  toast("Status berhasil diperbarui.");
}

function openTaskAttachment(taskId){
  const t=db.tasks.find(x=>x.id===taskId);
  if(!t?.fileKey)return toast("Lampiran tugas belum tersedia.");
  openFile(t.fileKey);
}
function downloadTaskAttachment(taskId){
  const t=db.tasks.find(x=>x.id===taskId);
  if(!t?.fileKey)return toast("Lampiran tugas belum tersedia.");
  downloadFile(t.fileKey,t.fileName);
}

async function submitAssignment(taskId){
  if(!needLogin())return;
  const t=db.tasks.find(x=>x.id===taskId);
  const file=$("submissionUpload")?.files[0];

  if(!t||!file){
    return toast("Pilih file hasil tugas terlebih dahulu.");
  }

  let uploaded;
  try{
    uploaded=await storeFile(file);
    const previous=t.submissions?.[userId];
    t.submissions={...t.submissions,[userId]:uploaded};

    if(!save()){
      if(previous)t.submissions[userId]=previous;
      else delete t.submissions[userId];
      await eraseFile(uploaded.fileKey);
      return;
    }

    if(previous?.fileKey){
      await eraseFile(previous.fileKey).catch(()=>{});
    }
    closeModal();
    render();
    toast("Tugas berhasil dikumpulkan.");
  }catch(e){
    toast(e.message||"Upload gagal.");
  }
}

function openSubmission(taskId){
  if(!needLogin())return;
  const s=db.tasks.find(x=>x.id===taskId)?.submissions?.[userId];
  if(s?.fileKey)openFile(s.fileKey);
  else toast("Belum ada file pengumpulan.");
}
function downloadSubmission(taskId){
  if(!needLogin())return;
  const s=db.tasks.find(x=>x.id===taskId)?.submissions?.[userId];
  if(s?.fileKey)downloadFile(s.fileKey,s.fileName);
  else toast("Belum ada file pengumpulan.");
}

// ========================================
// PENGUMUMAN
// ========================================
function announcementsPage(){
  const list=db.announcements.filter(a=>
    (a.title+" "+a.content+" "+a.category)
      .toLowerCase().includes(search));

  $("content").innerHTML=`
  <section class="container content-section">
    ${head("Campus <span class='marker'>Updates.</span>",
      "Informasi dan pengumuman akademik terbaru.",
      logged()
        ?button("+ Tambah Pengumuman","openEditor('announcements')")
        :"")}
    <div class="filters">
      <input id="search" placeholder="Cari pengumuman..."
        value="${safe(search)}" oninput="updateSearch(this.value)">
    </div>
    <div class="grid">
      ${list.map(a=>`
        <article class="card">
          <div class="card-top">
            <span class="chip ${a.important?"lime":""}">
              ${safe(a.category)}
            </span>
            <small>${formatDate(a.date)}</small>
          </div>
          <h3>${safe(a.title)}</h3>
          <p>${safe(a.content)}</p>
          <div class="card-actions">
            ${adminButtons("announcements",a.id)}
          </div>
        </article>
      `).join("")||empty()}
    </div>
  </section>`;
  focusSearch();
}

// ========================================
// LOGIN & REGISTRASI
// ========================================
function loginPage(){
  $("content").innerHTML=`
  <div class="auth-wrap">
    <span class="chip lime">WELCOME BACK</span>
    <h2 style="margin-top:18px">Masuk ke KULIAHKU.</h2>
    <p class="muted">Gunakan email dan password akun Anda.</p>

    <form onsubmit="login(event)">
      <label>
        Email
        <input type="email" name="email" required autocomplete="email">
      </label>
      <label>
        Password
        <input id="pass" type="password" name="password"
          required autocomplete="current-password">
      </label>
      <label style="font-weight:400">
        <input type="checkbox" style="width:auto"
          onchange="$('pass').type=this.checked?'text':'password'">
        Tampilkan password
      </label>
      <button class="btn" type="submit">Masuk →</button>
    </form>

    <p style="margin-top:22px">
      Belum punya akun?
      <a style="font-weight:800;text-decoration:underline"
        href="#" onclick="go('register')">Daftar sekarang</a>
    </p>
  </div>`;
}

function registerPage(){
  $("content").innerHTML=`
  <div class="auth-wrap">
    <span class="chip lime">CREATE ACCOUNT</span>
    <h2 style="margin-top:18px">Bergabung dengan KULIAHKU.</h2>

    <form onsubmit="register(event)">
      <label>Nama lengkap
        <input name="name" required minlength="2">
      </label>
      <label>Email
        <input name="email" type="email" required>
      </label>
      <label>NIM
        <input name="nim" required>
      </label>
      <label>Program studi
        <input name="program" value="Teknik Informatika" required>
      </label>
      <label>Password
        <input name="password" type="password"
          minlength="6" required>
      </label>
      <button class="btn" type="submit">Buat Akun →</button>
    </form>

    <p style="margin-top:22px">
      Sudah punya akun?
      <a href="#" onclick="go('login')"><strong>Masuk</strong></a>
    </p>
  </div>`;
}

function register(e){
  e.preventDefault();
  const f=new FormData(e.target);
  const email=String(f.get("email")).trim().toLowerCase();

  if(db.users.some(u=>u.email===email)){
    return toast("Email sudah terdaftar.");
  }

  const u={
    id:id(),
    name:String(f.get("name")).trim(),
    email,
    nim:String(f.get("nim")).trim(),
    program:String(f.get("program")).trim(),
    password:String(f.get("password"))
  };
  db.users.push(u);

  if(!save())return;
  userId=u.id;
  localStorage.setItem(SESSION_KEY,userId);
  go("home");
  toast("Registrasi berhasil!");
}

function login(e){
  e.preventDefault();
  const f=new FormData(e.target);
  const u=db.users.find(x=>
    x.email===String(f.get("email")).trim().toLowerCase()&&
    x.password===f.get("password")
  );
  if(!u)return toast("Email atau password salah.");

  userId=u.id;
  localStorage.setItem(SESSION_KEY,userId);
  go("home");
  toast("Login berhasil.");
}

function logout(){
  userId=null;
  localStorage.removeItem(SESSION_KEY);
  go("home");
  toast("Anda telah keluar.");
}

// ========================================
// PROFIL
// ========================================
function profilePage(){
  if(!logged())return go("login");
  const u=user();

  $("content").innerHTML=`
  <section class="container content-section">
    ${head("My <span class='marker'>Profile.</span>",
      "Informasi akun akademik Anda.")}
    <div class="card profile-box">
      <form onsubmit="saveProfile(event)">
        <label>Nama
          <input name="name" required value="${safe(u.name)}">
        </label>
        <label>Email
          <input name="email" type="email" required value="${safe(u.email)}">
        </label>
        <label>NIM
          <input name="nim" required value="${safe(u.nim)}">
        </label>
        <label>Program studi
          <input name="program" required value="${safe(u.program)}">
        </label>
        <label>Password baru (opsional)
          <input name="password" type="password" minlength="6">
        </label>
        <button class="btn">Simpan Profil</button>
      </form>
    </div>
  </section>`;
}

function saveProfile(e){
  e.preventDefault();
  const f=new FormData(e.target);
  const u=user();
  const email=String(f.get("email")).trim().toLowerCase();

  if(db.users.some(x=>x.id!==u.id&&x.email===email)){
    return toast("Email sudah dipakai.");
  }
  for(const k of ["name","nim","program"]){
    u[k]=String(f.get(k)).trim();
  }
  u.email=email;
  if(f.get("password"))u.password=String(f.get("password"));
  save();
  render();
  toast("Profil disimpan.");
}

// ========================================
// PENYIMPANAN FILE INDEXEDDB (25 MB)
// ========================================
const MAX_UPLOAD_SIZE = 25 * 1024 * 1024;
const UPLOAD_DB_NAME = "KULIAHKU_FILE_STORE_V1";
const UPLOAD_STORE = "files";

function openUploadDB(){
  return new Promise((resolve,reject)=>{
    const req=indexedDB.open(UPLOAD_DB_NAME,1);

    req.onupgradeneeded=()=>{
      if(!req.result.objectStoreNames.contains(UPLOAD_STORE)){
        req.result.createObjectStore(UPLOAD_STORE);
      }
    };
    req.onsuccess=()=>resolve(req.result);
    req.onerror=()=>reject(
      req.error||new Error("Tidak dapat membuka penyimpanan file.")
    );
  });
}

async function fileTransaction(mode,operation){
  const database=await openUploadDB();

  return new Promise((resolve,reject)=>{
    const tx=database.transaction(UPLOAD_STORE,mode);
    const request=operation(tx.objectStore(UPLOAD_STORE));
    let result;

    if(request){
      request.onsuccess=()=>{result=request.result;};
    }
    tx.oncomplete=()=>{
      database.close();
      resolve(result);
    };
    tx.onerror=()=>{
      database.close();
      reject(tx.error||new Error("Operasi file gagal."));
    };
    tx.onabort=()=>{
      database.close();
      reject(tx.error||new Error("Operasi dibatalkan."));
    };
  });
}

async function storeFile(file){
  if(!(file instanceof File)||!file.size){
    throw Error("Pilih file terlebih dahulu.");
  }
  if(file.size>MAX_UPLOAD_SIZE){
    throw Error("File maksimal 25 MB.");
  }

  const fileKey=id();
  await fileTransaction(
    "readwrite",
    store=>store.put(file,fileKey)
  );

  return {
    fileKey,
    fileName:file.name,
    fileType:file.type,
    fileSize:file.size,
    uploadedAt:now()
  };
}

const fetchFile=key=>
  fileTransaction("readonly",store=>store.get(key));

const eraseFile=key=>key
  ?fileTransaction("readwrite",store=>store.delete(key))
  :Promise.resolve();

function previewable(file){
  return file.type==="application/pdf"||
    file.type.startsWith("image/")||
    file.type.startsWith("text/")||
    /\.(pdf|png|jpe?g|gif|webp|txt)$/i.test(file.name);
}

async function openFile(key){
  const tab=window.open("","_blank");

  try{
    const file=await fetchFile(key);
    if(!file){
      throw Error("File tidak ditemukan di browser ini.");
    }

    if(!previewable(file)){
      if(tab)tab.close();
      return toast(
        "Pratinjau format ini tidak tersedia. Silakan gunakan Unduh."
      );
    }

    if(!tab){
      return toast("Izinkan pop-up untuk membuka file.");
    }

    const url=URL.createObjectURL(file);
    tab.location.href=url;

    setTimeout(()=>URL.revokeObjectURL(url),120000);
  }catch(e){
    if(tab)tab.close();
    toast(e.message||"Gagal membuka file.");
  }
}

async function downloadFile(key,name){
  try{
    const file=await fetchFile(key);

    if(!file){
      throw Error("File tidak ditemukan di browser ini.");
    }

    const url=URL.createObjectURL(file);
    const link=document.createElement("a");

    link.href=url;
    link.download=name||file.name||"file";

    document.body.appendChild(link);
    link.click();
    link.remove();

    setTimeout(()=>URL.revokeObjectURL(url),60000);
  }catch(e){
    toast(e.message||"Gagal mengunduh file.");
  }
}

function validExternalURL(value){
  try{
    const u=new URL(value);
    return ["https:","http:"].includes(u.protocol)
      ?u.href:null;
  }catch{
    return null;
  }
}
function openExternal(value){
  const url=validExternalURL(value);
  if(!url)return toast("Tautan tidak valid.");

  window.open(url,"_blank","noopener,noreferrer");
}

// ========================================
// MODAL & FORM EDITOR
// ========================================
function modal(body){
  $("modalRoot").innerHTML=`
    <div class="modal-cover"
      onclick="if(event.target===this)closeModal()">
      <div class="modal">
        <div class="modal-head">
          <strong>KULIAHKU Workspace</strong>
          <button aria-label="Tutup" onclick="closeModal()">×</button>
        </div>
        ${body}
      </div>
    </div>`;
}
function closeModal(){
  $("modalRoot").innerHTML="";
}

function field(name,label,value="",type="text"){
  return `<label>${label}
    <input name="${name}" type="${type}"
      value="${safe(value)}" required>
  </label>`;
}

function textarea(name,label,value=""){
  return `<label>${label}
    <textarea name="${name}">${safe(value)}</textarea>
  </label>`;
}

function openEditor(type,itemId=""){
  if(!needLogin())return;

  const r=db[type].find(x=>x.id===itemId)||{};
  let html="";

  if(type==="courses")html=`
    ${field("name","Nama Mata Kuliah",r.name)}
    <div class="form-row">
      ${field("code","Kode",r.code)}
      ${field("semester","Semester",r.semester||5,"number")}
    </div>
    ${field("lecturer","Nama Dosen",r.lecturer)}
  `;

  if(type==="materials")html=`
    ${field("title","Judul Materi",r.title)}
    <label>Mata Kuliah
      <select name="courseId">
        ${courseOptions(r.courseId)}
      </select>
    </label>
    <div class="form-row">
      ${field("category","Kategori",r.category||"Modul")}
      ${field("meeting","Pertemuan",r.meeting||1,"number")}
    </div>
    ${textarea("description","Deskripsi",r.description)}
    <label>Link materi (opsional)
      <input name="url" type="url" value="${safe(r.url||"")}">
    </label>
    <label>
      Upload / ganti file
      (maksimal 25 MB, disimpan di browser ini)
      <input name="file" type="file"
        accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.zip,.jpg,.jpeg,.png">
    </label>
    <label>
      <input style="width:auto" name="public" type="checkbox"
        ${r.public!==false?"checked":""}>
      Materi dapat diakses publik
    </label>`;

  if(type==="tasks")html=`
    ${field("title","Judul Tugas",r.title)}
    <label>Mata Kuliah
      <select name="courseId">
        ${courseOptions(r.courseId)}
      </select>
    </label>
    ${textarea("description","Instruksi Tugas",r.description)}
    ${field("deadline","Deadline",r.deadline||day(7),"date")}
    <label>Status
      <select name="status">
        ${["Belum Dikerjakan","Sedang Dikerjakan","Selesai"]
          .map(s=>`
            <option ${r.status===s?"selected":""}>${s}</option>
          `).join("")}
      </select>
    </label>
    <label>Lampiran instruksi tugas (maksimal 25 MB)
      <input name="taskFile" type="file"
        accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.zip,.jpg,.jpeg,.png">
    </label>
    ${r.fileName
      ?`<p class="muted">File saat ini: ${safe(r.fileName)}</p>`
      :""}`;

  if(type==="announcements")html=`
    ${field("title","Judul Pengumuman",r.title)}
    ${field("category","Kategori",r.category||"Akademik")}
    ${textarea("content","Isi Pengumuman",r.content)}
    ${field("date","Tanggal",r.date||day(0),"date")}
    <label>
      <input type="checkbox" name="important" style="width:auto"
        ${r.important?"checked":""}>
      Pengumuman penting
    </label>`;

  modal(`
    <h2>${itemId?"Edit":"Tambah"} Konten</h2>
    <form id="editorForm">
      ${html}
      <div class="card-actions">
        <button type="submit" class="btn">Simpan</button>
        ${button("Batal","closeModal()","outline")}
      </div>
    </form>`);

  $("editorForm").onsubmit=e=>saveEditor(e,type,itemId);
}

// ========================================
// SIMPAN KONTEN & FILE
// ========================================
async function saveEditor(e,type,itemId){
  e.preventDefault();
  if(!logged())return;

  const f=new FormData(e.target);
  const val=k=>String(f.get(k)||"").trim();
  const old=db[type].find(x=>x.id===itemId);
  const r={...old,id:itemId||id()};
  let uploaded=null;

  if(type==="courses"){
    Object.assign(r,{
      name:val("name"),
      code:val("code"),
      semester:Number(val("semester")),
      lecturer:val("lecturer")
    });
  }

  if(type==="materials"){
    Object.assign(r,{
      title:val("title"),
      courseId:val("courseId"),
      category:val("category"),
      meeting:Number(val("meeting")),
      description:val("description"),
      url:val("url"),
      public:f.has("public"),
      author:old?.author||user().name,
      updatedAt:now()
    });

    if(r.url&&!validExternalURL(r.url)){
      return toast("Link materi harus HTTP atau HTTPS.");
    }

    const file=f.get("file");

    if(file instanceof File&&file.size){
      try{
        uploaded=await storeFile(file);
        Object.assign(r,uploaded);
        r.fileData="";
      }catch(e){
        return toast(e.message||"Upload file gagal.");
      }
    }
  }

  if(type==="tasks"){
    Object.assign(r,{
      title:val("title"),
      courseId:val("courseId"),
      description:val("description"),
      deadline:val("deadline"),
      status:val("status"),
      submissions:old?.submissions||{}
    });

    const file=f.get("taskFile");

    if(file instanceof File&&file.size){
      try{
        uploaded=await storeFile(file);
        Object.assign(r,uploaded);
      }catch(e){
        return toast(e.message||"Upload file gagal.");
      }
    }
  }

  if(type==="announcements"){
    Object.assign(r,{
      title:val("title"),
      category:val("category"),
      content:val("content"),
      date:val("date"),
      important:f.has("important")
    });
  }

  const before=db[type];

  db[type]=old
    ?before.map(x=>x.id===itemId?r:x)
    :[...before,r];

  if(!save()){
    db[type]=before;

    if(uploaded){
      await eraseFile(uploaded.fileKey).catch(()=>{});
    }
    return;
  }

  if(uploaded&&old?.fileKey){
    await eraseFile(old.fileKey).catch(()=>{});
  }

  closeModal();
  render();
  toast("Konten berhasil disimpan.");
}

// ========================================
// HAPUS KONTEN DAN FILE
// ========================================
async function removeItem(type,itemId){
  if(!needLogin())return;
  if(!confirm("Hapus konten ini secara permanen?"))return;

  const removed=db[type].find(x=>x.id===itemId);

  const extra=type==="courses"
    ?[
      ...db.materials.filter(x=>x.courseId===itemId),
      ...db.tasks.filter(x=>x.courseId===itemId)
    ]
    :[];

  const backup={
    [type]:db[type],
    materials:db.materials,
    tasks:db.tasks
  };

  db[type]=db[type].filter(x=>x.id!==itemId);

  if(type==="courses"){
    db.materials=db.materials.filter(x=>x.courseId!==itemId);
    db.tasks=db.tasks.filter(x=>x.courseId!==itemId);
  }

  if(!save()){
    Object.assign(db,backup);
    return;
  }

  const affected=[removed,...extra].filter(Boolean);

  for(const row of affected){
    if(row.fileKey){
      await eraseFile(row.fileKey).catch(()=>{});
    }

    if(row.submissions){
      for(const submission of Object.values(row.submissions)){
        if(submission?.fileKey){
          await eraseFile(submission.fileKey).catch(()=>{});
        }
      }
    }
  }

  render();
  toast("Konten telah dihapus.");
}

// ========================================
// PENCARIAN & INITIALIZATION
// ========================================
function empty(){
  return `<div class="empty">Tidak ada data yang ditemukan.</div>`;
}

function updateSearch(value){
  search=value.toLowerCase();

  ({
    courses:coursesPage,
    materials:materialsPage,
    tasks:tasksPage,
    announcements:announcementsPage
  }[page])();
}

function focusSearch(){
  const el=$("search");

  if(el&&search){
    el.focus();
    el.setSelectionRange(
      el.value.length,
      el.value.length
    );
  }
}

// Jalankan aplikasi
render();
