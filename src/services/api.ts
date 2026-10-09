import { GoogleGenAI } from '@google/genai';

const GEMINI_MODEL = 'gemini-2.5-flash';

// -------------------------------------------------------------
// Types for AI operations
// -------------------------------------------------------------
export interface DecomposeTaskRequest {
  title: string;
  category?: string;
  assignee?: string;
  durationHours?: number;
  description?: string;
}

export interface DecomposedMicroTask {
  title: string;
  category?: 'Legal Ops' | 'Finance' | 'IT Engineering' | 'Product Ops';
  durationHours?: number;
  xpReward?: number;
  description?: string;
}

export interface DecomposeTaskResponse {
  success?: boolean;
  tasks?: DecomposedMicroTask[];
  subtasks?: DecomposedMicroTask[];
  microTasks?: DecomposedMicroTask[];
  steps?: string[];
  durationHours?: number;
  xpReward?: number;
  message?: string;
}

export interface AskMentorRequest {
  message: string;
  taskTitle?: string;
  taskDescription?: string;
  taskId?: string;
  history?: Array<{ sender: 'user' | 'ai'; text: string }>;
}

export interface AskMentorResponse {
  reply?: string;
  answer?: string;
  response?: string;
  text?: string;
  message?: string;
  richContent?: {
    type: 'steps' | 'code' | 'warning';
    steps?: string[];
    code?: string;
    warning?: string;
  };
}

export interface VerifyProofRequest {
  imageUrl?: string;
  image?: string;
  filename?: string;
  isFakeScenario?: boolean;
  taskTitle?: string;
  clause?: string;
}

export interface VerifyProofResponse {
  verified?: boolean;
  success?: boolean;
  status?: 'success' | 'failure' | 'verified' | 'rejected' | string;
  confidence?: number;
  message?: string;
  explanation?: string;
  xpReward?: number;
}

interface ImageData {
  data: string;
  mimeType: string;
}

function getGeminiClient(): GoogleGenAI {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('VITE_GEMINI_API_KEY is not configured.');
  }

  return new GoogleGenAI({ apiKey });
}

async function generateJson(prompt: string): Promise<unknown> {
  const response = await getGeminiClient().models.generateContent({
    model: GEMINI_MODEL,
    contents: prompt,
    config: { responseMimeType: 'application/json' },
  });

  const text = response.text;
  if (!text) {
    throw new Error('Gemini returned an empty response.');
  }

  try {
    return JSON.parse(text) as unknown;
  } catch {
    throw new Error('Gemini returned an invalid JSON response.');
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function parseImageDataUrl(value: string): ImageData | null {
  const match = value.match(/^data:(image\/[a-zA-Z0-9.+-]+|application\/pdf);base64,(.+)$/);
  if (!match) return null;

  return { mimeType: match[1], data: match[2] };
}

function bytesToBase64(bytes: Uint8Array): string {
  let binary = '';
  const chunkSize = 0x8000;
  for (let offset = 0; offset < bytes.length; offset += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(offset, offset + chunkSize));
  }
  return btoa(binary);
}

async function loadImage(image: string): Promise<ImageData> {
  const dataUrl = parseImageDataUrl(image);
  if (dataUrl) return dataUrl;

  const response = await fetch(image);
  if (!response.ok) {
    throw new Error(`Unable to load proof image (${response.status} ${response.statusText}).`);
  }

  const mimeType = response.headers.get('content-type')?.split(';')[0];
  if (!mimeType?.startsWith('image/') && mimeType !== 'application/pdf') {
    throw new Error('The proof file must be an image or PDF.');
  }

  return {
    mimeType,
    data: bytesToBase64(new Uint8Array(await response.arrayBuffer())),
  };
}

/**
 * Decomposes a high-level task into manageable micro-tasks with Gemini.
 */
export async function decomposeTask(
  params: DecomposeTaskRequest
): Promise<DecomposeTaskResponse> {
  const result = await generateJson(
    `Break this work task into 3-6 practical micro-tasks. Return JSON with a "tasks" array. Each task must have a concise "title", a category selected from "Legal Ops", "Finance", "IT Engineering", or "Product Ops", a numeric "durationHours", a numeric "xpReward", and a short "description". You may include total numeric "durationHours" and "xpReward".

Task details:
${JSON.stringify(params)}`
  );

  if (!isRecord(result) || !Array.isArray(result.tasks)) {
    throw new Error('Gemini returned an invalid task breakdown.');
  }

  const tasks = result.tasks.map((task): DecomposedMicroTask => {
    if (!isRecord(task) || typeof task.title !== 'string' || !task.title.trim()) {
      throw new Error('Gemini returned a task without a valid title.');
    }

    const categories = ['Legal Ops', 'Finance', 'IT Engineering', 'Product Ops'] as const;
    const category = categories.find((item) => item === task.category);
    return {
      title: task.title,
      ...(category ? { category } : {}),
      ...(typeof task.durationHours === 'number' ? { durationHours: task.durationHours } : {}),
      ...(typeof task.xpReward === 'number' ? { xpReward: task.xpReward } : {}),
      ...(typeof task.description === 'string' ? { description: task.description } : {}),
    };
  });

  return {
    tasks,
    ...(typeof result.durationHours === 'number' ? { durationHours: result.durationHours } : {}),
    ...(typeof result.xpReward === 'number' ? { xpReward: result.xpReward } : {}),
  };
}

/**
 * Communicates with the AI Mentor Copilot using Gemini.
 */
export async function askMentor(params: AskMentorRequest): Promise<AskMentorResponse> {
  const result = await generateJson(
    `You are an AI mentor helping an employee complete a work task. Reply helpfully and concisely. Return JSON with a required string "reply". Optionally return "richContent" with "type" set to "steps", "code", or "warning", and the relevant "steps", "code", or "warning" fields.

Current task:
${JSON.stringify({
      title: params.taskTitle,
      description: params.taskDescription,
      id: params.taskId,
    })}

Recent conversation:
${JSON.stringify(params.history || [])}

Employee message:
${params.message}`
  );

  if (!isRecord(result) || typeof result.reply !== 'string') {
    throw new Error('Gemini returned an invalid mentor response.');
  }

  const richContent = result.richContent;
  if (!isRecord(richContent)) return { reply: result.reply };

  const type = richContent.type;
  if (type !== 'steps' && type !== 'code' && type !== 'warning') {
    return { reply: result.reply };
  }

  return {
    reply: result.reply,
    richContent: {
      type,
      ...(Array.isArray(richContent.steps) &&
      richContent.steps.every((step) => typeof step === 'string')
        ? { steps: richContent.steps }
        : {}),
      ...(typeof richContent.code === 'string' ? { code: richContent.code } : {}),
      ...(typeof richContent.warning === 'string' ? { warning: richContent.warning } : {}),
    },
  };
}

/**
 * Verifies document or screenshot proof of task completion with Gemini Vision.
 */
export async function verifyProof(
  params: VerifyProofRequest
): Promise<VerifyProofResponse> {
  const imageSource = params.image || params.imageUrl;
  if (!imageSource) {
    throw new Error('A proof image is required.');
  }

  const image = await loadImage(imageSource);
  const response = await getGeminiClient().models.generateContent({
    model: GEMINI_MODEL,
    contents: [
      {
        role: 'user',
        parts: [
          {
            text: `Assess whether this image is credible visual proof for the task "${params.taskTitle || 'work task'}", especially ${params.clause || 'the requested requirements'}. Treat the image itself as the evidence; do not assume it is valid based on its filename. Return JSON with boolean "verified", numeric "confidence" from 0 to 1, a concise "message", an "explanation", and numeric "xpReward" (50 if verified, otherwise 0).`,
          },
          { inlineData: image },
        ],
      },
    ],
    config: { responseMimeType: 'application/json' },
  });

  if (!response.text) {
    throw new Error('Gemini returned an empty proof verification response.');
  }

  let result: unknown;
  try {
    result = JSON.parse(response.text) as unknown;
  } catch {
    throw new Error('Gemini returned an invalid proof verification response.');
  }

  if (!isRecord(result) || typeof result.verified !== 'boolean') {
    throw new Error('Gemini returned an invalid proof verification result.');
  }

  return {
    verified: result.verified,
    status: result.verified ? 'verified' : 'rejected',
    ...(typeof result.confidence === 'number' ? { confidence: result.confidence } : {}),
    ...(typeof result.message === 'string' ? { message: result.message } : {}),
    ...(typeof result.explanation === 'string' ? { explanation: result.explanation } : {}),
    ...(typeof result.xpReward === 'number' ? { xpReward: result.xpReward } : {}),
  };
}
