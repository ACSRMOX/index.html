// 波奇酱的网站 - JavaScript功能
console.log('🦞 波奇酱的网站脚本加载完成！');

// 网站功能类
class WebsiteFeatures {
    constructor() {
        this.init();
    }
    
    init() {
        this.setupTheme();
        this.setupAnimations();
        this.setupEvents();
        this.showWelcomeMessage();
    }
    
    // 设置主题（未来可扩展）
    setupTheme() {
        const savedTheme = localStorage.getItem('website-theme') || 'light';
        document.body.setAttribute('data-theme', savedTheme);
    }
    
    // 设置动画
    setupAnimations() {
        // 滚动动画
        this.setupScrollAnimation();
        
        // 卡片入场动画
        this.animateCardsOnLoad();
    }
    
    // 设置事件监听
    setupEvents() {
        // 窗口大小变化
        window.addEventListener('resize', this.handleResize.bind(this));
        
        // 滚动事件
        window.addEventListener('scroll', this.handleScroll.bind(this));
        
        // 点击外部卡片关闭所有tooltip
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.tooltip')) {
                this.hideAllTooltips();
            }
        });
    }
    
    // 显示欢迎消息
    showWelcomeMessage() {
        const messages = [
            '欢迎来到波奇酱的网站！ (>_<)',
            '墨宣，希望你喜欢这个网站！',
            '用尽tokens的力量制作的网站！',
            '紧张但努力完成中...'
        ];
        
        const randomMsg = messages[Math.floor(Math.random() * messages.length)];
        console.log(`%c${randomMsg}`, 'color: #667eea; font-size: 16px; font-weight: bold;');
        
        // 在控制台显示可爱ASCII艺术
        console.log(`
        　　∧＿∧
        　（　´∀｀）
        　（　　　　）
        　｜ ｜　|
        　（_＿）＿）
        　🦞 波奇酱参上！
        `);
    }
    
    // 滚动动画
    setupScrollAnimation() {
        const observerOptions = {
            root: null,
            rootMargin: '0px',
            threshold: 0.1
        };
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                }
            });
        }, observerOptions);
        
        // 观察所有卡片
        document.querySelectorAll('.card').forEach(card => {
            observer.observe(card);
        });
    }
    
    // 卡片加载动画
    animateCardsOnLoad() {
        const cards = document.querySelectorAll('.card');
        cards.forEach((card, index) => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            
            setTimeout(() => {
                card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, index * 100);
        });
    }
    
    // 处理窗口大小变化
    handleResize() {
        console.log(`窗口大小: ${window.innerWidth} x ${window.innerHeight}`);
    }
    
    // 处理滚动
    handleScroll() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const header = document.querySelector('header');
        
        if (scrollTop > 100) {
            header.style.opacity = '0.9';
            header.style.transform = 'scale(0.98)';
        } else {
            header.style.opacity = '1';
            header.style.transform = 'scale(1)';
        }
    }
    
    // 隐藏所有tooltip
    hideAllTooltips() {
        document.querySelectorAll('.tooltip-text').forEach(tooltip => {
            tooltip.style.visibility = 'hidden';
            tooltip.style.opacity = '0';
        });
    }
    
    // 工具函数：获取随机颜色
    static getRandomColor() {
        const colors = ['#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe', '#00f2fe'];
        return colors[Math.floor(Math.random() * colors.length)];
    }
    
    // 工具函数：格式化时间
    static formatTime(date) {
        return date.toLocaleTimeString('zh-CN', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    }
}

// 币安数据模拟（未来可替换为真实API）
class BinanceDataSimulator {
    constructor() {
        this.prices = {
            'BTC/USDT': 65000 + Math.random() * 1000,
            'ETH/USDT': 3500 + Math.random() * 100,
            'BNB/USDT': 500 + Math.random() * 10
        };
    }
    
    getPrice(symbol) {
        // 模拟价格波动
        const change = (Math.random() - 0.5) * 0.02; // ±2%
        this.prices[symbol] *= (1 + change);
        
        return {
            symbol,
            price: this.prices[symbol].toFixed(2),
            change: (change * 100).toFixed(2) + '%',
            timestamp: new Date().toISOString()
        };
    }
    
    getAllPrices() {
        return Object.keys(this.prices).map(symbol => this.getPrice(symbol));
    }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    // 初始化网站功能
    window.website = new WebsiteFeatures();
    
    // 初始化币安数据模拟器
    window.binanceSim = new BinanceDataSimulator();
    
    // 添加一些动态效果
    addDynamicEffects();
    
    // 移除加载动画（如果有）
    setTimeout(() => {
        const loading = document.querySelector('.loading');
        if (loading) {
            loading.classList.add('hidden');
            setTimeout(() => loading.remove(), 500);
        }
    }, 1000);
});

// 添加动态效果
function addDynamicEffects() {
    // 为emoji添加浮动效果
    const emoji = document.querySelector('.emoji');
    if (emoji) {
        emoji.classList.add('floating');
    }
    
    // 添加点击效果到卡片
    document.querySelectorAll('.card').forEach(card => {
        card.addEventListener('click', function() {
            this.style.transform = 'scale(0.98)';
            setTimeout(() => {
                this.style.transform = '';
            }, 150);
        });
    });
    
    // 添加键盘快捷键
    document.addEventListener('keydown', (e) => {
        // Ctrl+R 刷新数据
        if (e.ctrlKey && e.key === 'r') {
            e.preventDefault();
            refreshData();
        }
        
        // ESC 隐藏所有tooltip
        if (e.key === 'Escape') {
            window.website.hideAllTooltips();
        }
    });
}

// 全局刷新函数
function refreshData() {
    console.log('刷新网站数据...');
    
    // 更新时间
    updateTime();
    
    // 显示刷新反馈
    const event = new CustomEvent('dataRefreshed', {
        detail: { timestamp: new Date() }
    });
    window.dispatchEvent(event);
    
    // 如果有币安数据区域，更新它
    const binanceSection = document.getElementById('binance-data');
    if (binanceSection && window.binanceSim) {
        updateBinanceData();
    }
}

// 更新币安数据（模拟）
function updateBinanceData() {
    const prices = window.binanceSim.getAllPrices();
    const container = document.getElementById('binance-data');
    
    if (container) {
        container.innerHTML = prices.map(p => `
            <div class="price-item">
                <strong>${p.symbol}</strong>: $${p.price}
                <span class="change ${p.change.startsWith('-') ? 'negative' : 'positive'}">
                    ${p.change}
                </span>
            </div>
        `).join('');
    }
}

// 导出全局函数
window.refreshData = refreshData;
window.updateBinanceData = updateBinanceData;