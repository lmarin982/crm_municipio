// --- Utilidades Generales ---
function mostrarMensaje(tipo, mensaje) {
    if (tipo === 'error') {
        alert(`Error: ${mensaje}`);
    } else if (tipo === 'confirmacion') {
        alert(mensaje);
    }
}

function limpiarCampos(campos) {
    campos.forEach(campo => {
        const elemento = document.getElementById(campo);
        if (elemento) elemento.value = '';
    });
}

function limpiarCheckboxes(checkboxes) {
    checkboxes.forEach(checkbox => {
        const elemento = document.getElementById(checkbox);
        if (elemento) elemento.checked = false;
    });
}

function limpiarArchivos(archivos) {
    archivos.forEach(archivo => {
        const elemento = document.getElementById(archivo);
        if (elemento) elemento.value = '';
    });
}

function validarCamposRequeridos(campos, tipoPersona) {
    for (const campo of campos) {
        if (!document.getElementById(campo).value) {
            mostrarMensaje('error', `Todos los campos son requeridos para persona ${tipoPersona}`);
            return false;
        }
    }
    return true;
}

// --- Validaciones ---
function validarCedula(cedula) {
    if (cedula.length !== 10 || !/^\d+$/.test(cedula)) return false;

    let suma = 0;
    for (let i = 0; i < 9; i++) {
        let digito = parseInt(cedula.charAt(i));
        if (i % 2 === 0) {
            digito *= 2;
            if (digito > 9) digito -= 9;
        }
        suma += digito;
    }

    const verificador = (10 - (suma % 10)) % 10;
    return verificador === parseInt(cedula.charAt(9));
}

function validarRUC(ruc) {
    if (ruc.length !== 13 || !/^\d+$/.test(ruc)) return false;

    const provincia = parseInt(ruc.substring(0, 2));
    if (provincia < 1 || provincia > 24) return false;

    const tercerDigito = parseInt(ruc.charAt(2));
    if (tercerDigito > 6) return false;

    const coeficientes = tercerDigito < 6
        ? [2, 1, 2, 1, 2, 1, 2, 1, 2]
        : tercerDigito === 6
            ? [3, 2, 7, 6, 5, 4, 3, 2, 0]
            : [4, 3, 2, 7, 6, 5, 4, 3, 2];

    let suma = 0;
    for (let i = 0; i < coeficientes.length; i++) {
        let digito = parseInt(ruc.charAt(i)) * coeficientes[i];
        if (tercerDigito < 6 && digito > 9) digito -= 9;
        suma += digito;
    }

    const modulo = tercerDigito < 6 ? 10 : 11;
    const verificador = (modulo - (suma % modulo)) % modulo;
    return verificador === parseInt(ruc.charAt(tercerDigito === 6 ? 8 : 9));
}

function validarCedulaORUC(valor) {
    return validarCedula(valor) || validarRUC(valor);
}

// --- Manejo de Tablas ---
function actualizarTabla(tablaSelector, registros, columnas, acciones = []) {
    const tabla = document.querySelector(`${tablaSelector} tbody`);
    tabla.innerHTML = ''; // Limpia la tabla

    registros.forEach((registro, index) => {
        const fila = document.createElement('tr');
        fila.classList.add('tabla-fila');

        // Generar columnas dinámicamente
        columnas.forEach(columna => {
            const celda = document.createElement('td');
            celda.textContent = registro[columna] || '';
            fila.appendChild(celda);
        });

        // Agregar acciones (botones)
        acciones.forEach(accion => {
            const boton = document.createElement('button');
            boton.textContent = accion.texto;
            boton.className = accion.clase;
            boton.onclick = () => accion.funcion(index);
            const celdaAccion = document.createElement('td');
            celdaAccion.appendChild(boton);
            fila.appendChild(celdaAccion);
        });

        tabla.appendChild(fila);
    });
}

// --- Validar si la tabla tiene filas ---
function validarTablaConDatos(tablaSelector) {
    const tabla = document.querySelector(`${tablaSelector} tbody`);
    if (!tabla || tabla.rows.length === 0) {
        mostrarMensaje('error', 'Debe agregar al menos un elemento a la tabla antes de enviar el formulario.');
        return false;
    }
    return true;
}

// --- Manejo de Formularios ---
function limpiarFormularioNatural() {
    limpiarCampos(['nombresApellidosNatural', 'ccNatural', 'direccionNatural', 'correoNatural', 'telefonoNatural']);
    limpiarArchivos(['registroFile', 'actaFile', 'planosFile', 'fotosFile', 'comprobanteFile']);
    limpiarCheckboxes(['registroCheckbox', 'actaCheckbox', 'planosCheckbox', 'fotosCheckbox', 'comprobanteCheckbox']);
}

// --- Validar formulario completo ---
function validarFormularioNatural() {
    const campos = ['nombresApellidosNatural', 'ccNatural', 'direccionNatural', 'correoNatural', 'telefonoNatural'];
    
    // Validar campos requeridos
    if (!validarCamposRequeridos(campos, 'natural')) return false;

    // Validar cédula
    if (!validarCedula(document.getElementById('ccNatural').value)) {
        mostrarMensaje('error', 'Por favor, ingrese una cédula válida.');
        return false;
    }

    // Validar si la tabla tiene datos
    if (!validarTablaConDatos('.tabla-registro')) return false;

    return true;
}

// --- Eventos DOM ---
document.addEventListener('DOMContentLoaded', () => {
    // Inicializar dropdowns
    const tipoElementoSelect = document.getElementById('tipoElemento');
    const tipoSolicitudSelect = document.getElementById('tipoSolicitud');

    const tiposElementosSeguridad = [
        { descripcion: "PORTONES METÁLICOS EN VÍAS PEATONALES", tipo: "TIPO 1" },
        { descripcion: "PORTONES METÁLICOS EN CALLES VEHICULARES CON ACERAS MENORES A 1,50 METROS", tipo: "TIPO 2" },
        { descripcion: "PORTONES METÁLICOS EN CALLES VEHICULARES CON ACERAS IGUALES O MAYORES A 1,50 METROS", tipo: "TIPO 3" },
        { descripcion: "OTROS ELEMENTOS DE SEGURIDAD", tipo: "OTROS" }
    ];

    const tipos_de_solicitudes = ["Primera vez", "Renovación", "Regularización"];

    tipoElementoSelect.innerHTML = '<option value="">Seleccione...</option>';
    tiposElementosSeguridad.forEach(elemento => {
        const option = document.createElement('option');
        option.value = elemento.tipo;
        option.textContent = elemento.descripcion;
        tipoElementoSelect.appendChild(option);
    });

    tipoSolicitudSelect.innerHTML = '<option value="">Seleccione...</option>';
    tipos_de_solicitudes.forEach(tipo => {
        const option = document.createElement('option');
        option.value = tipo;
        option.textContent = tipo.toUpperCase();
        tipoSolicitudSelect.appendChild(option);
    });

    // Validación en tiempo real
    const cedulaInput = document.getElementById('ccNatural');
    cedulaInput.addEventListener('blur', () => {
        if (!validarCedula(cedulaInput.value)) {
            mostrarMensaje('error', 'La cédula ingresada no es válida.');
        }
    });
});
