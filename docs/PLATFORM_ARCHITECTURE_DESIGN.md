# 短剧出海平台 - 架构设计规划

## 概述

本文档为短剧出海平台的后期优化提供架构设计规划，包括操作日志、修改痕迹追踪、并发队列管理和数据埋点系统。

**业务规模预估**:
- 月处理量：1000+ 部短剧
- 平均每部：80 集
- 平均每集：100 条字幕
- 月字幕处理量：约 800 万条
- 并发用户：50-100 人（译者、质检等）

---

## 一、操作日志系统设计

### 1.1 日志分类

#### 1.1.1 用户操作日志 (User Action Log)
记录所有用户的关键操作行为

**数据结构**:
```typescript
interface UserActionLog {
  id: string                    // 日志ID
  userId: string                // 用户ID
  userName: string              // 用户名
  userRole: UserRole            // 用户角色
  action: ActionType            // 操作类型
  targetType: TargetType        // 目标类型
  targetId: string              // 目标ID
  targetName?: string           // 目标名称
  details: Record<string, any>  // 操作详情
  ipAddress: string             // IP地址
  userAgent: string             // 浏览器信息
  timestamp: Date               // 操作时间
  duration?: number             // 操作耗时(ms)
}
```

**操作类型枚举**:
```typescript
enum ActionType {
  // 项目管理
  PROJECT_CREATE = 'project.create',
  PROJECT_UPDATE = 'project.update',
  PROJECT_DELETE = 'project.delete',
  PROJECT_VIEW = 'project.view',
  
  // 工作流程
  WORKFLOW_START = 'workflow.start',
  WORKFLOW_COMPLETE = 'workflow.complete',
  WORKFLOW_CANCEL = 'workflow.cancel',
  
  // 编辑器操作
  EDITOR_OPEN = 'editor.open',
  EDITOR_SAVE = 'editor.save',
  SUBTITLE_EDIT = 'subtitle.edit',
  SUBTITLE_DELETE = 'subtitle.delete',
  SUBTITLE_ADD = 'subtitle.add',
  GLOSSARY_EDIT = 'glossary.edit',
  
  // 文件操作
  FILE_UPLOAD = 'file.upload',
  FILE_DOWNLOAD = 'file.download',
  FILE_DELETE = 'file.delete',
  
  // 任务管理
  TASK_ASSIGN = 'task.assign',
  TASK_COMPLETE = 'task.complete',
  TASK_SUBMIT = 'task.submit',
  
  // 审核操作
  REVIEW_APPROVE = 'review.approve',
  REVIEW_REJECT = 'review.reject',
  
  // 系统操作
  LOGIN = 'system.login',
  LOGOUT = 'system.logout',
  PERMISSION_CHANGE = 'system.permission_change',
}
```

**目标类型枚举**:
```typescript
enum TargetType {
  PROJECT = 'project',
  EPISODE = 'episode',
  SUBTITLE = 'subtitle',
  GLOSSARY = 'glossary',
  FILE = 'file',
  TASK = 'task',
  USER = 'user',
}
```

#### 1.1.2 系统日志 (System Log)
记录系统级别的事件和错误

**数据结构**:
```typescript
interface SystemLog {
  id: string
  level: 'info' | 'warning' | 'error' | 'critical'
  category: string              // 日志分类
  message: string               // 日志消息
  details?: Record<string, any> // 详细信息
  stackTrace?: string           // 错误堆栈
  timestamp: Date
}
```

### 1.2 日志存储策略

#### 热数据存储 (近30天)
- **存储方式**: PostgreSQL / MySQL
- **索引**: userId, action, targetType, timestamp
- **查询性能**: 支持快速查询和统计

#### 温数据存储 (30-180天)
- **存储方式**: 时序数据库 (InfluxDB / TimescaleDB)
- **压缩**: 启用数据压缩
- **查询**: 支持聚合查询

#### 冷数据存储 (180天+)
- **存储方式**: 对象存储 (S3 / OSS)
- **格式**: JSON Lines / Parquet
- **归档**: 按月归档，支持离线分析

### 1.3 日志采集方案

```typescript
// 前端日志采集
class LogCollector {
  // 批量上报，减少请求
  private buffer: UserActionLog[] = []
  private batchSize = 10
  private flushInterval = 5000 // 5秒
  
  log(action: ActionType, target: TargetType, details: any) {
    const log: UserActionLog = {
      id: generateId(),
      userId: getCurrentUser().id,
      userName: getCurrentUser().name,
      userRole: getCurrentUser().role,
      action,
      targetType: target,
      targetId: details.id,
      targetName: details.name,
      details,
      ipAddress: getClientIP(),
      userAgent: navigator.userAgent,
      timestamp: new Date(),
    }
    
    this.buffer.push(log)
    
    if (this.buffer.length >= this.batchSize) {
      this.flush()
    }
  }
  
  async flush() {
    if (this.buffer.length === 0) return
    
    const logs = [...this.buffer]
    this.buffer = []
    
    try {
      await api.post('/api/logs/batch', { logs })
    } catch (error) {
      // 失败重试或本地存储
      console.error('Failed to send logs:', error)
    }
  }
}
```

---

## 二、修改痕迹追踪系统

### 2.1 字幕修改历史

**数据结构**:
```typescript
interface SubtitleRevision {
  id: string
  subtitleId: string            // 字幕ID
  projectId: string             // 项目ID
  episodeId: string             // 集数ID
  languageVariant: string       // 语言变体
  
  // 修改信息
  revisionNumber: number        // 版本号
  userId: string                // 修改人ID
  userName: string              // 修改人姓名
  userRole: UserRole            // 修改人角色
  
  // 修改内容
  field: 'originalText' | 'translatedText' | 'timing' | 'style'
  beforeValue: any              // 修改前的值
  afterValue: any               // 修改后的值
  
  // 元数据
  changeType: 'create' | 'update' | 'delete'
  comment?: string              // 修改备注
  timestamp: Date               // 修改时间
  
  // 审核信息
  reviewStatus?: 'pending' | 'approved' | 'rejected'
  reviewerId?: string
  reviewerName?: string
  reviewComment?: string
  reviewTime?: Date
}
```

### 2.2 版本对比功能

```typescript
interface DiffResult {
  subtitleId: string
  revisions: SubtitleRevision[]
  
  // 对比结果
  changes: {
    field: string
    oldValue: any
    newValue: any
    changedBy: string
    changedAt: Date
  }[]
  
  // 统计信息
  totalChanges: number
  changesByUser: Record<string, number>
  changesByType: Record<string, number>
}
```

### 2.3 修改追踪策略

#### 实时追踪
- 编辑器内每次保存触发
- 记录字段级别的变更
- 支持撤销/重做功能

#### 批量追踪
- 批量导入/导出时记录
- AI翻译结果记录
- 批量修改操作记录

#### 审核追踪
- 质检人员的审核意见
- 修改建议和批注
- 审核通过/拒绝记录

### 2.4 存储优化

```typescript
// 使用差异存储减少空间占用
interface CompactRevision {
  id: string
  subtitleId: string
  revisionNumber: number
  userId: string
  timestamp: Date
  
  // 只存储变更的字段
  changes: {
    field: string
    value: any  // 新值
  }[]
}

// 定期合并历史版本
// 保留：最近30天的所有版本
// 合并：30天前每天保留1个版本
// 归档：90天前只保留首尾版本
```

---

## 三、并发与队列管理

### 3.1 业务场景分析

#### 高并发场景
1. **AI处理任务**
   - AI提取：1000部 × 80集 = 80,000 个任务/月
   - AI翻译：80,000 × 5语言 = 400,000 个任务/月
   - 视频擦除：80,000 个任务/月

2. **文件上传下载**
   - 视频上传：80,000 个文件/月
   - 字幕下载：频繁操作
   - 成片下载：80,000+ 个文件/月

3. **编辑器并发**
   - 50-100 个译者同时在线
   - 实时保存字幕修改
   - 冲突检测和解决

### 3.2 队列系统设计

#### 3.2.1 任务队列架构

```typescript
// 使用 Redis + Bull Queue
interface TaskQueue {
  // 队列类型
  queueType: QueueType
  
  // 任务优先级
  priority: 'high' | 'normal' | 'low'
  
  // 并发控制
  concurrency: number
  
  // 重试策略
  retryStrategy: {
    maxAttempts: number
    backoff: 'fixed' | 'exponential'
    delay: number
  }
}

enum QueueType {
  AI_EXTRACT = 'ai_extract',      // AI提取队列
  AI_TRANSLATE = 'ai_translate',  // AI翻译队列
  VIDEO_ERASE = 'video_erase',    // 视频擦除队列
  VIDEO_COMPRESS = 'video_compress', // 视频压制队列
  FILE_UPLOAD = 'file_upload',    // 文件上传队列
  FILE_PROCESS = 'file_process',  // 文件处理队列
}
```

#### 3.2.2 队列配置

```typescript
const queueConfigs = {
  ai_extract: {
    concurrency: 10,              // 同时处理10个任务
    priority: 'high',
    timeout: 300000,              // 5分钟超时
    retryAttempts: 3,
  },
  
  ai_translate: {
    concurrency: 20,              // 翻译并发更高
    priority: 'normal',
    timeout: 180000,              // 3分钟超时
    retryAttempts: 2,
  },
  
  video_erase: {
    concurrency: 5,               // 视频处理并发较低
    priority: 'normal',
    timeout: 600000,              // 10分钟超时
    retryAttempts: 2,
  },
  
  video_compress: {
    concurrency: 3,               // 压制最耗资源
    priority: 'low',
    timeout: 1800000,             // 30分钟超时
    retryAttempts: 1,
  },
  
  file_upload: {
    concurrency: 50,              // 上传并发高
    priority: 'high',
    timeout: 300000,
    retryAttempts: 3,
  },
}
```

### 3.3 并发控制策略

#### 3.3.1 编辑器并发锁

```typescript
// 使用 Redis 实现分布式锁
interface EditorLock {
  lockKey: string               // project:episode:language
  userId: string                // 当前编辑用户
  userName: string
  acquiredAt: Date
  expiresAt: Date               // 锁过期时间
  heartbeat: Date               // 心跳时间
}

// 锁策略
const LOCK_TTL = 300000         // 5分钟自动释放
const HEARTBEAT_INTERVAL = 30000 // 30秒心跳
const LOCK_TIMEOUT = 10000      // 10秒获取锁超时
```

#### 3.3.2 乐观锁机制

```typescript
// 字幕保存时使用版本号
interface SubtitleSaveRequest {
  subtitleId: string
  version: number               // 当前版本号
  content: string
  userId: string
}

// 保存逻辑
async function saveSubtitle(request: SubtitleSaveRequest) {
  const current = await db.getSubtitle(request.subtitleId)
  
  if (current.version !== request.version) {
    // 版本冲突，需要合并
    throw new ConflictError({
      currentVersion: current.version,
      yourVersion: request.version,
      currentContent: current.content,
    })
  }
  
  // 更新版本号
  await db.updateSubtitle({
    ...request,
    version: request.version + 1,
  })
}
```

### 3.4 限流策略

```typescript
// API 限流配置
const rateLimits = {
  // 按用户限流
  perUser: {
    'editor.save': { limit: 100, window: 60000 },      // 每分钟100次
    'file.upload': { limit: 50, window: 60000 },       // 每分钟50次
    'file.download': { limit: 100, window: 60000 },    // 每分钟100次
  },
  
  // 按IP限流
  perIP: {
    'api.*': { limit: 1000, window: 60000 },           // 每分钟1000次
  },
  
  // 全局限流
  global: {
    'ai.extract': { limit: 100, window: 60000 },       // 每分钟100个AI任务
    'ai.translate': { limit: 200, window: 60000 },     // 每分钟200个翻译任务
  },
}
```

---

## 四、数据埋点系统

### 4.1 核心埋点指标

#### 4.1.1 用户行为埋点

```typescript
interface UserBehaviorEvent {
  // 基础信息
  eventId: string
  eventName: string
  eventCategory: EventCategory
  userId: string
  sessionId: string
  timestamp: Date
  
  // 页面信息
  pagePath: string
  pageTitle: string
  referrer: string
  
  // 设备信息
  deviceType: 'desktop' | 'mobile' | 'tablet'
  os: string
  browser: string
  screenResolution: string
  
  // 业务数据
  properties: Record<string, any>
}

enum EventCategory {
  PAGE_VIEW = 'page_view',           // 页面浏览
  USER_ACTION = 'user_action',       // 用户操作
  WORKFLOW = 'workflow',             // 工作流程
  PERFORMANCE = 'performance',       // 性能指标
  ERROR = 'error',                   // 错误事件
}
```

#### 4.1.2 关键埋点事件

**页面浏览类**:
```typescript
// 1. 页面访问
track('page_view', {
  page: 'dashboard' | 'projects' | 'workspace' | 'editor',
  projectId?: string,
  duration: number,  // 停留时长
})

// 2. 编辑器打开
track('editor_open', {
  projectId: string,
  episodeId: string,
  languageVariant: string,
  workflowStage: string,
  loadTime: number,  // 加载耗时
})
```

**工作流程类**:
```typescript
// 3. 工作流程开始
track('workflow_start', {
  workflowType: 'ai_extract' | 'ai_translate' | 'manual_translate' | ...,
  projectId: string,
  episodeCount: number,
})

// 4. 工作流程完成
track('workflow_complete', {
  workflowType: string,
  projectId: string,
  duration: number,  // 处理耗时
  success: boolean,
  errorMessage?: string,
})

// 5. 任务分配
track('task_assign', {
  taskType: 'translation' | 'quality_check' | 'compress',
  projectId: string,
  assigneeId: string,
  episodeCount: number,
})
```

**编辑操作类**:
```typescript
// 6. 字幕编辑
track('subtitle_edit', {
  projectId: string,
  episodeId: string,
  subtitleId: string,
  field: 'originalText' | 'translatedText' | 'timing',
  editType: 'create' | 'update' | 'delete',
  characterCount: number,
})

// 7. 字幕保存
track('subtitle_save', {
  projectId: string,
  episodeId: string,
  subtitleCount: number,
  saveTime: number,  // 保存耗时
})

// 8. 集数完成
track('episode_complete', {
  projectId: string,
  episodeId: string,
  workflowStage: string,
  duration: number,  // 处理耗时
  subtitleCount: number,
})
```

**文件操作类**:
```typescript
// 9. 文件上传
track('file_upload', {
  fileType: 'video' | 'subtitle' | 'onscreen_text' | 'glossary',
  fileSize: number,
  uploadTime: number,
  success: boolean,
})

// 10. 文件下载
track('file_download', {
  fileType: string,
  fileSize: number,
  downloadTime: number,
})
```

**性能指标类**:
```typescript
// 11. 页面性能
track('page_performance', {
  page: string,
  loadTime: number,
  domReady: number,
  firstPaint: number,
  firstContentfulPaint: number,
})

// 12. API性能
track('api_performance', {
  endpoint: string,
  method: string,
  duration: number,
  statusCode: number,
})
```

**错误事件类**:
```typescript
// 13. 前端错误
track('frontend_error', {
  errorType: 'javascript' | 'network' | 'resource',
  errorMessage: string,
  stackTrace: string,
  page: string,
})

// 14. 业务错误
track('business_error', {
  errorCode: string,
  errorMessage: string,
  context: Record<string, any>,
})
```

### 4.2 埋点实现方案

```typescript
// 埋点SDK
class Analytics {
  private buffer: UserBehaviorEvent[] = []
  private sessionId: string
  
  constructor() {
    this.sessionId = generateSessionId()
    this.initAutoTracking()
  }
  
  // 手动埋点
  track(eventName: string, properties: Record<string, any>) {
    const event: UserBehaviorEvent = {
      eventId: generateId(),
      eventName,
      eventCategory: this.getCategory(eventName),
      userId: getCurrentUser().id,
      sessionId: this.sessionId,
      timestamp: new Date(),
      pagePath: window.location.pathname,
      pageTitle: document.title,
      referrer: document.referrer,
      deviceType: this.getDeviceType(),
      os: this.getOS(),
      browser: this.getBrowser(),
      screenResolution: `${screen.width}x${screen.height}`,
      properties,
    }
    
    this.buffer.push(event)
    this.flushIfNeeded()
  }
  
  // 自动埋点
  private initAutoTracking() {
    // 页面浏览
    this.trackPageView()
    
    // 页面停留时长
    this.trackPageDuration()
    
    // 点击事件
    this.trackClicks()
    
    // 性能指标
    this.trackPerformance()
    
    // 错误监控
    this.trackErrors()
  }
  
  private trackPageView() {
    this.track('page_view', {
      page: this.getCurrentPage(),
    })
  }
  
  private trackPerformance() {
    if (window.performance && window.performance.timing) {
      const timing = window.performance.timing
      const loadTime = timing.loadEventEnd - timing.navigationStart
      
      this.track('page_performance', {
        page: this.getCurrentPage(),
        loadTime,
        domReady: timing.domContentLoadedEventEnd - timing.navigationStart,
        firstPaint: timing.responseStart - timing.navigationStart,
      })
    }
  }
  
  private async flushIfNeeded() {
    if (this.buffer.length >= 10) {
      await this.flush()
    }
  }
  
  private async flush() {
    if (this.buffer.length === 0) return
    
    const events = [...this.buffer]
    this.buffer = []
    
    try {
      await api.post('/api/analytics/events', { events })
    } catch (error) {
      console.error('Failed to send analytics:', error)
    }
  }
}

// 全局实例
export const analytics = new Analytics()
```

### 4.3 数据分析维度

#### 用户维度
- 活跃用户数（DAU/MAU）
- 用户留存率
- 用户行为路径
- 用户效率指标

#### 项目维度
- 项目处理周期
- 各环节耗时分布
- 项目完成率
- 质量指标

#### 功能维度
- 功能使用频率
- 功能使用时长
- 功能转化率
- 功能错误率

#### 性能维度
- 页面加载时间
- API响应时间
- 文件上传下载速度
- 系统稳定性

---

## 五、实施建议

### 5.1 分阶段实施

**第一阶段（MVP）**:
- 基础操作日志
- 关键埋点（页面浏览、工作流程、编辑操作）
- 简单队列管理

**第二阶段（优化）**:
- 完整修改历史
- 高级并发控制
- 完整埋点体系

**第三阶段（高级）**:
- 实时数据分析
- 智能告警
- 性能优化

### 5.2 技术栈建议

**后端**:
- 队列：Redis + Bull / RabbitMQ
- 日志存储：PostgreSQL + InfluxDB + S3
- 缓存：Redis
- 搜索：Elasticsearch

**前端**:
- 埋点SDK：自研轻量级SDK
- 性能监控：Web Vitals
- 错误监控：Sentry

**数据分析**:
- 实时分析：Flink / Spark Streaming
- 离线分析：Hive / Presto
- 可视化：Grafana / Metabase

### 5.3 成本估算

**存储成本**（月）:
- 热数据（30天）：约 50GB
- 温数据（180天）：约 200GB
- 冷数据（归档）：约 1TB/年

**计算成本**（月）:
- 队列处理：中等规格服务器 × 3
- 日志处理：小规格服务器 × 2
- 数据分析：按需计算

---

## 六、监控告警

### 6.1 关键指标监控

```typescript
// 监控指标
interface MonitorMetrics {
  // 系统指标
  system: {
    cpu: number
    memory: number
    disk: number
    network: number
  }
  
  // 业务指标
  business: {
    activeUsers: number
    queueLength: Record<QueueType, number>
    taskProcessingTime: Record<QueueType, number>
    errorRate: number
  }
  
  // 性能指标
  performance: {
    apiResponseTime: Record<string, number>
    pageLoadTime: Record<string, number>
    databaseQueryTime: number
  }
}
```

### 6.2 告警规则

```typescript
const alertRules = {
  // 队列积压告警
  queueBacklog: {
    condition: 'queue_length > 1000',
    severity: 'warning',
    action: 'notify_admin',
  },
  
  // 错误率告警
  errorRate: {
    condition: 'error_rate > 5%',
    severity: 'critical',
    action: 'notify_oncall',
  },
  
  // 性能告警
  slowApi: {
    condition: 'api_response_time > 3000ms',
    severity: 'warning',
    action: 'log_and_notify',
  },
}
```

---

**文档版本**: v1.0  
**创建时间**: 2024-01-26  
**维护人员**: 技术团队
