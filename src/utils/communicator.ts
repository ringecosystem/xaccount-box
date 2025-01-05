import { RefObject, useEffect, useState } from 'react';
import { MessageFormatter } from './messageFormatter';
import {
  SDKMessageEvent,
  MethodToResponse,
  Methods,
  ErrorResponse,
  RequestId
} from '../types/communicator';

export const getSDKVersion = () => {
  return '7.6.0'; // IMPORTANT: needs to be >= 1.0.0
};

type MessageHandler = (
  msg: SDKMessageEvent
) =>
  | void
  | MethodToResponse[Methods]
  | ErrorResponse
  | Promise<MethodToResponse[Methods] | ErrorResponse | void>;

export enum LegacyMethods {
  getEnvInfo = 'getEnvInfo'
}

type SDKMethods = Methods | LegacyMethods;

class AppCommunicator {
  private iframeRef: RefObject<HTMLIFrameElement | null>;
  private handlers = new Map<SDKMethods, MessageHandler>();

  constructor(iframeRef: RefObject<HTMLIFrameElement | null>) {
    this.iframeRef = iframeRef;
    window.addEventListener('message', this.handleIncomingMessage);
  }

  on = (method: SDKMethods, handler: MessageHandler): void => {
    this.handlers.set(method, handler);
  };

  private isValidMessage = (msg: SDKMessageEvent): boolean => {
    if (Object.prototype.hasOwnProperty.call(msg.data, 'isCookieEnabled')) {
      return true;
    }

    const sentFromIframe = this.iframeRef.current?.contentWindow === msg.source;
    const knownMethod = Object.values(Methods).includes(msg.data.method);

    return sentFromIframe && knownMethod;
  };

  private canHandleMessage = (msg: SDKMessageEvent): boolean => {
    return Boolean(this.handlers.get(msg.data.method));
  };

  send = (data: unknown, requestId: RequestId, error = false): void => {
    const sdkVersion = getSDKVersion();
    const msg = error
      ? MessageFormatter.makeErrorResponse(requestId, data as string, sdkVersion)
      : MessageFormatter.makeResponse(requestId, data, sdkVersion);
    // console.log("send", { msg });
    this.iframeRef.current?.contentWindow?.postMessage(msg, '*');
  };

  handleIncomingMessage = async (msg: SDKMessageEvent): Promise<void> => {
    const validMessage = this.isValidMessage(msg);
    const hasHandler = this.canHandleMessage(msg);

    if (validMessage && hasHandler) {
      if (
        !(
          msg.data.method === 'rpcCall' &&
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (msg.data.params as any).call === 'eth_getBlockByNumber'
        )
      ) {
        console.log('*', msg.data);
      }

      const handler = this.handlers.get(msg.data.method);
      try {
        // @ts-expect-error Handler existence is checked in this.canHandleMessage
        const response = await handler(msg);

        // If response is not returned, it means the response will be send somewhere else
        if (typeof response !== 'undefined') {
          this.send(response, msg.data.id);
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
        this.send(err.message, msg.data.id, true);
      }
    }
  };

  clear = (): void => {
    window.removeEventListener('message', this.handleIncomingMessage);
  };
}

const useAppCommunicator = (
  iframeRef: RefObject<HTMLIFrameElement | null>
): AppCommunicator | undefined => {
  const [communicator, setCommunicator] = useState<AppCommunicator | undefined>(undefined);
  useEffect(() => {
    let communicatorInstance: AppCommunicator;
    const initCommunicator = (iframeRef: RefObject<HTMLIFrameElement | null>) => {
      communicatorInstance = new AppCommunicator(iframeRef);
      setCommunicator(communicatorInstance);
    };

    initCommunicator(iframeRef);

    return () => {
      communicatorInstance?.clear();
    };
  }, [iframeRef]);

  return communicator;
};

export { useAppCommunicator };
