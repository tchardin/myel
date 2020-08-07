import * as React from 'react';
import Margins from './Margins';
import PageTitle from './PageTitle';

type PageFallbackProps = {
  loading?: boolean;
};
const PageFallback: React.FC<PageFallbackProps> = ({loading}) => (
  <Margins>
    <PageTitle title="TODO" subtitle="TODO" loading={loading} />
  </Margins>
);

export default PageFallback;
