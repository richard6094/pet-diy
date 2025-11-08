import { removeBackground } from '@imgly/background-removal';

const toDataUrl = (blob) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('无法读取处理后的图像数据'));
    reader.readAsDataURL(blob);
  });

const loadImageFromBlob = (blob) =>
  new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(blob);
    const image = new Image();
    image.crossOrigin = 'anonymous';
    image.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('无法载入处理后的图像内容'));
    };
    image.src = objectUrl;
  });

const cropTransparentBorders = async (blob, alphaThreshold = 8) => {
  const image = await loadImageFromBlob(blob);
  const width = image.naturalWidth || image.width;
  const height = image.naturalHeight || image.height;

  if (!width || !height) {
    return {
      blob,
      dataUrl: await toDataUrl(blob),
      width,
      height,
      cropBox: null,
    };
  }

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  ctx.drawImage(image, 0, 0);

  const { data } = ctx.getImageData(0, 0, width, height);

  let minX = width;
  let minY = height;
  let maxX = -1;
  let maxY = -1;

  for (let y = 0; y < height; y += 1) {
    const rowOffset = y * width;
    for (let x = 0; x < width; x += 1) {
      const index = (rowOffset + x) * 4 + 3;
      const alpha = data[index];
      if (alpha > alphaThreshold) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }

  if (maxX === -1 || maxY === -1) {
    return {
      blob,
      dataUrl: await toDataUrl(blob),
      width,
      height,
      cropBox: null,
    };
  }

  const cropWidth = Math.max(1, maxX - minX + 1);
  const cropHeight = Math.max(1, maxY - minY + 1);

  const cropCanvas = document.createElement('canvas');
  cropCanvas.width = cropWidth;
  cropCanvas.height = cropHeight;
  const cropCtx = cropCanvas.getContext('2d');
  cropCtx.drawImage(canvas, minX, minY, cropWidth, cropHeight, 0, 0, cropWidth, cropHeight);

  const croppedBlob = await new Promise((resolve, reject) => {
    cropCanvas.toBlob((result) => {
      if (result) {
        resolve(result);
      } else {
        reject(new Error('无法生成裁剪后的图像数据'));
      }
    }, 'image/png');
  });

  return {
    blob: croppedBlob,
    dataUrl: await toDataUrl(croppedBlob),
    width: cropWidth,
    height: cropHeight,
    cropBox: {
      left: minX,
      top: minY,
      right: maxX,
      bottom: maxY,
      originalWidth: width,
      originalHeight: height,
    },
  };
};

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

  try {
    return await cropTransparentBorders(resultBlob);
  } catch (error) {
    console.warn('裁剪透明边框失败，返回原始背景移除结果', error);
    return {
      blob: resultBlob,
      dataUrl: await toDataUrl(resultBlob),
      width: undefined,
      height: undefined,
      cropBox: null,
    };
  }
};
