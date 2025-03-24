public with sharing class BC_ElementosController {
    @AuraEnabled(cacheable=true)
    public static List<BCElemento__c> obtenerCoordenadas(Id caseId) {
        return [
            SELECT Id, 
            BCCoordenadasgeoreferenciales__c
            FROM BCElemento__c
            WHERE BCCaso__c = :caseId
        ];
    }
}