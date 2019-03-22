import React, {Component} from 'react';
import {lyricState,reloader,tabReloader} from '../../core/manager.js';
import {red,grey,dark} from '../../assets/colors.js';


class TabButton extends Component {

  constructor(props){
    super(props);
    this.state = {
      selected: lyricState.tab === props.tab ? true : false,
      active: evalLyrics(props.tab)
    }
  }

  componentDidMount(){
    this.props.adoptChild(this);
    this.sub = tabReloader.subscribe(val => {
      if(val){
        this.setState({active: val[this.props.tab]});
      }
    });
  }

  componentWillUnmount(){
    this.props.disownChild(this);
    this.sub.unsubscribe();
  }

  onCLick(){
    this.props.selectChild(this);
  }

  select(){
    if(!this.state.selected){
      this.setState({selected: true});
      lyricState.tab = this.props.tab;
      reloader.next({tab: this.props.tab, save: true});
    }
  }

  deselect(){
    if(this.state.selected)
      this.setState({selected: false});
  }


  render(){
    const { tab } = this.props;
    return (
      <div
        className={`tab-button-wrapper ${this.state.active ? "active" : ""} ${this.state.selected ? "selected" : ""}`}
        onClick={this.onCLick.bind(this)}
      >
          {tab}
      </div >
    );
  }

}

function evalLyrics(key){
  return lyricState[key].match(/\w/);
}
export default TabButton;
