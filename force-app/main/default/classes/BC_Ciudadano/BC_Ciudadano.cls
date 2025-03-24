@RestResource(urlMapping='/Ciudadano/*')
global with sharing class BC_Ciudadano {
    
    @HttpGet
    global static String obtenerDatosCiudadano() { // Cambiado a String
        RestRequest req = RestContext.request;
        RestResponse res = RestContext.response; //Obtenemos el objeto response.
        String cedula = req.params.get('cedula');
        
        //Validaciones iniciales
        if (String.isBlank(cedula)) {
            return JSON.serialize(construirRespuestaError(400, 'Cédula no proporcionada.')); // Serializamos el error
        }
        
        // 1.  Consumir el endpoint externo usando BC_Request
        try {
            // 1. Obtener la instancia del Custom Setting (para el usuario actual)
            BCCiudadano__c bcCiudadano = BCCiudadano__c.getInstance();
            
            // 2. Verificar si la instancia del Custom Setting es nula
            if (bcCiudadano == null) {
                System.debug('Error: No se encontró la configuración de BCCiudadano__c para el usuario actual.');
                // Opcional: Podrías intentar obtener los valores predeterminados de la organización
                // como respaldo:
                bcCiudadano = BCCiudadano__c.getOrgDefaults();
                if (bcCiudadano == null) {
                    System.debug('Error: No se encontró la configuración de BCCiudadano__c.');
                }
            }
            
            // 3. Acceder al campo BCUrl__c *dentro* de la instancia del Custom Setting.
            String url_api_municipio = bcCiudadano.BCUrl__c;
            
            // 4. Verificar si el campo BCUrl__c tiene un valor
            if (String.isBlank(url_api_municipio)) {
                System.debug('Error: El campo BCUrl__c está vacío en la configuración de BCCiudadano__c.');
            }

            //Opcional, si getInstance, tiene sentido que se use para este caso.
            //BCCiudadano__c ciudadano = BCCiudadano__c.getInstance(endpointURL);
            
            
            //BCCiudadano__c bcCiudadano = BCCiudadano__c.getOrgDefaults();
            String endpointURL = url_api_municipio + '?tipoIdentificacion=C&identificacion=' + cedula; // Reemplaza con la URL real
            //String endpointURL = 'https://tu-endpoint-externo.com/consulta?cedula=' + EncodingUtil.urlEncode(cedula, 'UTF-8'); // Reemplaza con la URL real
            BC_Request externalRequest = new BC_Request(endpointURL, 'GET', null, false);  // GET request, body nulo, no requerido
            String externalResponseString = externalRequest.executeRequest();
            
            //Verificar si hubo algun error en la peticion
            if (externalResponseString.startsWith('Error:')) {
                BC_CiudadanoResult errorResult = construirRespuestaError(500, 'Error al consumir el servicio externo: ' + externalResponseString);
                res.statusCode = 500; //Seteamos el status code en el objeto Response.
                return JSON.serialize(errorResult); // Serializamos el error
            }
            
            
            // 2. Parsear la respuesta del endpoint externo (si fue exitosa)
            Map<String, Object> datosExternos = (Map<String, Object>) JSON.deserializeUntyped(externalResponseString);
            
            // 3. Transformar los datos y construir el objeto BC_CiudadanoResult
            BC_CiudadanoResult ciudadanoResult = transformarDatos(datosExternos);
            res.statusCode = 200; //Seteamos el status code en el objeto Response.
            // 4. Serializar la respuesta a JSON y configurar la respuesta REST
            res.headers.put('Content-Type', 'application/json'); //Importante para que el cliente lo interprete como JSON
            return JSON.serialize(ciudadanoResult);
            
        } catch (Exception ex) {
            BC_CiudadanoResult errorResult = construirRespuestaError(500, 'Error inesperado: ' + ex.getMessage());
            res.statusCode = 500; //Seteamos el status code en el objeto Response.
            return JSON.serialize(errorResult); // Serializamos el error
        }
    }
    
    
    // **Método para transformar los datos al formato de respuesta deseado y construir BC_CiudadanoResult**
    private static BC_CiudadanoResult transformarDatos(Map<String, Object> datosExternos) {
        
        BC_CiudadanoResult.DataResult dataResult = new BC_CiudadanoResult.DataResult();
        dataResult.numeroIdentificacion = (String) datosExternos.get('cedula');  // Asume que el endpoint externo devuelve un campo "cedula"
        dataResult.nombres = (String) datosExternos.get('nombres');
        dataResult.apellidos = (String) datosExternos.get('apellidos');
        dataResult.fechaNacimiento = (String) datosExternos.get('fechaNacimiento');
        dataResult.edad = (Integer) datosExternos.get('edad');
        dataResult.estadoCivil = (String) datosExternos.get('estadoCivil');
        dataResult.sexo = (String) datosExternos.get('sexo');
        dataResult.provinciaNacimiento = (String) datosExternos.get('provinciaNacimiento');
        dataResult.cantonNacimiento = (String) datosExternos.get('cantonNacimiento');
        dataResult.direccionResidencia = (String) datosExternos.get('direccion');
        dataResult.provinciaResidencia = (String) datosExternos.get('provinciaResidencia');
        dataResult.cantonResidencia = (String) datosExternos.get('cantonResidencia');
        dataResult.parroquiaResidencia = (String) datosExternos.get('parroquiaResidencia');
        dataResult.telefonoCelular = (String) datosExternos.get('telefonoCelular');
        dataResult.telefonoConvencional = (String) datosExternos.get('telefonoConvencional');
        dataResult.email = (String) datosExternos.get('email');
        
        BC_CiudadanoResult.Resultado resultado = new BC_CiudadanoResult.Resultado();
        resultado.ok = true;
        resultado.titulo = 'Consulta de ciudadano Sales Force';
        resultado.tipoMensaje = 0;
        resultado.mensajes.add('Consulta satisfactoria.'); // Asegúrate de inicializar la lista
        resultado.errorValidacion = false;
        resultado.statusCode = 200;
        
        return new BC_CiudadanoResult(dataResult, resultado);
    }
    
    // **Métodos para construir las respuestas (exitosa y de error)**
    private static BC_CiudadanoResult construirRespuestaError(Integer statusCode, String mensaje) {
        
        BC_CiudadanoResult.Resultado resultado = new BC_CiudadanoResult.Resultado();
        resultado.ok = false;
        resultado.titulo = 'Error en Consulta de Ciudadano';
        resultado.tipoMensaje = 2; // Código para error
        resultado.mensajes.add(mensaje); // Asegúrate de inicializar la lista
        resultado.errorValidacion = true;
        resultado.statusCode = statusCode;
        
        BC_CiudadanoResult ciudadanoResult = new BC_CiudadanoResult();
        ciudadanoResult.resultado = resultado;
        
        return ciudadanoResult;
    }
}