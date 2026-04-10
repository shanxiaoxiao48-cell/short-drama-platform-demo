# 短剧翻译平台 - 权限管理规则 (RBAC)

## 角色定义

### 1. 管理员 (Admin)
- **角色代码**: `admin`
- **描述**: 系统最高权限，可以访问所有功能和数据
- **典型用户**: 系统管理员、平台负责人

### 2. 项目管理 (Project Manager)
- **角色代码**: `project_manager`
- **描述**: 负责项目创建、配置和整体进度管理
- **典型用户**: 项目经理、制片人

### 3. 物料处理人员 (Material Handler)
- **角色代码**: `material_handler`
- **描述**: 负责视频、字幕等物料的上传和管理
- **典型用户**: 物料管理员、资源协调员

### 4. 译者 (Translator)
- **角色代码**: `translator`
- **描述**: 负责字幕翻译工作
- **典型用户**: 翻译人员

### 5. 质检人员 (Quality Checker)
- **角色代码**: `quality_checker`
- **描述**: 负责翻译质量检查和审核
- **典型用户**: 质检员、审核员

### 6. 视频压制人员 (Video Encoder)
- **角色代码**: `video_encoder`
- **描述**: 负责视频压制和输出
- **典型用户**: 视频制作人员、后期人员

---

## 菜单权限矩阵

| 菜单项 | 管理员 | 项目管理 | 物料处理 | 译者 | 质检 | 视频压制 |
|--------|--------|----------|----------|------|------|----------|
| **首页** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **工作台** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **物料管理** | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| └─ 短剧管理 | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| └─ 小说管理 | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| **任务管理** | ✅ | ✅ | ❌ | ✅ | ✅ | ✅ |
| └─ 任务列表 | ✅ | ✅ | ❌ | ✅ | ✅ | ✅ |
| **任务分配** | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| └─ 翻译任务列表 | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| **翻译审核** | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ |
| └─ 审核 | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ |
| └─ 翻译 | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ |
| **设置** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

---

## 页面级权限

### 首页 (Dashboard)

| 功能 | 管理员 | 项目管理 | 物料处理 | 译者 | 质检 | 视频压制 |
|------|--------|----------|----------|------|------|----------|
| 查看项目列表 | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| 查看项目详情 | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| 创建新项目 | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| 查看全部项目 | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |

**数据权限**:
- 管理员、项目管理、物料处理：查看所有项目
- 译者：只查看分配给自己的翻译任务相关项目
- 质检：只查看分配给自己的质检任务相关项目
- 视频压制：只查看分配给自己的压制任务相关项目

### 工作台 (Workspace)

| 功能 | 管理员 | 项目管理 | 物料处理 | 译者 | 质检 | 视频压制 |
|------|--------|----------|----------|------|------|----------|
| 查看语言变体 | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| 批量选择 | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| 下载文件 | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| 上传文件 | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| 查看工作流程 | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| 操作工作流程 | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |

**数据权限**:
- 管理员、项目管理、物料处理：查看和操作所有语言变体
- 译者：只查看分配给自己的翻译任务相关语言变体
- 质检：只查看分配给自己的质检任务相关语言变体
- 视频压制：只查看分配给自己的压制任务相关语言变体

### 工作流程操作权限

| 工作流程 | 管理员 | 项目管理 | 物料处理 | 译者 | 质检 | 视频压制 |
|----------|--------|----------|----------|------|------|----------|
| **AI提取** | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| 开始提取 | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| 确认提取结果 | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| **视频擦除** | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| 开始擦除 | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| 确认擦除结果 | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| **AI翻译** | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| 开始翻译 | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| 查看任务队列 | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| **任务分配** | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| 分配翻译任务 | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| 分配质检任务 | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| 分配压制任务 | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| **人工翻译** | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ |
| 进入编辑器 | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ |
| 编辑字幕 | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ |
| 提交审核 | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ |
| **成片质检** | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ |
| 进入编辑器 | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ |
| 审核字幕 | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ |
| 确认通过 | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ |
| **视频压制** | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ |
| 开始压制 | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ |
| 确认完成 | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ |

### 编辑器权限

| 功能 | 管理员 | 项目管理 | 物料处理 | 译者 | 质检 | 视频压制 |
|------|--------|----------|----------|------|------|----------|
| 查看原文字幕 | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| 编辑原文字幕 | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| 查看译文字幕 | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| 编辑译文字幕 | ✅ | ✅ | ❌ | ✅ | ✅ | ❌ |
| 查看画面字 | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| 编辑画面字 | ✅ | ✅ | ❌ | ✅ | ✅ | ❌ |
| 查看术语表 | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| 编辑术语表 | ✅ | ✅ | ❌ | ✅ | ✅ | ❌ |
| 查看修改历史 | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| 调整字幕样式 | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| 切换集数 | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| 完成本集 | ✅ | ✅ | ❌ | ✅ | ✅ | ❌ |
| 提交审核 | ✅ | ✅ | ❌ | ✅ | ✅ | ❌ |

**数据权限**:
- 管理员、项目管理：可以编辑所有项目的所有内容
- 物料处理：只能在 AI 提取待确认阶段编辑原文
- 译者：只能编辑分配给自己的翻译任务
- 质检：只能编辑分配给自己的质检任务

---

## 按钮操作权限

### 首页按钮

| 按钮 | 管理员 | 项目管理 | 物料处理 | 译者 | 质检 | 视频压制 |
|------|--------|----------|----------|------|------|----------|
| 创建新项目 | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| 查看全部 | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |

### 工作台按钮

| 按钮 | 管理员 | 项目管理 | 物料处理 | 译者 | 质检 | 视频压制 |
|------|--------|----------|----------|------|------|----------|
| 批量选择 | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| 全选 | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| 下载 - 视频 | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| 下载 - 字幕 | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| 下载 - 画面字 | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| 下载 - 术语表 | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| 上传 - 视频 | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| 上传 - 字幕 | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| 上传 - 画面字 | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| 上传 - 术语表 | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| 进入编辑器 | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |

### 工作流程按钮

| 按钮 | 管理员 | 项目管理 | 物料处理 | 译者 | 质检 | 视频压制 |
|------|--------|----------|----------|------|------|----------|
| AI提取 | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| 视频擦除 | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| AI翻译 | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| 任务分配 | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |

### 编辑器按钮

| 按钮 | 管理员 | 项目管理 | 物料处理 | 译者 | 质检 | 视频压制 |
|------|--------|----------|----------|------|------|----------|
| 保存 | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| 撤销 | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| 重做 | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| 上一集 | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| 下一集 | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| 完成本集 | ✅ | ✅ | ❌ | ✅ | ✅ | ❌ |
| 确认本集 | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| 提交审核 | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ |
| 确认通过 | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ |
| 添加画面字 | ✅ | ✅ | ❌ | ✅ | ✅ | ❌ |
| 添加术语 | ✅ | ✅ | ❌ | ✅ | ✅ | ❌ |

---

## 数据权限规则

### 项目数据权限

```typescript
// 管理员、项目管理、物料处理：查看所有项目
if (role === 'admin' || role === 'project_manager' || role === 'material_handler') {
  return allProjects
}

// 译者：只查看有翻译任务的项目
if (role === 'translator') {
  return projects.filter(p => 
    p.languageVariants.some(v => 
      v.translationAssignments.some(a => a.assignee === currentUserId)
    )
  )
}

// 质检：只查看有质检任务的项目
if (role === 'quality_checker') {
  return projects.filter(p => 
    p.languageVariants.some(v => 
      v.qualityCheckAssignments.some(a => a.assignee === currentUserId)
    )
  )
}

// 视频压制：只查看有压制任务的项目
if (role === 'video_encoder') {
  return projects.filter(p => 
    p.languageVariants.some(v => 
      v.compressAssignments.some(a => a.assignee === currentUserId)
    )
  )
}
```

### 语言变体数据权限

```typescript
// 管理员、项目管理、物料处理：查看所有语言变体
if (role === 'admin' || role === 'project_manager' || role === 'material_handler') {
  return allVariants
}

// 译者：只查看有翻译任务的语言变体
if (role === 'translator') {
  return variants.filter(v => 
    v.translationAssignments.some(a => a.assignee === currentUserId)
  )
}

// 质检：只查看有质检任务的语言变体
if (role === 'quality_checker') {
  return variants.filter(v => 
    v.qualityCheckAssignments.some(a => a.assignee === currentUserId)
  )
}

// 视频压制：只查看有压制任务的语言变体
if (role === 'video_encoder') {
  return variants.filter(v => 
    v.compressAssignments.some(a => a.assignee === currentUserId)
  )
}
```

### 编辑器数据权限

```typescript
// 管理员、项目管理：可以编辑所有内容
if (role === 'admin' || role === 'project_manager') {
  return { canEdit: true, canEditOriginal: true }
}

// 物料处理：只能在 AI 提取待确认阶段编辑原文
if (role === 'material_handler') {
  return { 
    canEdit: workflowStage === 'ai_extract_review',
    canEditOriginal: workflowStage === 'ai_extract_review'
  }
}

// 译者：只能编辑分配给自己的翻译任务
if (role === 'translator') {
  const isAssigned = variant.translationAssignments.some(a => 
    a.assignee === currentUserId && a.episodes.includes(currentEpisode)
  )
  return { 
    canEdit: isAssigned && workflowStage === 'manual_translate',
    canEditOriginal: false
  }
}

// 质检：只能编辑分配给自己的质检任务
if (role === 'quality_checker') {
  const isAssigned = variant.qualityCheckAssignments.some(a => 
    a.assignee === currentUserId && a.episodes.includes(currentEpisode)
  )
  return { 
    canEdit: isAssigned && workflowStage === 'quality_check',
    canEditOriginal: false
  }
}
```

---

## 权限检查函数

### 菜单权限检查

```typescript
function hasMenuPermission(role: UserRole, menuId: string): boolean {
  const menuPermissions: Record<UserRole, string[]> = {
    admin: ['dashboard', 'workspace', 'materials', 'tasks', 'task_assign', 'review', 'settings'],
    project_manager: ['dashboard', 'workspace', 'materials', 'tasks', 'task_assign', 'review', 'settings'],
    material_handler: ['dashboard', 'workspace', 'materials', 'settings'],
    translator: ['dashboard', 'workspace', 'tasks', 'settings'],
    quality_checker: ['dashboard', 'workspace', 'tasks', 'review', 'settings'],
    video_encoder: ['dashboard', 'workspace', 'tasks', 'settings'],
  }
  
  return menuPermissions[role]?.includes(menuId) ?? false
}
```

### 按钮权限检查

```typescript
function hasButtonPermission(role: UserRole, buttonId: string): boolean {
  const buttonPermissions: Record<UserRole, string[]> = {
    admin: ['*'], // 所有按钮
    project_manager: ['*'], // 所有按钮
    material_handler: [
      'batch_select', 'select_all', 'download', 'upload',
      'ai_extract', 'video_erase', 'ai_translate', 'enter_editor',
      'save', 'undo', 'redo', 'confirm_episode'
    ],
    translator: [
      'download', 'enter_editor', 'save', 'undo', 'redo',
      'prev_episode', 'next_episode', 'complete_episode', 'submit_review',
      'add_onscreen_text', 'add_glossary'
    ],
    quality_checker: [
      'download', 'enter_editor', 'save', 'undo', 'redo',
      'prev_episode', 'next_episode', 'complete_episode', 'confirm_pass',
      'add_onscreen_text', 'add_glossary'
    ],
    video_encoder: [
      'download', 'video_compress'
    ],
  }
  
  const permissions = buttonPermissions[role] ?? []
  return permissions.includes('*') || permissions.includes(buttonId)
}
```

### 工作流程权限检查

```typescript
function hasWorkflowPermission(role: UserRole, workflowId: string): boolean {
  const workflowPermissions: Record<UserRole, string[]> = {
    admin: ['*'],
    project_manager: ['*'],
    material_handler: ['ai_extract', 'video_erase', 'ai_translate'],
    translator: ['manual_translate'],
    quality_checker: ['quality_check'],
    video_encoder: ['video_compress'],
  }
  
  const permissions = workflowPermissions[role] ?? []
  return permissions.includes('*') || permissions.includes(workflowId)
}
```

---

## 实现建议

### 1. 用户角色切换组件

在设置页面添加一个角色切换下拉菜单（仅用于 Demo 演示）：

```typescript
<Select value={currentRole} onValueChange={setCurrentRole}>
  <SelectItem value="admin">管理员</SelectItem>
  <SelectItem value="project_manager">项目管理</SelectItem>
  <SelectItem value="material_handler">物料处理人员</SelectItem>
  <SelectItem value="translator">译者</SelectItem>
  <SelectItem value="quality_checker">质检人员</SelectItem>
  <SelectItem value="video_encoder">视频压制人员</SelectItem>
</Select>
```

### 2. 权限上下文

创建一个全局的权限上下文，用于管理当前用户角色和权限检查：

```typescript
const PermissionContext = createContext<{
  role: UserRole
  hasMenuPermission: (menuId: string) => boolean
  hasButtonPermission: (buttonId: string) => boolean
  hasWorkflowPermission: (workflowId: string) => boolean
}>()
```

### 3. 条件渲染

在组件中使用权限检查函数进行条件渲染：

```typescript
{hasButtonPermission('create_project') && (
  <Button onClick={handleCreateProject}>创建新项目</Button>
)}
```

### 4. 数据过滤

在数据获取时根据角色过滤数据：

```typescript
const visibleProjects = filterProjectsByRole(allProjects, currentRole, currentUserId)
```

---

## 注意事项

1. **Demo 模式**: 这是一个演示系统，角色切换功能仅用于展示不同角色的权限差异
2. **生产环境**: 在实际生产环境中，用户角色应该由后端认证系统管理，不应该允许前端随意切换
3. **数据安全**: 数据权限过滤应该在后端实现，前端只负责 UI 展示
4. **权限缓存**: 可以将权限检查结果缓存，避免重复计算
5. **权限更新**: 角色切换后应该刷新页面或重新加载数据

---

**文档版本**: 1.0  
**最后更新**: 2024-01-26  
**维护者**: 开发团队
