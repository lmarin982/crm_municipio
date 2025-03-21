// Archivo: BC_InformeFactibilidadSocial.cls
public with sharing class BC_InformeFactibilidadSocial {

    // Propiedades (simplificadas, ya que son efectivamente de solo lectura)
    // O puedes hacerlas métodos estáticos públicos directamente.
    public String formatoFecha {
        get { return formatFechaPriv(); }
    }

    public String memoData {
        get { return getMemorandumData(); }
    }

    public String urlApiMimg {
        get { return getURL(); }
    }

    // Obtener la URL desde la configuración personalizada (CORREGIDO)
    public static String getURL() {
        try {
            // Usar getOrgDefaults() o getValues('NombreDelRegistro')
            BCCiudadano__c settings = BCCiudadano__c.getOrgDefaults(); // O getValues() si tienes un registro específico.
            //BCCiudadano__c settings = BCCiudadano__c.getValues('URL_API');
            return settings.BCUrl__c;
        } catch (Exception e) {
            // No uses AuraHandledException aquí.  Registra el error y devuelve null (o un valor por defecto).
            System.debug('Error al obtener la URL: ' + e.getMessage());
            return null; // O lanza una excepción personalizada.
        }
    }

    // Método para obtener datos del ciudadano (CORREGIDO y MEJORADO)
    @RemoteAction
    public static BC_CiudadanoResult getDataCiudadano(String cedula) {
        try {
			// --- Validaciones ---
            if (String.isBlank(cedula)) {
                throw new IllegalArgumentException('La cédula no puede estar vacía.');
            }
             //Validar que la cédula contenga solo números.
            if(!cedula.isNumeric()){
                throw new IllegalArgumentException('La cédula debe contener solo numeros');
            }

            String urlApi = getURL() != null ? getURL() : 'https://tramites4.guayaquil.gob.ec/MgcApiCiudadano/CiudadanoSF/Consultar';
            if(String.isBlank(urlApi)){
                throw new AuraHandledException('URL de la API no encontrada. Revise la configuracion.');
            }

			// Construir URL correctamente
            String url = String.format('{0}?tipoIdentificacion={1}&identificacion={2}', new List<Object>{ urlApi, 'C', cedula }); // Asumiendo 'CEDULA' como tipoIdentificacion

            BC_Request request = new BC_Request(url, 'GET', null, false);
            String jsonResponse = request.executeRequest();

			// Deserializar la respuesta a BC_CiudadanoResult (ASUMIENDO que tienes BC_CiudadanoResult definido correctamente)
            BC_CiudadanoResult ciudadanoResult = (BC_CiudadanoResult) JSON.deserialize(jsonResponse, BC_CiudadanoResult.class);
            return ciudadanoResult;


        }catch (IllegalArgumentException e) {
            System.debug('Error de validación: ' + e.getMessage());
            // Considera lanzar una excepción personalizada o devolver un objeto BC_CiudadanoResult con información del error
            return buildErrorResult('Error de validación: ' + e.getMessage());
        } catch(CalloutException e){
             System.debug('Error de Callout: ' + e.getMessage());
              return buildErrorResult('Error de conexion con la API: ' + e.getMessage());
        }
        catch (Exception e) {
            // Manejar otros errores
			 System.debug('Error al obtener datos del ciudadano: ' + e.getMessage());
            return buildErrorResult('Error al obtener datos del ciudadano: ' + e.getMessage());
        }
    }

    // Constructor (generalmente vacío en este caso)
    public BC_InformeFactibilidadSocial() {}

    // Obtener datos del memorándum (CORREGIDO)
    private static String getMemorandumData() {
        try {
            return 'Memorándum No. DVC-AyP-2024-1087';
        } catch (Exception e) {
            // No uses AuraHandledException aquí.  Registra el error.
            System.debug('Error al obtener datos del memorándum: ' + e.getMessage());
            return 'Error al obtener memorandum'; // O un valor por defecto
        }
    }

    // Formatear la fecha (CORREGIDO y más eficiente)
    private static String formatFechaPriv() {
        try {
            Date today = Date.today();
            String monthName = getLocalizedMonthName(today, 'es_ES');

            return String.format('Guayaquil, {0} de {1} del {2}', new List<Object>{today.day(), monthName, today.year()});

        } catch (Exception e) {
            System.debug('Error al formatear la fecha: ' + e.getMessage());
            return 'Error al formatear la fecha'; // O un valor por defecto.
        }
    }
	 // Helper method to create an error BC_CiudadanoResult
    private static BC_CiudadanoResult buildErrorResult(String errorMessage) {
        BC_CiudadanoResult.Resultado errorResultado = new BC_CiudadanoResult.Resultado();
        errorResultado.ok = false;
        errorResultado.titulo = 'Error';
        errorResultado.mensajes.add(errorMessage);
        errorResultado.errorValidacion = true; // Considera si esto es siempre true

        BC_CiudadanoResult errorResult = new BC_CiudadanoResult();
        errorResult.resultado = errorResultado;
        return errorResult;
    }

    private static String getLocalizedMonthName(Date inputDate, String locale) {
        Datetime dt = Datetime.newInstance(inputDate.year(), inputDate.month(), inputDate.day());
        return dt.format('MMMM', locale);
    }
}