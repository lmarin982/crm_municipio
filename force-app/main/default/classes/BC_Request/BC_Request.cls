public with sharing class BC_Request {

    public String url { get; set; }
    public String method { get; set; }
    public String body { get; set; }
    public Boolean isRequired { get; set; } // Cambiado a Boolean

    // Constructor
    public BC_Request(String url, String method, String body, Boolean isRequired) {
        this.url = url;
        this.method = method.toUpperCase(); // Normalizar a mayúsculas
        this.body = body;
        this.isRequired = isRequired;
    }
     // Constructor sin el parametro isRequired.
     public BC_Request(String url, String method, String body) {
        this.url = url;
        this.method = method.toUpperCase(); // Normalizar a mayúsculas
        this.body = body;
        this.isRequired = false; // Valor predeterminado si no se especifica.
    }

    // Método de instancia para realizar la solicitud (NO estático)
    public String executeRequest() {
        // Validar el método HTTP
        if (!new Set<String>{'GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD'}.contains(this.method)) {
            return 'Error: Método HTTP inválido: ' + this.method;
        }

        // Validar si el cuerpo es requerido y está vacío
        if (this.isRequired && String.isBlank(this.body) && (this.method == 'POST' || this.method == 'PUT')) {
            return 'Error: El cuerpo de la solicitud es requerido.';
        }


        try {
            HttpRequest request = new HttpRequest();
            request.setEndpoint(this.url);
            request.setMethod(this.method);
            request.setTimeout(60000); // Timeout de 60 segundos (ajustar según necesidad)

            if (this.method == 'POST' || this.method == 'PUT') {
                request.setHeader('Content-Type', 'application/json; charset=UTF-8');
                if(String.isNotBlank(this.body)) { // Solo establecer el body si no es blanco
                    request.setBody(this.body);
                }

            }

            Http http = new Http();
            HttpResponse response = http.send(request);

            // Mejor manejo de la respuesta, incluyendo el código de estado y cuerpo en caso de error
            String responseBody = response.getBody(); //almacenar el body
            if (response.getStatusCode() >= 200 && response.getStatusCode() < 300) {
                return responseBody;
            } else {
                return String.format('Error: Código de estado {0}, Mensaje: {1}, Cuerpo: {2}',
                    new List<Object>{response.getStatusCode(), response.getStatus(), responseBody});
            }

        } catch (System.CalloutException e) {
             return String.format('Error de Callout: {0}', new List<Object>{e.getMessage()});
        } // No es necesario un catch (Exception e) adicional
    }


    // Método estático que toma una instancia de BC_Request como parámetro (alternativa)
    public static String executeRequestStatic(BC_Request requestData) {
        // Validar el método HTTP
        if (!new Set<String>{'GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD'}.contains(requestData.method)) {
            return 'Error: Método HTTP inválido: ' + requestData.method;
        }
        //Validar que el requestData no sea nulo
        if(requestData == null){
             return 'Error: requestData no puede ser nulo.';
        }
        // Validar si el cuerpo es requerido y está vacío
        if (requestData.isRequired && String.isBlank(requestData.body) && (requestData.method == 'POST' || requestData.method == 'PUT')) {
            return 'Error: El cuerpo de la solicitud es requerido.';
        }


        try {
            HttpRequest request = new HttpRequest();
            request.setEndpoint(requestData.url);
            request.setMethod(requestData.method);
            request.setTimeout(60000); // Timeout de 60 segundos (ajustar según necesidad)

            if (requestData.method == 'POST' || requestData.method == 'PUT') {
                request.setHeader('Content-Type', 'application/json; charset=UTF-8');
                if(String.isNotBlank(requestData.body)) {
                  request.setBody(requestData.body);
                }

            }

            Http http = new Http();
            HttpResponse response = http.send(request);
             // Mejor manejo de la respuesta, incluyendo el código de estado y cuerpo en caso de error
            String responseBody = response.getBody(); //almacenar body
            if (response.getStatusCode() >= 200 && response.getStatusCode() < 300) {
                return responseBody;
            } else {
                return String.format('Error: Código de estado {0}, Mensaje: {1}, Cuerpo: {2}',
                    new List<Object>{response.getStatusCode(), response.getStatus(), responseBody});
            }


        } catch (System.CalloutException e) {
            return String.format('Error de Callout: {0}', new List<Object>{e.getMessage()});
        } // No es necesario un catch (Exception e) adicional
    }
}