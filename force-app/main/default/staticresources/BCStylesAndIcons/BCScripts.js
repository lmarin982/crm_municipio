const datosPersonas = {
    "1717756712": { // Cédula válida
        tipo: "natural",
        nombresApellidos: "Juan Pérez Gómez",
        direccion: "Av. Siempre Viva 123",
        correo: "juan.perez@example.com",
        telefono: "0991234567"
    },
    "0925451720": { // Cédula válida
        tipo: "natural",
        nombresApellidos: "María Rodríguez López",
        direccion: "Calle Falsa 456",
        correo: "maria.rodriguez@example.com",
        telefono: "0989876543"
    },
    "1712345678001": {  // RUC de persona jurídica (válido)
        tipo: "juridica",
        nombreEmpresa: "Empresa Ejemplo S.A.",
        direccion: "Av. Principal 789",
        correo: "info@empresa.com",
        telefono: "0221234567",
        representanteLegal: "Ana García",
        identificacionRepresentante: "1002003004" // Cédula válida
    },
    "1798765432001": { // RUC de persona jurídica (válido)
        tipo: "juridica",
        nombreEmpresa: "ACME Corp",
        direccion: "123 Main Street",
        correo: "info@acme.com",
        telefono: "555-123-4567",
        representanteLegal: "",          // Datos que NO se rellenan
        identificacionRepresentante: "" // en persona jurídica.
    },
    "1753177179001": { // RUC de persona natural (válido)
        tipo: "natural",  // <-- Mantenemos "natural" para RUC de persona natural
        nombresApellidos: "Carlos Andrade Marin", // Usamos nombres/apellidos
        direccion: "Calle Principal y Secundaria",
        correo: "carlos.andrade@example.com",
        telefono: "0991112233"
    }
};

function autocompletarDatos(cedulaRuc) {
    const datos = datosPersonas[cedulaRuc];

    if (datos) {
        // Determinar el tipo de formulario y mostrarlo
        document.getElementById('tipoFormulario').value = datos.tipo;
        mostrarFormulario(); // Asegúrate de que esta función exista y funcione

        if (datos.tipo === "natural") {
            document.getElementById('nombresApellidosNatural').value = datos.nombresApellidos || '';
            document.getElementById('direccionNatural').value = datos.direccion || '';
            document.getElementById('correoNatural').value = datos.correo || '';
            document.getElementById('telefonoNatural').value = datos.telefono || '';
            document.getElementById('ccNatural').value = cedulaRuc; // Rellenar la cédula

        } else if (datos.tipo === "juridica") {
            document.getElementById('nombreEmpresaJuridica').value = datos.nombreEmpresa || '';
            document.getElementById('rucJuridica').value = cedulaRuc; // Rellenar el RUC
            document.getElementById('direccionJuridica').value = datos.direccion || '';
            document.getElementById('correoJuridica').value = datos.correo || '';
            document.getElementById('telefonoJuridica').value = datos.telefono || '';

            //No se autocompletan los campos de representante.
            // document.getElementById('representanteLegalJuridica').value = datos.representanteLegal || '';
            // document.getElementById('identificacionRepresentanteJuridica').value = datos.identificacionRepresentante || '';
        }
    }
}

// --- Data for Dropdowns ---
const tiposElementosSeguridad = [
    { descripcion: "PORTONES METÁLICOS EN VÍAS PEATONALES", tipo: "TIPO 1" },
    { descripcion: "PORTONES METÁLICOS EN CALLES VEHICULARES CON ACERAS MENORES A 1,50 METROS", tipo: "TIPO 2" },
    { descripcion: "PORTONES METÁLICOS EN CALLES VEHICULARES CON ACERAS IGUALES O MAYORES A 1,50 METROS", tipo: "TIPO 3" },
    { descripcion: "OTROS ELEMENTOS DE SEGURIDAD", tipo: "OTROS" }
];

const tipos_de_solicitudes = ["Primera vez", "Renovación", "Regularización"];

// --- Arrays to Store Added Rows ---
const registrosElementosSeguridad = [];
const registrosPropietarios = [];  // Array para propietarios
let codigoCatastralTemporal = null; // Variable temporal

// --- Funciones para elementos de seguridad (SIN CAMBIOS) ---

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
    document.getElementById('tipoSolicitud').value = '';
    document.getElementById('tipoElemento').value = '';
}

function eliminarRegistro(index) {
    if (confirm('¿Está seguro de que desea eliminar este registro?')) {
        registrosElementosSeguridad.splice(index, 1); // Remove the correct element
        actualizarTabla(); // Re-render the table
    }
}

function actualizarTabla() {
    const tablaRegistro = document.querySelector('.tabla-registro');
    const tbody = tablaRegistro.querySelector('tbody');
    /* tbody.innerHTML = ''; */

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

// --- Funciones para propietarios/mandatarios (AHORA CON TABLA) ---

function abrirModalCodigoCatastral() {
    // Limpiar campos del modal
    document.getElementById('seccionCatastral').value = '';
    document.getElementById('manzanaCatastral').value = '';
    document.getElementById('loteCatastral').value = '';
    document.getElementById('divisionCatastral').value = '';
    document.getElementById('phvCatastral').value = '';
    document.getElementById('phhCatastral').value = '';

    document.getElementById('modalCodigoCatastral').style.display = 'block';
    codigoCatastralTemporal = null;  // Resetear
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

    if (!seccion || !manzana || !lote) {
        mostrarMensajeErrorJS('SECT, MANZ y LOTE son obligatorios.');
        return;
    }

    codigoCatastralTemporal = `${seccion}-${manzana}-${lote}-${division || '000'}-${phv || '000'}-${phh || '000'}`;
    cerrarModalCodigoCatastral();
}

document.addEventListener("DOMContentLoaded", () => {
    const calidadSuscritoSelect = document.getElementById('calidadSuscrito');
    calidadSuscritoSelect.addEventListener("change", (event) => {
        const camposMandatario = document.getElementById("representante-campo");
        const idRepresentanteCampo = document.getElementById("id-representante-campo"); // Asegúrate de que este ID sea correcto

        if (event.target.value === "Mandatario") {
            camposMandatario.style.display = "block";
            idRepresentanteCampo.style.display = "block"; // Mostrar el campo de identificación
        } else {
            camposMandatario.style.display = "none"; // Ocultar ambos campos
            idRepresentanteCampo.style.display = "none"; // Ocultar el campo de identificación
        }
    });
});

document.addEventListener("DOMContentLoaded", () => {
    const nombresInput = document.getElementById('nombresApellidosNatural');
    const cedulaInput = document.getElementById('ccNatural');
    const outputText1 = document.getElementById('id_nombres_1');
    const outputText2 = document.getElementById('id_nombres_2');
    const outputText3 = document.getElementById('id_nombres_3');

    function actualizarTexto() {
        const nombres = nombresInput.value;
        const cedula = cedulaInput.value;

        // Usamos un condicional para construir el texto de forma más flexible.
        if (nombres && cedula) outputText1.textContent = `Yo, ${nombres}, con número de cédula ${cedula}.`;
        if (nombres && cedula) outputText2.textContent = `Yo, ${nombres}, con número de cédula ${cedula}.`;
        if (nombres && cedula) outputText3.textContent = `Yo, ${nombres}, con número de cédula ${cedula}.`;
    }

    // Añadimos los listeners a AMBOS campos.
    nombresInput.addEventListener("change", actualizarTexto);
    cedulaInput.addEventListener("change", actualizarTexto);

    //Opcional: llamar a actualizarTexto(); al inicio si quieres que compruebe si hay algo precargado en los campos.
    actualizarTexto();

    //Mejora: usar el evento "input" en lugar de "change". (Más responsivo)
    nombresInput.addEventListener("input", actualizarTexto);
    cedulaInput.addEventListener("input", actualizarTexto);
    nombresInput.removeEventListener("change", actualizarTexto);
    cedulaInput.removeEventListener("change", actualizarTexto);

});

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
    const camposMandatario = document.getElementById("representante-campo").value;
    const idRepresentanteCampo = document.getElementById("id-representante-campo").value;

    if (!calidadSuscritoValue || !nombresApellidos || !cedulaRuc || !telefono || !correo || !codigoCatastralTemporal) return mostrarMensajeErrorJS('Complete todos los campos, incluido el código.');
    if (!validarCedulaORUC(cedulaRuc)) return mostrarMensajeErrorJS('Por favor, ingrese una cédula o RUC válido.');

    const nuevoRegistro = calidadSuscritoSelect.value == "Mandatario" ? {
        calidadSuscrito: calidadSuscritoText,
        nombresApellidos,
        cedulaRuc,
        telefono,
        correo,
        codigoCatastral: codigoCatastralTemporal,
        camposMandatario,
        idRepresentanteCampo
    } : {
        calidadSuscrito: calidadSuscritoText,
        nombresApellidos,
        cedulaRuc,
        telefono,
        correo,
        codigoCatastral: codigoCatastralTemporal
    }

    registrosPropietarios.push(nuevoRegistro);
    actualizarTablaPropietarios(); // Usa la función correcta

    // Limpiar los campos del formulario principal
    document.getElementById('calidadSuscrito').value = '';
    document.getElementById('nombresApellidosPropietario').value = '';
    document.getElementById('cedulaRucPropietario').value = '';
    document.getElementById('telefonoPropietario').value = '';
    document.getElementById('correoPropietario').value = '';
    codigoCatastralTemporal = null; // Limpiar
}

function eliminarRegistroPropietario(index) {
    if (confirm('¿Está seguro?')) {
        registrosPropietarios.splice(index, 1);
        actualizarTablaPropietarios(); // Usa la función correcta
    }
}

// Función para ACTUALIZAR LA TABLA de propietarios
function actualizarTablaPropietarios() {
    const tabla = document.querySelector('.tabla-registro-propietarios tbody'); // Selecciona el tbody
    /* tabla.innerHTML = ''; // Limpia el contenido actual de la tabla */

    registrosPropietarios.forEach((registro, index) => {
        const fila = document.createElement('tr'); // Crea una nueva fila (tr)
        fila.classList.add('tabla-fila-propietario');

        // Botón para mostrar el código catastral (llama a mostrarCodigoCatastral)
        const botonVerCodigo = `<button type="button" onclick="mostrarCodigoCatastral(${index})" class="btn-ver-codigo">Ver</button>`;

        // Crea las celdas (td) y las llena con los datos del registro
        fila.innerHTML = `
            <td style="text-align: center;">${index + 1}</td>
            <td style="text-align: center;">${registro.calidadSuscrito}</td>
            <td style="text-align: center;">${registro.nombresApellidos}</td>
            <td style="text-align: center;">${registro.cedulaRuc}</td>
            <td style="text-align: center;">${registro.telefono}</td>
            <td style="text-align: center;">${registro.correo}</td>
            <td style="display: flex; justify-content: center; align-items: center; width: 100%;">${botonVerCodigo}</td>
            <td>
                <button onclick="eliminarRegistroPropietario(${index})" class="eliminar-registro">Eliminar</button>
            </td>
        `;
        tabla.appendChild(fila); // Agrega la fila al tbody de la tabla
    });
}


//Mostrar codigo Catastral
function mostrarCodigoCatastral(index) {
    const registro = registrosPropietarios[index];
    if (registro && registro.codigoCatastral) {
        const partes = registro.codigoCatastral.split('-');
        document.getElementById('seccionCatastral').value = partes[0] || '';
        document.getElementById('manzanaCatastral').value = partes[1] || '';
        document.getElementById('loteCatastral').value = partes[2] || '';
        document.getElementById('divisionCatastral').value = partes[3] || '';
        document.getElementById('phvCatastral').value = partes[4] || '';
        document.getElementById('phhCatastral').value = partes[5] || '';

        document.getElementById('modalCodigoCatastral').style.display = 'block';
        // codigoCatastralTemporal = registro.codigoCatastral;  //IMPORTANTE:  No necesitas actualizar esto aquí
    }
}

// --- Otras funciones (sin cambios, pero necesarias) ---

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
    // Limpia los campos de los formularios principales
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

    // Limpia los campos de las tablas/listas
    limpiarFormularioDirecciones(); // Elementos de seguridad
    registrosElementosSeguridad.length = 0; // Elementos, seguridad
    registrosPropietarios.length = 0;     // Propietarios
    actualizarTabla();                // Refresca tabla elementos
    actualizarTablaPropietarios();   // Refresca TABLA propietarios

    const aceptaTerminos = document.getElementById('aceptaTerminos');
    if (aceptaTerminos) aceptaTerminos.checked = false;
}

function limpiarFormularioDirecciones() {
    document.getElementById('direccionElemento').value = '';
    document.getElementById('latitudElemento').value = '';
    document.getElementById('longitudElemento').value = '';
    document.getElementById('tipoElemento').value = ''; // Limpia
    document.getElementById('tipoSolicitud').value = '';  // Limpia
}

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

    // ---  AQUÍ AÑADIMOS EL CONSOLE.LOG ---
    const formData = obtenerDatosFormulario();
    console.log("Datos del formulario a enviar:", formData);
    // --- FIN DEL CONSOLE.LOG ---


    mostrarMensajeConfirmacionJS();
    limpiarTodosLosCampos();
    mostrarFormulario();
}

function obtenerDatosFormulario() {
    const tipoPersona = document.getElementById('tipoFormulario').value;
    let datos = {
        tipoPersona: tipoPersona,
        elementosSeguridad: [...registrosElementosSeguridad], // Usamos el operador spread (...)
        propietarios: [...registrosPropietarios], // Usamos el operador spread (...)
        aceptaTerminos: document.getElementById('aceptaTerminos').checked
    };

    if (tipoPersona === 'juridica') {
        datos.datosJuridica = {
            nombreEmpresa: document.getElementById('nombreEmpresaJuridica').value,
            ruc: document.getElementById('rucJuridica').value,
            direccion: document.getElementById('direccionJuridica').value,
            correo: document.getElementById('correoJuridica').value,
            telefono: document.getElementById('telefonoJuridica').value,
            representanteLegal: document.getElementById('representanteLegalJuridica').value,
            identificacionRepresentante: document.getElementById('identificacionRepresentanteJuridica').value
        };
    } else if (tipoPersona === 'natural') {
        datos.datosNatural = {
            nombresApellidos: document.getElementById('nombresApellidosNatural').value,
            cedula: document.getElementById('ccNatural').value,
            direccion: document.getElementById('direccionNatural').value,
            correo: document.getElementById('correoNatural').value,
            telefono: document.getElementById('telefonoNatural').value
        };
    }

    // Recolectar datos de archivos (solo si están presentes y tienen archivos)
    datos.archivos = {};

    const archivosInfo = [
        { id: 'registroFile', key: 'registro' },
        { id: 'actaFile', key: 'acta' },
        { id: 'planosFile', key: 'planos' },
        { id: 'fotosFile', key: 'fotos' },
        { id: 'comprobanteFile', key: 'comprobante' }
    ];

    archivosInfo.forEach(info => {
        const fileInput = document.getElementById(info.id);
        if (fileInput && fileInput.files.length > 0) {
            //En un entorno de servidor, normalmente no enviarías el archivo *completo* aquí.
            //Aquí solo incluimos el nombre y tamaño como ejemplo demostrativo.  En la práctica,
            //el archivo se subiría a través de una petición separada (ej. FormData)
            datos.archivos[info.key] = {
                nombre: fileInput.files[0].name,
                tamaño: fileInput.files[0].size,
            };
        }
    });
    return datos;
}

//Se modifican estas funciones de validacion del formulario para validar en tiempo real.
function validarFormularioJuridica() {
    const campos = [
        'nombreEmpresaJuridica', 'rucJuridica', 'direccionJuridica',
        'correoJuridica', 'telefonoJuridica', 'representanteLegalJuridica',
        'identificacionRepresentanteJuridica'
    ];
    //Se llama a esta funcion para validar en tiempo real.
    if (!validarCamposRequeridos(campos, 'jurídica')) {
        return false;
    }

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

    return true;
}

function validarFormularioNatural() {
    const campos = [
        'nombresApellidosNatural', 'ccNatural', 'direccionNatural',
        'correoNatural', 'telefonoNatural'
    ];

    //Se llama a esta funcion para validar en tiempo real.
    if (!validarCamposRequeridos(campos, 'natural')) {
        return false;
    }

    const cedulaValida = validarCedula(document.getElementById('ccNatural').value);
    if (!cedulaValida) {
        mostrarMensajeErrorJS('Por favor, ingrese una cédula válida.');
        return false;
    }
    return true;
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
    //AQUI el digito verificador es el decimo digito.
    let digitoVerificador = parseInt(ruc.charAt(9));

    let suma = 0;

    if (tercerDigito < 6) {
        coeficientes = [2, 1, 2, 1, 2, 1, 2, 1, 2];
        //Para persona natural el modulo es 10.
        let modulo = suma % 10;
        let validador = 0; // Inicializar validador
        if (modulo != 0) {
            validador = 10 - modulo; // Corrección: Calcular el validador
        }
        //Se compara el validador con el digito verificador.
        if (validador != digitoVerificador) {
            return false;
        }
    } else if (tercerDigito === 6) {
        //Para sociedades privadas el modulo es 11.
        coeficientes = [3, 2, 7, 6, 5, 4, 3, 2, 0];
        verificador = parseInt(ruc.charAt(8)); // Octavo dígito para RUC de sociedad privada
        let modulo = suma % 11;
        let validador = 0; // Inicializar validador
        if (modulo != 0) {
            validador = 11 - modulo; // Corrección: Calcular el validador
        }
        if (validador != verificador) {
            return false
        }

    } else if (tercerDigito === 9) {
        coeficientes = [4, 3, 2, 7, 6, 5, 4, 3, 2];
        //Para entidades publicas el modulo es 11.
        let modulo = suma % 11;
        let validador = 0;
        if (modulo != 0) {
            validador = 11 - modulo;
        }
        //Se compara el validador con el digito verificador.
        if (validador != verificador) {
            return false
        }
    } else {

        return false;
    }

    for (let i = 0; i < coeficientes.length; i++) {
        let digito = parseInt(ruc.charAt(i));
        digito = digito * coeficientes[i];
        //Ya no se resta 9.
        /* if (digito > 9 && tercerDigito < 6) {
            digito = digito - 9;
        }*/
        suma = suma + digito;
    }



    return true;
}

//Esta funcion valida en tiempo real
function agregarValidacionEnTiempoReal(inputId, funcionValidacion, autocompletar = false) {
    const inputElement = document.getElementById(inputId);
    if (inputElement) {
        // Evento 'blur' (cuando el campo pierde el foco)
        inputElement.addEventListener('blur', function () {
            if (!funcionValidacion(this.value)) {
                mostrarMensajeErrorJS(`El valor ingresado en ${this.placeholder} no es válido.`);
            } else if (autocompletar) {
                autocompletarDatos(this.value); // Llama a autocompletar si la validacion fue exitosa
            }
        });

        // Evento 'keyup' (al soltar una tecla) con debounce
        inputElement.addEventListener('keyup', debounce(function () {
            if (autocompletar) {
                if (!funcionValidacion(this.value)) {
                    //No muestra el mensaje aqui, porque se valida en blur
                    // mostrarMensajeErrorJS(`El valor ingresado en ${this.placeholder} no es válido.`);
                    return; // Si no es válido, no hacemos nada.
                }
                autocompletarDatos(this.value); // Solo autocompleta si la validación es OK
            }
        }, 300)); // Espera 300ms después de la última pulsación de tecla
    }
}

function truncarTextoTabla() {
    const celdasTruncadas = document.querySelectorAll('.tabla-registro td.truncate'); // Cambiado para apuntar a la clase correcta

    celdasTruncadas.forEach(celda => {
        const textoCompleto = celda.textContent;
        const limite = 50;

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
        const textoTruncado = celda.textContent; // Texto ya truncado
        const textoCompleto = celda.getAttribute('title');

        celda.addEventListener('mouseover', function () {
            celda.textContent = textoCompleto; // Muestra completo
        });
        celda.addEventListener('mouseout', function () {
            celda.textContent = textoTruncado; // Vuelve a truncar
        });
    });
}

function mostrarMensajeErrorJS(mensaje) {
    alert(mensaje);
}

function mostrarMensajeConfirmacionJS() {
    alert('Formulario enviado correctamente.');
}

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
    /* tipoSolicitudSelect.innerHTML = '<option value="">Seleccione...</option>'; */
    tipos_de_solicitudes.forEach(tipo => {
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
    truncarTextoTabla(); // Para la tabla de elementos
    agregarEventosHover(); //Y eventos hover

    agregarValidacionEnTiempoReal('ccNatural', validarCedula, true);  // Autocompletar para persona natural
    agregarValidacionEnTiempoReal('rucJuridica', validarRUC, true); // Autocompletar para persona juridica
    agregarValidacionEnTiempoReal('identificacionRepresentanteJuridica', validarCedula);
    agregarValidacionEnTiempoReal('cedulaRucPropietario', validarCedulaORUC);
});

function validarCedulaORUC(valor) {
    if (validarCedula(valor)) {
        return true;
    }
    return validarRUC(valor);
}

function debounce(func, wait) {
    let timeout;
    return function (...args) {
        const context = this;
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(context, args), wait);
    };
}