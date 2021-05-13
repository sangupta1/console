import * as _ from 'lodash-es';
import * as React from 'react';
import { coFetch } from '@console/internal/co-fetch';
import { connect } from 'react-redux';

import { ContainerDropdown, getQueryArgument, ResourceLog, setQueryArgument } from '../utils';

import { Alert, Rule } from './types';

import {
  Button, 
  TimePicker,
  TextInput,
} from '@patternfly/react-core';

import {
  K8sResourceCommon,
  Selector,
  MatchLabels,
} from '@console/dynamic-plugin-sdk/src/extensions/console-types';

import {
  alertStateToProps,
  containerToLogSourceStatus,
  containersToStatuses,
} from './alert-logs-utils';

import {AlertResourceLog} from '../utils/alert-resource-log';

import { useK8sGet } from '../utils/k8s-get-hook';
import { InfrastructureModel } from '../../models';
import { K8sResourceKind, K8sKind } from '../../module/k8s';

const AlertLogs = (props: AlertLogsProps) => {
  const [containers, setContainers] = React.useState({});
  const [currentKey, setCurrentKey] = React.useState(getQueryArgument('container') || '');
  const [initContainers, setInitContainers] = React.useState({});
  const [timeInput, setTimeInput] = React.useState("");
  const [maxLogsInput, setMaxLogsInput] = React.useState("");
  const [alertLogs, setAlertLogs] = React.useState("");
  
  
  //console.log(infrastructure);
    const [infrastructure, infrastructureLoaded, infrastructureError] = useK8sGet<K8sResourceKind>(
      InfrastructureModel,
      'cluster',
    );

   //console.log(infrastructure);

  const buildObj = React.useRef(props.obj);

  React.useEffect(
    () => {

      const asyncFn = async ()=> {
        constructApiUrl();
        const {pod, namespace }= props.alert?.labels;
      //console.log("component did mount");
      const url= 'http://log-exploration-api-route-openshift-logging.apps.emishra-may11.devcluster.openshift.com/logs/filter?';
    constructApiUrl();
      //console.log(url);
      try {
        const response = await coFetch(url + new URLSearchParams({
          namespace: namespace,
          pod: pod,
          //startTime: activeAt,
          //endTime: startTimeIso,
      }));
        //const response = await fetch(url);
        let responseData;
        let messageArray=[];
        await response.json().then((json) => {
          responseData = json;
          //console.log(JSON.stringify(JSON.parse(json.Logs)));
          //console.log(json.Logs[0]);
          //console.log(JSON.parse(json.Logs[0])['_source'].message);
          json.Logs.forEach(element => {
            const rt=JSON.parse(element)['_source']['message'];
            //console.log(rt);
            messageArray.push(rt);
          });
          setAlertLogs(messageArray);
        });
        //console.log(responseData);
        //sc(responseData);
        return responseData;
      } catch (err) {
        // eslint-disable-next-line no-console
        //console.log(err);
        throw err;
      }
    }
    asyncFn();
    },
    [],
  );

  React.useEffect(
    () => {
      const build = props.obj;
      const currentContainers = build?.spec?.containers ?? [];
      const currentInitContainers = build?.spec?.initContainers ?? [];
      if (!currentKey) {
        const firstContainer = _.find(containersToStatuses(build, currentContainers), { order: 0 });
        setCurrentKey(firstContainer ? firstContainer.name : '');
      }
      setContainers(containersToStatuses(build, currentContainers));
      setInitContainers(containersToStatuses(build, currentInitContainers));
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [buildObj?.current],
  );

  const selectContainer = (name) => {
    setCurrentKey(name);
    setQueryArgument('container', currentKey);
  };

  const handleTimeInputChange = value => {
    //console.log(value);
    setTimeInput(value);
  };

   const handleTextInputChange = value1 => {
    setMaxLogsInput(value1);
  };

  const convertToMilliSeconds = (hours, minutes) => {
    let timeInMinutes= (hours*60)+minutes;
    //console.log(timeInMinutes);
    let timeInMilliSeconds= timeInMinutes*60*1000;
    //console.log(timeInMilliSeconds);
    return timeInMilliSeconds;
  }

  const getStartTime = () => {
    const {activeAt}= props.alert;
    let splittedTime= timeInput.split("h",2);
    //console.log(splittedTime);
    //let iso1=this.props.alert.activeAt;
    let alertDate= new Date(activeAt);
    //console.log(activeAt);
    let alertTimeMilliSec= alertDate.getTime();
    //console.log(alertTimeMilliSec);
    let startTime=alertTimeMilliSec + convertToMilliSeconds(parseInt(splittedTime[0]),parseInt(splittedTime[1]));
    let startDate=new Date(startTime);
    //console.log(startDate);
    return startDate.toISOString();
  }

  const constructApiUrl = () => {
    /*const [infrastructure, infrastructureLoaded, infrastructureError] = useK8sGet<K8sResourceKind>(
      InfrastructureModel,
      'cluster',
    );*/
    const apiServerURL= infrastructure?.status?.apiServerURL;
    console.log(apiServerURL);
    //setInfra(infrastructure?.status.apiServerURL);
    //console.log(queryParams);
  }

  const handleSubmit = async () => {
    /*connect(alertStateToProps)((props) => {
    const { alert, loaded, loadError, namespace, rule, silencesLoaded, match } = props;*/
    //const aaa= this.alertStateToProps(RootState, this.props.match);
    //console.log(this.props);
    const {pod, namespace }= props.alert?.labels;
    const {activeAt}= props.alert;
    //console.log(this.props.alert);
    console.log(pod);
    console.log(namespace);

    const startTimeIso = getStartTime();
    
    //console.log(maxLogsInput);

    //const url = `http://log-exploration-api-route-openshift-logging.apps.abhansal-cluster-april14.devcluster.openshift.com/logs/multifilter/${name}/${namespace}/${startTimeIso}/${alert.activeAt}`;
    //const url = `http://log-exploration-api-route-openshift-logging.apps.abhansal-cluster-april14.devcluster.openshift.com/logs/multifilter/${name}/${namespace}/${alert.activeAt}/${startTimeIso}`;
    //const url = `http://log-exploration-api-route-openshift-logging.apps.abhansal-cluster-april14.devcluster.openshift.com/logs/indexfilter/infra-000001`;
    //const url = `http://log-exploration-api-route-openshift-logging.apps.abhansal-cluster-april14.devcluster.openshift.com/logs/podnamefilter/${name}`;
    //const url = `http://log-exploration-api-route-openshift-logging.apps.abhansal-cluster-april14.devcluster.openshift.com/logs/timefilter/${startTimeIso}/${alert.activeAt}`;
    //const url = `http://log-exploration-api-route-openshift-logging.apps.sangupta-eghgj.devcluster.openshift.com/logs/filter?`;
    //const url= 'http://log-exploration-api-route-openshift-logging.apps.sangupta-may9qfr.devcluster.openshift.com/logs/filter?'
    //const url= 'http://log-exploration-api-route-openshift-logging.apps.emishra-header-test.devcluster.openshift.com/logs/filter?namespace=openshift-kube-scheduler&maxlogs=1';
    //console.log(url);
    const url= 'http://log-exploration-api-route-openshift-logging.apps.emishra-may11.devcluster.openshift.com/logs/filter?';
    constructApiUrl();
      //console.log(url);
      try {
        const response = await coFetch(url + new URLSearchParams({
          namespace: namespace,
          pod: pod,
          startTime: activeAt,
          endTime: startTimeIso,
          maxlogs: maxLogsInput,
      }));
        //const response = await fetch(url);
        let responseData;
        let messageArray=[];
        await response.json().then((json) => {
          responseData = json;
          //console.log(JSON.stringify(JSON.parse(json.Logs)));
          //console.log(json.Logs[0]);
          //console.log(JSON.parse(json.Logs[0])['_source'].message);
          json.Logs.forEach(element => {
            const rt=JSON.parse(element)['_source']['message'];
            //console.log(rt);
            messageArray.push(rt);
          });
          setAlertLogs(messageArray);
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

  const currentContainer = containers?.[currentKey] ?? initContainers?.[currentKey];
  const currentContainerStatus = containerToLogSourceStatus(currentContainer);

  const containerDropdown = (
    <ContainerDropdown
      currentKey={currentKey}
      containers={containers}
      initContainers={initContainers}
      onChange={selectContainer}
    />
  );

  return (
    <>
      <div className="co-m-pane__body">
        {props.alert?.labels?.namespace ? (
          <>
          <div className="row">
          <div className="col-sm-3">
          <TimePicker is24Hour delimiter="h" placeholder="" onChange={handleTimeInputChange}/>
        <TextInput
                isRequired
                type="text"
                id="simple-form-name"
                name="simple-form-name"
                aria-describedby="simple-form-name-helper"
                value={maxLogsInput}
                onChange={handleTextInputChange}
        />
              </div>
              <Button variant="primary" onClick={handleSubmit} isDisabled={timeInput=== ''}>Submit form123</Button>
              </div>
          <div className="co-m-pane__body">
              <AlertResourceLog
                containerName={currentContainer ? currentContainer.name : ''}
                dropdown={containerDropdown}
                resource={props.obj}
                resourceStatus={currentContainerStatus}
                alertLogs={alertLogs}
              />
          </div>
          </>
        ) : (
          <div>No logs for this Alert</div>
        )}
      </div>
    </>
  );
};

export default connect(alertStateToProps)(AlertLogs);

export type AlertLogsProps = {
  alert: Alert;
  obj: ResourceKindAlert;
  params?: any;
  rule: Rule;
  match?: any;
  customData?: any;
  filters?: any;
  loadError?: string;
  loaded: boolean;
};

export type ResourceKindAlert = K8sResourceCommon & {
  spec?: {
    selector?: Selector | MatchLabels;
    [key: string]: any;
  };
  status: { [key: string]: any };
  data?: { [key: string]: any };
};
