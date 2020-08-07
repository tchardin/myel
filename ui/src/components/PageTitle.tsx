import * as React from 'react';
import {VStack} from './Stack';
import Space from './Space';
import Text from './Text';
import Placeholder from './Placeholder';

type PageTitleProps = {
  title: string;
  subtitle?: string;
  secondary?: boolean;
  loading?: boolean;
};

const plSizes = {
  h1: 48,
  h2: 32,
};

const PageTitle: React.FC<PageTitleProps> = ({
  title,
  subtitle,
  secondary,
  loading,
}) => {
  const h = secondary ? 'h2' : 'h1';
  return (
    <Placeholder Animation={loading ? Placeholder.Fade : undefined}>
      <VStack mt={7} mb={3}>
        <Space scale={2}>
          {title === 'TODO' ? (
            <Placeholder.Line height={plSizes[h]} width={280} />
          ) : (
            <Text is={h}>{title}</Text>
          )}
          {!!subtitle &&
            (subtitle === 'TODO' ? (
              <Placeholder.Line width={375} />
            ) : (
              <Text is="body">{subtitle}</Text>
            ))}
        </Space>
      </VStack>
    </Placeholder>
  );
};

export default PageTitle;
