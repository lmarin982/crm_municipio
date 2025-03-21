// Archivo: BC_CiudadanoResult.cls
public with sharing class BC_CiudadanoResult { // Considera si 'with sharing' es apropiado.

    public DataResult dataResult { get; set; }  // camelCase y propiedades auto-implementadas
    public Resultado resultado { get; set; }

    // Constructor (opcional, pero recomendado)
    public BC_CiudadanoResult() {
        this.dataResult = new DataResult();
        this.resultado = new Resultado();
    }

    // Constructor para facilitar la creación
    public BC_CiudadanoResult(DataResult dataResult, Resultado resultado) {
        this.dataResult = dataResult;
        this.resultado = resultado;
    }

    // Archivo: Resultado.cls (clase separada)
    public class Resultado {
        public Boolean ok { get; set; }          // camelCase y Boolean
        public String titulo { get; set; }
        public Integer tipoMensaje { get; set; } // Integer
        public List<String> mensajes { get; set; } // List<String>
        public Boolean errorValidacion { get; set; }
        public Integer statusCode { get; set; }   // Integer

         // Constructor para facilitar la creación
        public Resultado(){
            this.mensajes = new List<String>(); //inicializar lista mensajes.
        }
    }

    // Archivo: DataResult.cls (clase separada)
    public class DataResult {
        public String numeroIdentificacion { get; set; }
        public String nombres { get; set; }
        public String apellidos { get; set; }
        public String fechaNacimiento { get; set; }
        public Integer edad { get; set; }        // Integer
        public String estadoCivil { get; set; }
        public String sexo { get; set; }
        public String provinciaNacimiento { get; set; }
        public String cantonNacimiento { get; set; }
        public String direccionResidencia { get; set; }
        public String provinciaResidencia { get; set; }
        public String cantonResidencia { get; set; }
        public String parroquiaResidencia { get; set; }
        public String telefonoCelular { get; set; }
        public String telefonoConvencional { get; set; }
        public String email { get; set; }
    }
}