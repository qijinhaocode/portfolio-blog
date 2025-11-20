"use client";

import { useState, useEffect, FormEvent } from 'react';

// 定义反馈条目的类型
interface Feedback {
  name: string;
  message: string;
  date: string;
}

export default function FeedbackPage() {
  const [feedbackList, setFeedbackList] = useState<Feedback[]>([]);
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 组件加载时获取历史反馈
  useEffect(() => {
    const fetchFeedback = async () => {
      try {
        setIsLoading(true);
        const res = await fetch('/api/feedback');
        if (!res.ok) throw new Error('未能加载反馈列表');
        const data: Feedback[] = await res.json();
        setFeedbackList(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : '发生未知错误');
      } finally {
        setIsLoading(false);
      }
    };

    fetchFeedback();
  }, []);

  // 处理表单提交
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !message.trim()) {
      alert('请填写你的名字和反馈内容。');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, message }),
      });

      if (!res.ok) throw new Error('提交失败，请稍后再试。');
      
      const newFeedback = await res.json();
      setFeedbackList([newFeedback, ...feedbackList]); // 立即更新UI
      setName('');
      setMessage('');
    } catch (err) {
      alert(err instanceof Error ? err.message : '发生未知错误');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
          留下你的反馈
        </h1>
        <p className="mt-4 text-lg text-gray-600">
          有任何建议或想法？欢迎告诉我！
        </p>
      </div>

      <div className="mt-10 max-w-xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 rounded-lg shadow-md">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              你的名字
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
              disabled={isSubmitting}
            />
          </div>
          <div>
            <label htmlFor="message" className="block text-sm font-medium text-gray-700">
              内容
            </label>
            <textarea
              id="message"
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
              disabled={isSubmitting}
            />
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300"
          >
            {isSubmitting ? '提交中...' : '提交反馈'}
          </button>
        </form>
      </div>

      <div className="mt-16">
        <h2 className="text-2xl font-semibold text-center text-gray-800">历史反馈</h2>
        <div className="mt-8 border-t border-gray-200 pt-8">
          {isLoading ? (
            <p className="text-center text-gray-500">正在加载反馈...</p>
          ) : error ? (
            <p className="text-center text-red-500">{error}</p>
          ) : feedbackList.length > 0 ? (
            <ul className="space-y-8 max-w-xl mx-auto">
              {feedbackList.map((fb, index) => (
                <li key={index} className="bg-white p-5 rounded-lg shadow">
                  <div className="flex justify-between items-start">
                    <p className="font-semibold text-gray-900">{fb.name}</p>
                    <p className="text-xs text-gray-500 flex-shrink-0 ml-4">
                      {new Date(fb.date).toLocaleString('zh-CN')}
                    </p>
                  </div>
                  <p className="mt-3 text-gray-700 whitespace-pre-wrap">{fb.message}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-center text-gray-500 py-10">还没有反馈，快来抢沙发吧！</p>
          )}
        </div>
      </div>
    </div>
  );
}