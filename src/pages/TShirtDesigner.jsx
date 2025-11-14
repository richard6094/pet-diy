import React, { useState } from 'react';
import ImageUpload from '../components/ImageUpload';
import PromptInput from '../components/PromptInput';
import ApiKeyManager from '../components/ApiKeyManager';
import DesignDisplay from '../components/DesignDisplay';
import UploadedImagesPanel from '../components/UploadedImagesPanel';
import { generateDesign, generateTemplateStyleTransfer } from '../services/aiClient';
import { removeBackgroundFromImageUrl } from '../services/backgroundProcessor';

const TShirtDesignerPage = () => {
  const [uploadedImages, setUploadedImages] = useState([]);
  const [designResult, setDesignResult] = useState(null);
  const [messageHistory, setMessageHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastPrompt, setLastPrompt] = useState('');
  const [prefillPrompt, setPrefillPrompt] = useState(null);
  const [statusMessage, setStatusMessage] = useState('');
  const [lastGeneration, setLastGeneration] = useState(null);

  const executeDesignWorkflow = async ({ modelExecutor, buildDescription }) => {
    let modelResult = null;

    try {
      modelResult = await modelExecutor();
    } catch (err) {
      console.error('生成设计失败:', err);
      setDesignResult(null);
      setError(err.message || '生成失败，请稍后重试。');
      setStatusMessage('');
      setIsLoading(false);
      return;
    }

    try {
      setStatusMessage('正在清理图像背景以适配T恤...');
      const processed = await removeBackgroundFromImageUrl(modelResult.imageUrl);

      setDesignResult({
        imageUrl: processed.dataUrl,
        originalImageUrl: modelResult.imageUrl,
        backgroundProcessed: true,
        processedMetadata: {
          width: processed.width,
          height: processed.height,
          cropBox: processed.cropBox,
        },
        description: buildDescription({ backgroundProcessed: true }),
        raw: modelResult.raw,
      });
      setError(null);
      setStatusMessage('设计生成完成！');
    } catch (bgError) {
      console.error('背景处理失败:', bgError);
      setDesignResult({
        imageUrl: modelResult.imageUrl,
        originalImageUrl: modelResult.imageUrl,
        backgroundProcessed: false,
        processedMetadata: null,
        description: buildDescription({ backgroundProcessed: false }),
        raw: modelResult.raw,
      });
      setError(bgError.message || '背景处理失败，已展示原始设计。');
      setStatusMessage('');
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = (imageData) => {
    setUploadedImages((prev) => {
      const next = [...prev, imageData];
      if (next.length <= 3) {
        return next;
      }
      return next.slice(-3);
    });
    setError(null);
  };

  const handleRemoveImage = (imageId) => {
    setUploadedImages((prev) =>
      prev.filter((image, index) => (image.id ?? image.name ?? String(index)) !== imageId)
    );
  };

  const handlePromptSubmit = async (prompt, { skipHistory = false } = {}) => {
    if (!uploadedImages.length) {
      setError('请先上传宠物照片后再生成设计。');
      return;
    }

    setIsLoading(true);
    setStatusMessage('正在调用模型生成设计...');
    setError(null);
    setDesignResult(null);

    const normalizedPrompt = prompt?.trim() || '';
    setLastPrompt(normalizedPrompt);
    setLastGeneration({ type: 'creative', prompt: normalizedPrompt });

    if (!skipHistory) {
      const newMessage = {
        prompt: normalizedPrompt,
        timestamp: new Date().toISOString(),
        type: 'creative',
      };
      setMessageHistory((prev) => [newMessage, ...prev]);
    }

    setPrefillPrompt(null);

    const imagesForRequest = uploadedImages
      .slice(-3)
      .map((item) => item.file)
      .filter(Boolean);

    await executeDesignWorkflow({
      modelExecutor: () =>
        generateDesign({
          imageFiles: imagesForRequest,
          prompt: normalizedPrompt,
        }),
      buildDescription: ({ backgroundProcessed }) => {
        if (normalizedPrompt) {
          return backgroundProcessed
            ? `基于提示词 "${normalizedPrompt}" 生成并优化的T恤设计`
            : `基于提示词 "${normalizedPrompt}" 生成的T恤设计（背景处理失败，展示原图）`;
        }

        return backgroundProcessed
          ? '根据上传的宠物照片生成并优化的T恤设计'
          : '根据上传的宠物照片生成的T恤设计（背景处理失败，展示原图）';
      },
    });
  };

  const handleTemplateSubmit = async (templateOption, { skipHistory = false } = {}) => {
    if (!templateOption) {
      return;
    }

    if (!uploadedImages.length) {
      setError('请先上传宠物照片后再进行模板替换。');
      return;
    }

    setIsLoading(true);
    setStatusMessage('正在根据模板生成设计...');
    setError(null);
    setDesignResult(null);
    setPrefillPrompt(null);

    const userFiles = uploadedImages
      .slice(-1)
      .map((item) => item.file)
      .filter(Boolean);

    const historyLabel = `模板替换：${templateOption.title}`;
    setLastPrompt(historyLabel);
    setLastGeneration({ type: 'template', templateOption });

    if (!skipHistory) {
      const newMessage = {
        prompt: historyLabel,
        timestamp: new Date().toISOString(),
        type: 'template',
        templateId: templateOption.id,
      };
      setMessageHistory((prev) => [newMessage, ...prev]);
    }

    await executeDesignWorkflow({
      modelExecutor: () =>
        generateTemplateStyleTransfer({
          templateImageUrl: templateOption.previewImage,
          templateName: templateOption.title,
          userImageFiles: userFiles,
          templateInstructions: templateOption.styleInstructions,
        }),
      buildDescription: ({ backgroundProcessed }) =>
        backgroundProcessed
          ? `基于模板「${templateOption.title}」为您的宠物生成并优化的T恤设计`
          : `基于模板「${templateOption.title}」生成的T恤设计（背景处理失败，展示原图）`,
    });
  };

  const handleRetry = () => {
    if (lastGeneration?.type === 'template' && lastGeneration.templateOption) {
      handleTemplateSubmit(lastGeneration.templateOption, { skipHistory: true });
      return;
    }

    handlePromptSubmit(lastGeneration?.prompt ?? lastPrompt, { skipHistory: true });
  };

  const handleReusePrompt = (promptText) => {
    setPrefillPrompt(promptText);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center">
      <div style={{ width: '1000px', minHeight: '100vh' }} className="bg-white shadow-xl">
        <header className="bg-white shadow-sm border-b">
          <div className="px-6 py-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">🐾</span>
                </div>
                <h1 className="text-xl font-bold text-gray-900">宠物T恤设计师</h1>
              </div>
              <p className="text-gray-600 text-sm hidden md:block">上传宠物照片，AI为您设计专属T恤</p>
            </div>
          </div>
        </header>

        <main className="px-6 py-6 flex flex-col gap-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
            <div className="h-[500px]">
              <ImageUpload onImageUpload={handleImageUpload} />
            </div>

            <div className="h-[500px]">
              <UploadedImagesPanel
                uploadedImages={uploadedImages}
                onRemoveImage={handleRemoveImage}
              />
            </div>
          </div>

          <div className="flex justify-center">
            <div className="w-[70%]">
              <PromptInput
                onSubmit={handlePromptSubmit}
                isLoading={isLoading}
                externalPrompt={prefillPrompt}
                onExternalPromptUsed={() => setPrefillPrompt(null)}
                onTemplateSubmit={handleTemplateSubmit}
                hasUploadedImages={uploadedImages.length > 0}
              />
            </div>
          </div>

          <div className="flex justify-center">
            <div className="w-[80%]">
              <DesignDisplay
                designResult={designResult}
                isLoading={isLoading}
                error={error}
                onRetry={error ? handleRetry : undefined}
                messageHistory={messageHistory}
                onReusePrompt={handleReusePrompt}
                statusMessage={statusMessage}
              />
            </div>
          </div>

          <div className="flex justify-center">
            <div className="w-[70%] mt-20">
              <ApiKeyManager />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default TShirtDesignerPage;
