'use client';
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

export default function Home() {
  const [description, setDescription] = useState('');
  const [language, setLanguage] = useState('Python');
  const [generatedCode, setGeneratedCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const generateCode = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      const response = await fetch('http://localhost:3001/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          description,
          language,
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || '生成代码失败');
      }

      setGeneratedCode(data.code);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error('Error details:', err);
      setError(err.message || '生成代码时发生错�?');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>AI代码生成�?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                编程语言
              </label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full p-2 border rounded-md bg-white"
              >
                <option value="Python">Python</option>
                <option value="JavaScript">JavaScript</option>
                <option value="Java">Java</option>
                <option value="C++">C++</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                描述你想要生成的代码功能
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full h-32 p-2 border rounded-md"
                placeholder="例如：创建一个计算数字列表平均值的函数"
              />
            </div>

            <Button 
              onClick={generateCode} 
              disabled={!description || isLoading}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  生成�?...
                </>
              ) : (
                '生成代码'
              )}
            </Button>

            {error && (
              <div className="p-4 bg-red-50 text-red-500 rounded-md">
                {error}
              </div>
            )}

            {generatedCode && (
              <div>
                <label className="block text-sm font-medium mb-2">
                  生成的代�?
                </label>
                <pre className="bg-gray-100 p-4 rounded-md overflow-x-auto">
                  <code>{generatedCode}</code>
                </pre>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}