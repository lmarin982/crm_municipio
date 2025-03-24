// Variables Globales (Constantes y Datos Compartidos)
const tipos_de_solicitudes = ["Primera vez", "Renovación", "Regularización"];
const tiposElementosSeguridad = [
    { descripcion: "PORTONES METÁLICOS EN VÍAS PEATONALES", tipo: "TIPO 1" },
    { descripcion: "PORTONES METÁLICOS EN CALLES VEHICULARES CON ACERAS MENORES A 1,50 METROS", tipo: "TIPO 2" },
    { descripcion: "PORTONES METÁLICOS EN CALLES  sVEHICULARES CON ACERAS IGUALES O MAYORES A 1,50 METROS", tipo: "TIPO 3" },
    { descripcion: "OTROS ELEMENTOS DE SEGURIDAD", tipo: "OTROS" }
];

// Registros (Inicializar como arrays vacíos)
const registrosElementosSeguridad = [];
const registrosPropietarios = [];

// Variable temporal
let codigoCatastralTemporal = null;

// Módulo: utils (Funciones de utilidad)
const utils = {
    mostrarMensajeErrorJS: function (mensaje) {
        alert(mensaje);
    },
    mostrarMensajeConfirmacionJS: function () {
        alert('Formulario enviado correctamente.');
    },
    validarCedula: function (cedula) {
        if (cedula.length !== 10 || !/^([0-9])*$/.test(cedula)) {
            return false;
        }
        let suma = 0;
        for (let i = 0; i < 9; i++) {
            let digito = parseInt(cedula.charAt(i));
            if (i % 2 === 0) {
                digito = (digito * 2) > 9 ? (digito * 2) - 9 : digito * 2;
            }
            suma += digito;
        }

        const verificador = (10 - (suma % 10)) % 10;
        return verificador === parseInt(cedula.charAt(9));
    },
    validarRUC: function (ruc) {
        if (ruc.length < 13 || !/^([0-9])*$/.test(ruc)) {
            return false;
        }

        const provincia = parseInt(ruc.substring(0, 2));
        if (provincia < 1 || provincia > 24) {
            return false;
        }

        const tercerDigito = parseInt(ruc.charAt(2));
        if (tercerDigito > 6 && tercerDigito !== 9) {
            return false; // No es ni persona natural ni sociedad válida
        }

        let coeficientes = [];
        let digitoVerificador = parseInt(ruc.charAt(9));
        let suma = 0;

        if (tercerDigito < 6) {
            coeficientes = [2, 1, 2, 1, 2, 1, 2, 1, 2];

            for (let i = 0; i < coeficientes.length; i++) {
                let digito = parseInt(ruc.charAt(i));
                digito = digito * coeficientes[i];
                suma = suma + digito;
            }
            const validador = (10 - (suma % 10)) % 10;

            if (validador != digitoVerificador) {
                return false;
            }

        } else if (tercerDigito === 6) {
            coeficientes = [3, 2, 7, 6, 5, 4, 3, 2];
            const verificador = parseInt(ruc.charAt(8));
            for (let i = 0; i < coeficientes.length; i++) {
                let digito = parseInt(ruc.charAt(i));
                digito = digito * coeficientes[i];
                suma = suma + digito;
            }
            const validador = (11 - (suma % 11)) % 11;
            if (validador != verificador) {
                return false
            }

        } else if (tercerDigito === 9) {
            coeficientes = [4, 3, 2, 7, 6, 5, 4, 3, 2];
            const verificador = parseInt(ruc.charAt(9));
            for (let i = 0; i < coeficientes.length; i++) {
                let digito = parseInt(ruc.charAt(i));
                digito = digito * coeficientes[i];
                suma = suma + digito;
            }

            const validador = (11 - (suma % 11)) % 11;
            if (validador != verificador) {
                return false
            }
        }

        return true;
    },
    validarCedulaORUC: function (valor) {
        return utils.validarCedula(valor) || utils.validarRUC(valor);
    },
    debounce: function (func, wait) {
        let timeout;
        return function (...args) {
            const context = this;
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(context, args), wait);
        };
    }
};

// Módulo: api (Simulación de llamadas a la API)
const api = {
    consultar_datos_ciudadano: async function (cedula) {
        const url = 'https://municipioguayaquil--dev01.sandbox.my.salesforce-setup.com/services/apexrest/Ciudadano/?cedula=' + cedula; // Reemplaza con la URL correcta
        try {
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'  //Indica que esperas una respuesta JSON
                }
            });

            if (!response.ok) {
                throw new Error(`Error al consultar la API: ${response.status} - ${response.statusText}`);
            }

            const data = await response.json();  //Parsea la respuesta JSON
            console.log('Respuesta de la API:', data);

            //Procesa la respuesta y extrae los datos que necesitas
            if (data.resultado.ok) {
                return data.dataResult; // Devuelve los datos del ciudadano
            } else {
                utils.mostrarMensajeErrorJS(data.resultado.mensajes.join('\n')); //Muestra los mensajes de error
                return null; // O un objeto vacío, según lo que necesites
            }

        } catch (error) {
            console.error('Error en la llamada a la API:', error);
            utils.mostrarMensajeErrorJS('Error al consultar la API: ' + error.message);
            return null; // O un objeto vacío
        }
    },
    autocompletarDatos: function (valor) {
        console.log(`Autocompletando datos para el valor: ${valor}`);
        // Aqui iria la logica para autocompletar los datos
    }
};

// Módulo: ui (Manipulación de la interfaz de usuario)
const ui = {
    actualizarTabla: function (registros, tablaSelector) {
        const tablaRegistro = document.querySelector(tablaSelector);
        if (!tablaRegistro) {
            console.error(`No se encontró la tabla con el selector: ${tablaSelector}`);
            return;
        }

        const tbody = tablaRegistro.querySelector('tbody');
        if (!tbody) {
            console.error('La tabla no tiene un tbody.');
            return;
        }

        tbody.innerHTML = '';

        registros.forEach((registro, index) => {
            const fila = document.createElement('tr');
            fila.classList.add('tabla-fila-entrada');

            // Aseguramos que tipoElemento sea un string y no un objeto antes de acceder a propiedades
            const tipoElementoDescripcion = typeof registro.tipoElemento === 'object' && registro.tipoElemento !== null ? registro.tipoElemento.descripcion : registro.tipoElemento;
            const tipoElementoTipo = typeof registro.tipoElemento === 'object' && registro.tipoElemento !== null ? registro.tipoElemento.tipo : registro.tipoElemento; // Obtener el tipo

            fila.innerHTML = `
                <td class="truncate" style="text-align: center;" title="${tipoElementoDescripcion}">${tipoElementoTipo}</td>
                <td class="truncate" title="${registro.direccion}">${registro.direccion}</td>
                <td>${registro.coordenadas}</td>
                <td>${registro.tipoSolicitud}</td>
                <td>
                    <button onclick="elementosSeguridad.eliminarRegistro(${index})" class="eliminar-registro">
                        Eliminar
                    </button>
                </td>
            `;
            tbody.appendChild(fila);
        });
        ui.truncarTextoTabla();
        ui.agregarEventosHover();
    },

    actualizarTablaPropietarios: function (registros) {
        const tabla = document.querySelector('.tabla-propietarios tbody');
        if (!tabla) {
            console.error('No se encontró el elemento tbody de la tabla de propietarios.');
            return;
        }

        tabla.innerHTML = ''; // Limpia la tabla antes de actualizarla

        registros.forEach((registro, index) => {
            const fila = document.createElement('tr');
            fila.classList.add('tabla-fila-propietario');

            const botonVerCodigo = `<button type="button" onclick="propietarios.mostrarCodigoCatastral(${index})" class="btn btn-success">Ver</button>`;

            fila.innerHTML = `
                <td style="text-align: center;">${index + 1}</td>
                <td style="text-align: center;">${registro.calidadSuscrito}</td>
                <td style="text-align: center;">${registro.nombresApellidos}</td>
                <td style="text-align: center;">${registro.cedulaRuc}</td>
                <td style="text-align: center;">${registro.telefono}</td>
                <td style="text-align: center;">${registro.correo}</td>
                <td style="display: flex; justify-content: center; align-items: center; width: 100%;">${botonVerCodigo}</td>
                <td>
                    <button onclick="propietarios.eliminarRegistroPropietario(${index})" class="eliminar-registro">Eliminar</button>
                </td>
            `;
            tabla.appendChild(fila);
        });
    },

    actualizarCheckbox: function (fileId, checkboxId, nombreArchivoId) {
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
    },

    truncarTextoTabla: function () {
        const celdasTruncadas = document.querySelectorAll('.tabla-elementos td.truncate'); // Actualizado para tabla de elementos
        celdasTruncadas.forEach(celda => {
            const textoCompleto = celda.textContent;
            const limite = 50;

            if (textoCompleto.length > limite) {
                const textoTruncado = textoCompleto.substring(0, limite) + '...';
                celda.textContent = textoTruncado;
                celda.setAttribute('title', textoCompleto);
            }
        });
    },

    agregarEventosHover: function () {
        const celdasTruncadas = document.querySelectorAll('.tabla-elementos td.truncate'); // Actualizado selector
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
    },

    agregarValidacionEnTiempoReal: function (inputId, funcionValidacion, autocompletar = false) {
        const inputElement = document.getElementById(inputId);
        if (inputElement) {
            // Evento 'blur' (cuando el campo pierde el foco)
            inputElement.addEventListener('blur', function () {
                if (!funcionValidacion(this.value)) {
                    utils.mostrarMensajeErrorJS(`El valor ingresado en ${this.placeholder} no es válido.`);
                } else if (autocompletar) {
                    api.autocompletarDatos(this.value); // Llama a autocompletar si la validacion fue exitosa
                }
            });

            // Evento 'keyup' (al soltar una tecla) con debounce
            inputElement.addEventListener('keyup', utils.debounce(function () {
                if (autocompletar) {
                    if (!funcionValidacion(this.value)) {
                        return; // Si no es válido, no hacemos nada.
                    }
                    api.autocompletarDatos(this.value); // Solo autocompleta si la validación es OK
                }
            }, 300)); // Espera 300ms después de la última pulsación de tecla
        }
    },
    mostrarFormulario: function () {
        // Coloca aquí la lógica para mostrar el formulario si es necesario.
        console.log('Formulario mostrado');
    }
};

// Módulo: rellenarCampos
const rellenarCampos = {
    inicializar: function () {
        this.rellenarSelectTipoElemento();
        this.rellenarSelectTipoSolicitud();
    },
    rellenarSelectTipoElemento: function () {
        const tipoElementoSelect = document.getElementById('tipoElemento');
        if (!tipoElementoSelect) return;

        tipoElementoSelect.innerHTML = '';

        tiposElementosSeguridad.forEach(elemento => {
            const option = document.createElement('option');
            option.value = elemento.tipo;
            option.textContent = elemento.descripcion;
            tipoElementoSelect.appendChild(option);
        });
    },

    rellenarSelectTipoSolicitud: function () {
        const tipoSolicitudSelect = document.getElementById('tipoSolicitud');
        if (!tipoSolicitudSelect) return;

        tipoSolicitudSelect.innerHTML = '';

        tipos_de_solicitudes.forEach(elemento => {
            const option = document.createElement('option');
            option.value = elemento;
            option.textContent = elemento;
            tipoSolicitudSelect.appendChild(option);
        });
    }
};

// Módulo: elementos_seguridad
const elementosSeguridad = {
    agregarRegistro: function (event) {
        event?.preventDefault();

        const tipoElementoSelect = document.getElementById('tipoElemento');
        const tipoSolicitudSelect = document.getElementById('tipoSolicitud');

        const direccion = document.getElementById('direccionElemento').value;
        const latitud = document.getElementById('latitudElemento').value;
        const longitud = document.getElementById('longitudElemento').value;

        const tipoSolicitudText = tipoSolicitudSelect.options[tipoSolicitudSelect.selectedIndex].text;
        const tipoElementoSeleccionado = tiposElementosSeguridad.find(elemento => elemento.tipo === tipoElementoSelect.value);

        if (!tipoElementoSelect.value || !direccion || !latitud || !longitud || !tipoSolicitudSelect.value) {
            utils.mostrarMensajeErrorJS('Por favor complete todos los campos del registro');
            return;
        }

        const coordenadas = `${latitud}, ${longitud}`;

        registrosElementosSeguridad.push({
            tipoElemento: tipoElementoSeleccionado,
            direccion,
            coordenadas,
            tipoSolicitud: tipoSolicitudText
        });

        ui.actualizarTabla(registrosElementosSeguridad, '.tabla-elementos'); // Actualizado el selector de la tabla

        // Limpiar campos
        document.getElementById('direccionElemento').value = '';
        document.getElementById('latitudElemento').value = '';
        document.getElementById('longitudElemento').value = '';
        tipoElementoSelect.value = '';
        tipoSolicitudSelect.value = '';
    },

    eliminarRegistro: function (index) {
        if (confirm('¿Está seguro de que desea eliminar este registro?')) {
            registrosElementosSeguridad.splice(index, 1);
            ui.actualizarTabla(registrosElementosSeguridad, '.tabla-elementos'); // Actualizado el selector de la tabla
        }
    }
};

// Módulo: formularios
const formularios = {
    limpiarCampos: function (campos) {
        campos.forEach(campo => {
            const elemento = document.getElementById(campo);
            if (elemento) elemento.value = '';
        });
    },

    limpiarCheckboxes: function (checkboxes) {
        checkboxes.forEach(checkbox => {
            const elemento = document.getElementById(checkbox);
            if (elemento) elemento.checked = false;
        });
    },

    limpiarTodosLosCampos: function () {
        formularios.limpiarCampos([
            'nombreEmpresaJuridica', 'rucJuridica', 'direccionJuridica',
            'correoJuridica', 'telefonoJuridica', 'representanteLegalJuridica',
            'identificacionRepresentanteJuridica',
            'nombresApellidosNatural', 'ccNatural', 'direccionNatural',
            'correoNatural', 'telefonoNatural',
            'registroFile', 'actaFile', 'planosFile', 'fotosFile', 'comprobanteFile'
        ]);

        formularios.limpiarCheckboxes([
            'registroCheckbox', 'actaCheckbox', 'planosCheckbox', 'fotosCheckbox', 'comprobanteCheckbox'
        ]);

        formularios.limpiarFormularioDirecciones();
        registrosElementosSeguridad.length = 0;
        registrosPropietarios.length = 0;
    },

    limpiarFormularioDirecciones: function () {
        formularios.limpiarCampos([
            'direccionElemento', 'latitudElemento', 'longitudElemento',
            'tipoElemento', 'tipoSolicitud'
        ]);
    },

    validarFormulario: function () {
        const tipoPersona = document.getElementById('tipoFormulario').value;

        if (!tipoPersona) {
            utils.mostrarMensajeErrorJS('Debe seleccionar un tipo de persona');
            return false;
        }

        if (!document.getElementById('aceptaTerminos').checked) {
            utils.mostrarMensajeErrorJS('Debe aceptar los términos y condiciones');
            return false;
        }

        if (registrosElementosSeguridad.length === 0) {
            utils.mostrarMensajeErrorJS('Debe agregar al menos un elemento de seguridad.');
            return false;
        }

        if (registrosPropietarios.length === 0) {
            utils.mostrarMensajeErrorJS('Debe agregar al menos un propietario/mandatario.');
            return false;
        }

        return tipoPersona === 'juridica' ? formularios.validarFormularioJuridica() : formularios.validarFormularioNatural();
    },

    enviarFormulario: function () {
        if (!formularios.validarFormulario()) {
            return;
        }
        if (!formularios.validarArchivosRequeridos()) {
            return;
        }

        const formData = formularios.obtenerDatosFormulario();
        console.log("Datos del formulario a enviar:", formData);

        utils.mostrarMensajeConfirmacionJS();
        formularios.limpiarTodosLosCampos();
        ui.mostrarFormulario();
    },

    obtenerDatosFormulario: function () {
        const tipoPersona = document.getElementById('tipoFormulario').value;
        const datos = {
            tipoPersona: tipoPersona,
            elementosSeguridad: [...registrosElementosSeguridad],
            propietarios: [...registrosPropietarios],
            aceptaTerminos: document.getElementById('aceptaTerminos').checked,
        };

        const camposComunes = (tipo) => ({
            ...(tipo === 'juridica' ? {
                nombreEmpresa: document.getElementById('nombreEmpresaJuridica').value,
                ruc: document.getElementById('rucJuridica').value,
                direccion: document.getElementById('direccionJuridica').value,
                correo: document.getElementById('correoJuridica').value,
                telefono: document.getElementById('telefonoJuridica').value,
                representanteLegal: document.getElementById('representanteLegalJuridica').value,
                identificacionRepresentante: document.getElementById('identificacionRepresentanteJuridica').value
            } : {
                nombresApellidos: document.getElementById('nombresApellidosNatural').value,
                cedula: document.getElementById('ccNatural').value,
                direccion: document.getElementById('direccionNatural').value,
                correo: document.getElementById('correoNatural').value,
                telefono: document.getElementById('telefonoNatural').value
            })
        });
        datos[`datos${tipoPersona.charAt(0).toUpperCase() + tipoPersona.slice(1)}`] = camposComunes(tipoPersona);

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
                datos.archivos[info.key] = {
                    nombre: fileInput.files[0].name,
                    tamaño: fileInput.files[0].size,
                };
            }
        });
        return datos;
    },

    validarFormularioJuridica: function () {
        const campos = [
            'nombreEmpresaJuridica', 'rucJuridica', 'direccionJuridica',
            'correoJuridica', 'telefonoJuridica', 'representanteLegalJuridica',
            'identificacionRepresentanteJuridica'
        ];
        if (!formularios.validarCamposRequeridos(campos, 'jurídica')) return false;

        const rucValido = utils.validarRUC(document.getElementById('rucJuridica').value);
        if (!rucValido) {
            utils.mostrarMensajeErrorJS('Por favor, ingrese un RUC válido.');
            return false;
        }
        const idRepresentanteValido = utils.validarCedula(document.getElementById('identificacionRepresentanteJuridica').value);
        if (!idRepresentanteValido) {
            utils.mostrarMensajeErrorJS('Por favor, ingrese una cédula válida para el representante legal.');
            return false;
        }

        return true;
    },

    validarFormularioNatural: function () {
        const campos = [
            'nombresApellidosNatural', 'ccNatural', 'direccionNatural',
            'correoNatural', 'telefonoNatural'
        ];

        if (!formularios.validarCamposRequeridos(campos, 'natural')) return false;

        const cedulaValida = utils.validarCedula(document.getElementById('ccNatural').value);
        if (!cedulaValida) {
            utils.mostrarMensajeErrorJS('Por favor, ingrese una cédula válida.');
            return false;
        }
        return true;
    },

    validarCamposRequeridos: function (campos, tipoPersona) {
        const camposVacios = campos.filter(campo => !document.getElementById(campo).value);
        if (camposVacios.length > 0) {
            utils.mostrarMensajeErrorJS(`Todos los campos son requeridos para persona ${tipoPersona}`);
            return false;
        }
        return true;
    },

    validarArchivosRequeridos: function () {
        const checkboxes = [
            'actaCheckbox', 'planosCheckbox', 'fotosCheckbox', 'comprobanteCheckbox'
        ];
        const archivosNoCargados = checkboxes.filter(checkbox => !document.getElementById(checkbox).checked);
        if (archivosNoCargados.length > 0) {
            utils.mostrarMensajeErrorJS('Debe cargar todos los archivos requeridos');
            return false;
        }
        return true;
    }
};

// Módulo: propietarios
const propietarios = {
    abrirModalCodigoCatastral: function () {
        // Limpiar campos del modal
        document.getElementById('seccionCatastral').value = '';
        document.getElementById('manzanaCatastral').value = '';
        document.getElementById('loteCatastral').value = '';
        document.getElementById('divisionCatastral').value = '';
        document.getElementById('phvCatastral').value = '';
        document.getElementById('phhCatastral').value = '';

        document.getElementById('modalCodigoCatastral').style.display = 'block';
        codigoCatastralTemporal = null;
    },

    cerrarModalCodigoCatastral: function () {
        document.getElementById('modalCodigoCatastral').style.display = 'none';
    },

    guardarCodigoCatastral: function () {
        const seccion = document.getElementById('seccionCatastral').value;
        const manzana = document.getElementById('manzanaCatastral').value;
        const lote = document.getElementById('loteCatastral').value;
        const division = document.getElementById('divisionCatastral').value;
        const phv = document.getElementById('phvCatastral').value;
        const phh = document.getElementById('phhCatastral').value;

        if (!seccion || !manzana || !lote) {
            utils.mostrarMensajeErrorJS('SECT, MANZ y LOTE son obligatorios.');
            return;
        }

        codigoCatastralTemporal = `${seccion}-${manzana}-${lote}-${division || '000'}-${phv || '000'}-${phh || '000'}`;
        propietarios.cerrarModalCodigoCatastral();
    },

    agregarRegistroPropietario: function (event) {
        event?.preventDefault();

        const calidadSuscritoSelect = document.getElementById('calidadSuscrito');

        const nombresApellidos = document.getElementById('nombresApellidosPropietario').value;
        const cedulaRuc = document.getElementById('cedulaRucPropietario').value;
        const telefono = document.getElementById('telefonoPropietario').value;
        const correo = document.getElementById('correoPropietario').value;
        const calidadSuscritoValue = calidadSuscritoSelect.value;
        const camposMandatario = document.getElementById("representante-campo").value;
        const idRepresentanteCampo = document.getElementById("id-representante-campo").value;

        if (!calidadSuscritoValue || !nombresApellidos || !cedulaRuc || !telefono || !correo || !codigoCatastralTemporal) {
            return utils.mostrarMensajeErrorJS('Complete todos los campos, incluido el código.');
        }
        if (!utils.validarCedulaORUC(cedulaRuc)) {
            return utils.mostrarMensajeErrorJS('Por favor, ingrese una cédula o RUC válido.');
        }

        const nuevoRegistro = {
            calidadSuscrito: calidadSuscritoSelect.options[calidadSuscritoSelect.selectedIndex].text,
            nombresApellidos,
            cedulaRuc,
            telefono,
            correo,
            codigoCatastral: codigoCatastralTemporal,
            ...(calidadSuscritoValue === "Mandatario" ? { camposMandatario, idRepresentanteCampo } : {})
        };

        registrosPropietarios.push(nuevoRegistro);
        ui.actualizarTablaPropietarios(registrosPropietarios);

        // Limpiar campos
        calidadSuscritoSelect.value = '';
        document.getElementById('nombresApellidosPropietario').value = '';
        document.getElementById('cedulaRucPropietario').value = '';
        document.getElementById('telefonoPropietario').value = '';
        document.getElementById('correoPropietario').value = '';
        codigoCatastralTemporal = null;
    },

    eliminarRegistroPropietario: function (index) {
        if (confirm('¿Está seguro?')) {
            registrosPropietarios.splice(index, 1);
            ui.actualizarTablaPropietarios(registrosPropietarios);
        }
    },

    mostrarCodigoCatastral: function (index) {
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
        }
    },

    agregarListenersModal: function () {
        const modal = document.getElementById('modalCodigoCatastral');
        if (modal) {
            modal.querySelector('.close-button')?.addEventListener('click', propietarios.cerrarModalCodigoCatastral);
        }

        const btnguardar = document.getElementById('guardarCodigoButton');
        if (btnguardar) {
            btnguardar?.addEventListener('click', propietarios.guardarCodigoCatastral);
        }
    }
};

// Inicialización (DOMContentLoaded)
document.addEventListener('DOMContentLoaded', function () {
    rellenarCampos.inicializar();
    propietarios.agregarListenersModal();
    ui.agregarValidacionEnTiempoReal('ccNatural', function (cedula) { // Pasa la función de validación
        // Después de la validación, llama a la función de autocompletado
        if (utils.validarCedula(cedula)) {
            api.consultar_datos_ciudadano(cedula)
                .then(data => {
                    if (data) {
                        // Rellena los campos con los datos obtenidos
                        document.getElementById('nombresApellidosNatural').value = data.nombres + ' ' + data.apellidos;
                        document.getElementById('direccionNatural').value = data.direccionResidencia;
                        document.getElementById('correoNatural').value = data.email;
                        document.getElementById('telefonoNatural').value = data.telefonoCelular;
                    }
                });
        }
        return utils.validarCedula(cedula); // Retorna el resultado de la validación
    });
    ui.agregarValidacionEnTiempoReal('cedulaRucPropietario', ui.actualizarTablaPropietarios);
});

document.addEventListener('DOMContentLoaded', function () {
    rellenarCampos.inicializar();
    propietarios.agregarListenersModal();
    ui.agregarValidacionEnTiempoReal('ccNatural', ui.actualizarTablaPropietarios);
    ui.agregarValidacionEnTiempoReal('cedulaRucPropietario', ui.actualizarTablaPropietarios);

    const nombresApellidosInput = document.getElementById('nombresApellidosNatural');
    const cedula = document.getElementById('ccNatural');

    const updateDeclarationName = () => {
        const applicantName = nombresApellidosInput.value;
        const cedulaORuc = cedula.value;

        if (!applicantName || !cedulaORuc) return;

        document.getElementById('id_nombres_1').textContent = `Yo, ${applicantName} con cédula o RUC ${cedulaORuc}. `;
        document.getElementById('id_nombres_2').textContent = `Yo, ${applicantName} con cédula o RUC ${cedulaORuc}. `;
        document.getElementById('id_nombres_3').textContent = `Yo, ${applicantName} con cédula o RUC ${cedulaORuc}. `;
    };

    nombresApellidosInput.addEventListener('input', utils.debounce(updateDeclarationName, 300));

    // Obtener los campos (asegúrate de que los selectores sean correctos)
    const representanteCampo = document.querySelector(".propietario-campo:nth-child(6)"); //Asumiendo que representante legal es el sexto campo dentro del formulario
    const idRepresentanteCampo = document.querySelector(".propietario-campo:nth-child(7)");//Asumiendo que identificacion de representante legal es el septimo campo

    //Ocultar los campos (asegúrate de que los elementos se obtuvieron correctamente)
    if (representanteCampo) representanteCampo.style.display = "none";
    if (idRepresentanteCampo) idRepresentanteCampo.style.display = "none";

    //Obtener el elemento Select
    const calidadSuscritoSelect = document.getElementById("calidadSuscrito");

    calidadSuscritoSelect.addEventListener("change", function () {
        if (this.value === "Mandatario") { // Usar 'this' en lugar de calidadSuscritoSelect
            if (representanteCampo) representanteCampo.style.display = "block";
            if (idRepresentanteCampo) idRepresentanteCampo.style.display = "block";
        } else {
            if (representanteCampo) representanteCampo.style.display = "none";
            if (idRepresentanteCampo) idRepresentanteCampo.style.display = "none";
        }
    });
});


