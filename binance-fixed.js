// 币安监控 - 修复版本
console.log('📊 币安监控系统加载中...');

// 简单价格模拟器（避免Chart.js问题）
class SimplePriceSimulator {
    constructor() {
        this.symbols = [
            { symbol: 'BTCUSDT', name: '比特币', price: 65000, change: 0 },
            { symbol: 'ETHUSDT', name: '以太坊', price: 3500, change: 0 },
            { symbol: 'BNBUSDT', name: '币安币', price: 500, change: 0 },
            { symbol: 'SOLUSDT', name: 'Solana', price: 150, change: 0 },
            { symbol: 'XRPUSDT', name: '瑞波币', price: 0.6, change: 0 },
            { symbol: 'ADAUSDT', name: 'Cardano', price: 0.5, change: 0 }
        ];
        
        this.updateInterval = 3000; // 3秒
        this.updateTimer = null;
        this.isRunning = false;
        
        this.init();
    }
    
    init() {
        console.log('✅ 简单价格模拟器初始化');
        this.updateAllPrices();
        this.startAutoUpdate();
        
        // 初始显示
        this.updateDisplay();
    }
    
    // 更新所有价格
    updateAllPrices() {
        this.symbols.forEach(symbol => {
            const oldPrice = symbol.price;
            const changePercent = (Math.random() - 0.5) * 0.1; // ±5%
            const changeAmount = oldPrice * changePercent;
            symbol.price = oldPrice + changeAmount;
            symbol.change = changePercent * 100;
            
            // 确保价格合理
            if (symbol.price < 0.01) symbol.price = 0.01;
        });
        
        console.log('🔄 价格已更新');
    }
    
    // 更新显示
    updateDisplay() {
        const container = document.getElementById('price-cards');
        if (!container) {
            console.error('❌ 找不到价格卡片容器');
            return;
        }
        
        container.innerHTML = this.symbols.map(symbol => `
            <div class="price-card">
                <div class="symbol-header">
                    <span class="symbol-name">${symbol.name}</span>
                    <span class="symbol-code">${symbol.symbol}</span>
                </div>
                <div class="price-info">
                    <div class="current-price">$${symbol.price.toFixed(2)}</div>
                    <div class="price-change ${symbol.change >= 0 ? 'positive' : 'negative'}">
                        ${symbol.change >= 0 ? '↗' : '↘'} ${Math.abs(symbol.change).toFixed(2)}%
                    </div>
                </div>
                <div class="price-history">
                    <div class="history-bar" style="width: ${50 + symbol.change * 10}%; 
                         background: ${symbol.change >= 0 ? '#4ade80' : '#ef4444'};"></div>
                </div>
                <div class="card-footer">
                    <span>更新时间: ${new Date().toLocaleTimeString('zh-CN', {hour12: false})}</span>
                </div>
            </div>
        `).join('');
        
        // 更新统计信息
        this.updateStats();
    }
    
    // 更新统计信息
    updateStats() {
        const totalChange = this.symbols.reduce((sum, s) => sum + s.change, 0);
        const avgChange = totalChange / this.symbols.length;
        const gainers = this.symbols.filter(s => s.change > 0).length;
        const losers = this.symbols.filter(s => s.change < 0).length;
        
        const statsEl = document.getElementById('market-stats');
        if (statsEl) {
            statsEl.innerHTML = `
                <div class="stat-item">
                    <span>平均涨跌</span>
                    <span class="${avgChange >= 0 ? 'positive' : 'negative'}">${avgChange.toFixed(2)}%</span>
                </div>
                <div class="stat-item">
                    <span>上涨币种</span>
                    <span class="positive">${gainers}个</span>
                </div>
                <div class="stat-item">
                    <span>下跌币种</span>
                    <span class="negative">${losers}个</span>
                </div>
                <div class="stat-item">
                    <span>更新时间</span>
                    <span>${new Date().toLocaleTimeString('zh-CN', {hour12: false})}</span>
                </div>
            `;
        }
    }
    
    // 开始自动更新
    startAutoUpdate() {
        if (this.isRunning) return;
        
        this.isRunning = true;
        this.updateTimer = setInterval(() => {
            this.updateAllPrices();
            this.updateDisplay();
        }, this.updateInterval);
        
        console.log('🔄 自动更新已启动');
    }
    
    // 停止自动更新
    stopAutoUpdate() {
        if (this.updateTimer) {
            clearInterval(this.updateTimer);
            this.updateTimer = null;
            this.isRunning = false;
            console.log('⏸️ 自动更新已停止');
        }
    }
    
    // 切换自动更新
    toggleAutoUpdate() {
        if (this.isRunning) {
            this.stopAutoUpdate();
            return false;
        } else {
            this.startAutoUpdate();
            return true;
        }
    }
    
    // 手动刷新
    manualRefresh() {
        this.updateAllPrices();
        this.updateDisplay();
        
        // 按钮反馈
        const btn = event?.target;
        if (btn) {
            const originalText = btn.textContent;
            btn.textContent = '✅ 已刷新';
            setTimeout(() => {
                btn.textContent = originalText;
            }, 1000);
        }
    }
    
    // 模拟价格暴涨（测试用）
    simulatePump() {
        this.symbols.forEach(symbol => {
            symbol.price *= 1.1; // 上涨10%
            symbol.change = 10;
        });
        this.updateDisplay();
        
        // 5秒后恢复
        setTimeout(() => {
            this.updateAllPrices();
            this.updateDisplay();
        }, 5000);
    }
    
    // 模拟价格暴跌（测试用）
    simulateDump() {
        this.symbols.forEach(symbol => {
            symbol.price *= 0.9; // 下跌10%
            symbol.change = -10;
        });
        this.updateDisplay();
        
        // 5秒后恢复
        setTimeout(() => {
            this.updateAllPrices();
            this.updateDisplay();
        }, 5000);
    }
}

// 页面管理器
class BinancePageManager {
    constructor() {
        this.simulator = new SimplePriceSimulator();
        
        this.init();
    }
    
    init() {
        console.log('✅ 币安页面管理器初始化');
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        // 刷新按钮
        const refreshBtn = document.querySelector('button[onclick="refreshPrices()"]');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.refreshPrices());
        }
        
        // 自动更新切换按钮
        const autoUpdateBtn = document.querySelector('button[onclick="toggleAutoUpdate()"]');
        if (autoUpdateBtn) {
            autoUpdateBtn.addEventListener('click', () => this.toggleAutoUpdate());
        }
        
        // 测试按钮
        const pumpBtn = document.querySelector('button[onclick="simulatePump()"]');
        if (pumpBtn) {
            pumpBtn.addEventListener('click', () => this.simulatePump());
        }
        
        const dumpBtn = document.querySelector('button[onclick="simulateDump()"]');
        if (dumpBtn) {
            dumpBtn.addEventListener('click', () => this.simulateDump());
        }
        
        // 间隔选择
        const intervalSelect = document.getElementById('update-interval');
        if (intervalSelect) {
            intervalSelect.addEventListener('change', (e) => this.changeInterval(e.target.value));
        }
    }
    
    refreshPrices() {
        this.simulator.manualRefresh();
    }
    
    toggleAutoUpdate() {
        const enabled = this.simulator.toggleAutoUpdate();
        const statusEl = document.getElementById('auto-update-status');
        const btn = event.target;
        
        if (statusEl) {
            statusEl.textContent = enabled ? '开启' : '关闭';
        }
        
        if (btn) {
            btn.style.background = enabled ? 
                'rgba(74, 222, 128, 0.2)' : 'rgba(239, 68, 68, 0.2)';
        }
    }
    
    simulatePump() {
        this.simulator.simulatePump();
        
        const btn = event.target;
        const originalText = btn.textContent;
        btn.textContent = '🚀 暴涨模拟中...';
        setTimeout(() => {
            btn.textContent = originalText;
        }, 5000);
    }
    
    simulateDump() {
        this.simulator.simulateDump();
        
        const btn = event.target;
        const originalText = btn.textContent;
        btn.textContent = '📉 暴跌模拟中...';
        setTimeout(() => {
            btn.textContent = originalText;
        }, 5000);
    }
    
    changeInterval(seconds) {
        this.simulator.updateInterval = parseInt(seconds) * 1000;
        
        if (this.simulator.isRunning) {
            this.simulator.stopAutoUpdate();
            this.simulator.startAutoUpdate();
        }
        
        console.log(`🔄 更新间隔改为: ${seconds}秒`);
    }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    console.log('🎉 币安监控页面加载完成！');
    
    // 检查必要元素
    if (!document.getElementById('price-cards')) {
        console.error('❌ 页面结构不完整，正在修复...');
        // 尝试创建必要元素
        const main = document.querySelector('.binance-container .dashboard-grid');
        if (main) {
            main.innerHTML = `
                <div id="price-cards" style="grid-column: 1 / -1;">
                    <p>正在加载价格数据...</p>
                </div>
            `;
        }
    }
    
    // 初始化页面管理器
    window.binancePage = new BinancePageManager();
    
    // 全局函数
    window.refreshPrices = () => window.binancePage.refreshPrices();
    window.toggleAutoUpdate = () => window.binancePage.toggleAutoUpdate();
    window.simulatePump = () => window.binancePage.simulatePump();
    window.simulateDump = () => window.binancePage.simulateDump();
    window.changeInterval = (val) => window.binancePage.changeInterval(val);
    
    console.log('✅ 所有功能已就绪！');
});

// 备用初始化（如果DOMContentLoaded没触发）
setTimeout(() => {
    if (!window.binancePage) {
        console.log('⚠️ DOMContentLoaded未触发，尝试备用初始化');
        window.binancePage = new BinancePageManager();
    }
}, 1000);