import {useEffect} from 'react';

const Messages = () => {
  useEffect(() => {
    const subMpool = async () => {
      /* const res = await client.mpoolSub(console.log); */
      /* console.log(res); */
    };

    subMpool();
  }, []);

  return null;
};

export default Messages;
