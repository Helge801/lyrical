import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import { Observable } from 'rxjs';
import Header from './header.js';
import '../../stylesheets/main.css';
import EditBox from '../common/editBox';
import {loader} from './loader.js';

class Popup extends React.Component {
  constructor(props) {
    super(props);
    this.state = props.info.value;
  }

  componentDidMount() {
    this.info = this.props.info.subscribe(info => {
      if (info) {
        this.setState(info);
      }
    });
  }

  componentWillUnmount() {
    if (this.info) {
      this.info.unsubscribe();
    }
  }

  render() {
    if(!this.state) return null;
    var scrape = (this.state.lyrics && this.state.lyrics.match(/\w/));
    return (
      <div id="mainWrapper" >
        <Header scrape={scrape} lyrics={this.state.lyrics} />
        <EditBox/>
        {loader}
      </div>
    );
  }
}

Popup.propTypes = {
  info: PropTypes.instanceOf(Observable).isRequired,
};

export default Popup
