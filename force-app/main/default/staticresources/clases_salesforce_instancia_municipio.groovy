// Apex Class (Controller)
public class SolicitudController {

    // Inner class to represent Elemento de Seguridad data (for CaseComment)
    public class ElementoSeguridadData {
        public String tipoElemento;
        public String descripcionElemento;
        public String direccion;
        public String coordenadas;
        public String tipoSolicitud;

        public ElementoSeguridadData(Map<String, Object> data) {
            Map<String, Object> tipoElementoMap = (Map<String, Object>) data.get('tipoElemento');
            this.tipoElemento = (String) tipoElementoMap.get('tipo');
            this.descripcionElemento = (String) tipoElementoMap.get('descripcion');
            this.direccion = (String) data.get('direccion');
            this.coordenadas = (String) data.get('coordenadas');
            this.tipoSolicitud = (String) data.get('tipoSolicitud');
        }

        // Convert to a formatted string for CaseComment.Body
        public String toCommentString() {
            return JSON.serialize(this); // Use JSON for structured storage
        }
        //Static method to convert from commentString
        public static ElementoSeguridadData fromCommentString(String commentStr){
            return (ElementoSeguridadData) JSON.deserialize(commentStr, ElementoSeguridadData.class);
        }
    }


    // --- Main Method to Process the Solicitud ---
    @AuraEnabled
    public static Id procesarSolicitud(Map<String, Object> formData) {

        Savepoint sp = Database.setSavepoint();
        try {
            // --- 1. Create the Case ---
            Case solicitud = new Case();
            solicitud.Subject = 'Solicitud de Elementos de Seguridad'; // Or a more descriptive subject
            solicitud.Description = 'Detalles de la solicitud...'; // You can add more details here
            solicitud.Type = 'Solicitud';  // Use a custom picklist value if needed
            solicitud.Status = 'New';     // Set initial status
            solicitud.Origin = 'Web';     // Or another appropriate origin

            // Custom Fields on Case (Add these to your Case object)
            solicitud.Tipo_de_Persona__c = (String) formData.get('tipoPersona'); //Picklist
            solicitud.Acepta_Terminos__c = (Boolean) formData.get('aceptaTerminos');

            // --- 2. Create the Primary Contact ---
            Contact primaryContact = new Contact();

            if (solicitud.Tipo_de_Persona__c == 'juridica') {
                Map<String, Object> datosJuridica = (Map<String, Object>) formData.get('datosJuridica');
                primaryContact.LastName = (String) datosJuridica.get('nombreEmpresa');
                primaryContact.MailingStreet = (String) datosJuridica.get('direccion');
                primaryContact.Email = (String) datosJuridica.get('correo');
                primaryContact.Phone = (String) datosJuridica.get('telefono');
                primaryContact.Description = 'Representante Legal: ' + (String) datosJuridica.get('representanteLegal') +
                                            ', Identificación: ' + (String) datosJuridica.get('identificacionRepresentante');
                 primaryContact.RUC__c = (String) datosJuridica.get('ruc'); // Custom field on Contact
                primaryContact.RecordTypeId = Schema.SObjectType.Contact.getRecordTypeInfosByName().get('Representante Legal').getRecordTypeId(); // VERY IMPORTANT: Replace 'Representante Legal'

            } else { // Natural
                Map<String, Object> datosNatural = (Map<String, Object>) formData.get('datosNatural');
                primaryContact.FirstName = ((String) datosNatural.get('nombresApellidos')).substringBefore(' ');
                primaryContact.LastName = ((String) datosNatural.get('nombresApellidos')).substringAfter(' ');
                primaryContact.MailingStreet = (String) datosNatural.get('direccion');
                primaryContact.Email = (String) datosNatural.get('correo');
                primaryContact.Phone = (String) datosNatural.get('telefono');
                primaryContact.Cedula__c = (String) datosNatural.get('cedula'); // Custom field on contact
                primaryContact.RecordTypeId = Schema.SObjectType.Contact.getRecordTypeInfosByName().get('Solicitante').getRecordTypeId(); // VERY IMPORTANT:  Replace 'Solicitante'
            }

            insert primaryContact;

            // Link the Case to the Contact
            solicitud.ContactId = primaryContact.Id;
            insert solicitud; // Insert Case *after* Contact, to have ContactId


            // --- 3. Create Additional Contacts (Propietarios/Mandatarios) ---

            List<Object> propietariosData = (List<Object>) formData.get('propietarios');
            if (propietariosData != null) {
                List<Contact> additionalContacts = new List<Contact>();
                for (Object propData : propietariosData) {
                    Map<String, Object> propMap = (Map<String, Object>) propData;
                    Contact additionalContact = new Contact();
                    additionalContact.LastName = (String) propMap.get('nombresApellidos');
                    additionalContact.Cedula__c = (String) propMap.get('cedulaRuc'); // Custom field
                    additionalContact.Phone = (String) propMap.get('telefono');
                    additionalContact.Email = (String) propMap.get('correo');
                    additionalContact.Codigo_Catastral__c = (String) propMap.get('codigoCatastral'); //Custom Field
                    additionalContact.Calidad_en_la_que_suscribe__c = (String) propMap.get('calidadSuscrito'); //Custom Field -- Picklist
                    additionalContact.Case__c = solicitud.Id; // Lookup to Case (VERY IMPORTANT - custom field)
                    additionalContact.RecordTypeId = Schema.SObjectType.Contact.getRecordTypeInfosByName().get('Propietario/Mandatario').getRecordTypeId(); // VERY IMPORTANT
                    additionalContacts.add(additionalContact);
                }
                insert additionalContacts;
            }



            // --- 4. Create CaseComments (for Elementos de Seguridad) ---

            List<Object> elementosSeguridadData = (List<Object>) formData.get('elementosSeguridad');
            if (elementosSeguridadData != null) {
                List<CaseComment> comments = new List<CaseComment>();
                for (Object elemData : elementosSeguridadData) {
                    Map<String, Object> elemMap = (Map<String, Object>) elemData;
                    ElementoSeguridadData elementoData = new ElementoSeguridadData(elemMap);

                    CaseComment comment = new CaseComment();
                    comment.ParentId = solicitud.Id; // Link to the Case
                    comment.CommentBody = elementoData.toCommentString(); // Store as JSON
                    comment.IsPublished = true; // Make it visible
                    comments.add(comment);
                }
                insert comments;
            }


            // --- 5. Handle Attachments (Simplified - see notes below) ---
             Map<String, Object> archivosData = (Map<String, Object>) formData.get('archivos');
            if (archivosData != null) {
                List<Attachment> attachments = new List<Attachment>();
                for (String key : archivosData.keySet()) {
                    Map<String, Object> archivoInfo = (Map<String, Object>) archivosData.get(key);
                    // In a real LWC, you would get the file body (Base64 encoded) here
                    // For this example, we're just demonstrating the Attachment creation
                    Attachment attachment = new Attachment();
                    attachment.ParentId = solicitud.Id;
                    attachment.Name = (String) archivoInfo.get('nombre');
                    attachment.ContentType = key; //  e.g., 'registro', 'acta', etc.  Could be improved with actual MIME type.
                    attachment.Body = Blob.valueOf('Dummy file content'); // Replace with actual Base64 decoded file content
                    // attachment.Description = 'File type: ' + key; // Optional
                    attachments.add(attachment);
                }
                insert attachments;
            }

            return solicitud.Id; // Return the Case ID

        } catch (Exception e) {
            Database.rollback(sp);
            System.debug('Error processing solicitud: ' + e.getMessage());
            //  Log the full stack trace for debugging
            System.debug(e.getStackTraceString());
            throw new AuraHandledException(e.getMessage()); // Re-throw for LWC to handle
        }
    }
}