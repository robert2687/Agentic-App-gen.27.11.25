
import React from 'react';
import { ApiContract } from '../types';
import { CodeBlock } from './CodeBlock';

interface ApiContractCardProps {
  contract: ApiContract;
}

export const ApiContractCard: React.FC<ApiContractCardProps> = ({ contract }) => {
  const methodColor = contract.method === 'POST' ? 'bg-sky-600 text-sky-100' : 'bg-emerald-600 text-emerald-100';

  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-lg overflow-hidden">
      <div className="p-4 border-b border-slate-700">
        <h3 className="text-lg font-semibold text-brand-text-primary mb-1">{contract.title}</h3>
        <div className="flex items-center space-x-3 mb-2">
            <span className={`px-2 py-0.5 rounded-md text-xs font-bold ${methodColor}`}>
                {contract.method}
            </span>
            <span className="text-sm font-mono text-brand-text-secondary">{contract.path}</span>
        </div>
        <p className="text-sm text-brand-text-secondary">{contract.description}</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-slate-700">
        {contract.request && (
          <div className="bg-brand-surface">
            <CodeBlock title="Request Body" code={contract.request} language="json" />
          </div>
        )}
        <div className={contract.request ? 'bg-brand-surface' : 'md:col-span-2 bg-brand-surface'}>
          <CodeBlock title="Response Body" code={contract.response} language="json" />
        </div>
      </div>
    </div>
  );
};
