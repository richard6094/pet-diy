import React, { useState, useEffect } from 'react';

const previewImages = import.meta.glob('../assets/suggestion-previews/*', {
  eager: true,
  import: 'default',
});

const getPreviewImage = (fileName) =>
  previewImages[`../assets/suggestion-previews/${fileName}`] || null;

const PromptInput = ({
  onSubmit,
  isLoading = false,
  externalPrompt = null,
  onExternalPromptUsed,
}) => {
  const [prompt, setPrompt] = useState('');
  const [failedImageMap, setFailedImageMap] = useState({});

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
    {
      text: '生成一张适合白色T恤的PNG图案：透明背景，粉白配色的手绘猫咪，放置在胸口中央',
      previewImage: getPreviewImage('pinkCat.png'),
      previewCaption: '粉白手绘猫咪胸口图案',
    },
    {
      text: '制作黑白线条风的宠物徽章PNG，带透明背景，适合印在白色T恤左胸位置',
      previewImage: getPreviewImage('mono-badge.png'),
      previewCaption: '黑白线条宠物徽章示例',
    },
    {
      text: '输出水彩风宠物与热带植物PNG，需透明背景与柔和色调，覆盖白色T恤中部',
      previewImage: getPreviewImage('jungleCat.png'),
      previewCaption: '水彩宠物热带植物设计',
    },
    {
      text: '设计复古学院风宠物队徽PNG，保持透明背景和清晰边缘，适用于白色T恤',
      previewImage: getPreviewImage('vintage-crest.png'),
      previewCaption: '复古学院宠物队徽',
    },
  ];

  const handleSuggestionClick = (index) => {
    const suggestion = suggestedPrompts[index];
    setPrompt(suggestion.text);
  };

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
        {/* 参考设计 */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-3">参考设计：</h3>
          <div className="relative flex justify-center">
            <div className="grid grid-cols-2 gap-4">
            {suggestedPrompts.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => handleSuggestionClick(index)}
                type="button"
                className="group focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed transition-transform duration-200 hover:-translate-y-1"
                disabled={isLoading}
              >
                <span className="sr-only">{suggestion.text}</span>
                <div className="w-[min(220px,40vw)] aspect-square rounded-[30px] shadow-2xl bg-white/85 backdrop-blur-xl border border-white/60 ring-1 ring-black/5 p-3">
                  <div className="flex items-center justify-center w-full h-full">
                    <div className="w-full h-full rounded-[24px] overflow-hidden bg-white flex items-center justify-center border border-gray-100">
                      {suggestion.previewImage && !failedImageMap[index] ? (
                        <img
                          src={suggestion.previewImage}
                          alt={suggestion.previewCaption || '参考设计示例图'}
                          className="w-full h-full object-contain max-w-full max-h-full"
                          onError={() =>
                            setFailedImageMap((prev) => ({ ...prev, [index]: true }))
                          }
                        />
                      ) : (
                        <span className="text-xs text-gray-400 text-center px-4">
                          示例图即将上线
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </button>
            ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PromptInput;
