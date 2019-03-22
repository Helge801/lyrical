import React, { Component } from 'react';
import Block from './block.js';


class LineStack extends Component {


  renderStack(){
    var lyrics = this.props.lyrics.split(/\n/);

    var accum = 0;
    var blocks = [];
    var blockNumber = 1;

    lyrics.forEach((l,i) => {
      if(l.match(/\w+/)){
        accum += 1; return;
      }

      if(accum > 0){
        blocks.push(<Block blockNumber={blockNumber} tab={this.props.tab} key={i} index={i} rows={accum} />);
        accum = 0;
        blockNumber++;
      }

    });

    if(accum > 0){
      blocks.push(<Block blockNumber={blockNumber} tab={this.props.tab} key={lyrics.length} index={lyrics.length} rows={accum} />);
      accum = 0;
    }

    return blocks;
  }

  render(){
    if(this.props.lyrics) 
      return (
        <div className="stack-wrapper" >
          {this.renderStack()}
        </div>
      );
    return null;
  }

}

export default LineStack;
