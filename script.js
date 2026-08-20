const STORAGE_KEY = "lifeInbox_v2";

let notes = JSON.parse(
  localStorage.getItem(STORAGE_KEY) || "[]"
);

let currentPage = "inbox";
let editingId = null;


/* =========================
   ELEMENTS
========================= */

const noteInput =
  document.getElementById("noteInput");

const categoryInput =
  document.getElementById("categoryInput");

const priorityInput =
  document.getElementById("priorityInput");

const reminderInput =
  document.getElementById("reminderInput");

const searchInput =
  document.getElementById("searchInput");

const filterInput =
  document.getElementById("filterInput");



/* =========================
   CATEGORY
========================= */

const categories = {

  general: "📌 Umum",

  college: "📚 Kuliah",

  shopping: "🛒 Belanja",

  idea: "💡 Ide",

  personal: "🧍 Personal"

};



/* =========================
   SAVE
========================= */

function saveData() {

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(notes)
  );

}



/* =========================
   ID
========================= */

function generateId() {

  return Date.now().toString(36)
    + Math.random()
      .toString(36)
      .substring(2, 8);

}



/* =========================
   DATE
========================= */

function formatDate(dateString) {

  if (!dateString) {
    return "";
  }

  const date =
    new Date(dateString);

  return new Intl.DateTimeFormat(
    "id-ID",
    {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    }
  ).format(date);

}


function isToday(dateString) {

  if (!dateString) {
    return false;
  }

  const date =
    new Date(dateString);

  const today =
    new Date();

  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );

}


function isOverdue(note) {

  if (!note.reminder) {
    return false;
  }

  return (
    !note.completed &&
    new Date(note.reminder) < new Date()
  );

}

const inputs = document.querySelectorAll('.pin-input');
const lockScreen = document.getElementById('lock-screen');
const mainApp = document.getElementById('main-app');
const lockStatus = document.getElementById('lock-status');
const errorMessage = document.getElementById('error-message');

let isRegisterMode = false;
let tempFirstPin = ""; // Tempat menyimpan pin pertama saat mode konfirmasi

// 1. CEK APAKAH PIN SUDAH PERNAH DIATUR
function initLockScreen() {
  const savedPin = localStorage.getItem('user_pin');
  
  if (!savedPin) {
    // Jika BELUM ada PIN terdaftar di browser
    isRegisterMode = true;
    lockStatus.innerText = "Buat PIN Baru Anda (4 Digit)";
    lockStatus.style.color = "#7000ff"; // Beri warna penanda
  } else {
    // Jika SUDAH ada PIN
    isRegisterMode = false;
    lockStatus.innerText = "Masukkan PIN untuk Masuk";
    lockStatus.style.color = "#a0a5c1";
  }
}

// Jalankan pengecekan saat halaman dimuat
initLockScreen();

// 2. LOGIKA INPUT PIN (Auto-focus & Auto-move)
inputs.forEach((input, index) => {
  input.addEventListener('input', (e) => {
    const value = e.target.value;
    
    if (!/^[0-9]$/.test(value)) {
      e.target.value = '';
      return;
    }

    if (value && index < inputs.length - 1) {
      inputs[index + 1].focus();
    }

    // Jalankan pengecekan otomatis saat 4 digit penuh
    checkPinAction();
  });

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Backspace' && !input.value && index > 0) {
      inputs[index - 1].focus();
    }
  });
});

// 3. LOGIKA UTAMA: MEMBACA AKSI PIN
function checkPinAction() {
  const enteredPin = Array.from(inputs).map(input => input.value).join('');

  if (enteredPin.length === 4) {
    if (isRegisterMode) {
      // --- MODE REGISTER/BUAT PIN BARU ---
      if (!tempFirstPin) {
        // Langkah 1: Simpan PIN pertama, lalu suruh konfirmasi
        tempFirstPin = enteredPin;
        resetInputFields();
        lockStatus.innerText = "Masukkan PIN Sekali Lagi untuk Konfirmasi";
      } else {
        // Langkah 2: Cocokkan konfirmasi dengan PIN pertama
        if (enteredPin === tempFirstPin) {
          // Jika cocok, simpan permanen di browser
          localStorage.setItem('user_pin', enteredPin);
          showPinToast("PIN Berhasil Diatur!");
          
          // Masuk ke aplikasi utama
          lockScreen.style.display = 'none';
          mainApp.style.display = 'block';
          render();
          startReminderChecker();
        } else {
          // Jika konfirmasi salah, reset dari awal lagi
          showError("PIN tidak cocok! Silakan ulangi dari awal.");
          tempFirstPin = "";
          lockStatus.innerText = "Buat PIN Baru Anda (4 Digit)";
          resetInputFields();
        }
      }
    } else {
      // --- MODE LOGIN / MASUKKAN PIN BIASA ---
      const correctPin = localStorage.getItem('user_pin');
      
      if (enteredPin === correctPin) {
        lockScreen.style.display = 'none';
        mainApp.style.display = 'block';
        render();
        startReminderChecker();
      } else {
        showError("PIN Salah! Coba lagi.");
        resetInputFields();
      }
    }
  }
}

// Fungsi pembantu untuk mengosongkan kotak input
function resetInputFields() {
  inputs.forEach(input => input.value = '');
  inputs[0].focus();
}

// Fungsi pembantu menampilkan pesan error
function showError(msg) {
  errorMessage.innerText = msg;
  errorMessage.style.display = 'block';
}

function showPinToast(msg) {
  errorMessage.style.display = 'none';
  // Pakai showToast utama (didefinisikan di bawah)
  // tapi saat PIN unlock, #toast sudah ada di DOM
  const toast = document.getElementById("toast");
  if (toast) {
    toast.textContent = msg;
    toast.classList.add("show");
    setTimeout(() => toast.classList.remove("show"), 2200);
  }
}


/* =========================
   AUTO CATEGORY
========================= */

function detectCategory(text) {

  const value =
    text.toLowerCase();


  if (
    /kuliah|dosen|tugas|kampus|kelas|praktikum|ujian|laporan|materi/
      .test(value)
  ) {

    return "college";

  }


  if (
    /beli|belanja|checkout|shopping|sabun|shampoo|makan/
      .test(value)
  ) {

    return "shopping";

  }


  if (
    /ide|project|projek|aplikasi|website|kepikiran/
      .test(value)
  ) {

    return "idea";

  }


  return "general";

}



/* =========================
   NATURAL REMINDER
========================= */

function detectReminder(text) {

  const value =
    text.toLowerCase();

  const now =
    new Date();


  /* BESOK */

  if (value.includes("besok")) {

    const date =
      new Date(now);

    date.setDate(
      date.getDate() + 1
    );

    date.setHours(
      8, 0, 0, 0
    );

    return date.toISOString();

  }


  /* LUSA */

  if (value.includes("lusa")) {

    const date =
      new Date(now);

    date.setDate(
      date.getDate() + 2
    );

    date.setHours(
      8, 0, 0, 0
    );

    return date.toISOString();

  }


  /* X JAM LAGI */

  const hourMatch =
    value.match(
      /(\d+)\s*jam\s*lagi/
    );


  if (hourMatch) {

    const date =
      new Date(now);

    date.setHours(
      date.getHours()
      + Number(hourMatch[1])
    );

    return date.toISOString();

  }


  /* X MENIT LAGI */

  const minuteMatch =
    value.match(
      /(\d+)\s*menit\s*lagi/
    );


  if (minuteMatch) {

    const date =
      new Date(now);

    date.setMinutes(
      date.getMinutes()
      + Number(minuteMatch[1])
    );

    return date.toISOString();

  }


  return null;

}



/* =========================
   ADD NOTE
========================= */

function addNote() {

  const text =
    noteInput.value.trim();


  if (!text) {

    showToast(
      "Tulis sesuatu dulu 😭"
    );

    noteInput.focus();

    return;

  }


  let reminder = null;


  if (reminderInput.value) {

    reminder =
      new Date(
        reminderInput.value
      ).toISOString();

  }

  else {

    reminder =
      detectReminder(text);

  }


  let category =
    categoryInput.value;


  if (category === "general") {

    category =
      detectCategory(text);

  }


  const note = {

    id: generateId(),

    text,

    category,

    priority:
      priorityInput.value,

    reminder,

    completed: false,

    createdAt:
      new Date().toISOString()

  };


  notes.unshift(note);


  saveData();


  noteInput.value = "";

  reminderInput.value = "";

  categoryInput.value =
    "general";

  priorityInput.value =
    "normal";


  currentPage =
    "inbox";


  render();


  showToast(
    reminder
      ? "Disimpan + pengingat dibuat 🔔"
      : "Masuk ke inbox 📥"
  );

}



/* =========================
   COMPLETE
========================= */

function toggleComplete(id) {

  const note =
    notes.find(
      item => item.id === id
    );


  if (!note) {
    return;
  }


  note.completed =
    !note.completed;


  note.completedAt =
    note.completed
      ? new Date().toISOString()
      : null;


  saveData();

  render();

}



/* =========================
   DELETE
========================= */

function deleteNote(id) {

  const confirmed =
    confirm(
      "Hapus catatan ini?"
    );


  if (!confirmed) {
    return;
  }


  notes =
    notes.filter(
      note => note.id !== id
    );


  saveData();

  render();

  showToast(
    "Catatan dihapus"
  );

}



/* =========================
   EDIT
========================= */

function openEdit(id) {

  const note =
    notes.find(
      item => item.id === id
    );


  if (!note) {
    return;
  }


  editingId = id;


  document.getElementById(
    "editText"
  ).value = note.text;


  document.getElementById(
    "editCategory"
  ).value = note.category;


  document.getElementById(
    "editPriority"
  ).value = note.priority;


  if (note.reminder) {

    const date =
      new Date(note.reminder);


    const offset =
      date.getTimezoneOffset();


    const local =
      new Date(
        date.getTime()
        - offset * 60000
      );


    document.getElementById(
      "editReminder"
    ).value =
      local.toISOString()
        .slice(0, 16);

  }

  else {

    document.getElementById(
      "editReminder"
    ).value = "";

  }


  document.getElementById(
    "modal"
  ).classList.remove("hidden");

}



/* =========================
   CLOSE EDIT
========================= */

function closeEdit() {

  editingId = null;

  document.getElementById(
    "modal"
  ).classList.add("hidden");

}



/* =========================
   SAVE EDIT
========================= */

function saveEdit() {

  const note =
    notes.find(
      item => item.id === editingId
    );


  if (!note) {
    return;
  }


  const text =
    document.getElementById(
      "editText"
    ).value.trim();


  if (!text) {

    showToast(
      "Catatan tidak boleh kosong"
    );

    return;

  }


  note.text = text;


  note.category =
    document.getElementById(
      "editCategory"
    ).value;


  note.priority =
    document.getElementById(
      "editPriority"
    ).value;


  const reminder =
    document.getElementById(
      "editReminder"
    ).value;


  note.reminder =
    reminder
      ? new Date(reminder).toISOString()
      : null;


  saveData();

  closeEdit();

  render();

  showToast(
    "Perubahan disimpan"
  );

}



/* =========================
   FILTER
========================= */

function getFilteredNotes() {

  const search =
    searchInput.value
      .trim()
      .toLowerCase();


  const category =
    filterInput.value;


  return notes.filter(note => {

    const matchSearch =
      !search ||
      note.text
        .toLowerCase()
        .includes(search);


    const matchCategory =
      category === "all" ||
      note.category === category;


    if (
      !matchSearch ||
      !matchCategory
    ) {

      return false;

    }


    switch (currentPage) {

      case "today":

        return (
          !note.completed &&
          (
            isToday(note.reminder) ||
            isOverdue(note)
          )
        );


      case "upcoming":

        return (
          !note.completed &&
          note.reminder &&
          new Date(note.reminder)
            >= new Date()
        );


      case "ideas":

        return (
          !note.completed &&
          note.category === "idea"
        );


      case "completed":

        return note.completed;


      default:

        return !note.completed;

    }

  });

}



/* =========================
   ESCAPE HTML
========================= */

function escapeHTML(text) {

  return text.replace(
    /[&<>"']/g,
    character => {

      const map = {

        "&": "&amp;",

        "<": "&lt;",

        ">": "&gt;",

        '"': "&quot;",

        "'": "&#039;"

      };

      return map[character];

    }
  );

}



/* =========================
   RENDER NOTES
========================= */

function renderNotes() {

  const container =
    document.getElementById(
      "notesContainer"
    );


  const empty =
    document.getElementById(
      "emptyState"
    );


  const notesToShow =
    getFilteredNotes();


  document.getElementById(
    "resultCount"
  ).textContent =
    `${notesToShow.length} item`;


  if (
    notesToShow.length === 0
  ) {

    container.innerHTML = "";

    empty.classList.remove(
      "hidden"
    );

    return;

  }


  empty.classList.add(
    "hidden"
  );


  container.innerHTML =
    notesToShow.map(note => {

      let reminderBadge = "";


      if (note.reminder) {

        const overdue =
          isOverdue(note);


        reminderBadge = `
          <span class="badge ${
            overdue
              ? "overdue"
              : "reminder"
          }">
            ${
              overdue
                ? "⚠️ Terlewat"
                : "🔔 " +
                  formatDate(
                    note.reminder
                  )
            }
          </span>
        `;

      }


      const priorityBadge =
        note.priority === "high"
          ? `
            <span class="badge high">
              🔥 Prioritas tinggi
            </span>
          `
          : "";


      return `

        <article
          class="note ${
            note.completed
              ? "completed"
              : ""
          }"
        >

          <button
            class="check"
            onclick="toggleComplete('${note.id}')"
            title="Tandai selesai"
          >
            ✓
          </button>


          <div>

            <p class="note-text">
              ${escapeHTML(note.text)}
            </p>


            <div class="note-meta">

              <span class="badge">
                ${
                  categories[
                    note.category
                  ]
                }
              </span>

              ${priorityBadge}

              ${reminderBadge}

            </div>

          </div>


          <div class="note-actions">

            <button
              onclick="openEdit('${note.id}')"
              title="Edit"
            >
              ✏️
            </button>


            <button
              class="delete"
              onclick="deleteNote('${note.id}')"
              title="Hapus"
            >
              🗑️
            </button>

          </div>

        </article>

      `;

    }).join("");

}



/* =========================
   SUMMARY
========================= */

function renderSummary() {

  const active =
    notes.filter(
      note => !note.completed
    ).length;


  const today =
    notes.filter(
      note =>
        !note.completed &&
        (
          isToday(note.reminder) ||
          isOverdue(note)
        )
    ).length;


  const upcoming =
    notes.filter(
      note =>
        !note.completed &&
        note.reminder &&
        new Date(note.reminder)
          >= new Date()
    ).length;


  const completed =
    notes.filter(
      note => note.completed
    ).length;


  document.getElementById(
    "summaryInbox"
  ).textContent = active;


  document.getElementById(
    "summaryToday"
  ).textContent = today;


  document.getElementById(
    "summaryUpcoming"
  ).textContent = upcoming;


  document.getElementById(
    "summaryCompleted"
  ).textContent = completed;


  document.getElementById(
    "inboxCount"
  ).textContent = active;

}



/* =========================
   PAGE TITLE
========================= */

function renderPageTitle() {

  const titles = {

    inbox: [
      "Inbox",
      "Semua hal yang belum beres.",
      "Semua hal yang lo titipin ke Life Inbox."
    ],

    today: [
      "Hari Ini",
      "Hal-hal yang perlu lo perhatikan hari ini.",
      "Termasuk catatan yang sudah terlewat."
    ],

    upcoming: [
      "Terjadwal",
      "Hal yang punya waktu pengingat.",
      "Catatan dengan jadwal ke depan."
    ],

    ideas: [
      "Ide",
      "Semua ide yang pernah lo titipkan.",
      "Semua catatan berkategori Ide."
    ],

    completed: [
      "Selesai",
      "Hal-hal yang sudah berhasil lo beresin.",
      "Catatan yang sudah lo tandai selesai."
    ]

  };


  const data =
    titles[currentPage];


  document.getElementById(
    "pageTitle"
  ).textContent =
    data[0];


  document.getElementById(
    "sectionTitle"
  ).textContent =
    data[1];


  document.getElementById(
    "sectionDescription"
  ).textContent =
    data[2];

}



/* =========================
   DATE
========================= */

function renderDate() {

  const date =
    new Date();


  document.getElementById(
    "currentDate"
  ).textContent =
    new Intl.DateTimeFormat(
      "id-ID",
      {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric"
      }
    ).format(date);

}



/* =========================
   NAVIGATION
========================= */

document
  .querySelectorAll(".nav-item")
  .forEach(button => {

    button.addEventListener(
      "click",
      () => {

        currentPage =
          button.dataset.page;


        document
          .querySelectorAll(
            ".nav-item"
          )
          .forEach(item =>
            item.classList.remove(
              "active"
            )
          );


        button.classList.add(
          "active"
        );


        render();

      }
    );

  });



/* =========================
   QUICK ADD
========================= */

function focusInput() {

  noteInput.focus();

}


document
  .getElementById(
    "quickAddButton"
  )
  .addEventListener(
    "click",
    focusInput
  );


document
  .getElementById(
    "emptyAddButton"
  )
  .addEventListener(
    "click",
    focusInput
  );


document.addEventListener(
  "keydown",
  event => {

    if (
      (event.ctrlKey ||
       event.metaKey) &&
      event.code === "Space"
    ) {

      event.preventDefault();

      focusInput();

    }


    if (
      (event.ctrlKey ||
       event.metaKey) &&
      event.key === "Enter"
    ) {

      if (
        document.activeElement ===
        noteInput
      ) {

        addNote();

      }

    }

  }
);



/* =========================
   SAVE BUTTON
========================= */

document
  .getElementById(
    "saveButton"
  )
  .addEventListener(
    "click",
    addNote
  );



/* =========================
   SEARCH
========================= */

searchInput.addEventListener(
  "input",
  render
);


filterInput.addEventListener(
  "change",
  render
);



/* =========================
   MODAL
========================= */

document
  .getElementById(
    "closeModal"
  )
  .addEventListener(
    "click",
    closeEdit
  );


document
  .getElementById(
    "cancelEdit"
  )
  .addEventListener(
    "click",
    closeEdit
  );


document
  .getElementById(
    "saveEdit"
  )
  .addEventListener(
    "click",
    saveEdit
);


document
  .querySelector(
    ".modal-overlay"
  )
  .addEventListener(
    "click",
    closeEdit
  );



/* =========================
   CLEAR COMPLETED
========================= */

document
  .getElementById(
    "clearCompleted"
  )
  .addEventListener(
    "click",
    () => {

      const completed =
        notes.filter(
          note => note.completed
        ).length;


      if (!completed) {

        showToast(
          "Belum ada yang selesai."
        );

        return;

      }


      const confirmed =
        confirm(
          `Hapus ${completed} catatan yang sudah selesai?`
        );


      if (!confirmed) {
        return;
      }


      notes =
        notes.filter(
          note => !note.completed
        );


      saveData();

      render();

      showToast(
        "Catatan selesai dibersihkan."
      );

    }
  );



/* =========================
   DARK MODE
========================= */

const themeButton =
  document.getElementById(
    "themeButton"
  );


const savedTheme =
  localStorage.getItem(
    "lifeInboxTheme"
  );


if (
  savedTheme === "dark"
) {

  document.body.classList.add(
    "dark"
  );

}


themeButton.addEventListener(
  "click",
  () => {

    document.body.classList.toggle(
      "dark"
    );


    const dark =
      document.body.classList.contains(
        "dark"
      );


    localStorage.setItem(
      "lifeInboxTheme",
      dark
        ? "dark"
        : "light"
    );

  }
);



/* =========================
   TOAST
========================= */

let toastTimer;


function showToast(message) {

  const toast =
    document.getElementById(
      "toast"
    );


  toast.textContent =
    message;


  toast.classList.add(
    "show"
  );


  clearTimeout(
    toastTimer
  );


  toastTimer =
    setTimeout(
      () => {

        toast.classList.remove(
          "show"
        );

      },
      2200
    );

}



/* =========================
   RENDER
========================= */

function render() {

  renderDate();

  renderPageTitle();

  renderSummary();

  renderNotes();

}

// render() dipanggil setelah PIN benar (bukan saat load), supaya
// tidak error karena #main-app masih display:none



/* =========================
   NOTIFIKASI
========================= */

// ID catatan yang sudah pernah dinotifikasi (biar tidak dobel)
const notifiedIds = new Set(
  JSON.parse(localStorage.getItem("notifiedIds") || "[]")
);

function saveNotifiedIds() {
  localStorage.setItem(
    "notifiedIds",
    JSON.stringify([...notifiedIds])
  );
}

// Minta izin notifikasi dari user
function requestNotifPermission() {
  if (!("Notification" in window)) return;
  if (Notification.permission === "default") {
    Notification.requestPermission();
  }
}

// Kirim satu notifikasi browser
function sendNotification(note) {
  if (Notification.permission !== "granted") return;

  const categoryLabel = {
    general:  "📌 Umum",
    college:  "📚 Kuliah",
    shopping: "🛒 Belanja",
    idea:     "💡 Ide",
    personal: "🧍 Personal"
  };

  const notif = new Notification("⏰ Life Inbox — Pengingat!", {
    body: note.text,
    tag:  note.id,
    icon: "https://uelll-arch.github.io/life-inbox-uel/favicon.ico",
    badge: "https://uelll-arch.github.io/life-inbox-uel/favicon.ico",
    data: { id: note.id }
  });

  // Klik notifikasi → fokus ke tab
  notif.onclick = () => {
    window.focus();
    notif.close();
  };
}

// Cek semua catatan yang remindernya sudah lewat / tepat waktu
function checkReminders() {
  const now = new Date();

  notes.forEach(note => {
    if (!note.reminder || note.completed) return;
    if (notifiedIds.has(note.id)) return;

    const reminderTime = new Date(note.reminder);

    // Trigger kalau waktunya sudah lewat (dalam rentang 5 menit ke belakang)
    const diffMs = now - reminderTime;
    if (diffMs >= 0 && diffMs <= 5 * 60 * 1000) {
      sendNotification(note);
      notifiedIds.add(note.id);
      saveNotifiedIds();
      showToast("🔔 Pengingat: " + note.text.substring(0, 40));
    }
  });
}

// Jalankan pengecekan setiap 30 detik
function startReminderChecker() {
  requestNotifPermission();
  checkReminders();
  setInterval(checkReminders, 30 * 1000);
}

// startReminderChecker() dipanggil langsung di dalam checkPinAction
// tepat setelah mainApp.style.display = 'block' (lihat bagian PIN)
//oke
