// loginSuccess.addEventListener("click", (e) => {
//   e.preventDefault(); // Ngăn reload trang

//   let username = document.querySelector(".username").value.trim();
//   let password = document.querySelector(".password").value.trim();

//   let user = userList.find(
//     (u) =>
//       (u.username === username || u.emailPhone === username) &&
//       u.password === password
//   );

//   if (user) {
//     // Save logged in user
//     localStorage.setItem(
//       "isLoggedIn",
//       JSON.stringify({ username: user.username })
//     );

//     alert("Login successful! Redirecting to home page...");
//     window.location.href = "../dashboard/board.html";
//   } else {
//     alert("Wrong password or username/email, please try again.");
//   }
// });

const loginBtn = document.querySelector(".submit");
const username = document.querySelector(".username");
const password = document.querySelector(".password");

loginBtn.addEventListener("click", (e) => {
  e.preventDefault();

  fetch("http://127.0.0.1:5000/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      username: username.value.trim(),
      password: password.value.trim(),
    }),
  })
    .then((res) => {
      if (!res.ok) {
        return res.json().then((err) => {
          throw err;
        });
      }
      return res.json();
    })
    .then((data) => {
      if (data.error) {
        alert(data.error);
      } else {
        console.log("Login successful:", data);

        localStorage.setItem(
          "isLoggedIn",
          JSON.stringify({ username: data.username, authorID: data.authorID })
        );        

        console.log("Saved to localStorage:", {
          username: data.username,
          authorID: data.authorID
        });

        window.location.href = "../dashboard/board.html";
      }
    })
    .catch((err) => console.error("Error:", err));
});
