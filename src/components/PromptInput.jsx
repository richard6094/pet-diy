import React, { useState, useEffect, useRef, useCallback } from 'react';

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
  const [activePreviewIndex, setActivePreviewIndex] = useState(null);
  const [isBubbleVisible, setIsBubbleVisible] = useState(false);
  const [bubbleStyle, setBubbleStyle] = useState({ top: 0, left: 0, originClass: 'origin-left' });
  const [failedPreviewMap, setFailedPreviewMap] = useState({});
  const suggestionListRef = useRef(null);
  const suggestionButtonRefs = useRef([]);
  const bubbleTimeoutRef = useRef(null);
  const bubbleContainerRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (prompt.trim() && !isLoading) {
      onSubmit(prompt.trim());
      setPrompt('');
      handleCloseBubble();
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

  useEffect(() => () => {
    if (bubbleTimeoutRef.current) {
      clearTimeout(bubbleTimeoutRef.current);
    }
  }, []);

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

  const bubbleWidth = 220;
  const bubbleHeight = 220;

  const handleCloseBubble = useCallback(() => {
    setIsBubbleVisible(false);
    if (bubbleTimeoutRef.current) {
      clearTimeout(bubbleTimeoutRef.current);
    }
    bubbleTimeoutRef.current = setTimeout(() => {
      setActivePreviewIndex(null);
    }, 200);
  }, []);

  const handleSuggestionClick = (index) => {
  const suggestion = suggestedPrompts[index];
    setPrompt(suggestion.text);
  setFailedPreviewMap((prev) => ({ ...prev, [index]: false }));

    if (bubbleTimeoutRef.current) {
      clearTimeout(bubbleTimeoutRef.current);
    }

    const containerRect = suggestionListRef.current?.getBoundingClientRect();
    const buttonRect = suggestionButtonRefs.current[index]?.getBoundingClientRect();

    if (containerRect && buttonRect) {
      let left = buttonRect.right - containerRect.left + 12;
      let top = buttonRect.top - containerRect.top - (bubbleHeight - buttonRect.height) / 2;
      let originClass = 'origin-left';

      if (left + bubbleWidth > containerRect.width) {
        left = buttonRect.left - containerRect.left - bubbleWidth - 12;
        originClass = 'origin-right';
        if (left < 0) {
          left = Math.max(containerRect.width - bubbleWidth, 0);
        }
      }

      if (top + bubbleHeight > containerRect.height) {
        top = Math.max(containerRect.height - bubbleHeight, 0);
      }

      if (top < 0) {
        top = 0;
      }

      setBubbleStyle({ top, left, originClass });
    } else {
      setBubbleStyle({ top: 0, left: 0, originClass: 'origin-left' });
    }

    setActivePreviewIndex(index);
    requestAnimationFrame(() => {
      setIsBubbleVisible(true);
    });
  };

  useEffect(() => {
    if (!isBubbleVisible) {
      return undefined;
    }

    const handleMouseDown = (event) => {
      if (bubbleContainerRef.current && !bubbleContainerRef.current.contains(event.target)) {
        handleCloseBubble();
      }
    };

    document.addEventListener('mousedown', handleMouseDown);
    return () => {
      document.removeEventListener('mousedown', handleMouseDown);
    };
  }, [isBubbleVisible, handleCloseBubble]);

  const activePreview =
    typeof activePreviewIndex === 'number' ? suggestedPrompts[activePreviewIndex] : null;
  const isActivePreviewBroken =
    typeof activePreviewIndex === 'number' ? failedPreviewMap[activePreviewIndex] : false;

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
          <div ref={suggestionListRef} className="relative flex flex-wrap gap-2">
            {suggestedPrompts.map((suggestion, index) => (
              <button
                key={index}
                ref={(el) => {
                  suggestionButtonRefs.current[index] = el;
                }}
                onClick={() => handleSuggestionClick(index)}
                className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full transition-colors duration-200"
                disabled={isLoading}
              >
                {suggestion.text}
              </button>
            ))}

            {activePreview && (
              <div
                className={`absolute z-10 w-[220px] h-[220px] transform transition-all duration-200 ${
                  isBubbleVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-75'
                } ${bubbleStyle.originClass}`}
                style={{ top: bubbleStyle.top, left: bubbleStyle.left }}
                ref={bubbleContainerRef}
              >
                <div className="relative w-full h-full rounded-[30px] shadow-2xl bg-white/85 backdrop-blur-xl border border-white/60 ring-1 ring-black/5 p-3">
                  <div className="flex items-center justify-center w-full h-full">
                    <div className="w-full h-full rounded-[24px] overflow-hidden bg-white flex items-center justify-center border border-gray-100">
                      {activePreview.previewImage && !isActivePreviewBroken ? (
                        <img
                          src={activePreview.previewImage}
                          alt={activePreview.previewCaption || '提示词示例图'}
                          className="object-cover w-full h-full"
                          onError={() =>
                            setFailedPreviewMap((prev) => ({ ...prev, [activePreviewIndex]: true }))
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
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PromptInput;
