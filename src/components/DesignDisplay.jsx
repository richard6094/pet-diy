import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import whiteShirtImage from '../assets/white_T_shirt.jpg';

const MIN_WIDTH_RATIO = 0.2;
const MAX_WIDTH_RATIO = 0.65;

const DesignDisplay = ({
  designResult,
  isLoading = false,
  error = null,
  onRetry,
  messageHistory = [],
  onReusePrompt,
  statusMessage = '',
}) => {
  const containerRef = useRef(null);
  const shirtImageRef = useRef(null);
  const [designAspectRatio, setDesignAspectRatio] = useState(1);
  const [transform, setTransform] = useState({ centerX: 0.5, centerY: 0.45, width: 0.46 });
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);

  const isEditable = Boolean(designResult?.imageUrl) && !isLoading && !error;

  useEffect(() => {
    if (designResult?.imageUrl) {
      setTransform({ centerX: 0.5, centerY: 0.45, width: 0.46 });
      const image = new Image();
      image.crossOrigin = 'anonymous';
      image.onload = () => {
        if (image.naturalWidth && image.naturalHeight) {
          setDesignAspectRatio(image.naturalHeight / image.naturalWidth);
        } else {
          setDesignAspectRatio(1);
        }
      };
      image.src = designResult.imageUrl;
    }
  }, [designResult?.imageUrl]);

  const clampTransform = useCallback(
    (config) => {
      const container = containerRef.current;
      if (!container) {
        return config;
      }

      const { width: containerWidth, height: containerHeight } = container.getBoundingClientRect();
      if (containerWidth === 0 || containerHeight === 0) {
        return config;
      }

      const width = Math.min(Math.max(config.width, MIN_WIDTH_RATIO), MAX_WIDTH_RATIO);
      const overlayWidthPx = width * containerWidth;
      const overlayHeightPx = overlayWidthPx * designAspectRatio;
      const halfWidthRatio = overlayWidthPx / containerWidth / 2;
      const halfHeightRatio = overlayHeightPx / containerHeight / 2;

      const centerX = Math.min(Math.max(config.centerX, halfWidthRatio), 1 - halfWidthRatio);
      const centerY = Math.min(Math.max(config.centerY, halfHeightRatio), 1 - halfHeightRatio);

      return { centerX, centerY, width };
    },
    [designAspectRatio]
  );

  const updateTransform = useCallback(
    (updater) => {
      setTransform((prev) => {
        const next = typeof updater === 'function' ? updater(prev) : updater;
        return clampTransform(next);
      });
    },
    [clampTransform]
  );

  const handleInteractionEnd = useCallback(() => {
    setIsDragging(false);
    setIsResizing(false);
    document.body.style.userSelect = '';
    document.body.style.cursor = '';
  }, []);

  useEffect(() => {
    return () => {
      handleInteractionEnd();
    };
  }, [handleInteractionEnd]);

  const handleDragStart = useCallback(
    (event) => {
      if (!isEditable || !containerRef.current) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();
      if (event.currentTarget?.setPointerCapture) {
        event.currentTarget.setPointerCapture(event.pointerId);
      }
      setIsDragging(true);
      document.body.style.userSelect = 'none';
      document.body.style.cursor = 'grabbing';

      const containerRect = containerRef.current.getBoundingClientRect();
      const startX = event.clientX;
      const startY = event.clientY;
      const startingTransform = transform;

      const handlePointerMove = (moveEvent) => {
        const deltaX = (moveEvent.clientX - startX) / containerRect.width;
        const deltaY = (moveEvent.clientY - startY) / containerRect.height;
        updateTransform({
          centerX: startingTransform.centerX + deltaX,
          centerY: startingTransform.centerY + deltaY,
          width: startingTransform.width,
        });
      };

      const handlePointerUp = () => {
        window.removeEventListener('pointermove', handlePointerMove);
        window.removeEventListener('pointerup', handlePointerUp);
        window.removeEventListener('pointercancel', handlePointerUp);
        handleInteractionEnd();
      };

      window.addEventListener('pointermove', handlePointerMove);
      window.addEventListener('pointerup', handlePointerUp);
      window.addEventListener('pointercancel', handlePointerUp);
    },
    [handleInteractionEnd, isEditable, transform, updateTransform]
  );

  const handleResizeStart = useCallback(
    (event) => {
      if (!isEditable || !containerRef.current) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();
      if (event.currentTarget?.setPointerCapture) {
        event.currentTarget.setPointerCapture(event.pointerId);
      }
      setIsResizing(true);
      document.body.style.userSelect = 'none';
      document.body.style.cursor = 'nwse-resize';

      const containerRect = containerRef.current.getBoundingClientRect();
      const startX = event.clientX;
      const startWidth = transform.width;

      const handlePointerMove = (moveEvent) => {
        const deltaRatio = (moveEvent.clientX - startX) / containerRect.width;
        updateTransform({
          centerX: transform.centerX,
          centerY: transform.centerY,
          width: startWidth + deltaRatio,
        });
      };

      const handlePointerUp = () => {
        window.removeEventListener('pointermove', handlePointerMove);
        window.removeEventListener('pointerup', handlePointerUp);
        window.removeEventListener('pointercancel', handlePointerUp);
        handleInteractionEnd();
      };

      window.addEventListener('pointermove', handlePointerMove);
      window.addEventListener('pointerup', handlePointerUp);
      window.addEventListener('pointercancel', handlePointerUp);
    },
    [handleInteractionEnd, isEditable, transform.centerX, transform.centerY, transform.width, updateTransform]
  );

  const handleDownload = useCallback(async () => {
    if (!designResult?.imageUrl || !shirtImageRef.current) {
      return;
    }

    try {
      const shirtImg = shirtImageRef.current;
      const baseWidth = shirtImg.naturalWidth || shirtImg.width;
      const baseHeight = shirtImg.naturalHeight || shirtImg.height;

      if (!baseWidth || !baseHeight) {
        throw new Error('T恤底图尺寸未知');
      }

      const designImg = new Image();
      designImg.crossOrigin = 'anonymous';
      const source = designResult.imageUrl;
      designImg.src = source;
      if (designImg.decode) {
        await designImg.decode();
      } else {
        await new Promise((resolve, reject) => {
          designImg.onload = resolve;
          designImg.onerror = reject;
        });
      }

      const canvas = document.createElement('canvas');
      canvas.width = baseWidth;
      canvas.height = baseHeight;
      const ctx = canvas.getContext('2d');

      ctx.drawImage(shirtImg, 0, 0, baseWidth, baseHeight);

      const overlayWidthPx = transform.width * baseWidth;
      const overlayHeightPx = overlayWidthPx * designAspectRatio;
      const centerX = transform.centerX * baseWidth;
      const centerY = transform.centerY * baseHeight;
      const drawX = centerX - overlayWidthPx / 2;
      const drawY = centerY - overlayHeightPx / 2;

      ctx.drawImage(designImg, drawX, drawY, overlayWidthPx, overlayHeightPx);

      const link = document.createElement('a');
      link.href = canvas.toDataURL('image/png');
      link.download = 'tshirt-design.png';
      link.click();
    } catch (downloadError) {
      console.error('下载合成图片失败:', downloadError);
      alert('保存图片失败，请稍后重试。');
    }
  }, [designAspectRatio, designResult?.imageUrl, transform.centerX, transform.centerY, transform.width]);

  const overlayStyle = useMemo(() => ({
    width: `${transform.width * 100}%`,
    top: `${transform.centerY * 100}%`,
    left: `${transform.centerX * 100}%`,
    transform: 'translate(-50%, -50%)',
    cursor: isDragging ? 'grabbing' : 'grab',
  }), [isDragging, transform.centerX, transform.centerY, transform.width]);

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 h-full flex flex-col">
      <h2 className="text-xl font-bold text-gray-800 mb-4">设计成果</h2>

      <div
        className={`flex-1 rounded-lg border-2 border-dashed flex items-center justify-center min-h-[300px] overflow-hidden ${
          error ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-gray-100'
        }`}
      >
        {error ? (
          <div className="text-center text-red-600 space-y-3 px-6">
            <p className="font-medium">生成失败</p>
            <p className="text-sm text-red-500">{error}</p>
            {onRetry && (
              <button
                onClick={onRetry}
                className="mt-2 inline-flex items-center px-3 py-1.5 bg-red-500 text-white text-sm rounded-md hover:bg-red-600"
              >
                重试
              </button>
            )}
          </div>
        ) : isLoading || designResult ? (
          <div ref={containerRef} className="relative w-full h-full flex items-center justify-center">
            <img
              ref={shirtImageRef}
              src={whiteShirtImage}
              alt="白色T恤底图"
              className="w-full h-full object-contain select-none"
            />

            {isLoading && (
              <div className="absolute inset-0 flex flex-col items-center justify-center space-y-4 bg-white/60">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                <p className="text-gray-700 font-medium">正在生成设计...</p>
              </div>
            )}

            {designResult?.imageUrl && (
              <div
                className={`absolute drop-shadow-xl transition-shadow duration-150 touch-none ${
                  isDragging || isResizing ? 'ring-2 ring-blue-400' : 'hover:ring-2 hover:ring-blue-300'
                }`}
                style={overlayStyle}
                onPointerDown={handleDragStart}
              >
                <img
                  src={designResult.imageUrl}
                  alt="生成设计图案"
                  className="w-full h-full object-contain select-none"
                  draggable={false}
                />
                <div
                  className="absolute bottom-[-12px] right-[-12px] w-6 h-6 bg-blue-500 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-md cursor-nwse-resize touch-none"
                  onPointerDown={handleResizeStart}
                >
                  ↘
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center text-gray-500">
            <svg
              className="w-16 h-16 mx-auto mb-4 text-gray-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <p className="text-lg font-medium">T恤设计将在这里显示</p>
            <p className="text-sm mt-2">上传宠物照片并输入提示词开始设计</p>
          </div>
        )}
      </div>

      {isEditable && (
        <p className="mt-3 text-xs text-gray-500">
          提示：按住图案拖动可调整位置，拖动右下角手柄可缩放大小。
        </p>
      )}

      {statusMessage && (
        <div className="mt-4 text-sm text-blue-600 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2">
          {statusMessage}
        </div>
      )}

      {designResult?.description && !isLoading && !error && (
        <div className="mt-4 bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm text-gray-700 leading-relaxed">
          {designResult.description}
        </div>
      )}

      {messageHistory.length > 0 && (
        <div className="mt-4">
          <h3 className="text-sm font-medium text-gray-700 mb-3">历史记录：</h3>
          <div className="space-y-3 max-h-48 overflow-y-auto">
            {messageHistory.map((message, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 text-sm font-medium">{index + 1}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-800">{message.prompt}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(message.timestamp).toLocaleString('zh-CN')}
                  </p>
                </div>
                {onReusePrompt && (
                  <button
                    onClick={() => onReusePrompt(message.prompt)}
                    className="flex-shrink-0 text-blue-500 hover:text-blue-600 text-sm"
                    disabled={isLoading}
                  >
                    重用
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {designResult && !isLoading && !error && (
        <div className="mt-6 flex justify-end">
          <button
            onClick={handleDownload}
            className="px-5 py-2 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition-colors duration-200"
          >
            保存合成图片
          </button>
        </div>
      )}
    </div>
  );
};

export default DesignDisplay;
