# 网站健康检查脚本 (PowerShell版本)

param(
    [string]$Path = "."
)

$ErrorActionPreference = "Continue"

class WebsiteHealthReport {
    [datetime]$Timestamp
    [int]$FilesChecked
    [System.Collections.ArrayList]$Issues
    [System.Collections.ArrayList]$Suggestions
    
    WebsiteHealthReport() {
        $this.Timestamp = Get-Date
        $this.FilesChecked = 0
        $this.Issues = [System.Collections.ArrayList]::new()
        $this.Suggestions = [System.Collections.ArrayList]::new()
    }
}

class FileIssue {
    [string]$File
    [string]$Path
    [System.Collections.ArrayList]$Issues
    
    FileIssue([string]$file, [string]$path) {
        $this.File = $file
        $this.Path = $path
        $this.Issues = [System.Collections.ArrayList]::new()
    }
}

class IssueDetail {
    [string]$Type
    [string]$Issue
    [int]$Count
    [string]$Sample
    [string]$ReferenceFile
    
    IssueDetail([string]$type, [string]$issue) {
        $this.Type = $type
        $this.Issue = $issue
        $this.Count = 0
        $this.Sample = ""
        $this.ReferenceFile = ""
    }
}

class Suggestion {
    [string]$Type
    [string]$Description
    [string]$Action
    [string[]]$Files
    
    Suggestion([string]$type, [string]$description, [string]$action) {
        $this.Type = $type
        $this.Description = $description
        $this.Action = $action
        $this.Files = @()
    }
}

function Get-FileEncoding {
    param([string]$FilePath)
    
    try {
        $bytes = Get-Content $FilePath -Encoding Byte -TotalCount 4
        if ($bytes[0] -eq 0xEF -and $bytes[1] -eq 0xBB -and $bytes[2] -eq 0xBF) {
            return "UTF-8 with BOM"
        } elseif ($bytes[0] -eq 0xFF -and $bytes[1] -eq 0xFE) {
            return "UTF-16 LE"
        } elseif ($bytes[0] -eq 0xFE -and $bytes[1] -eq 0xFF) {
            return "UTF-16 BE"
        } else {
            # 尝试读取为UTF-8
            $content = Get-Content $FilePath -Encoding UTF8 -ErrorAction SilentlyContinue
            if ($null -ne $content) {
                return "UTF-8"
            }
            return "Unknown"
        }
    } catch {
        return "Error: $_"
    }
}

function Test-FileForGarbledText {
    param([string]$FilePath)
    
    $issues = [System.Collections.ArrayList]::new()
    
    try {
        # 尝试用不同编码读取
        $encodings = @("UTF8", "Default", "Unicode")
        
        foreach ($encoding in $encodings) {
            try {
                $content = Get-Content $FilePath -Encoding $encoding -Raw -ErrorAction Stop
                
                # 检查乱码字符
                if ($content -match "�") {
                    $issue = [IssueDetail]::new("encoding", "包含替换字符(�)")
                    $issue.Count = [regex]::Matches($content, "�").Count
                    $issues.Add($issue) | Out-Null
                }
                
                # 检查非标准字符（简单检查）
                if ($content -match "[^\x00-\x7F\u4e00-\u9fa5\u3000-\u303F\uFF00-\uFFEF\s\r\n]") {
                    $issue = [IssueDetail]::new("encoding", "可能包含非标准字符")
                    $issues.Add($issue) | Out-Null
                }
                
                break  # 使用第一个成功的编码
            } catch {
                continue
            }
        }
    } catch {
        $issue = [IssueDetail]::new("error", "无法读取文件")
        $issue.Sample = $_.Exception.Message
        $issues.Add($issue) | Out-Null
    }
    
    return $issues
}

function Test-HTMLStructure {
    param([string]$FilePath)
    
    $issues = [System.Collections.ArrayList]::new()
    
    try {
        $content = Get-Content $FilePath -Raw -ErrorAction Stop
        
        # 检查基本HTML结构
        if (-not $content.Contains("<!DOCTYPE html>")) {
            $issue = [IssueDetail]::new("structure", "缺少DOCTYPE声明")
            $issues.Add($issue) | Out-Null
        }
        
        if (-not $content.Contains("<html")) {
            $issue = [IssueDetail]::new("structure", "缺少<html>标签")
            $issues.Add($issue) | Out-Null
        }
        
        if (-not $content.Contains("</html>")) {
            $issue = [IssueDetail]::new("structure", "缺少闭合</html>标签")
            $issues.Add($issue) | Out-Null
        }
        
        # 检查脚本和CSS引用
        $scriptPattern = '<script\s+[^>]*src=["'']([^"'']+)["''][^>]*>'
        $cssPattern = '<link\s+[^>]*href=["'']([^"'']+)["''][^>]*>'
        
        $scriptMatches = [regex]::Matches($content, $scriptPattern)
        foreach ($match in $scriptMatches) {
            if ($match.Groups[1].Value -notmatch '^(http|//)') {
                $scriptFile = Join-Path (Split-Path $FilePath) $match.Groups[1].Value
                if (-not (Test-Path $scriptFile)) {
                    $issue = [IssueDetail]::new("resource", "引用的脚本文件不存在")
                    $issue.ReferenceFile = $match.Groups[1].Value
                    $issues.Add($issue) | Out-Null
                }
            }
        }
        
        $cssMatches = [regex]::Matches($content, $cssPattern)
        foreach ($match in $cssMatches) {
            $href = $match.Groups[1].Value
            if ($href -notmatch '^(http|//)' -and $href -match '\.css$') {
                $cssFile = Join-Path (Split-Path $FilePath) $href
                if (-not (Test-Path $cssFile)) {
                    $issue = [IssueDetail]::new("resource", "引用的CSS文件不存在")
                    $issue.ReferenceFile = $href
                    $issues.Add($issue) | Out-Null
                }
            }
        }
        
    } catch {
        $issue = [IssueDetail]::new("error", "无法检查HTML结构")
        $issue.Sample = $_.Exception.Message
        $issues.Add($issue) | Out-Null
    }
    
    return $issues
}

function Test-JavaScriptSyntax {
    param([string]$FilePath)
    
    $issues = [System.Collections.ArrayList]::new()
    
    try {
        $content = Get-Content $FilePath -Raw -ErrorAction Stop
        
        # 检查常见问题模式
        $patterns = @(
            @{Pattern = 'console\.log\([^)]*\)\s*[^;]\s*$'; Issue = 'console.log语句可能缺少分号'},
            @{Pattern = 'function\s+(\w+)\s*\([^)]*\)\s*{[^}]*$'; Issue = '函数可能缺少闭合大括号'},
            @{Pattern = 'if\s*\([^)]*\)\s*{[^}]*$'; Issue = 'if语句可能缺少闭合大括号'},
            @{Pattern = 'for\s*\([^)]*\)\s*{[^}]*$'; Issue = 'for循环可能缺少闭合大括号'}
        )
        
        foreach ($patternInfo in $patterns) {
            $matches = [regex]::Matches($content, $patternInfo.Pattern, [System.Text.RegularExpressions.RegexOptions]::Multiline)
            if ($matches.Count -gt 0) {
                $issue = [IssueDetail]::new("syntax", $patternInfo.Issue)
                $issue.Count = $matches.Count
                $issue.Sample = $matches[0].Value.Substring(0, [Math]::Min(50, $matches[0].Value.Length))
                $issues.Add($issue) | Out-Null
            }
        }
        
    } catch {
        $issue = [IssueDetail]::new("error", "无法检查JavaScript语法")
        $issue.Sample = $_.Exception.Message
        $issues.Add($issue) | Out-Null
    }
    
    return $issues
}

function Start-WebsiteHealthCheck {
    param([string]$Path)
    
    Write-Host "🔍 开始网站健康检查..." -ForegroundColor Cyan
    Write-Host "检查目录: $Path" -ForegroundColor Cyan
    Write-Host ""
    
    $report = [WebsiteHealthReport]::new()
    
    # 获取所有文件
    $files = Get-ChildItem $Path -File
    
    foreach ($file in $files) {
        $report.FilesChecked++
        
        $fileIssue = [FileIssue]::new($file.Name, $file.FullName)
        
        # 根据文件类型检查
        switch -Wildcard ($file.Name) {
            "*.html" {
                $fileIssue.Issues.AddRange((Test-FileForGarbledText $file.FullName))
                $fileIssue.Issues.AddRange((Test-HTMLStructure $file.FullName))
            }
            "*.js" {
                $fileIssue.Issues.AddRange((Test-FileForGarbledText $file.FullName))
                $fileIssue.Issues.AddRange((Test-JavaScriptSyntax $file.FullName))
            }
            "*.css" {
                $fileIssue.Issues.AddRange((Test-FileForGarbledText $file.FullName))
            }
        }
        
        if ($fileIssue.Issues.Count -gt 0) {
            $report.Issues.Add($fileIssue) | Out-Null
        }
    }
    
    # 生成建议
    Generate-Suggestions $report
    
    return $report
}

function Generate-Suggestions {
    param([WebsiteHealthReport]$Report)
    
    # 编码问题
    $encodingFiles = @()
    foreach ($issue in $Report.Issues) {
        foreach ($detail in $issue.Issues) {
            if ($detail.Type -eq "encoding") {
                $encodingFiles += $issue.File
                break
            }
        }
    }
    
    if ($encodingFiles.Count -gt 0) {
        $suggestion = [Suggestion]::new("encoding", "发现编码问题", "使用UTF-8编码重新保存文件")
        $suggestion.Files = $encodingFiles | Select-Object -Unique
        $Report.Suggestions.Add($suggestion) | Out-Null
    }
    
    # 资源引用问题
    $resourceFiles = @()
    foreach ($issue in $Report.Issues) {
        foreach ($detail in $issue.Issues) {
            if ($detail.Type -eq "resource") {
                $resourceFiles += $issue.File
                break
            }
        }
    }
    
    if ($resourceFiles.Count -gt 0) {
        $suggestion = [Suggestion]::new("resource", "发现资源引用问题", "检查并修复文件引用路径")
        $suggestion.Files = $resourceFiles | Select-Object -Unique
        $Report.Suggestions.Add($suggestion) | Out-Null
    }
    
    # 语法问题
    $syntaxFiles = @()
    foreach ($issue in $Report.Issues) {
        foreach ($detail in $issue.Issues) {
            if ($detail.Type -eq "syntax") {
                $syntaxFiles += $issue.File
                break
            }
        }
    }
    
    if ($syntaxFiles.Count -gt 0) {
        $suggestion = [Suggestion]::new("syntax", "发现JavaScript语法问题", "检查并修复代码语法")
        $suggestion.Files = $syntaxFiles | Select-Object -Unique
        $Report.Suggestions.Add($suggestion) | Out-Null
    }
}

function Show-Report {
    param([WebsiteHealthReport]$Report)
    
    Write-Host ""
    Write-Host "📊 网站健康检查报告" -ForegroundColor Green
    Write-Host ("=" * 50) -ForegroundColor DarkGray
    Write-Host "检查时间: $($Report.Timestamp.ToString('yyyy-MM-dd HH:mm:ss'))" -ForegroundColor Yellow
    Write-Host "检查文件数: $($Report.FilesChecked)" -ForegroundColor Yellow
    Write-Host "发现问题数: $($Report.Issues.Count)" -ForegroundColor Yellow
    
    if ($Report.Issues.Count -eq 0) {
        Write-Host ""
        Write-Host "✅ 恭喜！未发现明显问题！" -ForegroundColor Green
        return
    }
    
    Write-Host ""
    Write-Host "🔴 发现的问题:" -ForegroundColor Red
    
    for ($i = 0; $i -lt $Report.Issues.Count; $i++) {
        $fileIssue = $Report.Issues[$i]
        Write-Host ""
        Write-Host "$($i + 1). 文件: $($fileIssue.File)" -ForegroundColor Cyan
        
        for ($j = 0; $j -lt $fileIssue.Issues.Count; $j++) {
            $issue = $fileIssue.Issues[$j]
            Write-Host "   $($j + 1)) $($issue.Type.ToUpper()): $($issue.Issue)" -ForegroundColor White
            
            if ($issue.Count -gt 0) {
                Write-Host "      数量: $($issue.Count)" -ForegroundColor Gray
            }
            
            if ($issue.Sample) {
                Write-Host "      示例: $($issue.Sample)" -ForegroundColor Gray
            }
            
            if ($issue.ReferenceFile) {
                Write-Host "      引用文件: $($issue.ReferenceFile)" -ForegroundColor Gray
            }
        }
    }
    
    Write-Host ""
    Write-Host "💡 修复建议:" -ForegroundColor Magenta
    
    for ($i = 0; $i -lt $Report.Suggestions.Count; $i++) {
        $suggestion = $Report.Suggestions[$i]
        Write-Host ""
        Write-Host "$($i + 1). $($suggestion.Description)" -ForegroundColor Cyan
        Write-Host "   建议操作: $($suggestion.Action)" -ForegroundColor White
        
        if ($suggestion.Files.Count -gt 0) {
            Write-Host "   涉及文件: $($suggestion.Files -join ', ')" -ForegroundColor Gray
        }
    }
    
    Write-Host ""
    Write-Host ("=" * 50) -ForegroundColor DarkGray
}

# 主程序
try {
    $checkPath = if (Test-Path $Path) { $Path } else { "." }
    $report = Start-WebsiteHealthCheck -Path $checkPath
    Show-Report $report
    
    # 保存报告
    $reportJson = $report | ConvertTo-Json -Depth 5
    $reportFile = Join-Path $checkPath "website_health_report.json"
    $reportJson | Out-File -FilePath $reportFile -Encoding UTF8
    Write-Host "📄 详细报告已保存至: $reportFile" -ForegroundColor Green
    
} catch {
    Write-Host "❌ 检查过程中发生错误: $_" -ForegroundColor Red
    exit 1
}