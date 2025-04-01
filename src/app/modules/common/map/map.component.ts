import { AfterViewInit, Component, Input, OnInit } from '@angular/core';
import { SharedMouleModule } from '../../../shared/shared-moule.module';
import 'ol/ol.css';
import { OSM } from 'ol/source';
import { fromLonLat } from 'ol/proj';
import { Marker } from '../../../core/model/map/marker.model';
import Feature from 'ol/Feature.js';
import Map from 'ol/Map.js';
import Overlay from 'ol/Overlay.js';
import Point from 'ol/geom/Point.js';
import View from 'ol/View.js';
import { Icon, Style } from 'ol/style.js';
import { Vector as VectorSource } from 'ol/source.js';
import { Tile as TileLayer, Vector as VectorLayer } from 'ol/layer.js';
import Popover from 'bootstrap/js/dist/popover';

@Component({
    selector: 'app-map',
    standalone: true,
    imports: [SharedMouleModule],
    templateUrl: './map.component.html',
    styleUrl: './map.component.css',
})
export class MapComponent implements OnInit, AfterViewInit {
    @Input() markers: Marker[];

    public map!: Map;

    ngOnInit(): void {
        var iconStyle = new Style({
            image: new Icon({
                src: 'assets/images/icons/marker.png',
                offset: [0, 0],
                opacity: 1,
                scale: 0.04,
            }),
        });

        let features: Feature<Point>[] = [];

        this.markers.forEach((marker: Marker) => {
            const pointFeature = new Feature({
                geometry: new Point(fromLonLat([marker.longitude, marker.latitude])),
                name: marker.name,
            });
            features.push(pointFeature);
        });

        const vectorSource = new VectorSource({
            features: features,
        });

        const vectorLayer = new VectorLayer({
            source: vectorSource,
            style: iconStyle,
        });

        this.map = new Map({
            layers: [
                new TileLayer({
                    source: new OSM(),
                }),
                vectorLayer,
            ],
            target: 'map',
            view: new View({
                center: [698282.236, 377375.758],
                zoom: 3,
                maxZoom: 18,
            }),
        });

        const element = document.getElementById('popup');
        let popup: any;
        let popover: any;
        if (element) {
            popup = new Overlay({
                element: element,
                positioning: 'bottom-center',
                stopEvent: false,
            });
            this.map.addOverlay(popup);
            this.setOnclick(this.map, popup, popover, element);
        }
        setTimeout(() => {
            this.map.getView().fit(vectorSource.getExtent());
            this.map.getView().setZoom(4);
        }, 250);
    }

    setOnclick(map: Map, popup: any, popover: any, element: any) {
        this.map.on('click', (evt) => {
            let feature: any = map.forEachFeatureAtPixel(evt.pixel, function (feature: any) {
                return feature;
            });
            if (popover) {
                popover.dispose();
                popover = undefined;
            }
            if (!feature) {
                return;
            }
            popup.setPosition(evt.coordinate);
            popover = new Popover(element, {
                placement: 'top',
                html: true,
                content: '<span class="text-center fw-bold">' + feature.get('name') + '</code>',
                title: '',
            });
            popover.show();
        });
        map.on('pointermove', function (e) {
            const pixel = map.getEventPixel(e.originalEvent);
            const hit = map.hasFeatureAtPixel(pixel);
            map.getTargetElement().style.cursor = hit ? 'pointer' : '';
        });
        map.on('movestart', function (e) {
            if (popover) {
                popover.dispose();
                popover = undefined;
            }
        });
    }

    ngAfterViewInit(): void {}
}
