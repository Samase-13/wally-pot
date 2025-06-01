document.addEventListener("DOMContentLoaded", function() {
  var loginForm = document.querySelector(".formulario__login");
  var registerForm = document.querySelector(".formulario__register");
  var btnIniciarSesion = document.getElementById("btn__iniciar-sesion");
  var btnRegistrarse = document.getElementById("btn__registrarse");

  btnIniciarSesion.addEventListener("click", function() {
    loginForm.style.display = "block";
    registerForm.style.display = "none";
  });

  btnRegistrarse.addEventListener("click", function(event) {
    event.preventDefault();
    loginForm.style.display = "none";
    registerForm.style.display = "block";
  });

  loginForm.addEventListener("submit", function(event) {
    event.preventDefault();

    var emailInput = loginForm.querySelector("input[type='text']");
    var passwordInput = loginForm.querySelector("input[type='password']");

    var email = emailInput.value;
    var password = passwordInput.value;

    var users = JSON.parse(localStorage.getItem("users")) || [];
    var user = users.find(function(u) {
      return u.email === email && u.password === password;
    });

    if (user) {
      alert("¡Bienvenido, " + user.username + "!");
      localStorage.setItem("currentUser", JSON.stringify(user)); // Almacenar información del usuario actual
      window.location.href = "index.html";
    } else {
      alert("Usuario o contraseña incorrectos. Inténtalo de nuevo.");
    }

    emailInput.value = "";
    passwordInput.value = "";
  });

  registerForm.addEventListener("submit", function(event) {
    event.preventDefault();

    var fullName = registerForm.querySelectorAll("input")[0].value;
    var email = registerForm.querySelectorAll("input")[1].value;
    var username = registerForm.querySelectorAll("input")[2].value;
    var password = registerForm.querySelectorAll("input")[3].value;
    var image = registerForm.querySelector("#imagen").files[0];

    var users = JSON.parse(localStorage.getItem("users")) || [];

    var existingUser = users.find(function(u) {
      return u.username === username || u.email === email;
    });

    if (existingUser) {
      alert("El usuario o correo electrónico ya existe. Inténtalo con información diferente.");
    } else {
      var reader = new FileReader();
      reader.onload = function() {
        var newUser = {
          fullName: fullName,
          email: email,
          username: username,
          password: password,
          image: reader.result
        };

        users.push(newUser);
        localStorage.setItem("users", JSON.stringify(users));
        localStorage.setItem("currentUser", JSON.stringify(newUser)); // Almacenar información del usuario actual

        registerForm.reset();

        alert("Registro exitoso. Ahora puedes iniciar sesión con tu nuevo usuario.");
        window.location.href = "index.html";
      };
      reader.readAsDataURL(image);
    }
  });
});
