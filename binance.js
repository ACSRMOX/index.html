// 币安监控 - JavaScript功能
console.log('📊 币安监控系统加载中...');

// 模拟币安数据
class BinanceSimulator {
    constructor() {
        this.symbols = [
            { symbol: 'BTCUSDT', name: '比特币', price: 65000, volatility: 0.02 },
            { symbol: 'ETHUSDT', name: '以太坊', price: 3500, volatility: 0.03 },
            { symbol: 'BNBUSDT', name: '币安币', price: 500, volatility: 0.04 },
            { symbol: 'SOLUSDT', name: 'Solana', price: 150, volatility: 0.05 },
            { symbol: 'XRPUSDT', name: '瑞波币', price: 0.6, volatility: 0.06 },
            { symbol: 'ADAUSDT', name: 'Cardano', price: 0.5, volatility: 0.07 }
        ];
        
        this.priceHistory = {};
        this.alerts = [];
        this.updateInterval = 3000; // 默认3秒
        this.chart = null;
        this.chartData = {};
        this.alertsEnabled = true;
        
        this.init();
    }
    
    init() {
        // 初始化价格历史
        this.symbols.forEach(s => {
            this.priceHistory[s.symbol] = [s.price];
            this.chartData[s.symbol] = [];
            
            // 生成初始历史数据
            for (let i = 0; i < 20; i++) {
                this.updatePrice(s);
                this.chartData[s.symbol].push({
                    x: new Date(Date.now() - (20 - i) * 30000),
                    y: this.priceHistory[s.symbol][i]
                });
            }
        });
        
        // 初始化警报
        this.loadSampleAlerts();
        
        console.log('✅ 币安模拟器初始化完成');
    }
    
    // 更新价格（模拟市场波动）
    updatePrice(symbolInfo) {
        const change = (Math.random() - 0.5) * 2 * symbolInfo.volatility;
        symbolInfo.price *= (1 + change);
        symbolInfo.price = Math.max(symbolInfo.price, symbolInfo.price * 0.5); // 防止归零
        
        // 记录价格历史
        this.priceHistory[symbolInfo.symbol].push(symbolInfo.price);
        if (this.priceHistory[symbolInfo.symbol].length > 100) {
            this.priceHistory[symbolInfo.symbol].shift();
        }
        
        // 更新图表数据
        this.chartData[symbolInfo.symbol].push({
            x: new Date(),
            y: symbolInfo.price
        });
        
        if (this.chartData[symbolInfo.symbol].length > 20) {
            this.chartData[symbolInfo.symbol].shift();
        }
        
        // 检查警报
        this.checkAlerts(symbolInfo);
        
        return {
            symbol: symbolInfo.symbol,
            name: symbolInfo.name,
            price: symbolInfo.price.toFixed(2),
            change: (change * 100).toFixed(2),
            timestamp: new Date().toISOString()
        };
    }
    
    // 获取所有价格
    getAllPrices() {
        return this.symbols.map(s => this.updatePrice(s));
    }
    
    // 获取单个价格
    getPrice(symbol) {
        const symbolInfo = this.symbols.find(s => s.symbol === symbol);
        return symbolInfo ? this.updatePrice(symbolInfo) : null;
    }
    
    // 检查警报条件
    checkAlerts(symbolInfo) {
        if (!this.alertsEnabled) return;
        
        const price = symbolInfo.price;
        const symbol = symbolInfo.symbol;
        
        // 示例警报条件
        if (symbol === 'BTCUSDT' && price > 66000) {
            this.addAlert(`${symbol} 突破 $66,000`, `当前价格: $${price.toFixed(2)}`);
        }
        
        if (symbol === 'ETHUSDT' && price < 3400) {
            this.addAlert(`${symbol} 跌破 $3,400`, `当前价格: $${price.toFixed(2)}`);
        }
        
        // 24小时变化超过3%
        const history = this.priceHistory[symbol];
        if (history.length > 10) {
            const oldPrice = history[history.length - 10];
            const change = (price - oldPrice) / oldPrice;
            
            if (Math.abs(change) > 0.03) {
                const direction = change > 0 ? '上涨' : '下跌';
                this.addAlert(
                    `${symbol} 波动超过 3%`,
                    `${direction} ${Math.abs(change * 100).toFixed(1)}%，当前: $${price.toFixed(2)}`
                );
            }
        }
    }
    
    // 添加警报
    addAlert(title, message) {
        const alert = {
            id: Date.now(),
            title,
            message,
            time: new Date(),
            read: false
        };
        
        this.alerts.unshift(alert);
        
        // 限制警报数量
        if (this.alerts.length > 20) {
            this.alerts.pop();
        }
        
        // 更新UI
        this.updateAlertDisplay();
        
        // 播放提示音（如果允许）
        if (this.alertsEnabled) {
            this.playAlertSound();
        }
        
        return alert;
    }
    
    // 播放提示音
    playAlertSound() {
        try {
            const audio = new Audio('data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAZGF0YQQAAAAAAA==');
            audio.volume = 0.3;
            audio.play().catch(() => {});
        } catch (e) {
            // 忽略音频错误
        }
    }
    
    // 更新警报显示
    updateAlertDisplay() {
        const alertList = document.getElementById('alert-list');
        if (!alertList) return;
        
        alertList.innerHTML = this.alerts.slice(0, 5).map(alert => `
            <div class="alert-item">
                <div>
                    <strong>${alert.title}</strong>
                    <p>${alert.message}</p>
                </div>
                <span class="alert-time">${this.formatTimeAgo(alert.time)}</span>
            </div>
        `).join('');
    }
    
    // 加载示例警报
    loadSampleAlerts() {
        this.addAlert('系统启动', '币安监控系统已启动，使用模拟数据');
        this.addAlert('BTC/USDT 监控', '开始监控比特币价格波动');
        this.addAlert('ETH/USDT 监控', '开始监控以太坊价格波动');
    }
    
    // 清空警报
    clearAlerts() {
        this.alerts = [];
        this.updateAlertDisplay();
    }
    
    // 切换警报状态
    toggleAlerts() {
        this.alertsEnabled = !this.alertsEnabled;
        return this.alertsEnabled;
    }
    
    // 格式化时间差
    formatTimeAgo(date) {
        const seconds = Math.floor((new Date() - date) / 1000);
        
        if (seconds < 60) return '刚刚';
        if (seconds < 3600) return `${Math.floor(seconds / 60)}分钟前`;
        if (seconds < 86400) return `${Math.floor(seconds / 3600)}小时前`;
        return `${Math.floor(seconds / 86400)}天前`;
    }
    
    // 设置更新间隔
    setUpdateInterval(ms) {
        this.updateInterval = ms;
    }
}

// 图表管理器
class ChartManager {
    constructor(simulator) {
        this.simulator = simulator;
        this.chart = null;
        this.currentSymbol = 'BTCUSDT';
        
        this.init();
    }
    
    init() {
        this.createChart();
        this.updateChart();
    }
    
    // 创建图表
    createChart() {
        const ctx = document.getElementById('price-chart');
        if (!ctx) return;
        
        this.chart = new Chart(ctx.getContext('2d'), {
            type: 'line',
            data: {
                datasets: [{
                    label: '价格',
                    data: [],
                    borderColor: '#667eea',
                    backgroundColor: 'rgba(102, 126, 234, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        labels: {
                            color: 'white'
                        }
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                        backgroundColor: 'rgba(0, 0, 0, 0.7)',
                        titleColor: 'white',
                        bodyColor: 'white'
                    }
                },
                scales: {
                    x: {
                        type: 'time',
                        time: {
                            unit: 'minute',
                            displayFormats: {
                                minute: 'HH:mm'
                            }
                        },
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        ticks: {
                            color: 'rgba(255, 255, 255, 0.7)'
                        }
                    },
                    y: {
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        ticks: {
                            color: 'rgba(255, 255, 255, 0.7)',
                            callback: function(value) {
                                return '$' + value.toLocaleString();
                            }
                        }
                    }
                }
            }
        });
    }
    
    // 更新图表数据
    updateChart(symbol = this.currentSymbol) {
        if (!this.chart) return;
        
        this.currentSymbol = symbol;
        const data = this.simulator.chartData[symbol] || [];
        
        this.chart.data.datasets[0].data = data;
        this.chart.data.datasets[0].label = `${symbol} 价格`;
        this.chart.update();
    }
    
    // 切换显示币种
    changeSymbol(symbol) {
        this.currentSymbol = symbol;
        this.updateChart(symbol);
    }
}

// 页面管理器
class PageManager {
    constructor() {
        this.simulator = new BinanceSimulator();
        this.chartManager = new ChartManager(this.simulator);
        this.updateTimer = null;
        this.lastUpdateTime = new Date();
        
        this.init();
    }
    
    init() {
        this.renderPriceCards();
        this.startAutoUpdate();
        this.setupEventListeners();
        this.updateLastUpdateTime();
        
        console.log('✅ 页面管理器初始化完成');
    }
    
    // 渲染价格卡片
    renderPriceCards() {
        const prices = this.simulator.getAllPrices();
        const grid = document.getElementById('price-grid');
        
        if (!grid) return;
        
        grid.innerHTML = prices.map(price => {
            const change = parseFloat(price.change);
            const changeClass = change >= 0 ? 'positive' : 'negative';
            const changeSymbol = change >= 0 ? '↗' : '↘';
            
            return `
                <div class="price-card">
                    <div class="price-header">
                        <div class="symbol">${price.symbol}</div>
                        <div class="change ${changeClass}">
                            ${changeSymbol} ${Math.abs(change)}%
                        </div>
                    </div>
                    <div class="price">$${parseFloat(price.price).toLocaleString()}</div>
                    <div style="opacity: 0.7; font-size: 0.9rem;">
                        ${price.name} | ${new Date(price.timestamp).toLocaleTimeString('zh-CN', {hour12: false})}
                    </div>
                    <div class="chart-container">
                        <canvas id="mini-chart-${price.symbol}" height="60"></canvas>
                    </div>
                </div>
            `;
        }).join('');
        
        // 创建迷你图表
        prices.forEach(price => {
            this.createMiniChart(price.symbol);
        });
    }
    
    // 创建迷你图表
    createMiniChart(symbol) {
        const ctx = document.getElementById(`mini-chart-${symbol}`);
        if (!ctx) return;
        
        const history = this.simulator.priceHistory[symbol] || [];
        const isPositive = history[history.length - 1] >= history[0];
        
        new Chart(ctx.getContext('2d'), {
            type: 'line',
            data: {
                labels: Array(history.length).fill(''),
                datasets: [{
                    data: history,
                    borderColor: isPositive ? '#4ade80' : '#ef4444',
                    backgroundColor: 'transparent',
                    borderWidth: 2,
                    tension: 0.4,
                    pointRadius: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: { enabled: false }
                },
                scales: {
                    x: { display: false },
                    y: { display: false }
                }
            }
        });
    }
    
    // 开始自动更新
    startAutoUpdate() {
        if (this.updateTimer) {
            clearInterval(this.updateTimer);
        }
        
        this.updateTimer = setInterval(() => {
            this.renderPriceCards();
            this.chartManager.updateChart();
            this.updateLastUpdateTime();
        }, this.simulator.updateInterval);
    }
    
    // 设置更新间隔
    setUpdateInterval(type) {
        const intervals = {
            fast: 3000,
            normal: 10000,
            slow: 30000
        };
        
        this.simulator.setUpdateInterval(intervals[type]);
        this.startAutoUpdate();
        
        // 更新按钮状态
        document.querySelectorAll('.control-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        event.target.classList.add('active');
    }
    
    // 刷新所有数据
    refreshAllData() {
        this.renderPriceCards();
        this.chartManager.updateChart();
        this.updateLastUpdateTime();
        
        // 添加反馈
        const btn = event.target;
        const originalText = btn.textContent;
        btn.textContent = '✅ 已刷新';
        setTimeout(() => {
            btn.textContent = originalText;
        }, 1000);
    }
    
    // 切换警报状态
    toggleAlerts() {
        const enabled = this.simulator.toggleAlerts();
        const statusEl = document.getElementById('alert-status');
        const btn = event.target;
        
        statusEl.textContent = enabled ? '开启' : '关闭';
        btn.style.background = enabled ? 'rgba(74, 222, 128, 0.2)' : 'rgba(239, 68, 68, 0.2)';
    }
    
    // 添加测试警报
    addTestAlert() {
        const symbols = ['BTCUSDT', 'ETHUSDT', 'BNBUSDT'];
        const symbol = symbols[Math.floor(Math.random() * symbols.length)];
        const price = this.simulator.getPrice(symbol);
        
        if (price) {
            this.simulator.addAlert(
                `测试警报: ${symbol}`,
                `测试价格: $${price.price}，变化: ${price.change}%`
            );
        }
    }
    
    // 清空警报
    clearAlerts() {
        this.simulator.clearAlerts();
    }
    
    // 更新最后更新时间
    updateLastUpdateTime() {
        this.lastUpdateTime = new Date();
        const el = document.getElementById('last-update');
        if (el) {
            el.textContent = this.lastUpdateTime.toLocaleTimeString('zh-CN', {hour12: false});
        }
    }
    
    // 设置事件监听器
    setupEventListeners() {
        // 图表币种选择
        const chartSelect = document.getElementById('chart-symbol');
        if (chartSelect) {
            chartSelect.addEventListener('change', (e) => {
                this.chartManager.changeSymbol(e.target.value);
            });
        }
    }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    window.binancePage = new PageManager();
    
    // 全局函数
    window.setInterval = (type) => window.binancePage.setUpdateInterval(type);
    window.refreshAllData = () => window.binancePage.refreshAllData();
    window.toggleAlerts = () => window.binancePage.toggleAlerts();
    window.addTestAlert = () => window.binancePage.addTestAlert();
    window.clearAlerts = () => window.binancePage.clearAlerts();
    window.updateChart = () => window.binancePage.chartManager.updateChart();
    
    console.log('🎉 币安监控页面加载完成！');
});