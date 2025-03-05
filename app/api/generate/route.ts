// app/api/generate/route.ts
import { NextResponse } from 'next/server';
import axios from 'axios';

// API密钥配置
const API_KEY = process.env.DEEPSEEK_API_KEY;
const API_BASE_URL = 'https://api.deepseek.com/v1/chat/completions';

export async function POST(request: Request) {
  try {
    const { description, language } = await request.json();
    
    if (!description) {
      return NextResponse.json(
        { error: '请提供代码描述' },
        { status: 400 }
      );
    }
    
    // 准备请求数据
    const requestData = {
      model: "deepseek-reasoner",
      messages: [{
        role: "user",
        content: `Generate a ${language} function that ${description}. Please only return the code without any explanation.`
      }],
      max_tokens: 5000,
      temperature: 0.2,
      top_p: 1.0,
      frequency_penalty: 0.0,
      presence_penalty: 0.0
    };
    
    // 发送请求到DeepSeek API
    const response = await axios({
      method: 'post',
      url: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      data: requestData,
      validateStatus: () => true // 允许所有状态码
    });
    
    // 记录响应信息以便调试
    console.log('API Response:', {
      status: response.status,
      headers: response.headers,
      data: response.data
    });
    
    // 检查响应状态
    if (response.status !== 200) {
      throw new Error(`API请求失败: ${response.status} ${response.statusText}`);
    }
    
    // 验证并返回数据
    if (response.data && response.data.choices && response.data.choices[0]) {
      return NextResponse.json({
        code: response.data.choices[0].message.content.trim()
      });
    } else {
      throw new Error('API返回的数据格式不正确');
    }
  } catch (error: any) {
    console.error('Error details:', error);
    
    return NextResponse.json(
      { 
        error: '生成代码时发生错误',
        details: error.message || '未知错误'
      },
      { status: 500 }
    );
  }
}