import json from 'react-syntax-highlighter/dist/esm/languages/hljs/json';
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
import ClipboardIconButton from '@/components/clipboard-icon-button';

SyntaxHighlighter.registerLanguage('json', json);

export interface Transaction {
  from?: string;
  to?: string;
  value?: string;
  calldata?: string;
}

interface GeneratedAction {
  transaction: Transaction;
  crossChainCall: {
    port: string;
    value: string;
    function: string;
    params: {
      toChainId: string;
      toDapp: string;
      message: string;
      params: string;
    };
  };
}

const customStyle = {
  hljs: {
    background: '#161818',
    padding: '15px',
    color: '#a872ca',
    overflow: 'auto',
    borderRadius: '8px',
    fontSize: '12px',
    // Add scrollbar styling
    '&::WebkitScrollbar': {
      width: '8px',
      height: '8px'
    },
    '&::WebkitScrollbarTrack': {
      background: '#1e2021'
    },
    '&::WebkitScrollbarThumb': {
      background: '#3f4142',
      borderRadius: '4px',
      '&:hover': {
        background: '#4f5152'
      }
    }
  },
  'hljs-string': {
    color: '#11b5dc'
  },
  'hljs-number': {
    color: '#B5CEA8'
  },
  'hljs-property': {
    color: '#11b5dc'
  }
};

export const Content = ({
  transaction,
  sourcePort,
  targetChainId,
  moduleAddress,
  message,
  params,
  fee
}: {
  transaction?: Transaction;
  sourcePort?: string;
  targetChainId?: number;
  moduleAddress?: string;
  message?: string;
  params?: string;
  fee?: string;
}) => {
  const generatedAction: GeneratedAction | object =
    transaction && sourcePort && fee && moduleAddress && targetChainId && message && params
      ? {
          transaction: transaction,
          crossChainCall: {
            port: sourcePort,
            value: fee,
            function:
              'send(uint256 toChainId, address toDapp, bytes calldata message, bytes calldata params) external payable',
            params: {
              toChainId: targetChainId.toString(),
              toDapp: moduleAddress,
              message: message,
              params: params
            }
          }
        }
      : {};

  return (
    <div className="flex w-full flex-col gap-[12px] rounded-[8px] bg-[#1A1A1A] p-[22px]">
      <header className="flex items-center justify-between">
        <span className="text-sm font-semibold leading-[150%] text-[#F6F1E8]/70">
          Generated Action
        </span>
        {generatedAction && Object.keys(generatedAction).length > 0 && (
          <ClipboardIconButton text={JSON.stringify(generatedAction, null, 2)} size={18} />
        )}
      </header>
      <div className="scrollWrapper">
        <SyntaxHighlighter
          language="json"
          style={customStyle}
          showLineNumbers
          showInlineLineNumbers
          wrapLines
        >
          {JSON.stringify(generatedAction, null, 2)}
        </SyntaxHighlighter>
      </div>
    </div>
  );
};
