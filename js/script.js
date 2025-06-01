document.getElementById("loginForm").addEventListener("submit", function(event) {
  event.preventDefault(); 

  var username = document.getElementById("username").value;
  var password = document.getElementById("password").value;

  var users = JSON.parse(localStorage.getItem("users")) || [];
  var user = users.find(function(u) {
    return u.username === username && u.password === password;
  });

  if (user) {
    alert("¡Bienvenido, " + username + "!");
  } else {
    alert("Usuario o contraseña incorrectos. Inténtalo de nuevo.");
  }
});

document.getElementById("registerForm").addEventListener("submit", function(event) {
  event.preventDefault(); 

  var username = document.getElementById("regUsername").value;
  var password = document.getElementById("regPassword").value;

  var users = JSON.parse(localStorage.getItem("users")) || [];

  var existingUser = users.find(function(u) {
    return u.username === username;
  });

  if (existingUser) {
    alert("El usuario ya existe. Inténtalo con un nombre de usuario diferente.");
  } else {
    var newUser = {
      username: username,
      password: password
    };

    users.push(newUser);

    localStorage.setItem("users", JSON.stringify(users));

    document.getElementById("regUsername").value = "";
    document.getElementById("regPassword").value = "";

    alert("Registro exitoso. Ahora puedes iniciar sesión con tu nuevo usuario.");
  }
});
