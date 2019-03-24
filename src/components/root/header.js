import React, {Component} from 'react';
import logo from '../../assets/lyrical-logo.png';
import TabButton from '../common/tabButton.js';
import FunctionButton from '../common/functionButton.js';
import {orange,red,purple} from '../../assets/colors.js';
import {tabReloader,reloader,lyricState,exportFile} from '../../core/manager.js';

const children = [];

class Header extends Component {

  constructor(props){
    super(props);
    this.state = {
      content: this.checkForContent()
    }
  }

  componentDidMount(){
    this.sub = tabReloader.subscribe(val => {
      this.setState({content: this.checkForContent()});
    });
  }

  componentWillUnmount(){
    this.sub.unsubscribe();
  }

  checkForContent(){
      var found = false;
      var keys = Object.keys(tabReloader.value);
      for(var i = 0; i < keys.length; i++){
        if(tabReloader.value[keys[i]])
          found = true;
      }
    return found;
  }

  adoptChild(child){
    if(child)
      children.push(child);
  }

  disownChild(child){
    if(child)
      for(var i = 0; i < children.length; i++){
        if(child === children[i]){
          children.splice(i,1);
          return;
        }
      }
  }

  selectChild(child){
    if(child){
      for(var i = 0; i < children.length; i++){
        if(child === children[i]){
          children[i].select();
        }
        else
          children[i].deselect();
      }
    }
  }

  renderTabs(){
    const tabs = [];
    for(var i = 1; i <= 5; i++){
      tabs.push(<TabButton
        key={i}
        index={i}
        disownChild={this.disownChild.bind(this)}
        adoptChild={this.adoptChild.bind(this)}
        selectChild={this.selectChild.bind(this)}
        tab={i.toString()}
      />);
    }
    return tabs;
  }

  exportFile(){
    const val = reloader.value;
    val.save = true;
    reloader.next(val);
    exportFile();
  }

  scrapePage(){
    lyricState[lyricState.tab] = this.props.lyrics;
    reloader.next({tab: lyricState.tab, save: false});
  }

  clearAll(){
    const tabs = tabReloader.value;
    const keys = Object.keys(tabs);
    for(var i = 0; i < keys.length; i++){
      lyricState[keys[i]] = "";
      tabs[keys[i]] = null;
    }
    tabReloader.next(tabs);
    reloader.next({tab: "1",save: false});
  }

  render(){

    return (
      <div className="dark" id="header-wrapper">
        <img id="header-logo" src={`../dist/${logo}`} alt="Logo" />
        <div className="tabs-wrapper">
          {this.renderTabs()}
        </div>
          <div className="functions-wrapper">
          <FunctionButton
            active={this.state.content}
            title={"Clear\nAll"}
            color={red}
            onClick={this.clearAll}
          />
          <div className="stacker-function-buttons">
            <FunctionButton 
              active={this.props.scrape}
              title="Scrape"
              onClick={this.scrapePage.bind(this)}
            />
            <FunctionButton
              active={this.state.content}
              title="Export"
              onClick={this.exportFile.bind(this)}
            />
          </div>

        </div>
      </div>
    );
  }

}

export default Header;
