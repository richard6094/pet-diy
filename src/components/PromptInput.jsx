import React, { useState, useEffect } from 'react';

const PromptInput = ({
  onSubmit,
  isLoading = false,
  externalPrompt = null,
  onExternalPromptUsed,
}) => {
  const [prompt, setPrompt] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (prompt.trim() && !isLoading) {
      onSubmit(prompt.trim());
      setPrompt('');
    }
  };

  useEffect(() => {
    if (typeof externalPrompt === 'string' && externalPrompt.length > 0) {
      setPrompt(externalPrompt);
      if (onExternalPromptUsed) {
        onExternalPromptUsed();
      }
    }
  }, [externalPrompt, onExternalPromptUsed]);

  const suggestedPrompts = [
    '生成一张适合白色T恤的PNG图案：透明背景，粉白配色的手绘猫咪，放置在胸口中央',
    '制作黑白线条风的宠物徽章PNG，带透明背景，适合印在白色T恤左胸位置',
    '输出水彩风宠物与热带植物PNG，需透明背景与柔和色调，覆盖白色T恤中部',
    '设计复古学院风宠物队徽PNG，保持透明背景和清晰边缘，适用于白色T恤'
  ];

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 h-full flex flex-col">
      <h2 className="text-xl font-bold text-gray-800 mb-4">设计提示</h2>
      
      {/* 提示词输入区域 */}
      <form onSubmit={handleSubmit}>
        <div className="flex space-x-3">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="描述你想要的T恤设计风格..."
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!prompt.trim() || isLoading}
            className="px-6 py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white font-medium rounded-lg transition-colors duration-200"
          >
            {isLoading ? '生成中...' : '生成设计'}
          </button>
        </div>
      </form>

      <div className="mt-auto space-y-6 pt-6">
        {/* 建议提示词 */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-3">建议提示词：</h3>
          <div className="flex flex-wrap gap-2">
            {suggestedPrompts.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => setPrompt(suggestion)}
                className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full transition-colors duration-200"
                disabled={isLoading}
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PromptInput;
