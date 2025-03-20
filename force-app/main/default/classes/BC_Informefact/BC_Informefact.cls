public with sharing class BC_Informefact {
  
    //Ahora es una propiedad y NO una función.
    @AuraEnabled
    public  String FormatoFecha { 
        get{ //Usamos un getter
           return formatFechaPriv();
        } 
        private set;  //Setter privado, no queremos que visualforce cambie este valor
    }


    //Constructor para inicializar el valor.
    public BC_Informefact() {
      //  FormatoFecha = formatFechaPriv();  //Ahora la propiedad se inicializa en el constructor.
    }

    //Metodo privado para formatear, ahora es una funcion que se llama desde el getter.
    private static String formatFechaPriv() {
         try {
            Date today = Date.today();
            String monthName;

            // Usamos un switch para obtener el nombre del mes en español.
            switch on today.month() {
                when 1 { monthName = 'enero'; }
                when 2 { monthName = 'febrero'; }
                when 3 { monthName = 'marzo'; }
                when 4 { monthName = 'abril'; }
                when 5 { monthName = 'mayo'; }
                when 6 { monthName = 'junio'; }
                when 7 { monthName = 'julio'; }
                when 8 { monthName = 'agosto'; }
                when 9 { monthName = 'septiembre'; }
                when 10 { monthName = 'octubre'; }
                when 11 { monthName = 'noviembre'; }
                when 12 { monthName = 'diciembre'; }
                when else { monthName = ''; } // Manejo para un mes inválido (poco probable)
            }

            // Construimos la cadena de fecha en el formato deseado.
            return 'Guayaquil, ' + today.day() + ' de ' + monthName + ' del ' + today.year();

        } catch (Exception e) {
           //Es mejor devolver un mensaje de error que lanzar la excepcion AuraHandled.
           //Si no, visualforce no puede mostrar el error.
            return 'Error al obtener la fecha: ' + e.getMessage();
        }
    }
}