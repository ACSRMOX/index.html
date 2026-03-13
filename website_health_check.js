/**
 * 网站健康检查脚本
 * 检查所有文件的问题并生成报告
 */

const fs = require('fs');
const path = require('path');

class WebsiteHealthChecker {
    constructor(basePath) {
        this.basePath = basePath;
        this.report = {
            timestamp: new Date().toISOString(),
            filesChecked: 0,
            issues: [],
            suggestions: []
        };
    }

    // 检查文件编码
    checkFileEncoding(filePath) {
        try {
            const content = fs.readFileSync(filePath);
            const text = content.toString('utf8');
            
            // 检查常见乱码模式
            const garbledPatterns = [
                /[^\x00-\x7F\u4e00-\u9fa5\u3000-\u303F\uFF00-\uFFEF\s]/g,
                /�/g
            ];
            
            let issues = [];
            garbledPatterns.forEach((pattern, index) => {
                const matches = text.match(pattern);
                if (matches && matches.length > 0) {
                    issues.push({
                        type: 'encoding',
                        pattern: index === 0 ? '非标准字符' : '替换字符(�)',
                        count: matches.length,
                        sample: matches.slice(0, 3).join(', ')
                    });
                }
            });
            
            return issues;
        } catch (error) {
            return [{ type: 'error', message: error.message }];
        }
    }

    // 检查HTML结构
    checkHTMLStructure(filePath) {
        try {
            const content = fs.readFileSync(filePath, 'utf8');
            const issues = [];
            
            // 检查基本HTML结构
            if (!content.includes('<!DOCTYPE html>')) {
                issues.push({ type: 'structure', issue: '缺少DOCTYPE声明' });
            }
            
            if (!content.includes('<html')) {
                issues.push({ type: 'structure', issue: '缺少<html>标签' });
            }
            
            if (!content.includes('</html>')) {
                issues.push({ type: 'structure', issue: '缺少闭合</html>标签' });
            }
            
            if (!content.includes('<head>') && !content.includes('<head ')) {
                issues.push({ type: 'structure', issue: '缺少<head>部分' });
            }
            
            if (!content.includes('<body>') && !content.includes('<body ')) {
                issues.push({ type: 'structure', issue: '缺少<body>部分' });
            }
            
            // 检查脚本引用
            const scriptTags = content.match(/<script\s+[^>]*src=["']([^"']+)["'][^>]*>/gi) || [];
            scriptTags.forEach(tag => {
                const srcMatch = tag.match(/src=["']([^"']+)["']/);
                if (srcMatch) {
                    const src = srcMatch[1];
                    if (!src.startsWith('http') && !src.startsWith('//')) {
                        const scriptPath = path.join(path.dirname(filePath), src);
                        if (!fs.existsSync(scriptPath)) {
                            issues.push({ 
                                type: 'resource', 
                                issue: '引用的脚本文件不存在',
                                file: src,
                                fullPath: scriptPath 
                            });
                        }
                    }
                }
            });
            
            // 检查CSS引用
            const linkTags = content.match(/<link\s+[^>]*href=["']([^"']+)["'][^>]*>/gi) || [];
            linkTags.forEach(tag => {
                const hrefMatch = tag.match(/href=["']([^"']+)["']/);
                if (hrefMatch) {
                    const href = hrefMatch[1];
                    if (!href.startsWith('http') && !href.startsWith('//') && href.includes('.css')) {
                        const cssPath = path.join(path.dirname(filePath), href);
                        if (!fs.existsSync(cssPath)) {
                            issues.push({ 
                                type: 'resource', 
                                issue: '引用的CSS文件不存在',
                                file: href,
                                fullPath: cssPath 
                            });
                        }
                    }
                }
            });
            
            return issues;
        } catch (error) {
            return [{ type: 'error', message: error.message }];
        }
    }

    // 检查JavaScript语法
    checkJavaScript(filePath) {
        try {
            const content = fs.readFileSync(filePath, 'utf8');
            const issues = [];
            
            // 检查常见JS错误模式
            const errorPatterns = [
                { pattern: /console\.log\([^)]*\)\s*[^;]\s*$/gm, issue: 'console.log语句缺少分号' },
                { pattern: /function\s+(\w+)\s*\([^)]*\)\s*{[^}]*$/gm, issue: '函数可能缺少闭合大括号' },
                { pattern: /if\s*\([^)]*\)\s*{[^}]*$/gm, issue: 'if语句可能缺少闭合大括号' },
                { pattern: /for\s*\([^)]*\)\s*{[^}]*$/gm, issue: 'for循环可能缺少闭合大括号' },
                { pattern: /while\s*\([^)]*\)\s*{[^}]*$/gm, issue: 'while循环可能缺少闭合大括号' }
            ];
            
            errorPatterns.forEach(({ pattern, issue }) => {
                const matches = content.match(pattern);
                if (matches) {
                    issues.push({
                        type: 'syntax',
                        issue: issue,
                        count: matches.length,
                        samples: matches.slice(0, 2)
                    });
                }
            });
            
            return issues;
        } catch (error) {
            return [{ type: 'error', message: error.message }];
        }
    }

    // 运行全面检查
    runFullCheck() {
        console.log('🔍 开始网站健康检查...');
        console.log(`检查目录: ${this.basePath}`);
        
        const files = fs.readdirSync(this.basePath);
        
        files.forEach(file => {
            const filePath = path.join(this.basePath, file);
            const stat = fs.statSync(filePath);
            
            if (stat.isFile()) {
                this.report.filesChecked++;
                
                const fileIssues = {
                    file: file,
                    path: filePath,
                    issues: []
                };
                
                // 根据文件类型进行检查
                if (file.endsWith('.html')) {
                    fileIssues.issues.push(...this.checkFileEncoding(filePath));
                    fileIssues.issues.push(...this.checkHTMLStructure(filePath));
                } else if (file.endsWith('.js')) {
                    fileIssues.issues.push(...this.checkFileEncoding(filePath));
                    fileIssues.issues.push(...this.checkJavaScript(filePath));
                } else if (file.endsWith('.css')) {
                    fileIssues.issues.push(...this.checkFileEncoding(filePath));
                }
                
                if (fileIssues.issues.length > 0) {
                    this.report.issues.push(fileIssues);
                }
            }
        });
        
        // 生成建议
        this.generateSuggestions();
        
        return this.report;
    }

    // 生成修复建议
    generateSuggestions() {
        const suggestions = [];
        
        // 编码问题建议
        const encodingIssues = this.report.issues.filter(issue => 
            issue.issues.some(i => i.type === 'encoding')
        );
        
        if (encodingIssues.length > 0) {
            suggestions.push({
                type: 'encoding',
                description: '发现编码问题',
                action: '使用UTF-8编码重新保存文件',
                files: encodingIssues.map(i => i.file)
            });
        }
        
        // 资源引用问题
        const resourceIssues = this.report.issues.filter(issue =>
            issue.issues.some(i => i.type === 'resource')
        );
        
        if (resourceIssues.length > 0) {
            suggestions.push({
                type: 'resource',
                description: '发现资源引用问题',
                action: '检查并修复文件引用路径',
                files: resourceIssues.map(i => i.file)
            });
        }
        
        // 语法问题
        const syntaxIssues = this.report.issues.filter(issue =>
            issue.issues.some(i => i.type === 'syntax')
        );
        
        if (syntaxIssues.length > 0) {
            suggestions.push({
                type: 'syntax',
                description: '发现JavaScript语法问题',
                action: '检查并修复代码语法',
                files: syntaxIssues.map(i => i.file)
            });
        }
        
        this.report.suggestions = suggestions;
    }

    // 打印报告
    printReport() {
        console.log('\n📊 网站健康检查报告');
        console.log('=' .repeat(50));
        console.log(`检查时间: ${new Date(this.report.timestamp).toLocaleString()}`);
        console.log(`检查文件数: ${this.report.filesChecked}`);
        console.log(`发现问题数: ${this.report.issues.length}`);
        
        if (this.report.issues.length === 0) {
            console.log('\n✅ 恭喜！未发现明显问题！');
            return;
        }
        
        console.log('\n🔴 发现的问题:');
        this.report.issues.forEach((fileIssue, index) => {
            console.log(`\n${index + 1}. 文件: ${fileIssue.file}`);
            fileIssue.issues.forEach((issue, i) => {
                console.log(`   ${i + 1}) ${issue.type.toUpperCase()}: ${issue.issue}`);
                if (issue.count) console.log(`      数量: ${issue.count}`);
                if (issue.sample) console.log(`      示例: ${issue.sample}`);
                if (issue.file) console.log(`      引用文件: ${issue.file}`);
            });
        });
        
        console.log('\n💡 修复建议:');
        this.report.suggestions.forEach((suggestion, index) => {
            console.log(`\n${index + 1}. ${suggestion.description}`);
            console.log(`   建议操作: ${suggestion.action}`);
            if (suggestion.files.length > 0) {
                console.log(`   涉及文件: ${suggestion.files.join(', ')}`);
            }
        });
        
        console.log('\n' + '=' .repeat(50));
    }
}

// 运行检查
if (require.main === module) {
    const checker = new WebsiteHealthChecker(__dirname);
    const report = checker.runFullCheck();
    checker.printReport();
    
    // 保存报告到文件
    const reportFile = path.join(__dirname, 'website_health_report.json');
    fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));
    console.log(`\n📄 详细报告已保存至: ${reportFile}`);
}

module.exports = WebsiteHealthChecker;