document.addEventListener("DOMContentLoaded", async function () {
  try {
    const response = await fetch("http://localhost:8081/auth/protected", {
      method: "GET",
      credentials: "include",
    });

    const result = await response.json();
    if (response.ok) {
      let spanElement = document.getElementById("username");
      spanElement.textContent =
        result.user.firstname + ` ` + result.user.lastname;
    } else {
      window.location.href = "login.html";
    }
  } catch (error) {
    console.error("Error fetching home:", error);
    window.location.href = "login.html";
  }
});

const logoutButton = document.getElementById("logoutBtn");
if (logoutButton) {
  logoutButton.addEventListener("click", async function () {
    try {
      const response = await fetch("http://localhost:8081/auth/logout", {
        method: "POST",
        credentials: "include",
      });

      const result = await response.json();
      if (response.ok) {
        window.location.href = "login";
      } else {
        alert(result.message);
      }
    } catch (error) {
      console.error("Error logging out:", error);
      alert("Logout failed. Please try again.");
    }
  });
}

function startQuiz(id_quiz) {
  // Arahkan ke halaman quiz dengan ID kuis dan pilihan sebagai URL parameters
  const url = `quiz?id_quiz=${id_quiz}`;
  window.location.href = url;
}

function startTantanganhiragana() {
  tantangan = "hiragana";
  const url = `tantangan?tantangan=${tantangan}`;
  window.location.href = url;
}

function startTantangankatakana() {
  tantangan = "katakana";
  const url = `tantangan?tantangan=${tantangan}`;
  window.location.href = url;
}
