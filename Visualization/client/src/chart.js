import React from "react";
import { connect } from "react-redux";
import _ from 'lodash';


import {
    VerticalBarSeries,
    XAxis,
    FlexibleWidthXYPlot,
    YAxis
} from "react-vis";
 
//import { highlightInChart, selectInChart } from "./actions";
//import {modeConfig, themes} from './constants';

class Chart extends React.Component {

    _onHighlight(highlighted) {
        console.log("highlighted", highlighted)
        this.props.highlight(highlighted);
        //this.props.highlightInChart(this.props.config.modeId, this.props.config.layerId, this.props.config.dim, highlighted);
    }

    _onSelect(selected) {
        console.log("selected")
        // this.props.selectInChart(
        //     this.props.config.modeId, this.props.config.layerId, this.props.config.dim, 
        //     selected === this.props.layer.selected[this.props.config.dim] ? null : selected
        // );
    }

    render() {
        // if (!this.props.config.data) {
        //     return <div />;
        // }

        // var highlighted = null;
        // if  (this.props.layer.highlighted[this.props.config.dim] !== undefined) {
        //      highlighted = this.props.layer.highlighted[this.props.config.dim].x;
        // }

        // const data = this.props.config.data.map(d => {
        //     let color = "#125C77";
        //     if (d.x === this.props.layer.selected[this.props.config.dim]) {
        //         color = "#19CDD7";
        //     } else if (d.x === highlighted) {
        //         color = "#17B8BE";
        //     }
        //     return { ...d, color };
        // });


        var maxString = 12;
        //console.log("Chart49", this.props.config.data)
        //console.log("Chart50", Object.values(this.props.config.data))

        var arr = []

        Object.keys(this.props.config.data.status).forEach((key) => {
            arr.push({x:this.props.config.data.status[key]._id, y:this.props.config.data.status[key].count});
        })

        this.bottomPadding = maxString * 4 + 15;

        // const title = this.props.config.dim.charAt(0).toUpperCase() + this.props.config.dim.slice(1) + " - " + this.props.layer.name;

        return (
            <div className="ui raised card"  
                style={{ 
                    position: 'absolute',
                    bottom: '20px',
                    right:  '20px',
                    width: "400px",
                    // paddingBottom: "20px" ,
                    // paddingLeft: "20px" ,
                    backgroundColor: 'lightgrey',//`${themes[this.props.mapViewport.theme].statusCardColor}`,
                    zIndex: '100'
                    }}>
                <div className="content"> 
                    <h4>{this.props.config.title}</h4>
                    <p>{this.props.config.desc}</p>
                    <FlexibleWidthXYPlot
                        margin={{ bottom: this.bottomPadding, left: 60  }}
                        height={180}
                        xType="ordinal"
                        onMouseLeave={() => this._onHighlight(null)}>
                        <XAxis
                            tickLabelAngle={-45}
                            color = "darkgrey"
                            style={{ 
                                text: { fontSize: "9px" }, 
                                line: {stroke: "darkgrey"}, 
                                }}
                        />
                        <YAxis style={{ 
                                line: {stroke: "darkgrey"}, 
                                }} />
                        <VerticalBarSeries
                            colorType="literal"
                            data={arr}
                            onValueMouseOver={d => this._onHighlight(d.x)}
                            onValueClick={d => this._onSelect(d.x)}
                        />
                    </FlexibleWidthXYPlot>
                </div>
            </div>
        );
    }
}


const mapStateToProps = (state, ownProps) => {
    return {
        state
    };
};

export default connect(
    mapStateToProps,
    {   }
)(Chart);
