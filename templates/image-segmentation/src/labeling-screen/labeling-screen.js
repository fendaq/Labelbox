import React, { Component } from 'react';
import ClassificationForm from './classification-options';
import Card, { CardActions, CardContent } from 'material-ui/Card';
import Button from 'material-ui/Button';
import { SegmentImage } from './segment-image';
import { rectangleIcon, polygonIcon } from './icons';

export class LabelingScreen extends Component {
  state = {
    segmentation: [],
    customization: {
      instructions: "Outline the car using the polygon tool",
      showPolygonTool: true,
      showRectangleTool: true,
      allowMultipleAnnotations: false
    }
  };

  customizationSubscription;

  componentWillMount(){
    this.customizationSubscription = window.Labelbox.getTemplateCustomization()
      .subscribe((customization) => {
        this.setState({...this.state, customization});
      });
  }

  componentWillUnmount(){
    this.customizationSubscription.unsubscribe();
  }

  render() {
    if (!this.props.imageUrl) {
      return (<div>Loading...</div>);
    }

    const onSubmit = (label) => {
      this.props.onSubmit(JSON.stringify(this.state.segmentation));
      this.setState({...this.state, segmentation: []});
    };

    const {showPolygonTool, showRectangleTool, allowMultipleAnnotations, instructions} = this.state.customization;

    const removeTools = this.state.segmentation.length > 0 && !allowMultipleAnnotations;

    return (
      <Card>
        <CardContent>
          <SegmentImage
            imageUrl={this.props.imageUrl}
            showPolygonTool={removeTools ? false : showPolygonTool}
            showRectangleTool={removeTools ? false : showRectangleTool}
            style={{width: '100%'}}
            updateLabel={(segmentation) => this.setState({...this.state, segmentation})}
          />
          <div className="form-controls">
            <div>{instructions}</div>
          </div>
        </CardContent>
        <CardActions style={{justifyContent: 'flex-end'}}>
          <Button
            raised={true}
            color="primary"
            disabled={this.state.segmentation.length === 0}
            onClick={onSubmit}
          >Submit</Button>
        </CardActions>
      </Card>
    );
  }
}
