import { getApiKey } from '../config/apiKeyStore';

const GOOGLE_API_BASE = 'https://generativelanguage.googleapis.com/v1beta';
const MODEL_ID = import.meta.env.VITE_GEMINI_IMAGE_MODEL || 'models/gemini-2.5-flash-image-preview:generateContent';
const SYSTEM_PROMPT = [
  '你是一名T恤图案设计助手，必须返回背景为纯白色 (#FFFFFF) 的 PNG 图像。',
  '主体需要拥有清晰、干净且可识别的边缘，便于后续抠图处理。',
  '不要添加阴影或渐变背景，确保设计居中并完整呈现主体。',
].join('\n');

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

const buildRequestPayload = ({ prompt, imageBase64, imageType }) => {
  const cleanedPrompt = prompt?.trim();

  const imagePart = {
    inline_data: {
      mime_type: imageType || 'image/png',
      data: imageBase64,
    },
  };

  const promptPart = cleanedPrompt
    ? { text: cleanedPrompt }
    : null;

  const parts = promptPart ? [imagePart, promptPart] : [imagePart];

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

export const generateDesign = async ({ imageFile, prompt }) => {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error('缺少 Google Nano Banana API Key，请先配置。');
  }

  if (!imageFile) {
    throw new Error('请先上传一张宠物照片。');
  }

  const endpoint = buildEndpoint(apiKey);
  const imageBase64 = await fileToBase64(imageFile);
  const payload = buildRequestPayload({
    prompt,
    imageBase64,
    imageType: imageFile.type,
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
