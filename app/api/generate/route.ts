// app/api/generate/route.ts
import { NextResponse } from 'next/server';
import axios from 'axios';

export const config = {
  maxDuration: 300000, // Extend Vercel function timeout if possible
};

export async function POST(request: Request) {
  try {
    // Parse request body
    let reqBody;
    try {
      reqBody = await request.json();
    } catch (e) {
      console.error('Failed to parse request JSON:', e);
      return NextResponse.json({ error: '无效的请求数据' }, { status: 400 });
    }
    
    const { description, language } = reqBody;
    
    if (!description) {
      return NextResponse.json({ error: '请提供代码描述' }, { status: 400 });
    }
    
    // Use environment variable for API key
    const API_KEY = process.env.DEEPSEEK_API_KEY;
    if (!API_KEY) {
      console.error('未配置API密钥');
      return NextResponse.json({ error: 'API配置错误' }, { status: 500 });
    }
    
    console.log(`Processing request for language: ${language}, description length: ${description.length}`);
    
    // Prepare request data
    const requestData = {
      model: "deepseek-reasoner",
      messages: [{
        role: "user",
        content: `Generate a ${language} function that ${description}. Please only return the code without any explanation.`
      }],
      max_tokens: 1000,
      temperature: 0.2,
      top_p: 1.0
    };
    
    // Use a longer timeout
    const response = await axios({
      method: 'post',
      url: 'https://api.deepseek.com/v1/chat/completions',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      data: requestData,
      timeout: 2500000, // Increased timeout
      validateStatus: () => true // Allow all status codes
    });
    
    console.log(`API response status: ${response.status}`);
    
    // Handle error responses
    if (response.status !== 200) {
      let errorMsg = '与AI服务通信时出错';
      
      console.error('API error:', response.status, response.data);
      
      // Safely extract error message
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
    
    // Validate and return data
    if (response.data?.choices?.[0]?.message?.content) {
      const generatedCode = response.data.choices[0].message.content.trim();
      console.log('Successfully generated code');
      return NextResponse.json({
        code: generatedCode
      });
    } else {
      console.error('Invalid API response format:', response.data);
      return NextResponse.json({ error: 'API返回的数据格式不正确' }, { status: 500 });
    }
  } catch (error: any) {
    // Ensure valid JSON response
    let errorMessage = '生成代码时发生错误';
    
    console.error('Unhandled error:', error);
    
    if (error.name === 'AxiosError' && error.code === 'ECONNABORTED') {
      errorMessage = '请求超时，请稍后再试或简化您的请求';
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }
    
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
