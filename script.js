function toggleMenu() {
  const menu = document.getElementById("menu");
  const button = document.querySelector(".menu-toggle");

  if (!menu || !button) return;

  const isOpen = menu.classList.toggle("active");
  button.setAttribute("aria-expanded", String(isOpen));
}

document.querySelectorAll(".nav-links a").forEach((link) => {
  link.addEventListener("click", () => {
    const menu = document.getElementById("menu");
    const button = document.querySelector(".menu-toggle");

    if (menu) menu.classList.remove("active");
    if (button) button.setAttribute("aria-expanded", "false");
  });
});

const textarea = document.getElementById("message");
const counter = document.getElementById("charCount");

if (textarea && counter) {
  counter.textContent = textarea.value.length;

  textarea.addEventListener("input", () => {
    counter.textContent = textarea.value.length;
  });
}
