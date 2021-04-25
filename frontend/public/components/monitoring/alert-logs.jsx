import * as _ from 'lodash-es';
import * as React from 'react';
import { coFetch } from '@console/internal/co-fetch';
import { connect} from 'react-redux';
import {
  Form,
  FormGroup,
  TextInput,
  Checkbox,
  Popover,
  ActionGroup,
  Button, 
  TimePicker 
} from '@patternfly/react-core';
import {
  ContainerDropdown,
  getQueryArgument,
  LOG_SOURCE_RESTARTING,
  LOG_SOURCE_RUNNING,
  LOG_SOURCE_TERMINATED,
  LOG_SOURCE_WAITING,
  setQueryArgument,
} from '../utils';
import {AlertResourceLog} from '../utils/alert-resource-log';
import { RootState } from '../../redux';
import {  getURLSearchParams } from '../utils/link';
import {AlertsDetailsPageProps} from './alerting'
import { withFallback } from 'packages/console-shared/src/components/error/error-boundary';
import {
  AlertResource,
  alertsToProps,
  alertURL,
  getAlertsAndRules,
  labelsToParams,
  RuleResource,
  rulesToProps,
  silenceParamToProps,
  SilenceResource,
  silencesToProps,
} from '../monitoring/utils';
import { newJSONDocument } from 'yaml-language-server/out/server/src/languageservice/parser/jsonParser07';
const containersToStatuses = ({ status }, containers) => {
  return _.reduce(
    containers,
    (accumulator, { name }, order) => {
      const containerStatus =
        _.find(status.containerStatuses, { name }) ||
        _.find(status.initContainerStatuses, { name });
      if (containerStatus) {
        return {
          ...accumulator,
          [name]: { ...containerStatus, order },
        };
      }
      return accumulator;
    },
    {},
  );
};

const containerToLogSourceStatus = (container) => {
  if (!container) {
    return LOG_SOURCE_WAITING;
  }
  const { state, lastState } = container;
  if (state.waiting && !_.isEmpty(lastState)) {
    return LOG_SOURCE_RESTARTING;
  }
  if (state.waiting) {
    return LOG_SOURCE_WAITING;
  }
  if (state.terminated) {
    return LOG_SOURCE_TERMINATED;
  }
  return LOG_SOURCE_RUNNING;
};

 class AlertLogs extends React.Component {
  constructor(props) {
    super(props);
    this._selectContainer = this._selectContainer.bind(this);
    this.state = {
      containers: {},
      currentKey: getQueryArgument('container') || '',
      initContainers: {},
      timeInput: "",
      alertLogs: '',
    };
  }

  handleTimeInputChange = value => {
    //console.log(value);
    this.setState({timeInput: value});
  };

   /*handleTextInputChange = value1 => {
    this.setState({val: value1});
  };*/

  convertToMilliSeconds = (hours, minutes) => {
    let timeInMinutes= (hours*60)+minutes;
    //console.log(timeInMinutes);
    let timeInMilliSeconds= timeInMinutes*60*1000;
    //console.log(timeInMilliSeconds);
    return timeInMilliSeconds;
  }

  getStartTime = () => {
    const {timeInput}= this.state;
    const {activeAt}= this.props.alert;
    let splittedTime= timeInput.split("h",2);
    //console.log(splittedTime);
    //let iso1=this.props.alert.activeAt;
    let alertDate= new Date(activeAt);
    //console.log(activeAt);
    let alertTimeMilliSec= alertDate.getTime();
    //console.log(alertTimeMilliSec);
    let startTime=alertTimeMilliSec + this.convertToMilliSeconds(parseInt(splittedTime[0]),parseInt(splittedTime[1]));
    let startDate=new Date(startTime);
    //console.log(startDate);
    return startDate.toISOString();
  }

    

  handleSubmit = async () => {
    /*connect(alertStateToProps)((props) => {
    const { alert, loaded, loadError, namespace, rule, silencesLoaded, match } = props;*/
    //const aaa= this.alertStateToProps(RootState, this.props.match);
    //console.log(this.props);
    const {pod, namespace }= this.props.alert?.labels;
    const {activeAt}= this.props.alert;
    //console.log(this.props.alert);
    console.log(pod);
    console.log(namespace);

    const startTimeIso = this.getStartTime();
    
    //console.log(startTimeIso);

    //const url = `http://log-exploration-api-route-openshift-logging.apps.abhansal-cluster-april14.devcluster.openshift.com/logs/multifilter/${name}/${namespace}/${startTimeIso}/${alert.activeAt}`;
    //const url = `http://log-exploration-api-route-openshift-logging.apps.abhansal-cluster-april14.devcluster.openshift.com/logs/multifilter/${name}/${namespace}/${alert.activeAt}/${startTimeIso}`;
    //const url = `http://log-exploration-api-route-openshift-logging.apps.abhansal-cluster-april14.devcluster.openshift.com/logs/indexfilter/infra-000001`;
    //const url = `http://log-exploration-api-route-openshift-logging.apps.abhansal-cluster-april14.devcluster.openshift.com/logs/podnamefilter/${name}`;
    //const url = `http://log-exploration-api-route-openshift-logging.apps.abhansal-cluster-april14.devcluster.openshift.com/logs/timefilter/${startTimeIso}/${alert.activeAt}`;
    const url = `http://log-exploration-api-route-openshift-logging.apps.sangupta-eghgj.devcluster.openshift.com/logs/filter?`;
    //const url= 'https://jsonplaceholder.typicode.com/todos/1';
    //const url= 'http://log-exploration-api-route-openshift-logging.apps.emishra-header-test.devcluster.openshift.com/logs/filter?namespace=openshift-kube-scheduler&maxlogs=1';
    //console.log(url);
    const postData = {
        namespace: 'openshift-kube-scheduler',
        maxlogs: 1,
      };
      //console.log(url);
      try {
        const response = await coFetch(url+ new URLSearchParams({
          namespace: namespace,
          pod: pod,
          maxlogs: 2,
      }));
        //const response = await fetch(url);
        let responseData;
        await response.json().then((json) => {
          responseData = json;
          //console.log(JSON.stringify(JSON.parse(json.Logs)));
          //console.log(json.Logs[0]);
          console.log(JSON.parse(json.Logs[0])['_source'].message);
          json.Logs.forEach(element => {
            const rt=JSON.parse(element)['_source']['message'];
            console.log(rt);
          });
          this.setState({alertLogs: json.Logs[0].source.message});
        });
        //console.log(responseData);
        //sc(responseData);
        return responseData;
      } catch (err) {
        // eslint-disable-next-line no-console
        //console.log(err);
        throw err;
      }
    //})
  };
  static getDerivedStateFromProps({ obj: build }, { currentKey }) {
    const newState = {};
    const containers = _.get(build, 'spec.containers', []);
    const initContainers = _.get(build, 'spec.initContainers', []);
    newState.containers = containersToStatuses(build, containers);
    newState.initContainers = containersToStatuses(build, initContainers);
    if (!currentKey) {
      const firstContainer = _.find(newState.containers, { order: 0 });
      newState.currentKey = firstContainer ? firstContainer.name : '';
    }
    return newState;
  }
  _selectContainer(name) {
    this.setState({ currentKey: name }, () => {
      setQueryArgument('container', this.state.currentKey);
    });
  }
  render() {
    const { containers, currentKey, initContainers, timeInput } = this.state;
    const currentContainer = _.get(containers, currentKey) || _.get(initContainers, currentKey);
    const currentContainerStatus = containerToLogSourceStatus(currentContainer);
    const containerDropdown = (
      <ContainerDropdown
        currentKey={currentKey}
        containers={containers}
        initContainers={initContainers}
        onChange={this._selectContainer}
      />
    );
    return (
      <>
      {this.props.alert?.labels?.namespace && (
      <>
      <div className="row">
      <div className="col-sm-3">
      <TimePicker is24Hour delimiter="h" placeholder="" onChange={this.handleTimeInputChange}/>
    {/*<TextInput
            isRequired
            type="text"
            id="simple-form-name"
            name="simple-form-name"
            aria-describedby="simple-form-name-helper"
            value={this.state.val}
            onChange={this.handleTextInputChange}
    />*/}
          </div>
          <Button variant="primary" onClick={this.handleSubmit} isDisabled={timeInput=== ''}>Submit form</Button>
          </div>
      <div className="co-m-pane__body">
          <AlertResourceLog
            containerName={currentContainer ? currentContainer.name : ''}
            dropdown={containerDropdown}
            resource={this.props.obj}
            resourceStatus={currentContainerStatus}
            alertLogs={this.state.alertLogs}
          />
      </div>
      </>
      )}
      </>
    );
  }
}

const alertStateToProps = (state, props) => {
  //console.log(state.UI.getIn(['monitoring']));
  //console.log(state.FLAGS.get('OPENSHIFT'));
  //console.log(state);
  const {match}= props;
  //console.log(match);
  const perspective = _.has(match.params, 'ns') ? 'dev' : 'admin';

  const namespace = match.params?.ns;
  const { data, loaded, loadError } = alertsToProps(state, perspective);
  //const { loaded: silencesLoaded }: Silences = silencesToProps(state);
  const ruleID = match?.params?.ruleID;
  const labels = getURLSearchParams();
  const alerts = _.filter(data, (a) => a.rule.id === ruleID);
  const rule = alerts?.[0]?.rule;
  const alert = _.find(alerts, (a) => _.isEqual(a.labels, labels));
  return {
    alert,
    loaded,
    loadError,
    //namespace,
    rule,
    //silencesLoaded,
  };
};
export default connect(alertStateToProps)(AlertLogs);