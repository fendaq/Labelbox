import React, { Component } from 'react';
import L from 'leaflet';
import './leaflet.css';
import './leaflet-draw/leaflet.draw.css';
import './leaflet-draw/leaflet.draw';
import { LinearProgress } from 'material-ui/Progress';

function getSizeOnImage(url) {
  return new Promise((resolve) => {
    const img = document.createElement('img');
    img.src = url;
    img.onload = (event) => {
      document.body.removeChild(img);
      resolve({
        width: img.naturalWidth,
        height: img.naturalHeight
      });
    };
    img.style.display = 'none';
    document.body.appendChild(img);
  });
}

export class SegmentImage extends Component {
  state = {
    loading: true
  }

  componentDidUpdate(newProps){
    const { imageUrl, showPolygonTool, showRectangleTool } = newProps;
    if (imageUrl !== this.props.imageUrl) {
      this.drawnItems.getLayers().forEach((layer) => layer.remove());
      this.drawnOverlay.remove();
      this.drawImageOnMap(imageUrl);
    }
    if (this.props.showPolygonTool !== showPolygonTool || this.props.showPolygonTool !== showRectangleTool) {
      this.updateDrawControls();
    }
  }

  updateDrawControls() {
    if (this.drawControl){
      this.drawControl.remove();
    }
    this.drawControl = new L.Control.Draw({
      position: 'topright',
      draw: {
        polyline: false,
        polygon: this.props.showPolygonTool,
        rectangle: this.props.showRectangleTool,
        circle: false,
        circlemarker: false,
        marker: false
      },
      edit: {
        featureGroup: this.drawnItems,
        remove: true
      }
    });
    this.map.addControl(this.drawControl);
  }

  componentDidMount(){
    this.map = L.map('map', {
      crs: L.CRS.Simple,
      minZoom: -5,
      attributionControl: false,
      zoomControl: false
    });
    this.drawnItems = new L.FeatureGroup();
    this.updateDrawControls();
    const { imageUrl } = this.props;
    this.drawImageOnMap(imageUrl);
  }

  drawImageOnMap(imageUrl) {
    const updateLabel = () => {
      const toPixelLocation = ({lat, lng}) => ({y: lat, x: lng});
      const segmentation = this.drawnItems.getLayers()
            .map((layer) => layer.getLatLngs())
            .map(([latLngLocations]) => latLngLocations.map(toPixelLocation));
      this.props.updateLabel(segmentation || []);
    };

    this.setState({...this.state, loading: true});
    getSizeOnImage(imageUrl).then(({width, height}) => {
      const bounds = [[0,0], [height,width]];

      this.drawnOverlay = L.imageOverlay(imageUrl, bounds).addTo(this.map);
      this.map.addLayer(this.drawnItems);
      this.map.fitBounds(bounds);
      this.map.setZoom(-1);

		  this.map.on(L.Draw.Event.CREATED, (e) => {
			  this.drawnItems.addLayer(e.layer);
        updateLabel();
		  });

		  this.map.on(L.Draw.Event.DELETED, (e) => {
        updateLabel();
		  });

      this.setState({...this.state, loading: false});
    });
  }

  render() {
    return (
      <div>
        {
          this.state.loading && (<LinearProgress color="accent" />)
        }
        <div id="map" style={{height: '350px'}}></div>
      </div>
    );
  }
}
