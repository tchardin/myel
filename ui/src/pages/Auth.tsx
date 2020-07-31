import * as React from 'react';
import {useCallback, useMemo, useEffect} from 'react';
import {Form, Field} from 'react-final-form';
import {useNavigate} from 'react-router-dom';
import {useAuth} from '../client';

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
  const initialValues = useMemo(
    () => ({
      url: 'ws://localhost:1234/rpc/v0',
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
  }, [navigate, signedIn]);
  return (
    <Form onSubmit={submit} initialValues={initialValues}>
      {({handleSubmit}) => (
        <Scroll>
          <Main>
            <Bounds>
              <Space scale={7}>
                <Text is="h1">Let's connect to your Lotus node</Text>
                <Space scale={5}>
                  <Field
                    name="url"
                    component={TextField}
                    label="Endpoint"
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
