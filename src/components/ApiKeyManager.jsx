import React, { useState } from 'react';
import { useApiKey } from '../hooks/useApiKey';

const ApiKeyManager = () => {
  const { apiKey, source, setApiKey, clearApiKey } = useApiKey();
  const [draft, setDraft] = useState('');
  const [persist, setPersist] = useState(true);
  const [message, setMessage] = useState(null);

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!draft.trim()) {
      setMessage({ type: 'error', text: '请输入有效的 API Key。' });
      return;
    }
    setApiKey(draft.trim(), { persist });
    setDraft('');
    setMessage({ type: 'success', text: persist ? 'API Key 已保存至本地存储。' : 'API Key 已在当前会话中生效。' });
  };

  const handleClear = () => {
    clearApiKey();
    setMessage({ type: 'info', text: '已清除当前 API Key。' });
  };

  const renderStatus = () => {
    switch (source) {
      case 'env':
        return '当前使用环境变量中的 API Key（只读）。';
      case 'storage':
        return '当前使用本地存储中的 API Key。';
      case 'memory':
        return '当前使用会话内临时 API Key。';
      default:
        return '未设置 API Key，请先配置。';
    }
  };

  return (
    <section className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
      <header className="mb-4">
        <h2 className="text-lg font-semibold text-gray-900">API Key 管理</h2>
        <p className="text-sm text-gray-600 mt-1">
          推荐在部署环境中使用服务端代理或环境变量，不要在公开页面暴露敏感凭据。
        </p>
      </header>

      <div className="bg-gray-50 border border-gray-200 rounded-md p-3 text-sm text-gray-700 mb-4">
        <p>{renderStatus()}</p>
        {apiKey && (
          <p className="mt-2 text-xs text-gray-500 break-all">
            当前生效的 Key（仅显示前 6 位）: {apiKey.slice(0, 6)}••••
          </p>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="api-key-input" className="block text-sm font-medium text-gray-700 mb-1">
            输入 API Key
          </label>
          <input
            id="api-key-input"
            type="password"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Google Nano Banana API Key"
          />
        </div>

        <label className="flex items-center space-x-2 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={persist}
            onChange={(e) => setPersist(e.target.checked)}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span>持久化到浏览器本地存储（仅建议用于本地开发）</span>
        </label>

        <div className="flex space-x-3">
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            保存 API Key
          </button>
          <button
            type="button"
            onClick={handleClear}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
          >
            清除 Key
          </button>
        </div>
      </form>

      {message && (
        <p
          className={`mt-4 text-sm ${
            message.type === 'error'
              ? 'text-red-600'
              : message.type === 'success'
              ? 'text-green-600'
              : 'text-gray-600'
          }`}
        >
          {message.text}
        </p>
      )}
    </section>
  );
};

export default ApiKeyManager;
