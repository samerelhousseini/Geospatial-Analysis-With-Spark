import React from "react";
import { connect } from "react-redux";
import _ from 'lodash';


import {
    VerticalBarSeries,
    XAxis,
    FlexibleWidthXYPlot,
    YAxis
} from "react-vis";
 


class Chart extends React.Component {

    _onHighlight(highlighted) {
        console.log("highlighted", highlighted)
        this.props.highlight(highlighted);
    }

    _onSelect(selected) {
        console.log("selected")

    }

    render() {

        var maxString = 12;
        var arr = []

        console.log(this.props.config )
        if (_.isEmpty(this.props.config.data) === true) return (<div/>);
        console.log(this.props.config.data.status)
        Object.keys(this.props.config.data.status).forEach((key) => {
            arr.push({x:this.props.config.data.status[key]._id, y:this.props.config.data.status[key].count});
        })

        this.bottomPadding = maxString * 4 + 15;

        return (
            <div className="ui raised card"  
                style={{ 
                    position: 'absolute',
                    bottom: '20px',
                    right:  '20px',
                    width: "400px",
                    backgroundColor: 'lightgrey',
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
