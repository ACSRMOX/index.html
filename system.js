// 系统状态监控 - JavaScript功能
console.log('🖥️ 系统状态监控加载中...');

// 系统状态模拟器
class SystemStatusSimulator {
    constructor() {
        this.metrics = {
            cpu: { usage: 54, cores: 6, threads: 12, frequency: 2.6 },
            memory: { total: 16.0, used: 8.2, free: 7.8, percent: 51 },
            disk: { total: 148.9, used: 46.3, free: 102.6, percent: 31 },
            network: { status: 'online', latency: 57, download: 85.2, upload: 23.7 },
            processes: [
                { name: 'AutoClaw', memory: 174, cpu: 12 },
                { name: 'Windows Defender', memory: 489, cpu: 8 },
                { name: 'Feishu', memory: 285, cpu: 5 },
                { name: 'Chrome', memory: 412, cpu: 15 },
                { name: 'Node.js', memory: 128, cpu: 7 }
            ],
            uptime: { hours: 2, minutes: 55, seconds: 0 }
        };
        
        this.autoRefresh = true;
        this.refreshInterval = 5000; // 5秒
        this.refreshTimer = null;
        
        this.init();
    }
    
    init() {
        this.startAutoRefresh();
        console.log('✅ 系统状态模拟器初始化完成');
    }
    
    // 更新所有指标
    updateAllMetrics() {
        // 模拟CPU波动
        this.metrics.cpu.usage = Math.max(10, Math.min(90, 
            this.metrics.cpu.usage + (Math.random() - 0.5) * 10
        ));
        
        // 模拟内存波动
        this.metrics.memory.used = Math.max(6, Math.min(14,
            this.metrics.memory.used + (Math.random() - 0.5) * 0.5
        ));
        this.metrics.memory.percent = Math.round((this.metrics.memory.used / this.metrics.memory.total) * 100);
        this.metrics.memory.free = this.metrics.memory.total - this.metrics.memory.used;
        
        // 模拟磁盘变化（缓慢）
        this.metrics.disk.used += Math.random() * 0.01;
        this.metrics.disk.percent = Math.round((this.metrics.disk.used / this.metrics.disk.total) * 100);
        this.metrics.disk.free = this.metrics.disk.total - this.metrics.disk.used;
        
        // 模拟网络波动
        this.metrics.network.latency = Math.max(20, Math.min(200,
            this.metrics.network.latency + (Math.random() - 0.5) * 10
        ));
        this.metrics.network.download = Math.max(50, Math.min(120,
            this.metrics.network.download + (Math.random() - 0.5) * 5
        ));
        this.metrics.network.upload = Math.max(10, Math.min(40,
            this.metrics.network.upload + (Math.random() - 0.5) * 3
        ));
        
        // 更新运行时间
        this.metrics.uptime.seconds += 5;
        if (this.metrics.uptime.seconds >= 60) {
            this.metrics.uptime.seconds = 0;
            this.metrics.uptime.minutes += 1;
        }
        if (this.metrics.uptime.minutes >= 60) {
            this.metrics.uptime.minutes = 0;
            this.metrics.uptime.hours += 1;
        }
        
        // 随机更新进程内存
        this.metrics.processes.forEach(proc => {
            proc.memory = Math.max(50, Math.min(800,
                proc.memory + (Math.random() - 0.5) * 20
            ));
            proc.cpu = Math.max(1, Math.min(30,
                proc.cpu + (Math.random() - 0.5) * 5
            ));
        });
        
        // 按内存排序进程
        this.metrics.processes.sort((a, b) => b.memory - a.memory);
        
        return this.metrics;
    }
    
    // 获取格式化指标
    getFormattedMetrics() {
        const metrics = this.updateAllMetrics();
        
        return {
            cpu: {
                usage: metrics.cpu.usage.toFixed(1),
                cores: metrics.cpu.cores,
                threads: metrics.cpu.threads,
                frequency: metrics.cpu.frequency.toFixed(1)
            },
            memory: {
                used: metrics.memory.used.toFixed(1),
                total: metrics.memory.total,
                free: metrics.memory.free.toFixed(1),
                percent: metrics.memory.percent
            },
            disk: {
                used: metrics.disk.used.toFixed(1),
                total: metrics.disk.total,
                free: metrics.disk.free.toFixed(1),
                percent: metrics.disk.percent
            },
            network: {
                status: metrics.network.status,
                latency: metrics.network.latency.toFixed(0),
                download: metrics.network.download.toFixed(1),
                upload: metrics.network.upload.toFixed(1)
            },
            processes: metrics.processes.slice(0, 5), // 只显示前5个
            uptime: this.formatUptime(metrics.uptime)
        };
    }
    
    // 格式化运行时间
    formatUptime(uptime) {
        const hours = uptime.hours.toString().padStart(2, '0');
        const minutes = uptime.minutes.toString().padStart(2, '0');
        const seconds = uptime.seconds.toString().padStart(2, '0');
        return `${hours}:${minutes}:${seconds}`;
    }
    
    // 开始自动刷新
    startAutoRefresh() {
        if (this.refreshTimer) {
            clearInterval(this.refreshTimer);
        }
        
        if (this.autoRefresh) {
            this.refreshTimer = setInterval(() => {
                this.updateDisplay();
            }, this.refreshInterval);
        }
    }
    
    // 停止自动刷新
    stopAutoRefresh() {
        if (this.refreshTimer) {
            clearInterval(this.refreshTimer);
            this.refreshTimer = null;
        }
    }
    
    // 切换自动刷新
    toggleAutoRefresh() {
        this.autoRefresh = !this.autoRefresh;
        
        if (this.autoRefresh) {
            this.startAutoRefresh();
        } else {
            this.stopAutoRefresh();
        }
        
        return this.autoRefresh;
    }
    
    // 模拟问题（用于测试）
    simulateProblem() {
        // 模拟CPU飙升
        this.metrics.cpu.usage = 95;
        
        // 模拟内存不足
        this.metrics.memory.used = 14.5;
        this.metrics.memory.percent = 91;
        this.metrics.memory.free = 1.5;
        
        // 模拟网络延迟
        this.metrics.network.latency = 350;
        this.metrics.network.download = 12.3;
        
        this.updateDisplay();
        
        // 5秒后恢复正常
        setTimeout(() => {
            this.resetMetrics();
        }, 5000);
    }
    
    // 重置指标到正常状态
    resetMetrics() {
        this.metrics.cpu.usage = 54;
        this.metrics.memory.used = 8.2;
        this.metrics.memory.percent = 51;
        this.metrics.memory.free = 7.8;
        this.metrics.network.latency = 57;
        this.metrics.network.download = 85.2;
        this.metrics.network.upload = 23.7;
        
        this.updateDisplay();
    }
    
    // 更新显示
    updateDisplay() {
        const metrics = this.getFormattedMetrics();
        
        // 更新CPU
        document.getElementById('cpu-usage').textContent = `${metrics.cpu.usage}%`;
        document.getElementById('cpu-progress').style.width = `${metrics.cpu.usage}%`;
        
        // 更新内存
        document.getElementById('memory-usage').textContent = 
            `${metrics.memory.used}/${metrics.memory.total} GB`;
        document.getElementById('memory-progress').style.width = `${metrics.memory.percent}%`;
        
        // 更新磁盘
        document.getElementById('disk-usage').textContent = 
            `${metrics.disk.used}/${metrics.disk.total} GB`;
        document.getElementById('disk-progress').style.width = `${metrics.disk.percent}%`;
        
        // 更新网络
        document.getElementById('network-status').textContent = 
            metrics.network.status === 'online' ? '在线' : '离线';
        
        // 更新进程列表
        this.updateProcessList(metrics.processes);
        
        // 更新运行时间
        document.getElementById('uptime').textContent = metrics.uptime;
        
        // 更新最后更新时间
        this.updateLastUpdateTime();
    }
    
    // 更新进程列表
    updateProcessList(processes) {
        const processList = document.getElementById('process-list');
        if (!processList) return;
        
        processList.innerHTML = processes.map(proc => `
            <div class="process-item">
                <span>${proc.name}</span>
                <span>${proc.memory.toFixed(0)} MB (${proc.cpu.toFixed(0)}% CPU)</span>
            </div>
        `).join('');
    }
    
    // 更新最后更新时间
    updateLastUpdateTime() {
        const now = new Date();
        const timeStr = now.toLocaleTimeString('zh-CN', {hour12: false});
        const el = document.getElementById('system-last-update');
        if (el) {
            el.textContent = timeStr;
        }
    }
}

// 页面管理器
class SystemPageManager {
    constructor() {
        this.simulator = new SystemStatusSimulator();
        
        this.init();
    }
    
    init() {
        // 初始显示
        this.simulator.updateDisplay();
        
        // 设置事件监听器
        this.setupEventListeners();
        
        console.log('✅ 系统状态页面初始化完成');
    }
    
    // 设置事件监听器
    setupEventListeners() {
        // 刷新按钮
        const refreshBtn = document.querySelector('button[onclick="refreshAllMetrics()"]');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.refreshAllMetrics());
        }
        
        // 模拟问题按钮
        const problemBtn = document.querySelector('button[onclick="simulateProblem()"]');
        if (problemBtn) {
            problemBtn.addEventListener('click', () => this.simulateProblem());
        }
        
        // 重置按钮
        const resetBtn = document.querySelector('button[onclick="resetMetrics()"]');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => this.resetMetrics());
        }
        
        // 自动刷新切换按钮
        const autoRefreshBtn = document.querySelector('button[onclick="toggleAutoRefresh()"]');
        if (autoRefreshBtn) {
            autoRefreshBtn.addEventListener('click', () => this.toggleAutoRefresh());
        }
        
        // 刷新进程按钮
        const refreshProcessBtn = document.querySelector('button[onclick="refreshProcesses()"]');
        if (refreshProcessBtn) {
            refreshProcessBtn.addEventListener('click', () => this.refreshProcesses());
        }
    }
    
    // 刷新所有指标
    refreshAllMetrics() {
        this.simulator.updateDisplay();
        
        // 添加反馈
        const btn = event.target;
        const originalText = btn.textContent;
        btn.textContent = '✅ 已刷新';
        setTimeout(() => {
            btn.textContent = originalText;
        }, 1000);
    }
    
    // 模拟问题
    simulateProblem() {
        this.simulator.simulateProblem();
        
        // 添加反馈
        const btn = event.target;
        const originalText = btn.textContent;
        btn.textContent = '⚠️ 问题模拟中...';
        setTimeout(() => {
            btn.textContent = originalText;
        }, 5000);
    }
    
    // 重置指标
    resetMetrics() {
        this.simulator.resetMetrics();
        
        // 添加反馈
        const btn = event.target;
        const originalText = btn.textContent;
        btn.textContent = '✅ 已重置';
        setTimeout(() => {
            btn.textContent = originalText;
        }, 1000);
    }
    
    // 切换自动刷新
    toggleAutoRefresh() {
        const enabled = this.simulator.toggleAutoRefresh();
        const statusEl = document.getElementById('auto-refresh-status');
        const btn = event.target;
        
        statusEl.textContent = enabled ? '开启' : '关闭';
        btn.style.background = enabled ? 
            'rgba(74, 222, 128, 0.2)' : 'rgba(239, 68, 68, 0.2)';
    }
    
    // 刷新进程
    refreshProcesses() {
        this.simulator.updateDisplay();
        
        // 添加反馈
        const btn = event.target;
        const originalText = btn.textContent;
        btn.textContent = '✅ 已刷新';
        setTimeout(() => {
            btn.textContent = originalText;
        }, 1000);
    }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    window.systemPage = new SystemPageManager();
    
    // 全局函数
    window.refreshAllMetrics = () => window.systemPage.refreshAllMetrics();
    window.simulateProblem = () => window.systemPage.simulateProblem();
    window.resetMetrics = () => window.systemPage.resetMetrics();
    window.toggleAutoRefresh = () => window.systemPage.toggleAutoRefresh();
    window.refreshProcesses = () => window.systemPage.refreshProcesses();
    
    console.log('🎉 系统状态页面加载完成！');
});