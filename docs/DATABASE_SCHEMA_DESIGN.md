# 数据库设计方案

## 概述

本文档定义短剧出海平台的数据库表结构设计，支持操作日志、修改历史、并发控制等功能。

---

## 一、核心业务表

### 1.1 项目表 (projects)

```sql
CREATE TABLE projects (
  id VARCHAR(50) PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  original_language VARCHAR(50) NOT NULL,
  total_episodes INT NOT NULL,
  status VARCHAR(50) NOT NULL,
  remark TEXT,
  poster_image VARCHAR(500),
  created_by VARCHAR(50) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL,
  
  INDEX idx_status (status),
  INDEX idx_created_at (created_at),
  INDEX idx_created_by (created_by)
);
```

### 1.2 语言变体表 (language_variants)

```sql
CREATE TABLE language_variants (
  id VARCHAR(50) PRIMARY KEY,
  project_id VARCHAR(50) NOT NULL,
  target_language VARCHAR(50) NOT NULL,
  total_episodes INT NOT NULL,
  completed_episodes INT NOT NULL DEFAULT 0,
  current_stage VARCHAR(50) NOT NULL,
  progress DECIMAL(5,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  UNIQUE KEY uk_project_language (project_id, target_language),
  INDEX idx_current_stage (current_stage)
);
```

### 1.3 集数表 (episodes)

```sql
CREATE TABLE episodes (
  id VARCHAR(50) PRIMARY KEY,
  project_id VARCHAR(50) NOT NULL,
  language_variant_id VARCHAR(50) NOT NULL,
  episode_number INT NOT NULL,
  duration INT,  -- 时长（秒）
  status VARCHAR(50) NOT NULL,
  video_url VARCHAR(500),
  subtitle_url VARCHAR(500),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  FOREIGN KEY (language_variant_id) REFERENCES language_variants(id) ON DELETE CASCADE,
  UNIQUE KEY uk_variant_episode (language_variant_id, episode_number),
  INDEX idx_status (status)
);
```

### 1.4 字幕表 (subtitles)

```sql
CREATE TABLE subtitles (
  id VARCHAR(50) PRIMARY KEY,
  episode_id VARCHAR(50) NOT NULL,
  subtitle_index INT NOT NULL,  -- 字幕序号
  start_time DECIMAL(10,3) NOT NULL,  -- 开始时间（秒）
  end_time DECIMAL(10,3) NOT NULL,    -- 结束时间（秒）
  original_text TEXT,
  translated_text TEXT,
  version INT NOT NULL DEFAULT 1,  -- 版本号（乐观锁）
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (episode_id) REFERENCES episodes(id) ON DELETE CASCADE,
  INDEX idx_episode_index (episode_id, subtitle_index),
  INDEX idx_timing (episode_id, start_time, end_time)
);
```

---

## 二、操作日志表

### 2.1 用户操作日志 (user_action_logs)

```sql
CREATE TABLE user_action_logs (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id VARCHAR(50) NOT NULL,
  user_name VARCHAR(100) NOT NULL,
  user_role VARCHAR(50) NOT NULL,
  action_type VARCHAR(100) NOT NULL,
  target_type VARCHAR(50) NOT NULL,
  target_id VARCHAR(50),
  target_name VARCHAR(200),
  details JSON,
  ip_address VARCHAR(50),
  user_agent VARCHAR(500),
  duration INT,  -- 操作耗时（毫秒）
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_user_id (user_id),
  INDEX idx_action_type (action_type),
  INDEX idx_target (target_type, target_id),
  INDEX idx_created_at (created_at),
  INDEX idx_composite (user_id, action_type, created_at)
) PARTITION BY RANGE (UNIX_TIMESTAMP(created_at)) (
  -- 按月分区，便于归档
  PARTITION p202401 VALUES LESS THAN (UNIX_TIMESTAMP('2024-02-01')),
  PARTITION p202402 VALUES LESS THAN (UNIX_TIMESTAMP('2024-03-01')),
  -- ... 更多分区
);
```

### 2.2 系统日志 (system_logs)

```sql
CREATE TABLE system_logs (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  level VARCHAR(20) NOT NULL,
  category VARCHAR(100) NOT NULL,
  message TEXT NOT NULL,
  details JSON,
  stack_trace TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_level (level),
  INDEX idx_category (category),
  INDEX idx_created_at (created_at)
) PARTITION BY RANGE (UNIX_TIMESTAMP(created_at)) (
  PARTITION p202401 VALUES LESS THAN (UNIX_TIMESTAMP('2024-02-01')),
  -- ... 更多分区
);
```

---

## 三、修改历史表

### 3.1 字幕修改历史 (subtitle_revisions)

```sql
CREATE TABLE subtitle_revisions (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  subtitle_id VARCHAR(50) NOT NULL,
  project_id VARCHAR(50) NOT NULL,
  episode_id VARCHAR(50) NOT NULL,
  language_variant VARCHAR(50) NOT NULL,
  
  revision_number INT NOT NULL,
  user_id VARCHAR(50) NOT NULL,
  user_name VARCHAR(100) NOT NULL,
  user_role VARCHAR(50) NOT NULL,
  
  field VARCHAR(50) NOT NULL,  -- 修改字段
  before_value TEXT,
  after_value TEXT,
  change_type VARCHAR(20) NOT NULL,  -- create/update/delete
  comment TEXT,
  
  review_status VARCHAR(20),
  reviewer_id VARCHAR(50),
  reviewer_name VARCHAR(100),
  review_comment TEXT,
  review_time TIMESTAMP NULL,
  
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (subtitle_id) REFERENCES subtitles(id) ON DELETE CASCADE,
  INDEX idx_subtitle_id (subtitle_id),
  INDEX idx_project_episode (project_id, episode_id),
  INDEX idx_user_id (user_id),
  INDEX idx_created_at (created_at)
) PARTITION BY RANGE (UNIX_TIMESTAMP(created_at)) (
  PARTITION p202401 VALUES LESS THAN (UNIX_TIMESTAMP('2024-02-01')),
  -- ... 更多分区
);
```

### 3.2 术语表修改历史 (glossary_revisions)

```sql
CREATE TABLE glossary_revisions (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  glossary_id VARCHAR(50) NOT NULL,
  project_id VARCHAR(50) NOT NULL,
  
  revision_number INT NOT NULL,
  user_id VARCHAR(50) NOT NULL,
  user_name VARCHAR(100) NOT NULL,
  
  field VARCHAR(50) NOT NULL,
  before_value TEXT,
  after_value TEXT,
  change_type VARCHAR(20) NOT NULL,
  
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_glossary_id (glossary_id),
  INDEX idx_project_id (project_id),
  INDEX idx_created_at (created_at)
);
```

---

## 四、并发控制表

### 4.1 编辑器锁表 (editor_locks)

```sql
CREATE TABLE editor_locks (
  lock_key VARCHAR(200) PRIMARY KEY,  -- project:episode:language
  user_id VARCHAR(50) NOT NULL,
  user_name VARCHAR(100) NOT NULL,
  acquired_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP NOT NULL,
  heartbeat_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_user_id (user_id),
  INDEX idx_expires_at (expires_at)
);
```

### 4.2 任务队列表 (task_queue)

```sql
CREATE TABLE task_queue (
  id VARCHAR(50) PRIMARY KEY,
  queue_type VARCHAR(50) NOT NULL,
  priority VARCHAR(20) NOT NULL,
  status VARCHAR(20) NOT NULL,  -- pending/processing/completed/failed
  
  project_id VARCHAR(50),
  episode_id VARCHAR(50),
  payload JSON NOT NULL,
  
  retry_count INT NOT NULL DEFAULT 0,
  max_retries INT NOT NULL DEFAULT 3,
  error_message TEXT,
  
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  started_at TIMESTAMP NULL,
  completed_at TIMESTAMP NULL,
  
  INDEX idx_queue_status (queue_type, status),
  INDEX idx_priority (priority, created_at),
  INDEX idx_project_id (project_id)
);
```

---

## 五、用户与权限表

### 5.1 用户表 (users)

```sql
CREATE TABLE users (
  id VARCHAR(50) PRIMARY KEY,
  username VARCHAR(100) NOT NULL UNIQUE,
  email VARCHAR(200) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(100) NOT NULL,
  role VARCHAR(50) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  last_login_at TIMESTAMP NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_role (role),
  INDEX idx_status (status)
);
```

### 5.2 任务分配表 (task_assignments)

```sql
CREATE TABLE task_assignments (
  id VARCHAR(50) PRIMARY KEY,
  project_id VARCHAR(50) NOT NULL,
  language_variant_id VARCHAR(50) NOT NULL,
  task_type VARCHAR(50) NOT NULL,  -- translation/quality_check/compress
  assignee_id VARCHAR(50) NOT NULL,
  assignee_name VARCHAR(100) NOT NULL,
  episodes JSON NOT NULL,  -- 分配的集数列表
  status VARCHAR(20) NOT NULL DEFAULT 'assigned',
  assigned_by VARCHAR(50) NOT NULL,
  assigned_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP NULL,
  
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  FOREIGN KEY (assignee_id) REFERENCES users(id),
  INDEX idx_assignee (assignee_id, status),
  INDEX idx_project (project_id, task_type)
);
```

---

## 六、埋点数据表

### 6.1 用户行为事件表 (user_behavior_events)

```sql
CREATE TABLE user_behavior_events (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  event_id VARCHAR(50) NOT NULL UNIQUE,
  event_name VARCHAR(100) NOT NULL,
  event_category VARCHAR(50) NOT NULL,
  user_id VARCHAR(50) NOT NULL,
  session_id VARCHAR(50) NOT NULL,
  
  page_path VARCHAR(500),
  page_title VARCHAR(200),
  referrer VARCHAR(500),
  
  device_type VARCHAR(20),
  os VARCHAR(50),
  browser VARCHAR(50),
  screen_resolution VARCHAR(20),
  
  properties JSON,
  
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_event_name (event_name),
  INDEX idx_user_id (user_id),
  INDEX idx_session_id (session_id),
  INDEX idx_created_at (created_at),
  INDEX idx_composite (event_name, user_id, created_at)
) PARTITION BY RANGE (UNIX_TIMESTAMP(created_at)) (
  PARTITION p202401 VALUES LESS THAN (UNIX_TIMESTAMP('2024-02-01')),
  -- ... 更多分区
);
```

### 6.2 性能指标表 (performance_metrics)

```sql
CREATE TABLE performance_metrics (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  metric_type VARCHAR(50) NOT NULL,  -- page/api/database
  metric_name VARCHAR(200) NOT NULL,
  value DECIMAL(10,2) NOT NULL,
  unit VARCHAR(20) NOT NULL,  -- ms/bytes/count
  
  user_id VARCHAR(50),
  session_id VARCHAR(50),
  context JSON,
  
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_metric_type (metric_type),
  INDEX idx_metric_name (metric_name),
  INDEX idx_created_at (created_at)
) PARTITION BY RANGE (UNIX_TIMESTAMP(created_at)) (
  PARTITION p202401 VALUES LESS THAN (UNIX_TIMESTAMP('2024-02-01')),
  -- ... 更多分区
);
```

---

## 七、索引优化建议

### 7.1 复合索引

```sql
-- 用户操作日志的常用查询
CREATE INDEX idx_user_action_query 
ON user_action_logs(user_id, action_type, created_at);

-- 字幕修改历史的常用查询
CREATE INDEX idx_subtitle_revision_query 
ON subtitle_revisions(subtitle_id, revision_number DESC);

-- 任务队列的优先级查询
CREATE INDEX idx_task_priority_query 
ON task_queue(queue_type, status, priority, created_at);
```

### 7.2 覆盖索引

```sql
-- 项目列表查询（避免回表）
CREATE INDEX idx_project_list 
ON projects(status, created_at, id, title, total_episodes);

-- 用户任务查询
CREATE INDEX idx_user_tasks 
ON task_assignments(assignee_id, status, project_id, task_type);
```

---

## 八、数据归档策略

### 8.1 归档规则

```sql
-- 操作日志归档（保留90天热数据）
CREATE EVENT archive_user_action_logs
ON SCHEDULE EVERY 1 DAY
DO
  INSERT INTO user_action_logs_archive
  SELECT * FROM user_action_logs
  WHERE created_at < DATE_SUB(NOW(), INTERVAL 90 DAY);
  
  DELETE FROM user_action_logs
  WHERE created_at < DATE_SUB(NOW(), INTERVAL 90 DAY);

-- 字幕修改历史归档（保留180天）
CREATE EVENT archive_subtitle_revisions
ON SCHEDULE EVERY 1 DAY
DO
  INSERT INTO subtitle_revisions_archive
  SELECT * FROM subtitle_revisions
  WHERE created_at < DATE_SUB(NOW(), INTERVAL 180 DAY);
  
  DELETE FROM subtitle_revisions
  WHERE created_at < DATE_SUB(NOW(), INTERVAL 180 DAY);
```

### 8.2 归档表结构

```sql
-- 归档表与原表结构相同，但使用压缩存储
CREATE TABLE user_action_logs_archive LIKE user_action_logs;
ALTER TABLE user_action_logs_archive 
  ROW_FORMAT=COMPRESSED 
  KEY_BLOCK_SIZE=8;

CREATE TABLE subtitle_revisions_archive LIKE subtitle_revisions;
ALTER TABLE subtitle_revisions_archive 
  ROW_FORMAT=COMPRESSED 
  KEY_BLOCK_SIZE=8;
```

---

## 九、性能优化

### 9.1 读写分离

```
主库：处理所有写操作
从库1：处理查询操作（用户界面）
从库2：处理分析查询（数据分析）
```

### 9.2 缓存策略

```typescript
// Redis 缓存键设计
const cacheKeys = {
  // 项目信息（TTL: 1小时）
  project: (id: string) => `project:${id}`,
  
  // 语言变体（TTL: 30分钟）
  languageVariant: (id: string) => `variant:${id}`,
  
  // 字幕数据（TTL: 10分钟）
  subtitles: (episodeId: string) => `subtitles:${episodeId}`,
  
  // 用户信息（TTL: 1小时）
  user: (id: string) => `user:${id}`,
  
  // 编辑器锁（TTL: 5分钟）
  editorLock: (key: string) => `lock:editor:${key}`,
}
```

### 9.3 查询优化

```sql
-- 使用 EXPLAIN 分析查询
EXPLAIN SELECT * FROM user_action_logs 
WHERE user_id = 'user123' 
  AND action_type = 'subtitle.edit'
  AND created_at >= '2024-01-01'
ORDER BY created_at DESC 
LIMIT 100;

-- 避免全表扫描
-- 不好的查询
SELECT * FROM subtitles WHERE translated_text LIKE '%关键词%';

-- 好的查询（使用全文索引）
ALTER TABLE subtitles ADD FULLTEXT INDEX ft_translated_text (translated_text);
SELECT * FROM subtitles WHERE MATCH(translated_text) AGAINST('关键词');
```

---

**文档版本**: v1.0  
**创建时间**: 2024-01-26  
**维护人员**: 数据库团队
