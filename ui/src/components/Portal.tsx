import * as React from 'react';
import {useRef, useEffect, useReducer} from 'react';
import {createPortal} from 'react-dom';

type PortalProps = {
  name?: string;
};

const Portal: React.FC<PortalProps> = ({children, name = 'magic'}) => {
  const [, forceUpdate] = useReducer((x) => x + 1, 0);
  const mountNode = useRef<HTMLDivElement | null>(null);
  const portalNode = useRef<HTMLElement | null>(null);
  useEffect(() => {
    const ownerDocument = mountNode.current!.ownerDocument;
    portalNode.current = ownerDocument?.createElement(name + '-portal')!;
    ownerDocument!.body.appendChild(portalNode.current);
    forceUpdate();
    return () => {
      portalNode.current?.ownerDocument?.body.removeChild(portalNode.current);
    };
  }, [name]);
  return portalNode.current ? (
    createPortal(children, portalNode.current)
  ) : (
    <div ref={mountNode} />
  );
};

export default Portal;
