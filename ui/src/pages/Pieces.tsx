import * as React from 'react';
import {useMemo, Suspense, useCallback} from 'react';
import {useRecoilValue, selector} from 'recoil';
import {rpcClient, formatPieceSize} from '../client';
import PageTitle from '../components/PageTitle';
import Table from '../components/Table';
import PageFallback from '../components/PageFallback';
import ErrorBoundary from '../utils/ErrorBoundary';
import {shortID, lastNameFromPath} from '../utils/format';
import {Cid} from '../sharedTypes';

type FileImport = {
  FilePath: string;
  Key: Cid;
  Size: number;
  Status: number;
};
const localFilesQuery = selector<FileImport[]>({
  key: 'LocalFiles',
  get: async ({get}) => {
    const client = get(rpcClient);
    const imports = await client.clientListImports();
    return imports;
  },
});

const FilesTable: React.FC = ({children}) => {
  const data = useRecoilValue(localFilesQuery);
  const rows = useMemo(
    () =>
      data.map((p: FileImport) => ({
        ...p,
        data: [
          shortID(p.Key['/']),
          lastNameFromPath(p.FilePath),
          formatPieceSize(p.Size),
        ],
      })),
    [data]
  );
  const head = useMemo(() => ['CID', 'FILENAME', 'SIZE'], []);
  // TODO
  const select = useCallback(() => {}, []);
  return (
    <Table data={rows} children={children} head={head} onSelect={select} />
  );
};

const StoredPieces = () => {
  return (
    <ErrorBoundary fallback={<PageFallback />}>
      <Suspense fallback={<PageFallback loading />}>
        <FilesTable>
          <PageTitle
            title="Stored pieces"
            subtitle="List of locally stored content pieces"
          />
        </FilesTable>
      </Suspense>
    </ErrorBoundary>
  );
};

export default StoredPieces;
