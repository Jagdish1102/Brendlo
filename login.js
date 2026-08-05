document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("loginForm");
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");
  const togglePassword = document.getElementById("togglePassword");
  const rememberMe = document.getElementById("rememberMe");
  const errorMessage = document.getElementById("errorMessage");
  const loginBtn = document.getElementById("loginBtn");

  // Set current year
  document.getElementById("currentYear").textContent = new Date().getFullYear();

  // Prefill remembered email
  const rememberedEmail = localStorage.getItem("rememberEmail");
  if (rememberedEmail) {
    emailInput.value = rememberedEmail;
    rememberMe.checked = true;
  }

  // Toggle password visibility
  togglePassword.addEventListener("click", () => {
    const type = passwordInput.type === "password" ? "text" : "password";
    passwordInput.type = type;
  });

  // Handle form submit
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();

    if (!email || !password) {
      errorMessage.textContent = "Please enter email and password.";
      errorMessage.classList.remove("hidden");
      return;
    }

    // Basic email validation
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      errorMessage.textContent = "Please enter a valid email address.";
      errorMessage.classList.remove("hidden");
      return;
    }

    errorMessage.classList.add("hidden");
    loginBtn.disabled = true;
    loginBtn.textContent = "Signing in…";

    try {
      // Correct API request
      const response = await fetch("http://localhost:8080/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok || !data.token) {
        throw new Error(data.message || "Login failed!");
      }

      // Save token
      if (rememberMe.checked) {
        localStorage.setItem("auth_token", data.token);
        localStorage.setItem("rememberEmail", email);
      } else {
        sessionStorage.setItem("auth_token", data.token);
        localStorage.removeItem("rememberEmail");
      }

      // Redirect
      window.location.href = "dashboard.html";

    } catch (err) {
      errorMessage.textContent = err.message || "Login failed!";
      errorMessage.classList.remove("hidden");
    } finally {
      loginBtn.disabled = false;
      loginBtn.textContent = "Login";
    }
  });
});
