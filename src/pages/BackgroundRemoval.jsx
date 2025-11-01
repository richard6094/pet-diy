import React, { useState, useCallback, useEffect } from 'react';
import { removeBackground } from '@imgly/background-removal';

const BackgroundRemovalPage = () => {
  const [sourceFile, setSourceFile] = useState(null);
  const [sourcePreview, setSourcePreview] = useState(null);
  const [resultUrl, setResultUrl] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);

  const handleFileChange = useCallback((event) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    if (!file.type?.startsWith('image/')) {
      setError('请上传 PNG 或 JPG 等图片文件');
      return;
    }

    setError(null);
    setSourceFile(file);
    if (resultUrl) {
      URL.revokeObjectURL(resultUrl);
    }
    setResultUrl(null);

    const reader = new FileReader();
    reader.onload = () => setSourcePreview(reader.result);
    reader.onerror = () => setError('无法预览所选图片');
    reader.readAsDataURL(file);
  }, [resultUrl]);

  const handleProcess = useCallback(async () => {
    if (!sourceFile) {
      setError('请先上传一张需要处理的图片');
      return;
    }

    setIsProcessing(true);
    setError(null);
    setResultUrl(null);

    try {
      const resultBlob = await removeBackground(sourceFile, {
        output: {
          format: 'image/png',
        },
      });

      if (resultUrl) {
        URL.revokeObjectURL(resultUrl);
      }

      const objectUrl = URL.createObjectURL(resultBlob);
      setResultUrl(objectUrl);
    } catch (err) {
      console.error('背景移除失败', err);
      setError(err?.message || '处理失败，请稍后重试');
    } finally {
      setIsProcessing(false);
    }
  }, [sourceFile, resultUrl]);

  const handleDownload = useCallback(() => {
    if (!resultUrl) return;
    const link = document.createElement('a');
    link.href = resultUrl;
    link.download = 'transparent-result.png';
    link.click();
  }, [resultUrl]);

    useEffect(() => {
      return () => {
        if (resultUrl) {
          URL.revokeObjectURL(resultUrl);
        }
      };
    }, [resultUrl]);

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center py-10 px-4">
      <div className="w-full max-w-5xl bg-white shadow-xl rounded-2xl p-8">
        <header className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">背景透明处理</h1>
          <p className="text-gray-600 text-sm">
            上传一张边缘清晰但带背景的 PNG 或 JPG，算法会提取前景并生成透明背景的 PNG 文件。
          </p>
        </header>

        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 bg-gray-50 text-center">
              <input
                id="background-removal-upload"
                type="file"
                accept="image/png,image/jpeg,image/jpg"
                className="hidden"
                onChange={handleFileChange}
              />
              <label
                htmlFor="background-removal-upload"
                className="cursor-pointer inline-flex flex-col items-center justify-center w-full h-full space-y-4"
              >
                <span className="text-6xl">📁</span>
                <div>
                  <p className="text-gray-800 font-medium">点击或拖拽图片到此处上传</p>
                  <p className="text-gray-500 text-sm mt-1">建议使用分辨率较高、主体边缘清晰的 PNG/JPG</p>
                </div>
              </label>
            </div>

            {sourcePreview && (
              <div className="rounded-xl overflow-hidden shadow-md">
                <img src={sourcePreview} alt="原始图片预览" className="w-full object-contain bg-white" />
              </div>
            )}

            <div className="flex space-x-4">
              <button
                onClick={handleProcess}
                disabled={isProcessing || !sourceFile}
                className="flex-1 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white font-medium py-3 rounded-lg transition-colors duration-200"
              >
                {isProcessing ? '处理中...' : '开始处理'}
              </button>
              <button
                onClick={() => {
                  if (resultUrl) {
                    URL.revokeObjectURL(resultUrl);
                  }
                  setSourceFile(null);
                  setSourcePreview(null);
                  setResultUrl(null);
                  setError(null);
                }}
                className="px-5 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium rounded-lg transition-colors duration-200"
              >
                清空
              </button>
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}
          </div>

          <div className="space-y-4">
            <div className="h-[360px] border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center bg-gray-50">
              {isProcessing ? (
                <div className="flex flex-col items-center space-y-3">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
                  <p className="text-gray-600">正在生成透明背景...</p>
                </div>
              ) : resultUrl ? (
                <div className="w-full h-full flex flex-col items-center justify-center px-4 py-6">
                  <div className="bg-white border rounded-lg overflow-hidden shadow">
                    <img src={resultUrl} alt="透明背景结果" className="max-h-64 object-contain" />
                  </div>
                  <button
                    onClick={handleDownload}
                    className="mt-4 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium rounded-lg"
                  >
                    下载透明PNG
                  </button>
                </div>
              ) : (
                <p className="text-gray-500 text-sm">处理完成后，透明背景结果将展示在此处</p>
              )}
            </div>

            <div className="bg-blue-50 rounded-xl p-4 text-sm text-blue-800 leading-relaxed">
              <h2 className="text-base font-semibold text-blue-900 mb-2">使用建议</h2>
              <ul className="list-disc list-inside space-y-1">
                <li>选择主体轮廓清晰、与背景对比明显的图片效果最佳。</li>
                <li>处理结果为 PNG 格式，背景完全透明，可直接用于设计工具。</li>
                <li>如需进一步微调边缘，可导入到 Photopea / Photoshop 等软件中细修。</li>
              </ul>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default BackgroundRemovalPage;
