import * as React from 'react';
import {useCallback, useMemo, useEffect} from 'react';
import {Form, Field} from 'react-final-form';
import {useNavigate} from 'react-router-dom';
import {useRecoilValue} from 'recoil';
import {useAuth, rpcClient} from '../client';

import Main from '../components/Main';
import Scroll from '../components/Scroll';
import Text from '../components/Text';
import Bounds from '../components/Bounds';
import Space from '../components/Space';
import TextField from '../components/TextField';
import Actions from '../components/Actions';
import Button from '../components/Button';

const Auth = () => {
  const navigate = useNavigate();
  const {signedIn, signIn} = useAuth();
  const client = useRecoilValue(rpcClient);
  const initialValues = useMemo(
    () => ({
      fullNodeUrl: 'ws://localhost:1234/rpc/v0',
      storageNodeUrl: 'ws://localhost:2345/rpc/v0',
      myelUrl: 'ws://localhost:4321/rpc/v0',
      token: process.env.REACT_APP_LOTUS_TOKEN,
    }),
    []
  );
  const submit = useCallback(
    (values) => {
      signIn(values);
    },
    [signIn]
  );

  useEffect(() => {
    if (signedIn) {
      navigate('/');
    }
  }, [client, navigate, signedIn]);
  return (
    <Form onSubmit={submit} initialValues={initialValues}>
      {({handleSubmit}) => (
        <Scroll>
          <Main>
            <Bounds>
              <Space scale={7}>
                <Text is="h1">Let's connect to your node</Text>
                <Space scale={5}>
                  <Field
                    name="fullNodeUrl"
                    component={TextField}
                    label="Lotus node"
                    fullWidth
                  />
                  <Field
                    name="storageNodeUrl"
                    component={TextField}
                    label="Lotus storage miner"
                    fullWidth
                  />
                  <Field
                    name="myelUrl"
                    component={TextField}
                    label="Myelf retrieval client"
                    fullWidth
                  />
                  <Field
                    name="token"
                    component={TextField}
                    label="Lotus token"
                    fullWidth
                  />
                </Space>
                <Actions>
                  <Button onPress={handleSubmit}>Next</Button>
                </Actions>
              </Space>
            </Bounds>
          </Main>
        </Scroll>
      )}
    </Form>
  );
};

export default Auth;
