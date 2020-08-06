import * as React from 'react';
import {useCallback, useMemo, useState} from 'react';
import {Form, Field} from 'react-final-form';
import PageTitle from '../components/PageTitle';
import Scroll from '../components/Scroll';
import Bounds from '../components/Bounds';
import Margins from '../components/Margins';
import Text from '../components/Text';
import Space from '../components/Space';
import Button from '../components/Button';
import {PageSheet} from '../components/Sheets';
import TextField from '../components/TextField';
import {VStack} from '../components/Stack';
import Actions from '../components/Actions';

type HardwareConfig = {
  cpu?: string;
  cpuCooler?: string;
  memory?: string;
  storage?: string;
  videoCard?: string;
};
type HardwareConfigEditorProps = {
  visible?: boolean;
  onClose?: () => void;
};

const HardwareConfigEditor: React.FC<HardwareConfigEditorProps> = ({
  visible,
  onClose,
}) => {
  const submit = useCallback((values: HardwareConfig) => {}, []);
  return (
    <Form onSubmit={submit}>
      {({handleSubmit}) => (
        <PageSheet visible={visible} onRequestClose={onClose}>
          <Margins>
            <PageTitle title="Editing your system" secondary />
            <Space scale={5}>
              <Field
                name="cpu"
                component={TextField}
                label="CPU"
                fullWidth
                placeholder="AMD Ryzen 9 3950X 3.5 GHz 16-Core"
              />
              <Field
                name="cpuCooler"
                component={TextField}
                label="CPU cooler"
                placeholder="Fractal Design Celsius S36 87.6 CFM"
                fullWidth
              />
              <Field
                name="memory"
                component={TextField}
                label="Memory"
                placeholder="Corsair Vengeance LPX 64 GB (2 x 32 GB) DDR4-3200 CL16"
                fullWidth
              />
              <Field
                name="storage"
                component={TextField}
                label="Storage"
                placeholder={'Samsung 860 Evo 2 TB 2.5"'}
                fullWidth
              />
              <Field
                name="videoCard"
                component={TextField}
                label="Video card"
                placeholder="Gigabyte GeForce RTX 2080 8 GB"
                fullWidth
              />
            </Space>
            <VStack mt={5}>
              <Actions>
                <Button onPress={handleSubmit}>Save</Button>
              </Actions>
            </VStack>
          </Margins>
        </PageSheet>
      )}
    </Form>
  );
};

const Settings = () => {
  const [editing, setEditing] = useState(false);
  const edit = () => {
    setEditing(true);
  };
  return (
    <Scroll center>
      <Bounds wide>
        <Margins>
          <Bounds>
            <PageTitle
              title="Settings"
              subtitle="Fine tune your parameters here"
            />
            <Space scale={4}>
              <Text is="h3">Hardware</Text>
              <VStack mb={2}>
                <Text is="body">
                  Enter your lotus node's host hardware configuration. This can
                  help faucet nodes give better deals or suggest potential
                  upgrades.
                </Text>
              </VStack>
              <Button onPress={edit}>Add hardware configuration</Button>
            </Space>
          </Bounds>
        </Margins>
      </Bounds>
      <HardwareConfigEditor
        visible={editing}
        onClose={() => setEditing(false)}
      />
    </Scroll>
  );
};

export default Settings;
