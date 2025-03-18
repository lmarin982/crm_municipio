// --- (Código JavaScript anterior) ---
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

// --- Array para almacenar los registros de propietarios/mandatarios ---
const registrosPropietarios = [];
let codigoCatastralTemporal = null; // Variable temporal.  MUY IMPORTANTE

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
    registrosPropietarios.length = 0;
    actualizarTabla();
    actualizarTablaPropietarios();

    const aceptaTerminos = document.getElementById('aceptaTerminos');
    if (aceptaTerminos) aceptaTerminos.checked = false;
}

// --- Function to Clear *ONLY* Address Input Fields ---
function limpiarFormularioDirecciones() {
    document.getElementById('direccionElemento').value = '';
    document.getElementById('latitudElemento').value = '';
    document.getElementById('longitudElemento').value = '';
}

// ---- VALIDACIONES -----
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

    if (registrosPropietarios.length === 0) {
        mostrarMensajeErrorJS('Debe agregar al menos un propietario/mandatario.');
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
    const rucValido = validarRUC(document.getElementById('rucJuridica').value);
    if (!rucValido) {
        mostrarMensajeErrorJS('Por favor, ingrese un RUC válido.');
        return false;
    }
    const idRepresentanteValido = validarCedula(document.getElementById('identificacionRepresentanteJuridica').value);
    if (!idRepresentanteValido) {
        mostrarMensajeErrorJS('Por favor, ingrese una cédula válida para el representante legal.');
        return false;
    }

    return validarCamposRequeridos(campos, 'jurídica');
}

function validarFormularioNatural() {
    const campos = [
        'nombresApellidosNatural', 'ccNatural', 'direccionNatural',
        'correoNatural', 'telefonoNatural'
    ];

    const cedulaValida = validarCedula(document.getElementById('ccNatural').value);
    if (!cedulaValida) {
        mostrarMensajeErrorJS('Por favor, ingrese una cédula válida.');
        return false;
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

    return true;
}

function validarRUC(ruc) {
    if (ruc.length < 13) {
        return false;
    }

    if (/^([0-9])*$/.test(ruc) == false) {
        return false
    }

    const provincia = parseInt(ruc.substring(0, 2));
    if (provincia < 1 || provincia > 24) {
        return false;
    }

    const tercerDigito = parseInt(ruc.charAt(2));
    if (tercerDigito > 6) {
        return false
    }

    let coeficientes = [];
    let verificador = parseInt(ruc.charAt(9));
    let suma = 0;

    if (tercerDigito < 6) {
        coeficientes = [2, 1, 2, 1, 2, 1, 2, 1, 2];
    } else if (tercerDigito === 6) {
        coeficientes = [3, 2, 7, 6, 5, 4, 3, 2, 0];
        verificador = parseInt(ruc.charAt(8));
    } else if (tercerDigito === 9) {
        coeficientes = [4, 3, 2, 7, 6, 5, 4, 3, 2];
    } else {
        return false
    }

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
        inputElement.addEventListener('blur', function () {
            if (!funcionValidacion(this.value)) {
                mostrarMensajeErrorJS(`El valor ingresado en ${this.placeholder} no es válido.`);
            }
        });
    }
}

// --- Funciones para la tabla de elementos ---

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

// ---- FUNCIONES PARA LA TABLA DE PROPIETARIOS/MANDATARIOS y MODAL ----

function abrirModalCodigoCatastral() {
    // Limpiar los campos del modal
    document.getElementById('seccionCatastral').value = '';
    document.getElementById('manzanaCatastral').value = '';
    document.getElementById('loteCatastral').value = '';
    document.getElementById('divisionCatastral').value = '';
    document.getElementById('phvCatastral').value = '';
    document.getElementById('phhCatastral').value = '';

    // Mostrar el modal
    document.getElementById('modalCodigoCatastral').style.display = 'block';
    codigoCatastralTemporal = null;  // Resetear la variable temporal
}

function cerrarModalCodigoCatastral() {
    document.getElementById('modalCodigoCatastral').style.display = 'none';
}

function guardarCodigoCatastral() {
    const seccion = document.getElementById('seccionCatastral').value;
    const manzana = document.getElementById('manzanaCatastral').value;
    const lote = document.getElementById('loteCatastral').value;
    const division = document.getElementById('divisionCatastral').value;
    const phv = document.getElementById('phvCatastral').value;
    const phh = document.getElementById('phhCatastral').value;

    // Validar que los campos obligatorios estén llenos
    if (!seccion || !manzana || !lote) {
        mostrarMensajeErrorJS('Los campos SECT, MANZ y LOTE son obligatorios.');
        return; // Detener la función si faltan datos
    }

    // Formato del código catastral y guardar en variable temporal
    codigoCatastralTemporal = `${seccion}-${manzana}-${lote}-${division || '000'}-${phv || '000'}-${phh || '000'}`;
    cerrarModalCodigoCatastral();
}

function agregarRegistroPropietario(event) {
    if (event) {
        event.preventDefault();
    }

    const calidadSuscritoSelect = document.getElementById('calidadSuscrito');
    const nombresApellidos = document.getElementById('nombresApellidosPropietario').value;
    const cedulaRuc = document.getElementById('cedulaRucPropietario').value;
    const telefono = document.getElementById('telefonoPropietario').value;
    const correo = document.getElementById('correoPropietario').value;

    const calidadSuscritoText = calidadSuscritoSelect.options[calidadSuscritoSelect.selectedIndex].text;
    const calidadSuscritoValue = calidadSuscritoSelect.value;

    if (!calidadSuscritoValue || !nombresApellidos || !cedulaRuc || !telefono || !correo || !codigoCatastralTemporal) {
        mostrarMensajeErrorJS('Por favor, complete todos los campos, incluyendo el código catastral.');
        return;
    }

    const nuevoRegistro = {
        calidadSuscrito: calidadSuscritoText,
        nombresApellidos,
        cedulaRuc,
        telefono,
        correo,
        codigoCatastral: codigoCatastralTemporal,  // Usar la variable temporal
    };

    registrosPropietarios.push(nuevoRegistro);
    actualizarTablaPropietarios();

    // Limpiar campos del formulario principal
    document.getElementById('calidadSuscrito').value = '';
    document.getElementById('nombresApellidosPropietario').value = '';
    document.getElementById('cedulaRucPropietario').value = '';
    document.getElementById('telefonoPropietario').value = '';
    document.getElementById('correoPropietario').value = '';
    codigoCatastralTemporal = null; // Limpiar la variable temporal
}

function actualizarTablaPropietarios() {
    const tabla = document.querySelector('.tabla-registro-propietarios tbody');
    tabla.innerHTML = '';

    registrosPropietarios.forEach((registro, index) => {
        const fila = document.createElement('tr');
        fila.classList.add('tabla-fila-propietario');

        // Botón para ver el código catastral
        const botonVerCodigo = `<button type="button" onclick="mostrarCodigoCatastral(${index})" class="btn-ver-codigo">Ver</button>`;

        fila.innerHTML = `
            <td>${index + 1}</td>
            <td>${registro.calidadSuscrito}</td>
            <td>${registro.nombresApellidos}</td>
            <td>${registro.cedulaRuc}</td>
            <td>${registro.telefono}</td>
            <td>${registro.correo}</td>
            <td>${botonVerCodigo}</td>
             <td></td>
            <td>
                <button onclick="eliminarRegistroPropietario(${index})" class="eliminar-registro">Eliminar</button>
            </td>
        `;
        tabla.appendChild(fila);
    });
}

function eliminarRegistroPropietario(index) {
    if (confirm('¿Está seguro de que desea eliminar este registro de propietario/mandatario?')) {
        registrosPropietarios.splice(index, 1);
        actualizarTablaPropietarios();
    }
}

// Función para mostrar el código catastral en el modal (para visualización)
function mostrarCodigoCatastral(index) {
    const registro = registrosPropietarios[index];
    if (registro && registro.codigoCatastral) {
        const partes = registro.codigoCatastral.split('-');
        // Llenar los campos del modal con los valores del código
        document.getElementById('seccionCatastral').value = partes[0] || '';
        document.getElementById('manzanaCatastral').value = partes[1] || '';
        document.getElementById('loteCatastral').value = partes[2] || '';
        document.getElementById('divisionCatastral').value = partes[3] || '';
        document.getElementById('phvCatastral').value = partes[4] || '';
        document.getElementById('phhCatastral').value = partes[5] || '';

        // Mostrar el modal
        document.getElementById('modalCodigoCatastral').style.display = 'block';
        codigoCatastralTemporal = registro.codigoCatastral;
    }
}
// --- (Resto de las funciones) ---
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

function mostrarMensajeErrorJS(mensaje) {
    alert(mensaje);
}

function mostrarMensajeConfirmacionJS() {
    alert('Formulario enviado correctamente.');
}

// --- DOMContentLoaded Event ---
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

    agregarValidacionEnTiempoReal('ccNatural', validarCedula);
    agregarValidacionEnTiempoReal('rucJuridica', validarRUC);
    agregarValidacionEnTiempoReal('identificacionRepresentanteJuridica', validarCedula);
    agregarValidacionEnTiempoReal('cedulaRucPropietario', validarCedulaORUC);
});

function validarCedulaORUC(valor) {
    if (validarCedula(valor)) {
        return true;
    }
    return validarRUC(valor);
}