function toggleMenu() {
  const menu = document.getElementById("menu");
  menu.classList.toggle("active");
}

document.querySelectorAll(".nav-links a").forEach((link) => {
  link.addEventListener("click", () => {
    document.getElementById("menu").classList.remove("active");
  });
});

const textarea = document.getElementById("message");
const counter = document.getElementById("charCount");

if (textarea && counter) {

    textarea.addEventListener("input", () => {

        counter.textContent = textarea.value.length;

    });

}