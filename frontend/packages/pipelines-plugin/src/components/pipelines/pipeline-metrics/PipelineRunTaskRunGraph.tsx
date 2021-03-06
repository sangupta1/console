import * as React from 'react';
import Measure from 'react-measure';
import * as _ from 'lodash';
import { useTranslation } from 'react-i18next';
import { DEFAULT_CHART_HEIGHT, DEFAULT_LEGEND_CHART_HEIGHT } from '../const';
import {
  ChartLegend,
  ChartVoronoiContainer,
  getInteractiveLegendEvents,
  getInteractiveLegendItemStyles,
} from '@patternfly/react-charts';
import { PipelineTask } from '../../../types';
import { GraphEmpty } from '@console/internal/components/graphs/graph-empty';
import { formatDuration } from '@console/internal/components/utils/datetime';
import { LoadingInline, truncateMiddle } from '@console/internal/components/utils';
import { usePipelineRunTaskRunPoll } from '../hooks';
import {
  PipelineMetricsGraphProps,
  getRangeVectorData,
  getYaxisValues,
} from './pipeline-metrics-utils';
import { LineChart } from './charts/lineChart';

import './pipeline-chart.scss';

const PipelineRunTaskRunGraph: React.FC<PipelineMetricsGraphProps> = ({
  pipeline,
  timespan,
  interval,
  loaded = true,
  onLoad: onInitialLoad,
  queryPrefix,
}) => {
  const {
    metadata: { name, namespace },
  } = pipeline;
  const { t } = useTranslation();
  const [hiddenSeries, setHiddenSeries] = React.useState<Set<number>>(new Set());
  const chartHeight = DEFAULT_LEGEND_CHART_HEIGHT;
  const [runData, runDataError, runDataLoading] = usePipelineRunTaskRunPoll({
    name,
    namespace,
    timespan,
    delay: interval,
    queryPrefix,
  });

  const taskNameMap = pipeline.spec.tasks
    .filter((pipelineTask: PipelineTask) => !!pipelineTask.taskRef)
    .reduce((acc, task) => {
      acc[task.taskRef.name] = task.name;
      return acc;
    }, {});

  const getCustomTaskName = (task: string): string =>
    taskNameMap[task] ? taskNameMap[task] : task;

  if (runDataLoading) {
    return <LoadingInline />;
  }

  const pipelineTaskRunData = runData?.data?.result ?? [];
  if (!loaded) {
    onInitialLoad &&
      onInitialLoad({
        chartName: 'pipelineTaskRunDuration',
        hasData: !!pipelineTaskRunData.length,
      });
  }

  if ((!loaded && pipelineTaskRunData.length) || runDataError || pipelineTaskRunData.length === 0) {
    return <GraphEmpty height={chartHeight - 30} />;
  }

  const pRuns =
    getRangeVectorData(runData, (r) => truncateMiddle(r.metric.pipelinerun, { length: 10 })) ?? [];
  const tickValues = [];
  const finalObj: { [x: string]: { x: string; y: number }[] } = pRuns.reduce((acc, prun) => {
    if (!prun) return acc;
    const obj = prun[prun.length - 1];
    const taskName = getCustomTaskName(obj?.metric?.task);
    if (taskName) {
      if (!acc[taskName]) {
        acc[taskName] = [];
      }
      tickValues.push(truncateMiddle(obj.metric.pipelinerun, { length: 10 }));
      acc[taskName].push(obj);
    }
    return acc;
  }, {});

  const getLegendData = () => {
    return _.map(Object.keys(finalObj), (task, index) => ({
      childName: `line-${index}`,
      name: task,
      ...getInteractiveLegendItemStyles(hiddenSeries.has(index)),
    }));
  };
  const getChartNames = (): string[][] => {
    return getLegendData().map((l, i) => [l.childName, `scatter-${i}`]);
  };
  const isHidden = (index) => {
    return hiddenSeries.has(index);
  };
  const handleLegendClick = (props) => {
    const hidden = new Set(hiddenSeries);
    if (!hidden.delete(props.index)) {
      hidden.add(props.index);
    }
    setHiddenSeries(hidden);
  };
  const getEvents = () =>
    getInteractiveLegendEvents({
      chartNames: getChartNames() as [string | string[]],
      isHidden,
      legendName: 'legend',
      onLegendClick: handleLegendClick,
    });
  return (
    <Measure bounds>
      {({ measureRef, contentRect }) => (
        <div ref={measureRef}>
          <LineChart
            ariaDesc={t('pipelines-plugin~Pipeline task run duration chart')}
            data={_.values(finalObj)}
            yTickFormatter={(seconds) => getYaxisValues(seconds)}
            events={getEvents()}
            hiddenSeries={hiddenSeries}
            tickValues={tickValues}
            width={contentRect.bounds.width}
            height={chartHeight}
            legendPosition="bottom-left"
            legendComponent={
              <ChartLegend
                gutter={25}
                y={DEFAULT_CHART_HEIGHT + 75}
                itemsPerRow={4}
                name="legend"
                data={getLegendData()}
              />
            }
            containerComponent={
              <ChartVoronoiContainer
                constrainToVisibleArea
                activateData={false}
                voronoiPadding={{ bottom: 75 } as any}
                labels={({ datum }) =>
                  datum.childName.includes('line-') && datum.y !== null
                    ? `${datum?.metric?.pipelinerun}
                ${getCustomTaskName(datum?.metric?.task)}
            ${formatDuration(datum?.y * 1000)}`
                    : null
                }
              />
            }
          />
        </div>
      )}
    </Measure>
  );
};

export default PipelineRunTaskRunGraph;
