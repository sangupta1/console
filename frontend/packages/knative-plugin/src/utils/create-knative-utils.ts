import * as _ from 'lodash';
import { K8sResourceKind, ImagePullPolicy } from '@console/internal/module/k8s';
import { getAppLabels, mergeData } from '@console/dev-console/src/utils/resource-label-utils';
import { getProbesData } from '@console/dev-console/src/components/health-checks/create-health-checks-probe-utils';
import {
  DeployImageFormData,
  FileUploadData,
  GitImportFormData,
  UploadJarFormData,
} from '@console/dev-console/src/components/import/import-types';
import { ServiceModel } from '../models';

export const getKnativeServiceDepResource = (
  formData: GitImportFormData | DeployImageFormData | UploadJarFormData,
  imageStreamUrl: string,
  imageStreamName?: string,
  imageStreamTag?: string,
  imageNamespace?: string,
  annotations?: { [name: string]: string },
  originalKnativeService?: K8sResourceKind,
  fileUpload?: FileUploadData,
): K8sResourceKind => {
  const {
    name,
    application: { name: applicationName },
    project: { name: namespace },
    runtimeIcon,
    serverless: { scaling },
    limits,
    route: { unknownTargetPort, create, defaultUnknownPort },
    labels,
    image: { tag: imageTag },
    deployment: {
      env,
      triggers: { image: imagePolicy },
    },
    healthChecks,
    resources,
  } = formData;
  const contTargetPort = parseInt(unknownTargetPort, 10) || defaultUnknownPort;
  const imgPullPolicy = imagePolicy ? ImagePullPolicy.Always : ImagePullPolicy.IfNotPresent;
  const {
    concurrencylimit,
    concurrencytarget,
    minpods,
    maxpods,
    autoscale: { autoscalewindow, autoscalewindowUnit },
    concurrencyutilization,
  } = scaling;
  const {
    cpu: {
      request: cpuRequest,
      requestUnit: cpuRequestUnit,
      limit: cpuLimit,
      limitUnit: cpuLimitUnit,
    },
    memory: {
      request: memoryRequest,
      requestUnit: memoryRequestUnit,
      limit: memoryLimit,
      limitUnit: memoryLimitUnit,
    },
  } = limits;
  const defaultLabel = getAppLabels({
    name,
    applicationName,
    imageStreamName,
    selectedTag: imageStreamTag || imageTag,
    namespace: imageNamespace,
    runtimeIcon,
  });
  delete defaultLabel.app;
  const newKnativeDeployResource: K8sResourceKind = {
    kind: ServiceModel.kind,
    apiVersion: `${ServiceModel.apiGroup}/${ServiceModel.apiVersion}`,
    metadata: {
      name,
      namespace,
      labels: {
        ...defaultLabel,
        ...labels,
        ...(!create && { 'serving.knative.dev/visibility': `cluster-local` }),
      },
      annotations: fileUpload ? { ...annotations, isFromJarUpload: 'true' } : annotations,
    },
    spec: {
      template: {
        metadata: {
          labels: {
            ...defaultLabel,
            ...labels,
          },
          annotations: {
            ...(concurrencytarget && {
              'autoscaling.knative.dev/target': `${concurrencytarget}`,
            }),
            ...(minpods && { 'autoscaling.knative.dev/minScale': `${minpods}` }),
            ...(maxpods && { 'autoscaling.knative.dev/maxScale': `${maxpods}` }),
            ...(autoscalewindow && {
              'autoscaling.knative.dev/window': `${autoscalewindow}${autoscalewindowUnit}`,
            }),
            ...(concurrencyutilization && {
              'autoscaling.knative.dev/targetUtilizationPercentage': `${concurrencyutilization}`,
            }),
            ...annotations,
          },
        },
        spec: {
          ...(concurrencylimit && { containerConcurrency: concurrencylimit }),
          containers: [
            {
              name,
              image: `${imageStreamUrl}`,
              ...(contTargetPort && {
                ports: [
                  {
                    containerPort: contTargetPort,
                  },
                ],
              }),
              imagePullPolicy: imgPullPolicy,
              env: fileUpload?.javaArgs
                ? [...env, { name: 'JAVA_ARGS', value: fileUpload.javaArgs }]
                : env,
              resources: {
                ...((cpuLimit || memoryLimit) && {
                  limits: {
                    ...(cpuLimit && { cpu: `${cpuLimit}${cpuLimitUnit}` }),
                    ...(memoryLimit && { memory: `${memoryLimit}${memoryLimitUnit}` }),
                  },
                }),
                ...((cpuRequest || memoryRequest) && {
                  requests: {
                    ...(cpuRequest && { cpu: `${cpuRequest}${cpuRequestUnit}` }),
                    ...(memoryRequest && { memory: `${memoryRequest}${memoryRequestUnit}` }),
                  },
                }),
              },
              ...getProbesData(healthChecks, resources),
            },
          ],
        },
      },
    },
  };
  let knativeServiceUpdated = {};
  if (!_.isEmpty(originalKnativeService)) {
    knativeServiceUpdated = _.omit(originalKnativeService, [
      'status',
      'spec.template.metadata.name',
    ]);
  }
  const knativeDeployResource = mergeData(knativeServiceUpdated || {}, newKnativeDeployResource);

  return knativeDeployResource;
};
