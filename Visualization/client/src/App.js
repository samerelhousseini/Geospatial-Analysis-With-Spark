import React from 'react';
import 'mapbox-gl/dist/mapbox-gl.css';

import {StaticMap} from 'react-map-gl';
import {connect} from 'react-redux';
import DeckGL from '@deck.gl/react';
import _ from 'lodash';
import {ScatterplotLayer} from '@deck.gl/layers';
import socketIOClient from "socket.io-client";
import Chart from './chart';

import {
    changeViewport, 
} from './actions';

import {MAPBOX_TOKEN, startingViewPort} from './constants';


class App extends React.Component {

    state = {data:{}, stats:{status:{}}, group:''}
    endpoint = "http://127.0.0.1:4000";
    socket = socketIOClient(this.endpoint);

    componentDidMount(){

        this.socket.on('changeData', (msg) => {
            //console.log(msg);
            this.setState({data:{...this.state.data, [msg._id]:msg}});
        });
        this.socket.on('allData', (msg) => {
            //console.log(msg);
            this.setState({data:msg});
        });
        this.socket.on('stats', (msg) => {
            console.log(msg);
            //this.setState({data:msg});
            this.setState({stats:msg});
        });
    }

    _onViewportChange(viewState){

    }


    renderLayers(){        

        const layer = new ScatterplotLayer({
            id: 'scatterplot-layer',
            data:Object.values(this.state.data),
            pickable: true,
            opacity: 0.8,
            radiusScale: 6,
            radiusMinPixels: 5,
            radiusMaxPixels: 20,
            getPosition: d => d.coordinates,
            getRadius: d => Math.sqrt(d.exits),
            getFillColor: d => {return d.current_status === this.state.group ? [80, 80, 255]:[255, 140, 0]},
            getLineColor: d => [0, 0, 0],
            fp64: true,
          });
          return [layer];
    }


    renderCharts(){
        return <Chart config={{ 
                            data:this.state.stats,
                            title: "Stats",
                            desc: "Description"
                        }} 
                        highlight= { (group) => this.highlight(group) }
                        />
    }

    highlight(group){
        this.setState({group})
    }


    render(){
        return (
            <div id="DeckGLMapDiv" >
                <DeckGL 
                    ref={ref => {
                        this._deck = ref && ref.deck;
                    }}
                    refresh={this.props.animate || this.props.refreshMapState}
                    layers={this.renderLayers()}
                    initialViewState={startingViewPort.viewState} 
                    viewState = {this.props.mapViewport.viewState}
                    onViewStateChange={viewState => this._onViewportChange(viewState)}
                    controller >
                    <StaticMap 
                        mapboxApiAccessToken={MAPBOX_TOKEN} 
                        mapStyle='mapbox://styles/mapbox/dark-v10'
                        onLoad={this._onMapLoad}    
                        />
                </DeckGL>
                {
                    this.renderCharts()
                }
            </div>
        );
    }
}


const mapStateToProps = (state) => {
    return {
        mapViewport: state.mapViewport,
    }
}

export default connect(mapStateToProps, {changeViewport})(App);