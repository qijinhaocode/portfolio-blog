import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

// 定义反馈数据的类型
interface FeedbackEntry {
  name: string;
  message: string;
  date: string;
}

// 定义 data/feedback.json 文件的路径
const feedbackFilePath = path.join(process.cwd(), 'data', 'feedback.json');

// 安全地读取反馈文件
async function getFeedback(): Promise<FeedbackEntry[]> {
  try {
    const data = await fs.readFile(feedbackFilePath, 'utf-8');
    return JSON.parse(data) as FeedbackEntry[];
  } catch (error) {
    // 如果文件不存在或为空，返回空数组
    return [];
  }
}

// 处理 GET 请求，返回所有反馈
export async function GET() {
  const feedback = await getFeedback();
  return NextResponse.json(feedback);
}

// 处理 POST 请求，添加新反馈
export async function POST(request: Request) {
  const { name, message } = await request.json();

  // 基本的输入验证
  if (!name || !message) {
    return NextResponse.json(
      { error: 'Name and message are required.' },
      { status: 400 }
    );
  }

  const newFeedback: FeedbackEntry = {
    name,
    message,
    date: new Date().toISOString(),
  };

  const feedback = await getFeedback();
  feedback.unshift(newFeedback); // 将新反馈添加到列表开头

  // 将更新后的列表写回文件
  await fs.writeFile(feedbackFilePath, JSON.stringify(feedback, null, 2));

  return NextResponse.json(newFeedback, { status: 201 });
}
