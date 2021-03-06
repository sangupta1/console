import { chart_color_green_400 as tektonGroupColor } from '@patternfly/react-tokens/dist/js/chart_color_green_400';
import { K8sKind } from '@console/internal/module/k8s';
import { BadgeType } from '@console/shared/src/components/badges/badge-factory';

const color = tektonGroupColor.value;

export const PipelineModel: K8sKind = {
  apiGroup: 'tekton.dev',
  apiVersion: 'v1beta1',
  label: 'Pipeline',
  labelKey: 'pipelines-plugin~Pipeline',
  labelPluralKey: 'pipelines-plugin~Pipelines',
  plural: 'pipelines',
  abbr: 'PL',
  namespaced: true,
  kind: 'Pipeline',
  id: 'pipeline',
  labelPlural: 'Pipelines',
  crd: true,
  color,
};

export const PipelineRunModel: K8sKind = {
  apiGroup: 'tekton.dev',
  apiVersion: 'v1beta1',
  label: 'Pipeline Run',
  labelKey: 'pipelines-plugin~PipelineRun',
  labelPluralKey: 'pipelines-plugin~PipelineRuns',
  plural: 'pipelineruns',
  abbr: 'PLR',
  namespaced: true,
  kind: 'PipelineRun',
  id: 'pipelinerun',
  labelPlural: 'Pipeline Runs',
  crd: true,
  color,
};

export const TaskModel: K8sKind = {
  apiGroup: 'tekton.dev',
  apiVersion: 'v1beta1',
  label: 'Task',
  labelKey: 'pipelines-plugin~Task',
  labelPluralKey: 'pipelines-plugin~Tasks',
  plural: 'tasks',
  abbr: 'T',
  namespaced: true,
  kind: 'Task',
  id: 'task',
  labelPlural: 'Tasks',
  crd: true,
  color,
};

export const TaskRunModel: K8sKind = {
  apiGroup: 'tekton.dev',
  apiVersion: 'v1beta1',
  label: 'Task Run',
  labelKey: 'pipelines-plugin~TaskRun',
  labelPluralKey: 'pipelines-plugin~TaskRuns',
  plural: 'taskruns',
  abbr: 'TR',
  namespaced: true,
  kind: 'TaskRun',
  id: 'taskrun',
  labelPlural: 'Task Runs',
  crd: true,
  color,
};

export const PipelineResourceModel: K8sKind = {
  apiGroup: 'tekton.dev',
  apiVersion: 'v1alpha1',
  label: 'Pipeline Resource',
  labelKey: 'pipelines-plugin~PipelineResource',
  labelPluralKey: 'pipelines-plugin~PipelineResources',
  plural: 'pipelineresources',
  abbr: 'PR',
  namespaced: true,
  kind: 'PipelineResource',
  id: 'pipelineresource',
  labelPlural: 'Pipeline Resources',
  crd: true,
  color,
};

export const ClusterTaskModel: K8sKind = {
  apiGroup: 'tekton.dev',
  apiVersion: 'v1beta1',
  label: 'Cluster Task',
  labelKey: 'pipelines-plugin~ClusterTask',
  labelPluralKey: 'pipelines-plugin~ClusterTasks',
  plural: 'clustertasks',
  abbr: 'CT',
  namespaced: false,
  kind: 'ClusterTask',
  id: 'clustertask',
  labelPlural: 'Cluster Tasks',
  crd: true,
  color,
};

export const ConditionModel: K8sKind = {
  apiGroup: 'tekton.dev',
  apiVersion: 'v1alpha1',
  label: 'Condition',
  labelKey: 'pipelines-plugin~Condition',
  labelPluralKey: 'pipelines-plugin~Conditions',
  plural: 'conditions',
  abbr: 'C',
  namespaced: true,
  kind: 'Condition',
  id: 'condition',
  labelPlural: 'Conditions',
  crd: true,
  color,
};

export const TriggerBindingModel: K8sKind = {
  apiGroup: 'triggers.tekton.dev',
  apiVersion: 'v1alpha1',
  label: 'Trigger Binding',
  labelKey: 'pipelines-plugin~TriggerBinding',
  labelPluralKey: 'pipelines-plugin~TriggerBindings',
  plural: 'triggerbindings',
  abbr: 'TB',
  namespaced: true,
  kind: 'TriggerBinding',
  id: 'triggerbinding',
  labelPlural: 'Trigger Bindings',
  crd: true,
  badge: BadgeType.TECH,
  color,
};

export const ClusterTriggerBindingModel: K8sKind = {
  apiGroup: 'triggers.tekton.dev',
  apiVersion: 'v1alpha1',
  label: 'Cluster Trigger Binding',
  labelKey: 'pipelines-plugin~ClusterTriggerBinding',
  labelPluralKey: 'pipelines-plugin~ClusterTriggerBindings',
  plural: 'clustertriggerbindings',
  abbr: 'CTB',
  namespaced: false,
  kind: 'ClusterTriggerBinding',
  id: 'clustertriggerbinding',
  labelPlural: 'Cluster Trigger Bindings',
  crd: true,
  badge: BadgeType.TECH,
  color,
};

export const TriggerTemplateModel: K8sKind = {
  apiGroup: 'triggers.tekton.dev',
  apiVersion: 'v1alpha1',
  label: 'Trigger Template',
  labelKey: 'pipelines-plugin~TriggerTemplate',
  labelPluralKey: 'pipelines-plugin~TriggerTemplates',
  plural: 'triggertemplates',
  abbr: 'TT',
  namespaced: true,
  kind: 'TriggerTemplate',
  id: 'triggertemplate',
  labelPlural: 'Trigger Templates',
  crd: true,
  badge: BadgeType.TECH,
  color,
};

export const TriggerModel: K8sKind = {
  apiGroup: 'triggers.tekton.dev',
  apiVersion: 'v1alpha1',
  label: 'Trigger',
  plural: 'triggers',
  abbr: 'T',
  namespaced: true,
  kind: 'Trigger',
  id: 'trigger',
  labelPlural: 'Triggers',
  crd: true,
  badge: BadgeType.TECH,
  color,
};

export const EventListenerModel: K8sKind = {
  apiGroup: 'triggers.tekton.dev',
  apiVersion: 'v1alpha1',
  label: 'Event Listener',
  labelKey: 'pipelines-plugin~EventListener',
  labelPluralKey: 'pipelines-plugin~EventListeners',
  plural: 'eventlisteners',
  abbr: 'EL',
  namespaced: true,
  kind: 'EventListener',
  id: 'eventlistener',
  labelPlural: 'Event Listeners',
  crd: true,
  badge: BadgeType.TECH,
  color,
};
