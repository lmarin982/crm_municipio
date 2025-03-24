public with sharing class BC_ElementosController {
    @AuraEnabled(cacheable=true)
    public static List<Map<String, Object>> obtenerCoordenadas(Id caseId) {
        List<BCElemento__c> elementos = [
            SELECT Id, Name, BCCoordenadasgeoreferenciales__c
            FROM BCElemento__c
            WHERE BCSolicitud__c = :caseId 
              AND BCCoordenadasgeoreferenciales__Latitude__s != null 
              AND BCCoordenadasgeoreferenciales__Longitude__s != null
        ];

        List<Map<String, Object>> result = new List<Map<String, Object>>();
        for (BCElemento__c el : elementos) {
            result.add(new Map<String, Object>{
                'lat' => el.BCCoordenadasgeoreferenciales__Latitude__s,
                'lng' => el.BCCoordenadasgeoreferenciales__Longitude__s
            });
        }
        return result;
    }
}