import React, {Component} from 'react';

class FunctionButton extends Component {

  render(){
    const { title, active, color } = this.props;
    const style = {};
    if(active && color) style.backgroundColor = color;

    return (
      <div
        className={`function-button-wrapper ${active ? "active" : ''}`}
        onClick={this.props.onClick}
        style={style}
      >
        {title}
      </div >
    );
  }
} 

export default FunctionButton;
