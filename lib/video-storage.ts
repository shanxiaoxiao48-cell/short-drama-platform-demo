// 全局视频文件存储
// 由于 Blob URL 和 File 对象无法持久化到 localStorage，
// 我们在内存中保存 File 对象，并在需要时重新创建 Blob URL

export type VideoType = "source" | "erased" | "onscreen_text" | "final"

interface VideoFileEntry {
  file: File
  url: string
  thumbnailUrl: string
  duration: number
  name: string
  size: number
  videoType: VideoType
  episodeNumber: number
}

class VideoStorage {
  private storage: Map<string, VideoFileEntry> = new Map()

  // 生成唯一键
  private generateKey(projectId: string, episodeNumber: number, videoType: VideoType): string {
    return `${projectId}-${episodeNumber}-${videoType}`
  }

  // 添加视频文件
  addVideo(projectId: string, episodeNumber: number, videoType: VideoType, file: File, thumbnailUrl: string, duration: number): void {
    const key = this.generateKey(projectId, episodeNumber, videoType)

    // 如果已存在相同类型和集数的视频，先清理旧的 URL
    const existing = this.storage.get(key)
    if (existing) {
      URL.revokeObjectURL(existing.url)
    }

    const url = URL.createObjectURL(file)
    this.storage.set(key, {
      file,
      url,
      thumbnailUrl,
      duration,
      name: file.name,
      size: file.size,
      videoType,
      episodeNumber,
    })
  }

  // 获取视频 URL（指定类型和集数）
  getVideoUrl(projectId: string, episodeNumber: number, videoType: VideoType): string | undefined {
    const key = this.generateKey(projectId, episodeNumber, videoType)
    return this.storage.get(key)?.url
  }

  // 获取第一个源视频的 URL（用于编辑器默认播放）
  getFirstVideoUrl(projectId: string): string | undefined {
    for (const [key, value] of this.storage.entries()) {
      if (key.startsWith(`${projectId}-`) && value.videoType === "source") {
        return value.url
      }
    }
    return undefined
  }

  // 获取指定集数和类型的视频
  getEpisodeVideo(projectId: string, episodeNumber: number, videoType: VideoType): VideoFileEntry | undefined {
    const key = this.generateKey(projectId, episodeNumber, videoType)
    return this.storage.get(key)
  }

  // 获取项目的所有源视频（按集数排序）
  getSourceVideos(projectId: string): VideoFileEntry[] {
    const videos: VideoFileEntry[] = []
    for (const [key, value] of this.storage.entries()) {
      if (key.startsWith(`${projectId}-`) && value.videoType === "source") {
        videos.push(value)
      }
    }
    return videos.sort((a, b) => a.episodeNumber - b.episodeNumber)
  }

  // 获取项目的所有视频
  getProjectVideos(projectId: string): VideoFileEntry[] {
    const videos: VideoFileEntry[] = []
    for (const [key, value] of this.storage.entries()) {
      if (key.startsWith(`${projectId}-`)) {
        videos.push(value)
      }
    }
    return videos
  }

  // 获取项目的源视频集数
  getSourceEpisodeCount(projectId: string): number {
    const sourceEpisodes = new Set<number>()
    for (const [key, value] of this.storage.entries()) {
      if (key.startsWith(`${projectId}-`) && value.videoType === "source") {
        sourceEpisodes.add(value.episodeNumber)
      }
    }
    return sourceEpisodes.size
  }

  // 删除项目的所有视频
  removeProjectVideos(projectId: string): void {
    for (const [key, value] of this.storage.entries()) {
      if (key.startsWith(`${projectId}-`)) {
        URL.revokeObjectURL(value.url)
        this.storage.delete(key)
      }
    }
  }

  // 清理所有视频
  clearAll(): void {
    for (const value of this.storage.values()) {
      URL.revokeObjectURL(value.url)
    }
    this.storage.clear()
  }
}

// 导出单例实例
export const videoStorage = new VideoStorage()

// 清理资源（在组件卸载时调用）
export function cleanupVideoUrls(projectId: string) {
  videoStorage.removeProjectVideos(projectId)
}
