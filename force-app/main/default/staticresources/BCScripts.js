// --- Data for Dropdowns ---
const tiposElementosSeguridad = [
    { descripcion: "PORTONES METÁLICOS EN VÍAS PEATONALES", tipo: "TIPO 1" },
    { descripcion: "PORTONES METÁLICOS EN CALLES VEHICULARES CON ACERAS MENORES A 1,50 METROS", tipo: "TIPO 2" },
    { descripcion: "PORTONES METÁLICOS EN CALLES VEHICULARES CON ACERAS IGUALES O MAYORES A 1,50 METROS", tipo: "TIPO 3" },
    { descripcion: "OTROS ELEMENTOS DE SEGURIDAD", tipo: "OTROS" }
];

const tipos_de_solicitus = [
    "Regularización",
    "Primera vez",
    "Renovación"
];

// --- Array to Store Added Rows ---
const registrosElementosSeguridad = [];

// --- Function to Add a New Row ---
function agregarRegistro(event) {
    if (event) {
        event.preventDefault();
    }

    const tipoElementoSelect = document.getElementById('tipoElemento');
    const tipoSolicitudSelect = document.getElementById('tipoSolicitud');

    const direccion = document.getElementById('direccionElemento').value;
    const latitud = document.getElementById('latitudElemento').value;
    const longitud = document.getElementById('longitudElemento').value;

    const tipoSolicitudText = tipoSolicitudSelect.options[tipoSolicitudSelect.selectedIndex].text;
    const tipoSolicitudValue = tipoSolicitudSelect.value;

    const tipoElementoValue = tipoElementoSelect.value;
    const tipoElementoSeleccionado = tiposElementosSeguridad.find(elemento => elemento.tipo === tipoElementoValue);

    if (!tipoElementoValue || !direccion || !latitud || !longitud || !tipoSolicitudValue) {
        mostrarMensajeErrorJS('Por favor complete todos los campos del registro');
        return;
    }

    const coordenadas = `${latitud}, ${longitud}`;

    registrosElementosSeguridad.push({
        tipoElemento: tipoElementoSeleccionado,
        direccion,
        coordenadas,
        tipoSolicitud: tipoSolicitudText
    });

    actualizarTabla();

    document.getElementById('direccionElemento').value = '';
    document.getElementById('latitudElemento').value = '';
    document.getElementById('longitudElemento').value = '';
}

// --- Function to Delete a Row ---
function eliminarRegistro(index) {
    if (confirm('¿Está seguro de que desea eliminar este registro?')) {
        registrosElementosSeguridad.splice(index, 1);
        actualizarTabla();
    }
}

// --- Function to Update Checkbox Based on File Input ---
function actualizarCheckbox(fileId, checkboxId, nombreArchivoId) {
    const archivo = document.getElementById(fileId);
    const checkbox = document.getElementById(checkboxId);
    const nombreArchivoSpan = document.getElementById(nombreArchivoId);

    if (archivo.files.length > 0) {
        checkbox.checked = true;
        if (nombreArchivoSpan) {
            nombreArchivoSpan.textContent = archivo.files[0].name;
        }

    } else {
        checkbox.checked = false;
        if (nombreArchivoSpan) {
            nombreArchivoSpan.textContent = '';
        }

    }
}

// --- Function to Show/Hide Forms Based on Type ---
function mostrarFormulario() {
    const tipoSeleccionado = document.getElementById('tipoFormulario').value;
    const formularioJuridica = document.querySelector('.formulario-juridica');
    const formularioNatural = document.querySelector('.formulario-natural');

    formularioJuridica.classList.remove('visible');
    formularioNatural.classList.remove('visible');

    setTimeout(() => {
        formularioJuridica.style.display = 'none';
        formularioNatural.style.display = 'none';

        if (tipoSeleccionado === 'juridica') {
            formularioJuridica.style.display = 'block';
            formularioJuridica.offsetHeight;
            formularioJuridica.classList.add('visible');
        } else if (tipoSeleccionado === 'natural') {
            formularioNatural.style.display = 'block';
            formularioNatural.offsetHeight;
            formularioNatural.classList.add('visible');
        }
    }, 300);
}


// --- Function to Clear *ALL* Form Fields ---
function limpiarTodosLosCampos() {
    const camposJuridica = [
        'nombreEmpresaJuridica', 'rucJuridica', 'direccionJuridica',
        'correoJuridica', 'telefonoJuridica', 'representanteLegalJuridica',
        'identificacionRepresentanteJuridica'
    ];

    const camposNatural = [
        'nombresApellidosNatural', 'ccNatural', 'direccionNatural',
        'correoNatural', 'telefonoNatural'
    ];

    const archivos = [
        'registroFile', 'actaFile', 'planosFile', 'fotosFile', 'comprobanteFile'
    ];

    const checkboxes = [
        'registroCheckbox', 'actaCheckbox', 'planosCheckbox', 'fotosCheckbox', 'comprobanteCheckbox'
    ];

    camposJuridica.forEach(campo => {
        const elemento = document.getElementById(campo);
        if (elemento) elemento.value = '';
    });
    camposNatural.forEach(campo => {
        const elemento = document.getElementById(campo);
        if (elemento) elemento.value = '';
    });
    archivos.forEach(archivo => {
        const elemento = document.getElementById(archivo);
        if (elemento) elemento.value = '';
    });
    checkboxes.forEach(checkbox => {
        const elemento = document.getElementById(checkbox);
        if (elemento) elemento.checked = false;
    });

    limpiarFormularioDirecciones();
    registrosElementosSeguridad.length = 0;
    actualizarTabla();

    const aceptaTerminos = document.getElementById('aceptaTerminos');
    if (aceptaTerminos) aceptaTerminos.checked = false;
}

// --- Function to Clear *ONLY* Address Input Fields ---
function limpiarFormularioDirecciones() {
    document.getElementById('direccionElemento').value = '';
    document.getElementById('latitudElemento').value = '';
    document.getElementById('longitudElemento').value = '';
}

// --- Validation Functions ---
function validarFormulario() {
    const tipoPersona = document.getElementById('tipoFormulario').value;
    if (!tipoPersona) {
        mostrarMensajeErrorJS('Debe seleccionar un tipo de persona');
        return false;
    }

    if (!document.getElementById('aceptaTerminos').checked) {
        mostrarMensajeErrorJS('Debe aceptar los términos y condiciones');
        return false;
    }

    if (registrosElementosSeguridad.length === 0) {
        mostrarMensajeErrorJS('Debe agregar al menos un elemento de seguridad.');
        return false;
    }

    if (tipoPersona === 'juridica') {
        return validarFormularioJuridica();
    } else if (tipoPersona === 'natural') {
        return validarFormularioNatural();
    }

    return true;
}

function enviarFormulario() {
    if (!validarFormulario()) {
        return;
    }
    if (!validarArchivosRequeridos()) {
        return;
    }

    mostrarMensajeConfirmacionJS();
    limpiarTodosLosCampos();
    mostrarFormulario();
}

function validarFormularioJuridica() {
    const campos = [
        'nombreEmpresaJuridica', 'rucJuridica', 'direccionJuridica',
        'correoJuridica', 'telefonoJuridica', 'representanteLegalJuridica',
        'identificacionRepresentanteJuridica'
    ];
    //Validacion RUC
    const rucValido = validarRUC(document.getElementById('rucJuridica').value);
    if (!rucValido) {
        mostrarMensajeErrorJS('Por favor, ingrese un RUC válido.');
        return false;  // Detener la validación si el RUC no es válido.
    }
    // Validacion de la identificacion del representante legal
    const idRepresentanteValido = validarCedula(document.getElementById('identificacionRepresentanteJuridica').value);
    if (!idRepresentanteValido) {
        mostrarMensajeErrorJS('Por favor, ingrese una cédula válida para el representante legal.');
        return false; // Detener si la cedula no es valida.
    }

    return validarCamposRequeridos(campos, 'jurídica');
}

function validarFormularioNatural() {
    const campos = [
        'nombresApellidosNatural', 'ccNatural', 'direccionNatural',
        'correoNatural', 'telefonoNatural'
    ];

    //Validacion de cedula
    const cedulaValida = validarCedula(document.getElementById('ccNatural').value);
    if (!cedulaValida) {
        mostrarMensajeErrorJS('Por favor, ingrese una cédula válida.');
        return false; // Detener si la cedula no es valida
    }

    return validarCamposRequeridos(campos, 'natural');
}

function validarCamposRequeridos(campos, tipoPersona) {
    for (const campo of campos) {
        if (!document.getElementById(campo).value) {
            mostrarMensajeErrorJS(`Todos los campos son requeridos para persona ${tipoPersona}`);
            return false;
        }
    }
    return true;
}

function validarArchivosRequeridos() {
    const checkboxes = [
        'actaCheckbox', 'planosCheckbox', 'fotosCheckbox', 'comprobanteCheckbox'
    ];
    for (const checkbox of checkboxes) {
        if (!document.getElementById(checkbox).checked) {
            mostrarMensajeErrorJS('Debe cargar todos los archivos requeridos');
            return false;
        }
    }
    return true;
}


// --- FUNCIONES DE VALIDACION DE CEDULA Y RUC ---

function validarCedula(cedula) {
    if (cedula.length !== 10) {
        return false;
    }
    if (/^([0-9])*$/.test(cedula) == false) {
        return false;
    }
    let suma = 0;
    for (let i = 0; i < 9; i++) {
        let digito = parseInt(cedula.charAt(i));
        if (i % 2 == 0) {
            digito = digito * 2;
            if (digito > 9) {
                digito = digito - 9;
            }
        }
        suma = suma + digito;
    }

    let modulo = suma % 10;
    let verificador = 0;
    if (modulo != 0) {
        verificador = 10 - modulo;
    }

    if (verificador != parseInt(cedula.charAt(9))) {
        return false;
    }

    return true; //Cedula Correcta
}

function validarRUC(ruc) {
    if (ruc.length < 13) { //Minimo 13 digitos
        return false;
    }

    if (/^([0-9])*$/.test(ruc) == false) { //Solo numeros
        return false
    }

    // Validar los dos primeros dígitos (provincia)
    const provincia = parseInt(ruc.substring(0, 2));
    if (provincia < 1 || provincia > 24) {
        return false;
    }

    //  Verificación del tercer dígito
    const tercerDigito = parseInt(ruc.charAt(2));
    if (tercerDigito > 6) {
        return false
    }

    //Verificar el digito verificador

    let coeficientes = [];
    let verificador = parseInt(ruc.charAt(9));
    let suma = 0;

    if (tercerDigito < 6) {
        // Persona natural o RUC de persona natural
        coeficientes = [2, 1, 2, 1, 2, 1, 2, 1, 2];
    } else if (tercerDigito === 6) { // Entidades Publicas
        coeficientes = [3, 2, 7, 6, 5, 4, 3, 2, 0];
        verificador = parseInt(ruc.charAt(8));
    } else if (tercerDigito === 9) { // Persona Juridica
        coeficientes = [4, 3, 2, 7, 6, 5, 4, 3, 2];
    } else {
        return false
    }

    //Si el tercer digito es menor que 6 se tiene un ruc de persona natural por lo que tambien tiene un digito verificador
    for (let i = 0; i < coeficientes.length; i++) {
        let digito = parseInt(ruc.charAt(i));
        digito = digito * coeficientes[i];
        if (digito > 9 && tercerDigito < 6) {
            digito = digito - 9;
        }
        suma = suma + digito;
    }

    let modulo = suma % 11;
    let validador = 0;
    if (modulo != 0) {
        validador = 11 - modulo;
    }

    if (validador != verificador) {
        return false
    }

    return true;
}

// --- EVENT LISTENERS PARA VALIDACION EN TIEMPO REAL ---

function agregarValidacionEnTiempoReal(inputId, funcionValidacion) {
    const inputElement = document.getElementById(inputId);
    if (inputElement) {
        inputElement.addEventListener('blur', function () { // 'blur' se activa cuando el campo pierde el foco
            if (!funcionValidacion(this.value)) {
                mostrarMensajeErrorJS(`El valor ingresado en ${this.placeholder} no es válido.`);
            }
        });
    }
}


// --- Function to Update the Table ---
function actualizarTabla() {
    const tablaRegistro = document.querySelector('.tabla-registro');
    const tbody = tablaRegistro.querySelector('tbody');
    tbody.innerHTML = '';

    registrosElementosSeguridad.forEach((registro, index) => {
        const fila = document.createElement('tr');
        fila.classList.add('tabla-fila-entrada');

        fila.innerHTML = `
            <td class="truncate" style="text-align: center;" title="${registro.tipoElemento.descripcion}">${registro.tipoElemento.tipo}</td>
            <td class="truncate" title="${registro.direccion}">${registro.direccion}</td>
            <td style="text-align: center;">${registro.coordenadas}</td>
            <td style="text-align: center;">${registro.tipoSolicitud}</td>
            <td>
                <button onclick="eliminarRegistro(${index})" class="eliminar-registro">
                    Eliminar
                </button>
            </td>
        `;
        tbody.appendChild(fila);

        truncarTextoTabla();
        agregarEventosHover();
    });
}

function truncarTextoTabla() {
    const celdasTruncadas = document.querySelectorAll('.tabla-registro td.truncate');

    celdasTruncadas.forEach(celda => {
        const textoCompleto = celda.textContent;
        const limite = 50;

        if (textoCompleto.length > limite) {
            const textoTruncado = textoCompleto.substring(0, limite) + '...';
            celda.textContent = textoTruncado;
            celda.setAttribute('title', textoCompleto);
        }
    });
}

function agregarEventosHover() {
    const celdasTruncadas = document.querySelectorAll('.tabla-registro td.truncate');

    celdasTruncadas.forEach(celda => {
        const textoTruncado = celda.textContent;
        const textoCompleto = celda.getAttribute('title');

        celda.addEventListener('mouseover', function () {
            celda.textContent = textoCompleto;
        });

        celda.addEventListener('mouseout', function () {
            celda.textContent = textoTruncado;
        });
    });
}

// --- Placeholder Functions for Messages (Replace with your implementation) ---
function mostrarMensajeErrorJS(mensaje) {
    alert(mensaje);
}

function mostrarMensajeConfirmacionJS() {
    alert('Formulario enviado correctamente.');
}

// --- DOMContentLoaded Event: Populate Dropdowns and Initial Setup ---
document.addEventListener('DOMContentLoaded', function () {

    const tipoElementoSelect = document.getElementById('tipoElemento');
    tipoElementoSelect.innerHTML = '<option value="">Seleccione...</option>';
    tiposElementosSeguridad.forEach(elemento => {
        const option = document.createElement('option');
        option.value = elemento.tipo;
        option.textContent = elemento.descripcion;
        tipoElementoSelect.appendChild(option);
    });

    const tipoSolicitudSelect = document.getElementById('tipoSolicitud');
    tipoSolicitudSelect.innerHTML = '<option value="">Seleccione...</option>';
    tipos_de_solicitus.forEach(tipo => {
        const option = document.createElement('option');
        option.value = tipo;
        option.textContent = tipo.toUpperCase();
        tipoSolicitudSelect.appendChild(option);
    });

    const formularioJuridica = document.querySelector('.formulario-juridica');
    const formularioNatural = document.querySelector('.formulario-natural');
    if (formularioJuridica) formularioJuridica.style.display = 'none';
    if (formularioNatural) formularioNatural.style.display = 'none';

    mostrarFormulario();
    truncarTextoTabla();
    agregarEventosHover();

    // Agregar validación en tiempo real a los campos de cédula y RUC.
    agregarValidacionEnTiempoReal('ccNatural', validarCedula);
    agregarValidacionEnTiempoReal('rucJuridica', validarRUC);
    agregarValidacionEnTiempoReal('identificacionRepresentanteJuridica', validarCedula);
});