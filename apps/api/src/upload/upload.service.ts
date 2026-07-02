import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'

@Injectable()
export class UploadService {
  constructor(private readonly config: ConfigService) {}

  getFileUrl(file: Express.Multer.File): { url: string; filename: string; size: number } {
    const baseUrl = this.config.get('API_URL', 'http://localhost:4000')
    return {
      url:      `${baseUrl}/uploads/${file.filename}`,
      filename: file.filename,
      size:     file.size,
    }
  }
}
