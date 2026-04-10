// 质检审核相关的类型定义

/**
 * 驳回记录接口
 */
export interface RejectionRecord {
  id: string
  projectId: string
  languageVariant: string
  round: number // 被驳回时的轮次
  reason: string // 驳回理由
  rejectedBy: string // 驳回人员ID
  rejectedByName: string // 驳回人员姓名
  rejectedAt: string // 驳回时间 ISO 8601
  status: "pending" | "resolved" // 待处理/已解决
}

/**
 * 审核决策类型
 */
export type ReviewDecision = "approve" | "reject"

/**
 * 审核提交数据
 */
export interface ReviewSubmission {
  decision: ReviewDecision
  reason?: string // 驳回时必填
  reviewerId: string
  reviewerName: string
  timestamp: string
}
