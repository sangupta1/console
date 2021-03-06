import * as React from 'react';
import {
  SectionHeading,
  ResourceSummary,
  navFactory,
  Kebab,
} from '@console/internal/components/utils';
import { useTranslation } from 'react-i18next';
import { VolumeSnapshotClassKind } from '@console/internal/module/k8s';
import { DetailsPage, DetailsPageProps } from '@console/internal/components/factory';
import { ResourceEventStream } from '@console/internal/components/events';

const { editYaml, events } = navFactory;

const Details: React.FC<DetailsProps> = ({ obj }) => {
  const { t } = useTranslation();
  return (
    <div className="co-m-pane__body">
      <SectionHeading text={t('console-app~VolumeSnapshotClass details')} />
      <div className="row">
        <div className="col-md-6 col-xs-12">
          <ResourceSummary resource={obj}>
            <dt>{t('console-app~Driver')}</dt>
            <dd>{obj?.driver}</dd>
            <dt>{t('console-app~Deletion policy')}</dt>
            <dd>{obj?.deletionPolicy}</dd>
          </ResourceSummary>
        </div>
      </div>
    </div>
  );
};
const pages = [
  {
    href: '',
    name: 'Details',
    component: Details,
  },
  editYaml(),
  events(ResourceEventStream),
];

const VolumeSnapshotClassDetailsPage: React.FC<DetailsPageProps> = (props) => (
  <DetailsPage {...props} menuActions={Kebab.factory.common} pages={pages} />
);

type DetailsProps = {
  obj: VolumeSnapshotClassKind;
};

export default VolumeSnapshotClassDetailsPage;
