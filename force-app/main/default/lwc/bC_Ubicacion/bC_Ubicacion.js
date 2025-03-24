import { LightningElement, api, wire } from 'lwc';
import obtenerCoordenadas from '@salesforce/apex/BC_ElementosController.obtenerCoordenadas';

export default class MapaCaso extends LightningElement {
    @api recordId;
    latitud;
    longitud;
    googleMapsLoaded = false;

    @wire(obtenerCoordenadas, { caseId: '$recordId' })
    wiredCoordenadas({ error, data }) {
        if (data) {
            if (data.length > 0) {
                this.latitud = data[0].BCCoordenadasgeoreferenciales__Latitude;
                this.longitud = data[0].BCCoordenadasgeoreferenciales__Longitude;
                if (this.latitud && this.longitud) {
                    this.cargarGoogleMaps();
                }
            } else {
                this.latitud = null;
                this.longitud = null;
            }
        } else if (error) {
            console.error('Error al obtener coordenadas:', error);
        }
    }

    async cargarGoogleMaps() {
        if (!this.googleMapsLoaded) {
            await this.cargarScriptGoogleMaps();
        }

        if (this.latitud && this.longitud) {
            const mapContainer = this.template.querySelector('.map-container');
            const map = new google.maps.Map(mapContainer, {
                center: { lat: this.latitud, lng: this.longitud },
                zoom: 15
            });

            new google.maps.Marker({
                position: { lat: this.latitud, lng: this.longitud },
                map: map,
                title: "Ubicación"
            });
        }
    }

    async cargarScriptGoogleMaps() {
        return new Promise((resolve, reject) => {
            if (window.google && window.google.maps) {
                this.googleMapsLoaded = true;
                resolve();
            } else {
                const script = document.createElement('script');
                script.src = 'https://maps.googleapis.com/maps/api/js?key=AIzaSyAuRi0mJrWknQyVEs0ZtNUz81cGK8_sMjY'; // Replace with your actual API Key
                script.async = true;
                script.defer = true;
                script.onload = () => {
                    this.googleMapsLoaded = true;
                    resolve();
                };
                script.onerror = reject;
                document.body.appendChild(script);
            }
        });
    }
}