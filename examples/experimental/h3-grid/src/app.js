import React, {Component, Fragment} from 'react';
import {render} from 'react-dom';
import DeckGL from '@deck.gl/react';

import {StaticMap} from 'react-map-gl';

import H3GridLayer from './h3-grid-layer';
import {getMinZoom} from './h3-utils';

// Set your mapbox token here
const MAPBOX_TOKEN = process.env.MapboxAccessToken; // eslint-disable-line

const CONTROL_PANEL_STYLE = {
  position: 'fixed',
  top: 20,
  left: 20,
  padding: 20,
  fontSize: 13,
  background: '#fff'
};

// hexagon per tile at minZoom
const MAX_HEX_COUNT = 2000;

export default class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      viewState: {
        longitude: -100,
        latitude: 40,
        zoom: 3.5,
        pitch: 0,
        bearing: 0
      },
      resolution: 3
    };

    this._onResolutionChange = this._onResolutionChange.bind(this);
    this._onViewStateChange = this._onViewStateChange.bind(this);
  }

  _onResolutionChange(evt) {
    const resolution = Number(evt.target.value);
    const minZoom = getMinZoom(resolution, MAX_HEX_COUNT);
    let {viewState} = this.state;

    if (minZoom > viewState.zoom) {
      viewState = {
        ...viewState,
        zoom: minZoom,
        transitionDuration: 500
      };
    }

    this.setState({viewState, resolution});
  }

  _onViewStateChange({viewState}) {
    this.setState({viewState});
  }

  _getTooltip(info) {
    return info.object;
  }

  render() {
    const {resolution, viewState} = this.state;
    const layer = new H3GridLayer({
      // highPrecision: true,
      resolution,
      maxHexCount: MAX_HEX_COUNT,
      filled: true,
      extruded: false,
      stroked: true,
      lineWidthUnits: 'pixels',
      getLineWidth: 2,
      getFillColor: [0, 0, 0, 1],
      pickable: true,
      autoHighlight: true
    });

    return (
      <Fragment>
        <DeckGL
          viewState={viewState}
          controller={true}
          layers={[layer]}
          onViewStateChange={this._onViewStateChange}
          getTooltip={this._getTooltip}
        >
          <StaticMap
            mapStyle="mapbox://styles/mapbox/light-v9"
            mapboxApiAccessToken={MAPBOX_TOKEN}
          />
        </DeckGL>
        <div style={CONTROL_PANEL_STYLE}>
          <div>Resolution: {resolution}</div>
          <input
            type="range"
            min="0"
            max="15"
            step="1"
            value={resolution}
            onInput={this._onResolutionChange}
          />
        </div>
      </Fragment>
    );
  }
}

/* global document */
document.body.style.overflow = 'hidden';
render(<App />, document.body.appendChild(document.createElement('div')));
