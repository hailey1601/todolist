// let currentUser = JSON.parse(localStorage.getItem("isLoggedIn"));

// if (!currentUser) {
//   alert("Please log in to use this page!");
//   window.location.href = "../login/login.html";
// } else {
//   document.querySelector(".user-name").textContent = currentUser.username;
// }

// document.addEventListener("DOMContentLoaded", () => {
//   const currentUser = JSON.parse(localStorage.getItem("isLoggedIn"));

//   if (!currentUser || !currentUser.username) {
//     alert("Bạn chưa đăng nhập, vui lòng login lại.");
//     window.location.href = "../login/login.html";
//     return;
//   }

//   console.log("User info from localStorage:", currentUser);

//   // hiển thị user
//   const userInfo = document.querySelector(".user-name");
//   if (userInfo) {
//     userInfo.textContent = `${currentUser.username}`;
//   }
// });

// Giữ theme đã lưu
window.addEventListener("DOMContentLoaded", () => {
  let savedTheme = localStorage.getItem("theme") || "light";
  // let logo = document.querySelector(".logo");

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

let overviewBtn = document.querySelector(".overview-btn");
overviewBtn.style.cssText = `
background-color: #a4c2a5;
color: #4e7410;
border: none;
border-radius: 20px;
`;

let calendarBtn = document.querySelector(".calendar");
calendarBtn.addEventListener("click", () => {
  window.location.href = "../calendar/calen.html";
});


document.addEventListener("DOMContentLoaded", () => {
  const currentUser = JSON.parse(localStorage.getItem("isLoggedIn"));

  if (!currentUser || !currentUser.authorID) {
    alert("Bạn chưa đăng nhập, vui lòng login lại.");
    window.location.href = "../login/login.html";
    return;
  }

  console.log("User info from localStorage:", currentUser);

  // Hiển thị tên user
  const userInfo = document.querySelector(".user-name");
  if (userInfo) {
    userInfo.textContent = `${currentUser.username}`;
  }

  logoutBtn = document.querySelector(".logout-btn");
  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("isLoggedIn");
    alert("You have logged out successfully!");
    window.location.href = "../login/login.html";
  })

  // Input task
  const taskInput = document.querySelector(".task-input");
  const startDate = document.querySelector(".start-date");
  const endDate = document.querySelector(".end-date");
  const prioritySelect = document.querySelector(".task-priority");
  const statusSelect = document.querySelector(".task-status");
  const taskDescription = document.querySelector(".task-description");

  const recentDbList = document.querySelector(".recent-task-list");
  const upcomingDbList = document.querySelector(".upcoming-task-list");
  const completedDbList = document.querySelector(".completed-task-list");

  // ---------------- ADD NEW TASK ----------------
  const addTaskBtn = document.querySelector(".add-task-btn");
  addTaskBtn.addEventListener("click", (e) => {
    e.preventDefault();

    const newTask = {
      title: taskInput.value.trim(),
      description: taskDescription.value.trim(),
      start_date: startDate.value,
      end_date: endDate.value,
      status: statusSelect.value,
      priority: prioritySelect.value,
    };

    fetch(`http://127.0.0.1:5000/task/${currentUser.authorID}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newTask),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("Task saved:", data);
        loadTasks(); // reload tasks sau khi thêm
      })
      .catch((err) => console.error("Error:", err));
  });

  // ---------------- LOAD TASKS ----------------
  function loadTasks() {
    fetch(`http://127.0.0.1:5000/task/${currentUser.authorID}`)
      .then((res) => res.json())
      .then((data) => {
        recentDbList.innerHTML = "";
        upcomingDbList.innerHTML = "";
        completedDbList.innerHTML = "";

        const today = new Date().toISOString().split("T")[0];

        data.forEach((task, i) => {
          const statusText =
            task.status === "todo"
              ? "To Do"
              : task.status === "in_progress"
              ? "In Progress"
              : task.status === "done"
              ? "Done"
              : task.status;

          const taskCard = document.createElement("div");
          taskCard.className = "task-card";
          taskCard.innerHTML = `
            <div class="task-info">
            <input type="checkbox" class="task-checkbox" data-index="${i}" ${
            task.status === "done" ? "checked" : ""
          } />
              <span class="task-title" data-id="${task.id}">${
            task.title
          }</span><br>
              <span class="task-title">${task.description}</span>
              <div class="task-date">
                <span class="due-date">Due: ${task.end_date}</span>
                <span class="due-date">Start: ${task.start_date}</span>
              </div>
              <span class="task-status">Status: ${statusText}</span>
              <span class="priority">Priority: ${task.priority}</span>
            </div>
            <img src="../image/icons8-remove-50.png" class="delete-icon" alt="Delete Task" data-index="${i}" />
          `;

          if (task.status === "done") {
            completedDbList.appendChild(taskCard);
          } else if (task.start_date === today) {
            recentDbList.appendChild(taskCard);
          } else {
            upcomingDbList.appendChild(taskCard);
          }

          // Event delegation for "checkbox"
          const checkbox = taskCard.querySelector(".task-checkbox");

          checkbox.addEventListener("change", async function () {
            const newStatus = checkbox.checked ? "done" : "todo";

            try {
              await fetch(`http://127.0.0.1:5000/task/${task.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: newStatus }),
              });

              loadTasks();
            } catch (err) {
              console.error("Error updating task:", err);
            }
          });

          // Event delegation for "delete"
          const deleteButton = taskCard.querySelector(".delete-icon");

          deleteButton.addEventListener("click", async function () {
            if (confirm("Are you sure you want to delete this task?")) {
              try {
                await fetch(`http://127.0.0.1:5000/task/${task.id}`, {
                  method: "DELETE",
                });
                loadTasks();
              } catch (err) {
                console.error("Error deleting task:", err);
              }
            }
          });
        });
      })
      .catch((err) => console.error("Error:", err));
  }

  // -------- Modal Detail + Edit --------
  const taskDetailModal = document.getElementById("taskDetail");
  const closeModalBtn = document.getElementById("closeModal");
  const editForm = document.getElementById("editForm");

  document.addEventListener("click", function (e) {
    if (e.target.classList.contains("task-title")) {
      const taskId = e.target.dataset.id;

      fetch(`http://127.0.0.1:5000/task/id/${taskId}`)
        .then((res) => res.json())
        .then((task) => {
          console.log(task);

          document.getElementById("edit-id").value = task.id;
          document.getElementById("edit-title").value = task.title;

          if (task.start_date) {
            document.getElementById("edit-start-date").value =
              task.start_date.split("T")[0];
          }
          if (task.end_date) {
            document.getElementById("edit-end-date").value =
              task.end_date.split("T")[0];
          }

          document.getElementById("edit-status").value = task.status;
          document.getElementById("edit-priority").value = task.priority;
          document.getElementById("edit-desc").value = task.description;

          // document.getElementById("edit-tags").value = task.tags || "";

          taskDetailModal.style.display = "block";
        });
    }
  });

  // Close modal
  closeModalBtn.onclick = function () {
    taskDetailModal.style.display = "none";
  };

  // Save update
  editForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const taskId = document.getElementById("edit-id").value;
    const updatedTask = {
      title: document.getElementById("edit-title").value,
      start_date: document.getElementById("edit-start-date").value,
      end_date: document.getElementById("edit-end-date").value,
      status: document.getElementById("edit-status").value,
      priority: document.getElementById("edit-priority").value,
      description: document.getElementById("edit-desc").value,
      // tags: document.getElementById("edit-tags").value,
    };

    fetch(`http://127.0.0.1:5000/task/${taskId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedTask),
    })
      .then((res) => res.json())
      .then(() => {
        alert("Task updated!");
        taskDetailModal.style.display = "none";
        loadTasks(); 
      });
  });

  // Click outside to close
  window.onclick = function (event) {
    if (event.target === taskDetailModal) {
      taskDetailModal.style.display = "none";
    }
  };

  // lần đầu load tasks
  loadTasks();
});