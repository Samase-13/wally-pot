window.addEventListener("scroll", function() {
  var nav = document.querySelector(".nav");
  var scrollPosition = window.pageYOffset || document.documentElement.scrollTop;
  var offset = 300; // Ajusta este valor para determinar cuánto más abajo debe desplazarse el usuario antes de que aparezca el elemento
  
  if (scrollPosition > offset) {
    nav.classList.add("sticky");
    nav.classList.add("show");
  } else {
    nav.classList.remove("sticky");
    nav.classList.remove("show");
  }
});
