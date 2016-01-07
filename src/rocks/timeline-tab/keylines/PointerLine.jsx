import React, { PropTypes } from 'react'
import {observer} from 'mobservable-react'
import {createEaser} from 'animachine-connect'
import {convertTimeToPosition} from '../utils'

@observer
export default class Ease extends React.Component {
  render () {
    const {timeline, height} = this.props
    const position = convertTimeToPosition({
      timeline,
      time: timeline.currentTime
    })
    const style = {
      position: 'absolute',
      transform: `translate(${position}px)`,
      left: 0,
      top: 0,
      width: 1,
      height,
      backgroundColor: '#FF4136',
    }
    return <div style={style}/>
  }
}