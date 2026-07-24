import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PrismaService } from '../prisma/prisma.service'

@Injectable()
export class UploadService {
  constructor(
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  getFileUrl(file: Express.Multer.File): { url: string; filename: string; size: number } {
    const baseUrl = this.config.get('API_URL', 'http://localhost:4000')
    return {
      url:      `${baseUrl}/uploads/${file.filename}`,
      filename: file.filename,
      size:     file.size,
    }
  }

  /**
   * Stores an image's bytes in the database and returns an absolute URL that
   * serves it back. Persisting in Postgres (rather than on disk) means the
   * image survives redeploys on ephemeral hosts and is reachable from the live
   * domain — unlike the old disk path, which built a localhost URL.
   */
  async storeImage(
    file: Express.Multer.File,
    origin: string,
  ): Promise<{ url: string }> {
    const media = await this.prisma.media.create({
      data: { data: file.buffer, mime: file.mimetype },
    })
    return { url: `${origin}/api/media/${media.id}` }
  }
}
