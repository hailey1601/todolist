let currentUser = JSON.parse(localStorage.getItem("isLoggedIn"));

if (!currentUser) {
  alert("Please log in to use this page!");
  window.location.href = "../login/login.html";
} else {
  document.querySelector(".user-name").textContent = currentUser.username;
}

// Hiển thị tên user
const userInfo = document.querySelector(".user-name");
if (userInfo) {
  userInfo.textContent = `${currentUser.username}`;
}

function logout() {
  localStorage.removeItem("isLoggedIn");
  window.location.href = "../login/login.html";
}

// Giữ theme đã lưu
window.addEventListener("DOMContentLoaded", () => {
  let savedTheme = localStorage.getItem("theme") || "light";
  let logo = document.querySelector(".logo");

  document.body.classList.add(`${savedTheme}-mode`);
});

// Bấm nút thì đổi theme, lưu lại
let change = document.querySelector(".light-dark-mode");

change.addEventListener("click", () => {
  let isDark = document.body.classList.contains("dark-mode");

  // Xóa cả 2 class trước khi thêm lại
  document.body.classList.remove("dark-mode", "light-mode");

  let newTheme = isDark ? "light" : "dark";
  document.body.classList.add(`${newTheme}-mode`);
  localStorage.setItem("theme", newTheme);
});

let calendarBtn = document.querySelector(".calendar-btn");
calendarBtn.style.cssText = `
background-color: #a4c2a5;
color: #4e7410;
border: none;
border-radius: 20px;
`;

document.querySelector(".overview-btn").addEventListener("click", () => {
  window.location.href = "../dashboard/board.html";
});

document.addEventListener("DOMContentLoaded", function () {
  let calendarEl = document.getElementById("calendar-detail");

  let calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: "dayGridMonth",
    locale: "vi", // Tiếng Việt
    headerToolbar: {
      left: "prev,next today",
      center: "title",
      right: "dayGridMonth,timeGridWeek,timeGridDay",
    },
    events: [
      fetch(`http://127.0.0.1:5000/task/${currentUser.authorID}`)
      .then(res => res.json())
      .then(tasks => {
        const events = tasks.map(task => ({
          title: task.title,
          start: task.start_date,  
          end: task.end_date || null
        }));
    
        let calendar = new FullCalendar.Calendar(calendarEl, {
          initialView: "dayGridMonth",
          locale: "vi",
          titleFormat: function(date) {
            return `${date.date.month + 1} / ${date.date.year}`;
          }, 
          headerToolbar: {
            left: "prev,next today",
            center: "title",
            right: "dayGridMonth,timeGridWeek,timeGridDay",
          },
          events: events
        });
    
        calendar.render();
      })
    ],
  });

  calendar.render();
});
