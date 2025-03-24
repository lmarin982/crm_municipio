import { LightningElement, api, wire } from 'lwc';
import obtenerCoordenadas from '@salesforce/apex/BC_ElementosController.obtenerCoordenadas';

export default class MapaCaso extends LightningElement {
    @api recordId;
    mapMarkers = [];
    error;

    @wire(obtenerCoordenadas, { caseId: '$recordId' })
    wiredElementos({ error, data }) {
        if (data) {
            this.mapMarkers = data.map(el => ({
                location: {
                    Latitude: el.lat,
                    Longitude: el.lng
                }
            }));
            this.error = undefined;
        } else if (error) {
            this.error = error;
            this.mapMarkers = [];
        }
    }    

    get hasMarkers() {
        return this.mapMarkers.length > 0;
    }

    get noData() {
        return !this.hasMarkers && !this.error;
    }

}