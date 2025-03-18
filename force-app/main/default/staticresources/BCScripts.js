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
    const tipoElementoSeleccionado = tiposElementosSeguridad.find(elemento => elemento.tipo === tipoElementoValue); // Encuentra el objeto correspondiente

    if (!tipoElementoValue || !direccion || !latitud || !longitud || !tipoSolicitudValue) {
        mostrarMensajeErrorJS('Por favor complete todos los campos del registro');
        return;
    }

    const coordenadas = `${latitud}, ${longitud}`;

    registrosElementosSeguridad.push({
        tipoElemento: tipoElementoSeleccionado, // Guarda el objeto completo
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
        registrosElementosSeguridad.splice(index, 1); // Remove the correct element
        actualizarTabla(); // Re-render the table
    }
}

// --- Function to Update Checkbox Based on File Input ---
function actualizarCheckbox(fileId, checkboxId, nombreArchivoId) {
    const archivo = document.getElementById(fileId);
    const checkbox = document.getElementById(checkboxId);
    const nombreArchivoSpan = document.getElementById(nombreArchivoId);

    if (archivo.files.length > 0) {
        checkbox.checked = true;
        nombreArchivoSpan.textContent = archivo.files[0].name; // Muestra el nombre del archivo
    } else {
        checkbox.checked = false;
        nombreArchivoSpan.textContent = ''; // Limpia el nombre del archivo
    }
}

// --- Function to Show/Hide Forms Based on Type ---
function mostrarFormulario() {
    const tipoSeleccionado = document.getElementById('tipoFormulario').value;
    const formularioJuridica = document.querySelector('.formulario-juridica');
    const formularioNatural = document.querySelector('.formulario-natural');

    // Remove 'visible' class first
    formularioJuridica.classList.remove('visible');
    formularioNatural.classList.remove('visible');

    // Use setTimeout for CSS transitions (optional, but nice)
    setTimeout(() => {
        formularioJuridica.style.display = 'none';
        formularioNatural.style.display = 'none';

        if (tipoSeleccionado === 'juridica') {
            formularioJuridica.style.display = 'block';
            formularioJuridica.offsetHeight; // Trigger reflow (for transitions)
            formularioJuridica.classList.add('visible');
        } else if (tipoSeleccionado === 'natural') {
            formularioNatural.style.display = 'block';
            formularioNatural.offsetHeight; // Trigger reflow
            formularioNatural.classList.add('visible');
        }
    }, 300); // Match CSS transition time
}


// --- Function to Clear *ALL* Form Fields (for Reset/Submit) ---
function limpiarTodosLosCampos() {
    // Arrays of element IDs for easier clearing
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

    // Clear fields, handling potential null elements
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

    // Clear the added rows table
    limpiarFormularioDirecciones(); // Clear input fields in the "add row" section
    registrosElementosSeguridad.length = 0; // Empty the array
    actualizarTabla();  // Re-render the table (now empty)

    // Clear terms and conditions checkbox
    const aceptaTerminos = document.getElementById('aceptaTerminos');
    if (aceptaTerminos) aceptaTerminos.checked = false;
}

// --- Function to Clear *ONLY* Address Input Fields ---
// **CORRECTED:** This now *only* clears the input fields, *NOT* the dropdowns
function limpiarFormularioDirecciones() {
    document.getElementById('direccionElemento').value = '';
    document.getElementById('latitudElemento').value = '';
    document.getElementById('longitudElemento').value = '';
    // *DO NOT* clear tipoElemento and tipoSolicitud here!
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

    if (tipoPersona === 'juridica') {
        return validarFormularioJuridica();
    } else if (tipoPersona === 'natural') {
        return validarFormularioNatural();
    }

    return true; // Should not reach here, but allow for flexibility
}

function enviarFormulario() {
    if (!validarFormulario()) {
        return;
    }
    if (!validarArchivosRequeridos()) {
        return;
    }

    mostrarMensajeConfirmacionJS(); // Replace with your submission logic
    limpiarTodosLosCampos();
    mostrarFormulario();
}

function validarFormularioJuridica() {
    const campos = [
        'nombreEmpresaJuridica', 'rucJuridica', 'direccionJuridica',
        'correoJuridica', 'telefonoJuridica', 'representanteLegalJuridica',
        'identificacionRepresentanteJuridica'
    ];
    return validarCamposRequeridos(campos, 'jurídica');
}

function validarFormularioNatural() {
    const campos = [
        'nombresApellidosNatural', 'ccNatural', 'direccionNatural',
        'correoNatural', 'telefonoNatural'
    ];
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

// --- Function to Update the Table ---
function actualizarTabla() {
    const tablaRegistro = document.querySelector('.tabla-registro');
    const tbody = tablaRegistro.querySelector('tbody');
    tbody.innerHTML = '';

    registrosElementosSeguridad.forEach((registro, index) => {
        const fila = document.createElement('tr');
        fila.classList.add('tabla-fila-entrada');

        fila.innerHTML = `
            <td class="truncate" style="text-align: center;" title="${registro.tipoElemento}">${registro.tipoElemento.tipo}</td>
            <td class="truncate" title="${registro.direccion}">${registro.direccion}</td>
            <td>${registro.coordenadas}</td>
            <td>${registro.tipoSolicitud}</td>
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
        const limite = 50; // Define el límite de caracteres antes de truncar

        if (textoCompleto.length > limite) {
            const textoTruncado = textoCompleto.substring(0, limite) + '...';
            celda.textContent = textoTruncado;
            celda.setAttribute('title', textoCompleto); // Agrega tooltip
        }
    });
}

function agregarEventosHover() {
    const celdasTruncadas = document.querySelectorAll('.tabla-registro td.truncate');

    celdasTruncadas.forEach(celda => {
        const textoTruncado = celda.textContent;
        const textoCompleto = celda.getAttribute('title');

        celda.addEventListener('mouseover', function () {
            celda.textContent = textoCompleto; // Muestra el texto completo
        });

        celda.addEventListener('mouseout', function () {
            celda.textContent = textoTruncado; // Restaura el texto truncado
        });
    });
}

// --- Placeholder Functions for Messages (Replace with your implementation) ---
function mostrarMensajeErrorJS(mensaje) {
    alert(mensaje); // Replace with, e.g., a modal or a message div
}

function mostrarMensajeConfirmacionJS() {
    alert('Formulario enviado correctamente.'); // Replace with your logic
}

// --- DOMContentLoaded Event: Populate Dropdowns and Initial Setup ---
document.addEventListener('DOMContentLoaded', function () {

    // Populate "Tipo de Elemento" dropdown
    const tipoElementoSelect = document.getElementById('tipoElemento');
    tipoElementoSelect.innerHTML = '<option value="">Seleccione...</option>'; // Add default option
    tiposElementosSeguridad.forEach(elemento => {
        const option = document.createElement('option');
        option.value = elemento.tipo; // Use 'tipo' as the value
        option.textContent = elemento.descripcion; // Use 'descripcion' as the text
        tipoElementoSelect.appendChild(option);
    });

    // Populate "Tipo de Solicitud" dropdown
    const tipoSolicitudSelect = document.getElementById('tipoSolicitud');
    tipoSolicitudSelect.innerHTML = '<option value="">Seleccione...</option>'; // Add default option
    tipos_de_solicitus.forEach(tipo => {
        const option = document.createElement('option');
        option.value = tipo; // Use the type itself as the value
        option.textContent = tipo.toUpperCase();
        tipoSolicitudSelect.appendChild(option);
    });

    // Ensure forms are initially hidden
    const formularioJuridica = document.querySelector('.formulario-juridica');
    const formularioNatural = document.querySelector('.formulario-natural');
    if (formularioJuridica) formularioJuridica.style.display = 'none';
    if (formularioNatural) formularioNatural.style.display = 'none';

    // Call mostrarFormulario to handle initial visibility (if needed)
    mostrarFormulario();

    truncarTextoTabla(); // Trunca el texto al cargar la página
    agregarEventosHover();
});