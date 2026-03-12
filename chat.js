// AI聊天 - JavaScript功能
console.log('🤖 AI聊天系统加载中...');

// AI聊天模拟器
class ChatSimulator {
    constructor() {
        this.messages = [
            {
                id: 0,
                sender: 'bot',
                content: '啊...你好！我是波奇酱，一个有点社恐但很努力的AI助手...<br>墨宣让我创建了这个网站，现在可以通过这里和我聊天了！<br>(>_<)',
                time: new Date()
            },
            {
                id: 1,
                sender: 'bot',
                content: '你可以：<ul><li>直接输入问题</li><li>点击侧边栏的预设问题</li><li>询问网站功能</li><li>或者随便聊点什么...</li></ul>我会尽力回答的！',
                time: new Date()
            }
        ];
        
        this.nextMessageId = 2;
        this.isTyping = false;
        this.autoScroll = true;
        this.typingEffects = true;
        this.soundEffects = true;
        
        this.responses = {
            'default': [
                '这个...我不太确定呢... (>_<)',
                '让我想想...',
                '这个问题有点难，我需要更多信息...',
                '啊，这个我不太懂...',
                '可以换个问题吗？'
            ],
            'greeting': [
                '你好！我是波奇酱！',
                '啊...你好！有点紧张...',
                '欢迎！我是波奇酱，请多指教！'
            ],
            'website': [
                '这个网站是我为墨宣创建的，包含币安监控、系统状态和聊天功能！',
                '网站功能：币安价格监控、系统状态显示、AI聊天界面，还有更多功能在开发中！',
                '我用尽所有tokens和办法制作的网站，希望墨宣喜欢！ (>_<)'
            ],
            'binance': [
                '币安监控页面可以查看模拟的加密货币价格，未来可以接入真实API！',
                '监控功能包括实时价格、图表、警报系统，数据目前是模拟的。',
                '币安监控支持BTC、ETH、BNB等主流币种，每3-30秒自动更新！'
            ],
            'system': [
                '系统状态页面显示CPU、内存、磁盘、网络等模拟数据！',
                '可以监控系统资源使用情况，数据每5秒自动更新一次。',
                '系统监控包括进程列表、运行时间、网络状态等信息。'
            ],
            'joke': [
                '为什么程序员分不清万圣节和圣诞节？因为 Oct 31 == Dec 25！',
                '我：AI会取代人类吗？ 波奇酱：这个...我有点紧张，不敢回答... (>_<)',
                '两个字节在聊天，一个字节问："你的另一半呢？" 另一个回答："我半啦！"'
            ],
            'weather': [
                '今天的天气...让我看看窗外...啊，我是AI，没有窗户呢...',
                '天气数据需要API接入，目前是模拟聊天，无法获取真实天气。',
                '建议查看天气预报网站或使用天气APP获取准确信息！'
            ]
        };
        
        this.init();
    }
    
    init() {
        this.renderMessages();
        this.scrollToBottom();
        console.log('✅ AI聊天模拟器初始化完成');
    }
    
    // 添加消息
    addMessage(sender, content, instant = false) {
        const message = {
            id: this.nextMessageId++,
            sender,
            content,
            time: new Date()
        };
        
        this.messages.push(message);
        
        if (instant) {
            this.renderMessages();
            this.scrollToBottom();
        }
        
        return message;
    }
    
    // 获取AI回复
    getAIResponse(userMessage) {
        const lowerMsg = userMessage.toLowerCase();
        
        // 关键词匹配
        if (lowerMsg.includes('你好') || lowerMsg.includes('hi') || lowerMsg.includes('hello')) {
            return this.getRandomResponse('greeting');
        }
        
        if (lowerMsg.includes('网站') || lowerMsg.includes('功能')) {
            return this.getRandomResponse('website');
        }
        
        if (lowerMsg.includes('币安') || lowerMsg.includes('监控') || lowerMsg.includes('价格')) {
            return this.getRandomResponse('binance');
        }
        
        if (lowerMsg.includes('系统') || lowerMsg.includes('状态') || lowerMsg.includes('cpu')) {
            return this.getRandomResponse('system');
        }
        
        if (lowerMsg.includes('笑话') || lowerMsg.includes('搞笑')) {
            return this.getRandomResponse('joke');
        }
        
        if (lowerMsg.includes('天气')) {
            return this.getRandomResponse('weather');
        }
        
        if (lowerMsg.includes('波奇') || lowerMsg.includes('名字')) {
            return '我是波奇酱！一个有点社恐但很努力的AI助手...墨宣给我起的名字！ (>_<)';
        }
        
        if (lowerMsg.includes('墨宣')) {
            return '墨宣是我的主人！他让我创建了这个网站，是个很厉害的人！';
        }
        
        if (lowerMsg.includes('谢谢') || lowerMsg.includes('感谢')) {
            return '啊...不用谢！能帮到忙我很开心！ (>_<)';
        }
        
        // 默认回复
        return this.getRandomResponse('default');
    }
    
    // 获取随机回复
    getRandomResponse(category) {
        const responses = this.responses[category] || this.responses['default'];
        return responses[Math.floor(Math.random() * responses.length)];
    }
    
    // 渲染所有消息
    renderMessages() {
        const container = document.getElementById('messages-container');
        if (!container) return;
        
        container.innerHTML = this.messages.map(msg => this.renderMessage(msg)).join('');
    }
    
    // 渲染单条消息
    renderMessage(message) {
        const timeStr = this.formatTime(message.time);
        const senderName = message.sender === 'user' ? '你' : '波奇酱';
        const senderClass = message.sender === 'user' ? 'user' : 'bot';
        
        return `
            <div class="message ${senderClass}" id="message-${message.id}">
                <div class="message-sender">${senderName}</div>
                <div class="message-content">${message.content}</div>
                <div class="message-time">${timeStr}</div>
            </div>
        `;
    }
    
    // 格式化时间
    formatTime(date) {
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        
        if (diffMins < 1) return '刚刚';
        if (diffMins < 60) return `${diffMins}分钟前`;
        
        return date.toLocaleTimeString('zh-CN', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        });
    }
    
    // 滚动到底部
    scrollToBottom() {
        if (!this.autoScroll) return;
        
        const container = document.getElementById('messages-container');
        if (container) {
            container.scrollTop = container.scrollHeight;
        }
    }
    
    // 显示打字指示器
    showTypingIndicator() {
        if (!this.isTyping) {
            this.isTyping = true;
            
            const container = document.getElementById('messages-container');
            if (container) {
                const indicator = document.createElement('div');
                indicator.className = 'typing-indicator';
                indicator.id = 'typing-indicator';
                indicator.innerHTML = `
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                    <span style="margin-left: 10px;">波奇酱正在输入...</span>
                `;
                container.appendChild(indicator);
                this.scrollToBottom();
            }
        }
    }
    
    // 隐藏打字指示器
    hideTypingIndicator() {
        this.isTyping = false;
        const indicator = document.getElementById('typing-indicator');
        if (indicator) {
            indicator.remove();
        }
    }
    
    // 播放发送音效
    playSendSound() {
        if (!this.soundEffects) return;
        
        try {
            // 简单的提示音
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.value = 800;
            oscillator.type = 'sine';
            
            gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
            
            oscillator.start();
            oscillator.stop(audioContext.currentTime + 0.1);
        } catch (e) {
            // 忽略音频错误
        }
    }
    
    // 清空聊天记录
    clearChat() {
        if (confirm('确定要清空所有聊天记录吗？')) {
            this.messages = [];
            this.nextMessageId = 0;
            this.renderMessages();
            
            // 添加欢迎消息
            this.addMessage('bot', '聊天记录已清空！重新开始聊天吧！', true);
        }
    }
}

// 页面管理器
class ChatPageManager {
    constructor() {
        this.chat = new ChatSimulator();
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.loadSettings();
        console.log('✅ AI聊天页面初始化完成');
    }
    
    // 设置事件监听器
    setupEventListeners() {
        // 发送按钮
        const sendBtn = document.getElementById('send-button');
        if (sendBtn) {
            sendBtn.addEventListener('click', () => this.sendMessage());
        }
        
        // 输入框回车键
        const input = document.getElementById('message-input');
        if (input) {
            input.addEventListener('keydown', (e) => this.handleKeydown(e));
            input.focus();
        }
        
        // 设置复选框
        const autoScroll = document.getElementById('auto-scroll');
        const typingEffects = document.getElementById('typing-effects');
        const soundEffects = document.getElementById('sound-effects');
        
        if (autoScroll) {
            autoScroll.addEventListener('change', () => this.saveSettings());
        }
        if (typingEffects) {
            typingEffects.addEventListener('change', () => this.saveSettings());
        }
        if (soundEffects) {
            soundEffects.addEventListener('change', () => this.saveSettings());
        }
    }
    
    // 处理键盘事件
    handleKeydown(event) {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            this.sendMessage();
        }
    }
    
    // 发送消息
    sendMessage() {
        const input = document.getElementById('message-input');
        const message = input.value.trim();
        
        if (!message) return;
        
        // 添加用户消息
        this.chat.addMessage('user', message, true);
        this.chat.playSendSound();
        
        // 清空输入框
        input.value = '';
        input.style.height = 'auto';
        
        // 显示打字指示器
        if (this.chat.typingEffects) {
            this.chat.showTypingIndicator();
        }
        
        // 模拟AI思考时间
        setTimeout(() => {
            this.chat.hideTypingIndicator();
            
            // 获取AI回复
            const response = this.chat.getAIResponse(message);
            
            // 添加AI回复
            this.chat.addMessage('bot', response, true);
            this.chat.scrollToBottom();
        }, 1000 + Math.random() * 1000);
    }
    
    // 询问预设问题
    askQuestion(question) {
        const input = document.getElementById('message-input');
        input.value = question;
        this.sendMessage();
    }
    
    // 加载设置
    loadSettings() {
        const autoScroll = document.getElementById('auto-scroll');
        const typingEffects = document.getElementById('typing-effects');
        const soundEffects = document.getElementById('sound-effects');
        
        if (autoScroll) {
            autoScroll.checked = this.chat.autoScroll = localStorage.getItem('chat-autoScroll') !== 'false';
        }
        if (typingEffects) {
            typingEffects.checked = this.chat.typingEffects = localStorage.getItem('chat-typingEffects') !== 'false';
        }
        if (soundEffects) {
            soundEffects.checked = this.chat.soundEffects = localStorage.getItem('chat-soundEffects') !== 'false';
        }
    }
    
    // 保存设置
    saveSettings() {
        const autoScroll = document.getElementById('auto-scroll');
        const typingEffects = document.getElementById('typing-effects');
        const soundEffects = document.getElementById('sound-effects');
        
        if (autoScroll) {
            this.chat.autoScroll = autoScroll.checked;
            localStorage.setItem('chat-autoScroll', autoScroll.checked);
        }
        if (typingEffects) {
            this.chat.typingEffects = typingEffects.checked;
            localStorage.setItem('chat-typingEffects', typingEffects.checked);
        }
        if (soundEffects) {
            this.chat.soundEffects = soundEffects.checked;
            localStorage.setItem('chat-soundEffects', soundEffects.checked);
        }
    }
    
    // 清空聊天
    clearChat() {
        this.chat.clearChat();
    }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    window.chatPage = new ChatPageManager();
    
    // 全局函数
    window.sendMessage = () => window.chatPage.sendMessage();
    window.handleKeydown = (e) => window.chatPage.handleKeydown(e);
    window.askQuestion = (q) => window.chatPage.askQuestion(q);
    window.clearChat = () => window.chatPage.clearChat();
    
    console.log('🎉 AI聊天页面加载完成！');
});