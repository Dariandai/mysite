---
title: 'Running AI Locally'
titleCn: '在本地跑AI：从折腾到真香'
date: '2025-08-11'
description: 'WSL2 + llama.cpp/vLLM 部署踩坑记录'
---

前段时间毕设要做RAG，想着总不能每次调API都花钱吧，于是开始研究怎么在本地跑大模型。折腾了一周，从完全不懂到现在能流畅对话，记录一下踩过的坑。

## 为什么选择本地部署

最开始图省事，用的是在线API。但几个问题让我受不了：

- 网络不稳定，经常超时
- 数据要发到服务器，毕设等个人数据敏感
- 调用次数多了真的贵

本地部署虽然折腾，但跑起来之后是真的很爽。自己的机器，想怎么玩怎么玩。

## 我的环境

- Windows 11 + WSL2 (Ubuntu 22.04)
- RTX 3050 4G显存


这个配置跑7B以下的量化模型还是没什么问题的，甚至能同时跑两个量化较好的服务。

## 第一步：搞定WSL2

如果你也在Windows上开发，WSL2是必须的。安装很简单：

```bash
wsl --install
```

装好之后记得更新系统，然后装一些基础工具：

```bash
sudo apt update
sudo apt install aria2 git build-essential
```

`aria2`是多线程下载工具，下模型的时候比浏览器快多了。

## 第二步：搞模型文件

我主要用GGUF格式的模型，这是llama.cpp专用的量化格式，体积小加载快。

下载方式有几种：

**1. 直接下载（适合小模型）**
```bash
mkdir -p ~/models
cd ~/models
# 用aria2多线程下载
aria2c -x 4 -s 4 "模型下载链接"
```

**2. 从Windows复制（我常用的）**
```bash
# 把D盘的模型复制到WSL
mkdir -p ~/models
cp /mnt/d/Models/Qwen2.5.Q6_K.gguf ~/models/
```

**3. 用hfd脚本（适合HuggingFace上的模型）**
```bash
./hfd.sh microsoft/Phi-4-mini-instruct --local-dir ~/models/Phi-4
```
或者也可去魔搭社区下载模型。

## 第三步：llama.cpp 快速上手

如果你只想快速跑起来对话，llama.cpp是最简单的选择。

**编译（一次性）**
```bash
git clone https://github.com/ggerganov/llama.cpp.git
cd llama.cpp
make
```

**启动服务**
```bash
./bin/llama-server -m ~/models/Qwen2.5.gguf \
  --host 0.0.0.0 \
  --port 9090
```

然后打开浏览器访问 `http://localhost:9090`，就能看到聊天界面了。

## 第四步：vLLM 部署（生产级）

llama.cpp适合本地使用，但如果要接入RAG或者做API调用，vLLM更合适。它兼容OpenAI的API格式，直接替换base_url就能用。

**安装vLLM**
```bash
pip install vllm
```

**启动服务（以Phi-3为例）**
```bash
python -m vllm.entrypoints.openai.api_server \
  --model ~/models/Phi-3-mini-128k-instruct.Q4_K_M.gguf \
  --served-model-name Phi-3-mini \
  --quantization gguf \
  --max-model-len 1536 \
  --gpu-memory-utilization 0.8 \
  --port 5000
```

几个关键参数解释：

- `--max-model-len`: 模型最大上下文长度，显存小就设小点
- `--gpu-memory-utilization`: GPU显存占用比例，留点余地给系统
- `--quantization gguf`: 声明这是GGUF格式
- `--enforce-eager`: 如果遇到CUDA错误，加上这个试试

**测试API**
```bash
curl http://localhost:5000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "Phi-3-mini",
    "messages": [{"role": "user", "content": "你好"}],
    "max_tokens": 512,
    "temperature": 0.7
  }'
```

## 推荐模型


**Phi-4-mini**
- 微软出品，体积小（3.8B参数）
- 适合写代码，逻辑清晰


## 调参与踩坑

**temperature设置**
- 0.1-0.3: 确定性输出，适合代码生成
- 0.5-0.7: 平衡，日常对话用这个
- 0.8+: 创意写作，但可能胡言乱语

**遇到CUDA OOM**
- 减小 `--max-model-len`
- 降低 `--gpu-memory-utilization`
- 用更小量化的模型（Q4_K_M换成Q4_K）

**WSL2内存不够**
在Windows用户目录创建 `.wslconfig`：
```
[wsl2]
memory=24GB
processors=8
```

## 写在最后

本地部署AI最大的好处是掌控感。你可以随意调参，换不同的模型，不用担心API限流或者涨价。

当然缺点也很明显：折腾。但对我这种喜欢折腾的人来说，这反而是乐趣。

我的毕设RAG系统就跑在本地Qwen2.5上，响应速度比在线API还快。

如果你也在考虑本地部署，希望这篇记录能帮你少走点弯路。
