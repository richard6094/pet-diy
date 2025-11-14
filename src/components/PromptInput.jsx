import React, { useState, useEffect, useMemo } from 'react';

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
  onTemplateSubmit,
  hasUploadedImages = false,
}) => {
  const [prompt, setPrompt] = useState('');
  const [failedImageMap, setFailedImageMap] = useState({});
  const [activeMode, setActiveMode] = useState('creative');
  const [selectedTemplateId, setSelectedTemplateId] = useState(null);
  const [templateFailedMap, setTemplateFailedMap] = useState({});
  const [previewFailedMap, setPreviewFailedMap] = useState({});

  const submitPrompt = () => {
    if (prompt.trim() && !isLoading) {
      onSubmit(prompt.trim());
      setPrompt('');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    submitPrompt();
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

  const templateOptions = useMemo(
    () => [
      {
        id: 'soft-illustration-template',
        title: '粉白插画模板',
        description: '柔和手绘质感，适合胸前大面积印花',
        previewImage: getPreviewImage('pinkCat.png'),
        styleInstructions:
          '保留粉白插画的柔和线条与渐变色块，突出宠物的可爱神态',
      },
      {
        id: 'mono-badge-template',
        title: '宠物徽章模板',
        description: '黑白线条徽章风格，适合左胸位置的精致设计',
        previewImage: getPreviewImage('mono-badge.png'),
        styleInstructions:
          '维持徽章的黑白线条结构与分区，突出中央徽章内的宠物形象',
      },
      {
        id: 'soft-watercolor-template',
        title: '热带水彩模板',
        description: '水彩植物与柔和光影，适合胸前中部的大幅印花',
        previewImage: getPreviewImage('jungleCat.png'),
        styleInstructions:
          '保持热带植物的环绕构图与水彩质感，让宠物主体与柔和色彩自然融合',
      },
      {
        id: 'vintage-crest-template',
        title: '复古学院模板',
        description: '盾牌式构图与文字纹理，突出复古感与对称性',
        previewImage: getPreviewImage('vintage-crest.png'),
        styleInstructions:
          '继承盾牌的对称结构与复古配色，在中央呈现宠物的立体肖像',
      },
    ],
    []
  );

  const selectedTemplate = templateOptions.find((item) => item.id === selectedTemplateId) || null;

  useEffect(() => {
    if (!selectedTemplate && templateOptions.length > 0) {
      setSelectedTemplateId(templateOptions[0].id);
    }
  }, [selectedTemplate, templateOptions]);

  const handleTemplateSelect = (templateId) => {
    setSelectedTemplateId((prev) => (prev === templateId ? null : templateId));
  };

  const handleTemplateConfirm = () => {
    if (!selectedTemplate || isLoading || typeof onTemplateSubmit !== 'function') {
      return;
    }

    onTemplateSubmit(selectedTemplate);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 h-full flex flex-col">
      <h2 className="text-xl font-bold text-gray-800 mb-4">设计提示</h2>

      <div className="mb-4 flex rounded-lg bg-gray-100 p-1">
        {[
          { key: 'creative', label: '自由创作' },
          { key: 'template', label: '模板替换' },
        ].map(({ key, label }) => {
          const isActive = activeMode === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => setActiveMode(key)}
              className={`flex-1 rounded-md px-5 py-3 text-base font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-white text-blue-600 shadow'
                  : 'text-gray-600 hover:text-blue-500'
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      {activeMode === 'creative' ? (
        <>
          {/* 提示词输入区域 */}
          <form onSubmit={handleSubmit}>
            <div className="flex items-stretch gap-3">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={(e) => {
                  if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                    e.preventDefault();
                    submitPrompt();
                  }
                }}
                placeholder="描述你想要的T恤设计风格..."
                className="flex-1 min-h-[120px] px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-y"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={!prompt.trim() || isLoading}
                className="px-6 py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white font-medium rounded-lg transition-colors duration-200 shrink-0 self-stretch min-h-[120px] flex items-center justify-center"
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
                <div className="grid w-full max-w-[min(460px,90vw)] grid-cols-2 gap-4">
                  {suggestedPrompts.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestionClick(index)}
                      type="button"
                      className="group w-full focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed transition-transform duration-200 hover:-translate-y-1"
                      disabled={isLoading}
                    >
                      <span className="sr-only">{suggestion.text}</span>
                      <div className="w-full aspect-square max-w-[220px] rounded-[30px] shadow-2xl bg-white/85 backdrop-blur-xl border border-white/60 ring-1 ring-black/5 p-3 mx-auto">
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
        </>
      ) : (
        <div className="mt-2 flex-1 flex flex-col">
          <div className="rounded-lg border border-gray-200 bg-gray-50/70 p-4 space-y-5">
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2">选择一个模板示例</h3>
              <p className="text-xs text-gray-500">
                上传宠物照片后，从下方模板中挑选一个喜欢的风格。系统会参照模板的构图与色调完成替换。
              </p>
            </div>

            <div className="flex gap-3 overflow-x-auto overflow-y-hidden pb-1">
              {templateOptions.map((template) => {
                const isSelected = selectedTemplateId === template.id;
                const hasFailed = templateFailedMap[template.id];

                return (
                  <button
                    key={template.id}
                    type="button"
                    onClick={() => handleTemplateSelect(template.id)}
                    className={`relative shrink-0 rounded-xl border transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 ${
                      isSelected
                        ? 'border-blue-400 ring-2 ring-blue-400 ring-offset-2 bg-white shadow-lg'
                        : 'border-transparent bg-white/80 hover:border-blue-200 hover:shadow-md'
                    } w-[90px] h-[90px]`}
                    disabled={isLoading}
                  >
                    {template.previewImage && !hasFailed ? (
                      <img
                        src={template.previewImage}
                        alt={template.title}
                        className="w-full h-full object-cover rounded-lg"
                        onError={() =>
                          setTemplateFailedMap((prev) => ({ ...prev, [template.id]: true }))
                        }
                      />
                    ) : (
                      <span className="text-[11px] text-gray-400 px-2 text-center leading-tight">
                        示例图加载失败
                      </span>
                    )}
                    {isSelected && (
                      <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs font-semibold shadow-md">
                        ✓
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="rounded-2xl bg-white shadow-inner border border-gray-100 p-5 flex flex-col items-center gap-4">
              <div className="w-full max-w-[320px] aspect-square rounded-2xl overflow-hidden bg-gray-50 flex items-center justify-center">
                {selectedTemplate?.previewImage && !previewFailedMap[selectedTemplate.id] ? (
                  <img
                    src={selectedTemplate.previewImage}
                    alt={selectedTemplate.title}
                    className="w-full h-full object-contain"
                    onError={() =>
                      setPreviewFailedMap((prev) => ({ ...prev, [selectedTemplate.id]: true }))
                    }
                  />
                ) : (
                  <span className="text-sm text-gray-400 px-4 text-center">
                    当前模板预览加载失败
                  </span>
                )}
              </div>

              {selectedTemplate ? (
                <div className="w-full space-y-2 text-left">
                  <h4 className="text-sm font-semibold text-gray-800">{selectedTemplate.title}</h4>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    {selectedTemplate.description}
                  </p>
                </div>
              ) : (
                <p className="text-xs text-gray-400">请选择一个模板查看详细说明。</p>
              )}
            </div>
          </div>

          <div className="mt-4">
            <button
              type="button"
              onClick={handleTemplateConfirm}
              disabled={!selectedTemplate || !hasUploadedImages || isLoading}
              className={`w-full rounded-lg px-4 py-3 text-sm font-medium transition-colors duration-200 ${
                !selectedTemplate || !hasUploadedImages || isLoading
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-500 text-white hover:bg-blue-600'
              }`}
            >
              {isLoading ? '生成中...' : '确认使用模板生成设计'}
            </button>
            {!hasUploadedImages && (
              <p className="mt-2 text-xs text-red-500">
                请先在左侧上传至少一张宠物照片，才能进行模板替换。
              </p>
            )}
          </div>

          {selectedTemplate && (
            <div className="mt-4 rounded-lg bg-blue-50 border border-blue-200 px-4 py-3 text-xs text-blue-700 leading-relaxed space-y-1">
              <p className="font-medium">生成说明</p>
              <p>{selectedTemplate.styleInstructions}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PromptInput;
