import { getApiKey } from '../config/apiKeyStore';
import promptConfig from '../prompts/tshirtDesignerPrompt.json';

const GOOGLE_API_BASE = 'https://generativelanguage.googleapis.com/v1beta';
const MODEL_ID = import.meta.env.VITE_GEMINI_IMAGE_MODEL || 'models/gemini-2.5-flash-image-preview:generateContent';
const SYSTEM_PROMPT = Array.isArray(promptConfig.systemPromptLines)
  ? promptConfig.systemPromptLines.join('\n')
  : (promptConfig.systemPrompt ?? '').toString();

class ModelResponseError extends Error {
  constructor(message, payload, status) {
    super(message);
    this.name = 'ModelResponseError';
    this.payload = payload;
    if (status) {
      this.status = status;
    }
  }
}

const buildEndpoint = (apiKey) => {
  const base = `${GOOGLE_API_BASE}/${MODEL_ID}`;
  const url = new URL(base);
  if (apiKey) {
    url.searchParams.set('key', apiKey);
  }
  return url.toString();
};

const arrayBufferToBase64 = (buffer) => {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    const chunk = bytes.subarray(i, i + chunkSize);
    binary += String.fromCharCode.apply(null, chunk);
  }
  return btoa(binary);
};

const fileToBase64 = async (file) => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    return arrayBufferToBase64(arrayBuffer);
  } catch (error) {
    console.error('读取图片文件失败', error);
    throw new Error('无法读取上传的图片文件');
  }
};

const buildRequestPayload = ({ prompt, images }) => {
  const cleanedPrompt = prompt?.trim();

  if (!Array.isArray(images) || images.length === 0) {
    throw new Error('模型请求缺少有效的图像数据');
  }

  const imageParts = images.map(({ data, mimeType }) => ({
    inline_data: {
      mime_type: mimeType || 'image/png',
      data,
    },
  }));

  const parts = cleanedPrompt
    ? [...imageParts, { text: cleanedPrompt }]
    : imageParts;

  return {
    systemInstruction: {
      role: 'system',
      parts: [{ text: SYSTEM_PROMPT }],
    },
    contents: [
      {
        role: 'user',
        parts,
      },
    ],
  };
};

const extractInlineData = (part) => {
  if (!part || typeof part !== 'object') {
    return null;
  }

  const candidate = part.inline_data || part.inlineData;
  if (!candidate) {
    return null;
  }

  return {
    data: candidate.data,
    mimeType: candidate.mime_type || candidate.mimeType || 'image/png',
  };
};

const parseDesignResponse = async (response) => {
  const payload = await response.json();

  console.debug('[Gemini] 原始响应 payload:', payload);

  const parts = payload?.candidates?.[0]?.content?.parts || [];
  const inlineData = parts
    .map(extractInlineData)
    .find((item) => item && item.data);

  if (!inlineData || !inlineData.data) {
    throw new ModelResponseError(
      payload?.error?.message || 'AI 模型未返回图像数据',
      payload,
      response.status
    );
  }

  return {
    imageUrl: `data:${inlineData.mimeType};base64,${inlineData.data}`,
    raw: payload,
  };
};

export const generateDesign = async ({ imageFiles, imageFile, prompt }) => {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error('缺少 Google Nano Banana API Key，请先配置。');
  }

  const files = [
    ...((Array.isArray(imageFiles) ? imageFiles : []).filter(Boolean)),
    ...(imageFile ? [imageFile] : []),
  ].slice(0, 3);

  if (!files.length) {
    throw new Error('请先上传宠物照片。');
  }

  const endpoint = buildEndpoint(apiKey);
  const imagePayloads = await Promise.all(
    files.map(async (file) => ({
      data: await fileToBase64(file),
      mimeType: file.type,
    }))
  );
  const payload = buildRequestPayload({
    prompt,
    images: imagePayloads,
  });

  let response;

  try {
    response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
  } catch (networkError) {
    console.error('调用 Gemini API 发生网络错误', networkError);
    throw new ModelResponseError('模型调用失败：网络请求异常', null);
  }

  if (!response.ok) {
    let errorPayload = null;
    let errorMessage = `模型调用失败：${response.status}`;

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      try {
        errorPayload = await response.json();
        errorMessage = errorPayload?.error?.message
          ? `模型调用失败：${response.status} ${errorPayload.error.message}`
          : errorMessage;
      } catch (error) {
        console.error('解析模型错误响应失败', error);
      }
    } else {
      try {
        const text = await response.text();
        if (text) {
          errorPayload = { raw: text };
          errorMessage = `${errorMessage} ${text}`;
        }
      } catch (error) {
        console.error('读取模型错误响应文本失败', error);
      }
    }

    throw new ModelResponseError(errorMessage, errorPayload, response.status);
  }

  try {
    return await parseDesignResponse(response);
  } catch (error) {
    if (error instanceof ModelResponseError) {
      throw error;
    }

    console.error('解析模型响应失败', error);
    throw new ModelResponseError(error.message, null, response.status);
  }
};

export { ModelResponseError };
