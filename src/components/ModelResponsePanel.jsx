import React from 'react';

const formatPayload = (payload) => {
  try {
    return JSON.stringify(payload, null, 2);
  } catch (error) {
    console.error('序列化模型响应失败', error);
    return '无法序列化模型响应';
  }
};

const ModelResponsePanel = ({ payload, isLoading }) => {
  const hasPayload = payload && Object.keys(payload).length > 0;

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4">模型原始返回</h2>
      <div className="border border-gray-200 rounded-lg bg-gray-50 p-4 h-64 overflow-auto text-sm font-mono text-gray-700 whitespace-pre-wrap">
        {isLoading ? (
          <span className="text-gray-500">生成中，稍候即可查看完整响应...</span>
        ) : hasPayload ? (
          <pre className="whitespace-pre-wrap break-all">
            {formatPayload(payload)}
          </pre>
        ) : (
          <span className="text-gray-500">生成结果后将在此显示完整 JSON 响应。</span>
        )}
      </div>
    </div>
  );
};

export default ModelResponsePanel;
