const username = document.querySelector(".username");
const password = document.querySelector(".password");

document.getElementById('register-form').addEventListener('submit', function (e) {
  e.preventDefault();

  fetch("http://127.0.0.1:5000/register", {
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
        return res.json().then(err => { throw err });
      }
      return res.json();
    })
    .then((data) => {
      if (data.error) {
        alert(data.error);
      } else {
        alert("Register successful! You can now login.");
        window.location.href = "../login/login.html"; // điều hướng sang login
      }
    })
    .catch((err) => {
      console.error("Error:", err);
      alert("Register failed: " + (err.error || "Unknown error"));
    });
});