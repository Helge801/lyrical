import React, { Component } from 'react';
import LineStack from './lineStack.js';
import {lyricState,reloader, tabReloader} from '../../core/manager.js';

import "./editBox.css";

class EditBox extends Component {

  constructor(props){
    super(props);
    this.state = {
      value: lyricState[lyricState.tab],
      tab: lyricState.tab,
      content: (lyricState[lyricState.tab].match(/\w/) && true)
    };
  }

  componentDidMount(){
    this.sub = reloader.subscribe(val => {
      console.log(val);
      if(val){
        if(val.save) this.saveLyrics();
        this.state.tab = val.tab;
        this.onChange({target:{value: lyricState[lyricState.tab]}})
      }
    });
  }

  saveLyrics(){
    console.log(`saving: ${this.state.value}\nto: ${this.state.tab}`)
    lyricState[this.state.tab] = this.state.value;
    console.log("lyricState: ", lyricState)
  }

  componentWillUnmount(){
    this.saveLyrics();
    this.sub.unsubscribe();
  }

  onChange(event){
    this.setState({
      value: event.target.value
    });
    const content = (event.target.value.match(/\w/) && true);
    if(content != this.state.content ){
      this.setState({content})
      const tv = tabReloader.value;
      tv[lyricState.tab] = content;
      tabReloader.next(tv);
    }
  }

  render() {
    return (
      <div className="common-edit-box-wrapper dark">
        <textarea
          className="common-edit-box-textarea dark"
          value={this.state.value}
          onChange={this.onChange.bind(this)}
          style={{height: `${this.state.value.toString().split(/\n/).length * 20 + 20}px`}}
        />
            <LineStack tab={this.state.tab} lyrics={this.state.value.toString()} />
          </div>
    )
  }
}

export default EditBox;
