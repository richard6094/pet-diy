import { removeBackground } from '@imgly/background-removal';

const toDataUrl = (blob) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('无法读取处理后的图像数据'));
    reader.readAsDataURL(blob);
  });

export const removeBackgroundFromImageUrl = async (imageUrl, options = {}) => {
  const response = await fetch(imageUrl);
  if (!response.ok) {
    throw new Error('无法加载模型生成的图像内容');
  }

  const imageBlob = await response.blob();
  const resultBlob = await removeBackground(imageBlob, {
    output: { format: 'image/png' },
    ...options,
  });

  return {
    blob: resultBlob,
    dataUrl: await toDataUrl(resultBlob),
  };
};
