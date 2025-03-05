// app/api/generate/route.ts
import { NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(request: Request) {
  try {
    // 解析请求体
    let reqBody;
    try {
      reqBody = await request.json();
    } catch (e) {
      return NextResponse.json({ error: '无效的请求数据' }, { status: 400 });
    }
    
    const { description, language } = reqBody;
    
    if (!description) {
      return NextResponse.json({ error: '请提供代码描述' }, { status: 400 });
    }
    
    const API_KEY = process.env.DEEPSEEK_API_KEY;
    if (!API_KEY) {
      console.error('未配置API密钥');
      return NextResponse.json({ error: 'API配置错误' }, { status: 500 });
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
      top_p: 1.0
    };
    
    // 使用较短的超时时间
    const response = await axios({
      method: 'post',
      url: 'https://api.deepseek.com/v1/chat/completions',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      data: requestData,
      timeout: 8000, // 8秒超时，给Vercel留出处理时间
      validateStatus: () => true // 允许所有状态码
    });
    
    // 处理错误响应
    if (response.status !== 200) {
      let errorMsg = '与AI服务通信时出错';
      
      // 安全地提取错误消息
      if (response.data && typeof response.data === 'object') {
        if (response.data.error && response.data.error.message) {
          errorMsg = response.data.error.message;
        } else if (response.data.message) {
          errorMsg = response.data.message;
        }
      }
      
      return NextResponse.json({ 
        error: errorMsg,
        status: response.status
      }, { status: 500 });
    }
    
    // 验证并返回数据
    if (response.data?.choices?.[0]?.message?.content) {
      return NextResponse.json({
        code: response.data.choices[0].message.content.trim()
      });
    } else {
      return NextResponse.json({ error: 'API返回的数据格式不正确' }, { status: 500 });
    }
  } catch (error: any) {
    // 确保返回有效的JSON响应
    let errorMessage = '生成代码时发生错误';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}