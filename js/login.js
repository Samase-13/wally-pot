let listaEmpleados = [];

const objEmpleado = {
    id: '',
    EMAIL: '',
    CONTRA: ''
}

let editando = false;

const formulario = document.querySelector('#formulario');
const emailInput = document.querySelector('#email');
const contraInput = document.querySelector('#contra');
const btnEntrarInput = document.querySelector('#btnEntrar');

formulario.addEventListener('submit', validarFormulario);

function validarFormulario(e) {
    e.preventDefault();

    if(emailInput.value === '' || contraInput.value === '') {
        alert('Todos los campos se deben llenar');
        return;
    }

    if(editando) {
        editarEmpleado();
        editando = false;
    } else {
        objEmpleado.id = Date.now();
        objEmpleado.EMAIL = emailInput.value;
        objEmpleado.CONTRA = contraInput.value;

        agregarEmpleado();
    }
}