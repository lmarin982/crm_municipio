public class BC_Solicitante {

    private String accessToken;
    private String instanceUrl;

    public BC_Solicitante(String accessToken, String instanceUrl) {
        this.accessToken = accessToken;
        this.instanceUrl = instanceUrl;
    }

    public String crearRegistroSolicitante(Map<String, Object> datos) {
        // Primero, determina si es persona jurídica o natural
        String tipoPersona = (String) datos.get('tipoPersona');

        // Crea la Cuenta (si es persona jurídica)
        Id accountId = null;
        if (tipoPersona == 'juridica') {
            accountId = crearCuenta(datos);
        }

        // Crea el Contacto (siempre)
        Id contactId = crearContacto(datos, accountId);

        return contactId;  // Retorna el ID del Contacto
    }

    private Id crearCuenta(Map<String, Object> datos) {
        Map<String, Object> datosJuridica = (Map<String, Object>) datos.get('datosJuridica');

        Account acc = new Account();
        acc.Name = (String) datosJuridica.get('nombreEmpresa'); // Nombre de la cuenta
        /* acc.BCRuc__c = (String) datosJuridica.get('ruc'); // Asumo que tienes un campo RUC__c en la Cuenta
        acc.BillingAddress = (String) datosJuridica.get('direccion');
        acc.Phone = (String) datosJuridica.get('telefono'); */
        //No tenemos campo de correo en Account standar asi que guardaremos en un campo personalizado
       /*  acc.Correo_Electronico__c = (String) datosJuridica.get('correo'); */
        try {
            insert acc;
            System.debug('Cuenta creada con ID: ' + acc.Id);
            return acc.Id;
        } catch (DmlException e) {
            System.debug('Error al crear la Cuenta: ' + e.getMessage());
            throw e;
        }
    }

    private Id crearContacto(Map<String, Object> datos, Id accountId) {
        Contact con = new Contact();

        String tipoPersona = (String) datos.get('tipoPersona');
        if (tipoPersona == 'juridica') {
            Map<String, Object> datosJuridica = (Map<String, Object>) datos.get('datosJuridica');
            con.FirstName = (String) datosJuridica.get('representanteLegal');  // Usamos Representante Legal como Nombre
            con.LastName = 'Representante'; //  y un apellido genérico
            con.Phone = (String) datosJuridica.get('telefono');
            con.Email = (String) datosJuridica.get('correo');
           	//Asignamos Id Account
            con.AccountId = accountId;

        } else {
            Map<String, Object> datosNatural = (Map<String, Object>) datos.get('datosNatural');
            con.FirstName = (String) datosNatural.get('nombresApellidos');
            con.LastName = 'Natural';  // Apellido genérico
            con.Phone = (String) datosNatural.get('telefono');
            con.Email = (String) datosNatural.get('correo');
            //Si es persona natural le asignamos el valor de cedula
            //con.Cedula__c = (String) datosNatural.get('cedula');
        }
         //Mapeo de Elementos de seguridad para contacto
         List<Object> elementosSeguridad = (List<Object>) datos.get('elementosSeguridad');
        if (elementosSeguridad != null && !elementosSeguridad.isEmpty()) {
            //con.Elementos_de_Seguridad_JSON__c = JSON.serialize(elementosSeguridad);
        }
         //Mapeo de Propietarios para contacto
        List<Object> propietarios = (List<Object>) datos.get('propietarios');
        if (propietarios != null && !propietarios.isEmpty()) {
            //con.Propietarios_JSON__c = JSON.serialize(propietarios);
        }

        try {
            insert con;
            System.debug('Contacto creado con ID: ' + con.Id);
            return con.Id;
        } catch (DmlException e) {
            System.debug('Error al crear el Contacto: ' + e.getMessage());
            throw e;
        }
    }

    public String crearArchivoAdjunto(String recordId, String fileData, String fileName, String contentType) {
        Attachment attach = new Attachment();
        attach.Body = EncodingUtil.base64Decode(fileData);  // Decodifica el Base64
        attach.Name = fileName;
        attach.ParentId = recordId;  // ID del Contacto
        attach.ContentType = contentType;

        try {
            insert attach;
            System.debug('Adjunto creado con ID: ' + attach.Id);
            return attach.Id;
        } catch (DmlException e) {
            System.debug('Error al crear el Adjunto: ' + e.getMessage());
            throw e;
        }
    }

    // Mapear datos del formulario (AHORA NO NECESARIO)
    private Map<String, Object> mapearDatosParaSalesforce(Map<String, Object> datos) {
        // Este método ya no es necesario, pero lo dejo aquí por si quieres reutilizar alguna lógica
        return null;
    }

    // Ejemplo de cómo llamar a esta clase desde un contexto de Apex (por ejemplo, un Aura Controller o un LWC)
    //  Este método *NO* va en la clase BC_Solicitante, sino en la clase que lo llama (ej: un Aura Controller)

    @AuraEnabled
    public static String enviarFormularioDesdeApex(String accessToken, String instanceUrl, String formDataJson) {
        try {
            // 1. Deserializar el JSON a un Map<String, Object>
            Map<String, Object> formData = (Map<String, Object>) JSON.deserializeUntyped(formDataJson);

            // 2. Crear una instancia de la clase BC_Solicitante
            BC_Solicitante api = new BC_Solicitante(accessToken, instanceUrl);

            // 3. Crear el registro del solicitante (ahora Contacto y/o Cuenta)
            String recordId = api.crearRegistroSolicitante(formData);

            // 4. Adjuntar archivos
            Map<String, Object> archivos = (Map<String, Object>) formData.get('archivos');
            if (archivos != null) {
                for (String key : archivos.keySet()) {
                    Map<String, Object> archivo = (Map<String, Object>) archivos.get(key);
                    String fileName = (String) archivo.get('nombre');
                    String fileData = (String) archivo.get('base64Data');
                    String contentType = (String) archivo.get('contentType');

                    api.crearArchivoAdjunto(recordId, fileData, fileName, contentType);
                }
            }

            return 'Formulario enviado correctamente. Contact ID: ' + recordId;

        } catch (Exception e) {
            System.debug('Error en el método enviarFormularioDesdeApex: ' + e.getMessage());
            System.debug('Stack Trace: ' + e.getStackTraceString());
            throw new AuraHandledException(e.getMessage()); // Para mostrar el error en la interfaz de usuario
        }
    }

}