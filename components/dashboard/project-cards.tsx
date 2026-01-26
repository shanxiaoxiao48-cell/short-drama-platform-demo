"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ArrowRight, Globe } from "lucide-react"
import { usePermission } from "@/contexts/permission-context"

interface ProjectCardsProps {
  onOpenWorkspace: (projectId: string) => void
  onNavigateToProjects: () => void
}

const recentProjects = [
  {
    id: "1",
    title: "霸道总裁爱上我",
    targetLanguage: "英语",
    episodes: 80,
    completedEpisodes: 45,
    status: "in_progress",
    updatedAt: "2小时前",
    image: "/drama-posters/badao-zongcai.png", // 霸道总裁爱上我
  },
  {
    id: "2",
    title: "穿越之锦绣良缘",
    targetLanguage: "西班牙语",
    episodes: 60,
    completedEpisodes: 60,
    status: "completed",
    updatedAt: "1天前",
    image: "/drama-posters/chuanyue-jinxiu.png", // 穿越之锦绣良缘
  },
  {
    id: "3",
    title: "重生之商业帝国",
    targetLanguage: "葡萄牙语",
    episodes: 100,
    completedEpisodes: 12,
    status: "in_progress",
    updatedAt: "3小时前",
    image: "/drama-posters/chongsheng-shangye.png", // 重生之商业帝国
  },
  {
    id: "4",
    title: "豪门逆袭记",
    targetLanguage: "泰语",
    episodes: 50,
    completedEpisodes: 0,
    status: "pending",
    updatedAt: "刚刚",
    image: "/drama-posters/haomen-nixi.png", // 豪门逆袭记
  },
  {
    id: "5",
    title: "这爱你爱婚祥",
    targetLanguage: "印尼语",
    episodes: 70,
    completedEpisodes: 35,
    status: "in_progress",
    updatedAt: "5小时前",
    image: "/drama-posters/zhe-aini-aihunxiang.png", // 这爱你爱婚祥
  },
  {
    id: "6",
    title: "龙王赘婿",
    targetLanguage: "越南语",
    episodes: 90,
    completedEpisodes: 90,
    status: "completed",
    updatedAt: "2天前",
    image: "/drama-posters/longwang-zhuxu.png", // 龙王赘婿
  },
  {
    id: "7",
    title: "神医弃妃",
    targetLanguage: "阿拉伯语",
    episodes: 65,
    completedEpisodes: 20,
    status: "in_progress",
    updatedAt: "1小时前",
    image: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=400&h=400&fit=crop",
  },
  {
    id: "8",
    title: "战神归来",
    targetLanguage: "法语",
    episodes: 55,
    completedEpisodes: 0,
    status: "pending",
    updatedAt: "刚刚",
    image: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=400&h=400&fit=crop",
  },
]

const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "outline" }> = {
  in_progress: { label: "进行中", variant: "default" },
  completed: { label: "已完成", variant: "secondary" },
  pending: { label: "待开始", variant: "outline" },
}

export function ProjectCards({ onOpenWorkspace, onNavigateToProjects }: ProjectCardsProps) {
  const { canAccessProject, hasButton, user } = usePermission()
  
  // 根据用户角色过滤项目
  const visibleProjects = recentProjects.filter(project => canAccessProject(project.id))
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">
          近期项目
          {user.role === 'translator' && <span className="text-sm text-muted-foreground ml-2">(已分配给我的)</span>}
          {user.role === 'quality_checker' && <span className="text-sm text-muted-foreground ml-2">(已分配给我的)</span>}
          {user.role === 'video_encoder' && <span className="text-sm text-muted-foreground ml-2">(已分配给我的)</span>}
        </h2>
        {hasButton('batch_select') && (
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-muted-foreground hover:text-foreground"
            onClick={onNavigateToProjects}
          >
            查看全部 <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {visibleProjects.slice(0, 6).map((project) => {
          const progress = Math.round((project.completedEpisodes / project.episodes) * 100)
          const status = statusMap[project.status]

          return (
            <Card
              key={project.id}
              className="overflow-hidden bg-card border-border hover:border-primary/50 transition-all cursor-pointer group"
              onClick={() => onOpenWorkspace(project.id)}
            >
              <div className="flex flex-col">
                {/* 短剧图片 - 方形 */}
                <div className="relative w-full aspect-square bg-gradient-to-br from-purple-500/20 via-pink-500/20 to-blue-500/20 overflow-hidden">
                  <img
                    src={project.image}
                    alt={project.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-2 left-2">
                    <Badge variant={status.variant} className="text-xs backdrop-blur-sm">
                      {status.label}
                    </Badge>
                  </div>
                  <div className="absolute top-2 right-2 flex items-center gap-1 text-xs text-white bg-black/50 backdrop-blur-sm px-1.5 py-0.5 rounded">
                    <Globe className="w-3 h-3" />
                    <span>{project.targetLanguage}</span>
                  </div>
                </div>

                {/* 内容区域 */}
                <div className="p-2.5 space-y-1.5">
                  <h3 className="font-medium text-xs text-foreground line-clamp-2 min-h-[2rem]">
                    {project.title}
                  </h3>
                  
                  <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                    <span>{project.episodes} 集</span>
                    <span>{project.updatedAt}</span>
                  </div>
                  
                  <div className="space-y-0.5">
                    <Progress value={progress} className="h-1" />
                    <p className="text-[10px] text-muted-foreground text-right">{progress}%</p>
                  </div>
                </div>
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
