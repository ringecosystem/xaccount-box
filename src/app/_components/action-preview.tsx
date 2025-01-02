import json from 'react-syntax-highlighter/dist/esm/languages/hljs/json';
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
import ClipboardIconButton from '@/components/clipboard-icon-button';

// Register the language
SyntaxHighlighter.registerLanguage('json', json);

interface GeneratedAction {
  'Target Contract Address': string;
  'Contract Method': string;
  CallDatas: {
    toChainId: string;
    toDapp: string;
    message: string;
    params: string;
  };
  Value: string;
}

// 自定义颜色方案
const customStyle = {
  hljs: {
    background: '#161818',
    padding: '15px',
    color: '#a872ca',
    overflow: 'auto',
    borderRadius: '8px',
    fontSize: '12px',
    // Add scrollbar styling
    '&::-webkit-scrollbar': {
      width: '8px',
      height: '8px'
    },
    '&::-webkit-scrollbar-track': {
      background: '#1e2021'
    },
    '&::-webkit-scrollbar-thumb': {
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

export const ActionPreview = () => {
  const generatedAction: GeneratedAction = {
    'Target Contract Address': '0x2cd1867FbB016f93710B6386f7f9F1',
    'Contract Method':
      'function send(uint256 toChainId, address message, bytes calldata.params) external payable',
    CallDatas: {
      toChainId: '1',
      toDapp: '0x9Fc3d617873c95D8dd8DbBDbB8377A16cf11376eE',
      message: '0xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
      params: '0xxxxxxxxxxxxxxxxxxxxx'
    },
    Value: '100'
  };

  return (
    <div className="flex w-full flex-col gap-[12px] rounded-[8px] bg-[#1A1A1A] p-[22px]">
      <header className="flex items-center justify-between">
        <span className="text-sm font-semibold leading-[150%] text-[#F6F1E8]/70">
          Generated Action
        </span>
        <ClipboardIconButton text={JSON.stringify(generatedAction, null, 2)} size={18} />
      </header>
      <div className="scrollWrapper">
        <SyntaxHighlighter language="json" style={customStyle} showLineNumbers>
          {JSON.stringify(generatedAction, null, 2)}
        </SyntaxHighlighter>
      </div>
    </div>
  );
};
