const express = require('express');
const cors = require('cors');
const axios = require('axios');
const app = express();

// 中间件设置
app.use(cors());
app.use(express.json());

// API密钥配置
const API_KEY = 'sk-24b2614bab2947d484cc217a98b90b39';
const API_BASE_URL = 'https://api.deepseek.com/v1/chat/completions';

// 代码生成接口
app.post('/api/generate', async (req, res) => {
    try {
        const { description, language } = req.body;

        if (!description) {
            return res.status(400).json({ error: '请提供代码描述' });
        }

        // 准备请求数据
        const requestData = {
            model: "gpt-3.5-turbo",
            messages: [{
                role: "user",
                content: `Generate a ${language} function that ${description}. Please only return the code without any explanation.`
            }],
            max_tokens: 150,
            temperature: 0.2,
            top_p: 1.0,
            frequency_penalty: 0.0,
            presence_penalty: 0.0
        };

        // 发送请求到API
        const response = await axios({
            method: 'post',
            url: `${API_BASE_URL}/chat/completions`,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_KEY}`
            },
            data: requestData,
            validateStatus: false // 允许所有状态码
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
            return res.json({
                code: response.data.choices[0].message.content.trim()
            });
        } else {
            throw new Error('API返回的数据格式不正确');
        }

    } catch (error) {
        console.error('Error details:', error);
        res.status(500).json({
            error: '生成代码时发生错误',
            details: error.message
        });
    }
});

// 错误处理中间件
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        error: '服务器错误',
        details: err.message
    });
});

// 启动服务器
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});