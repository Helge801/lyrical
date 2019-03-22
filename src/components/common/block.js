import React, { Component } from 'react';

class Block extends Component {
  


  render(){
    const height = this.props.rows * 20 + 10;
    const top = ((this.props.index * 20) + 15) - height;
    const style = {
      top: `${top}px`,
      height: `${height}px`
    }

    return (
      <div className="block-wrapper" style={style} >
        <div className="block-text-shade"/>
        <div className="block-end-cap">
          <div className="block-cap-info" style={{height: `${height}px`}}>
              {`Slide: ${this.props.blockNumber}`}
          </div>
        </div>


      </div>
    )
  }
}

export default Block;

