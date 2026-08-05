document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("forgotForm");
  const emailInput = document.getElementById("email");
  const emailError = document.getElementById("emailError");
  const errorMessage = document.getElementById("errorMessage");
  const successMessage = document.getElementById("successMessage");
  const submitBtn = document.getElementById("submitBtn");

  document.getElementById("currentYear").textContent = new Date().getFullYear();

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = emailInput.value.trim();
    errorMessage.classList.add("hidden");
    successMessage.classList.add("hidden");
    emailError.classList.add("hidden");

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      emailError.classList.remove("hidden");
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = "Sending…";

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || "Something went wrong. Please try again.");
      }

      successMessage.textContent = "If an account exists for that email, a reset link has been sent.";
      successMessage.classList.remove("hidden");
      form.reset();
    } catch (err) {
      errorMessage.textContent = err.message || "Unable to reach the server. Please try again later.";
      errorMessage.classList.remove("hidden");
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = "Send Reset Link";
    }
  });
});
