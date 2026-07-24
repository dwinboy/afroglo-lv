import {
  Controller, Post, Get, Param, Req, Res,
  UseInterceptors, UploadedFile, UploadedFiles,
  UseGuards, BadRequestException, NotFoundException,
} from '@nestjs/common'
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express'
import { memoryStorage } from 'multer'
import { SkipThrottle } from '@nestjs/throttler'
import type { Request, Response } from 'express'
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger'
import { UploadService } from './upload.service'
import { PrismaService } from '../prisma/prisma.service'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'

/** Builds the public origin, honouring the proxy's forwarded protocol so the
 *  URL is https behind Railway/Vercel rather than http (which browsers block). */
function publicOrigin(req: Request): string {
  const proto = (req.headers['x-forwarded-proto'] as string)?.split(',')[0]?.trim() || req.protocol
  return `${proto}://${req.get('host')}`
}

@ApiTags('upload')
@Controller('upload')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('avatar')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload avatar image' })
  uploadAvatar(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('File is required')
    return this.uploadService.getFileUrl(file)
  }

  @Post('portfolio')
  @UseInterceptors(FilesInterceptor('files', 10))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload portfolio images (max 10)' })
  uploadPortfolio(@UploadedFiles() files: Express.Multer.File[]) {
    if (!files?.length) throw new BadRequestException('Files are required')
    return files.map(f => this.uploadService.getFileUrl(f))
  }

  @Post('document')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload a document (PDF)' })
  uploadDocument(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('File is required')
    return this.uploadService.getFileUrl(file)
  }

  /** Durable image upload — bytes go to the DB, returns a live, absolute URL. */
  @Post('image')
  @UseInterceptors(FileInterceptor('file', {
    storage: memoryStorage(),
    limits: { fileSize: 8 * 1024 * 1024 },
    fileFilter: (_req, file, cb) => {
      cb(/^image\/(jpe?g|png|gif|webp|avif)$/.test(file.mimetype)
        ? null : new BadRequestException('Only image files are allowed'), true)
    },
  }))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload an image stored in the database' })
  uploadImage(@UploadedFile() file: Express.Multer.File, @Req() req: Request) {
    if (!file?.buffer) throw new BadRequestException('File is required')
    return this.uploadService.storeImage(file, publicOrigin(req))
  }
}

@ApiTags('media')
@Controller('media')
export class MediaController {
  constructor(private readonly prisma: PrismaService) {}

  /** Public — serves a stored image. Skips the throttler so pages full of
   *  images are never rate-limited. */
  @Get(':id')
  @SkipThrottle()
  @ApiOperation({ summary: 'Serve a stored image' })
  async serve(@Param('id') id: string, @Res() res: Response) {
    const media = await this.prisma.media.findUnique({ where: { id } })
    if (!media) throw new NotFoundException('Image not found')
    res.set('Content-Type', media.mime)
    res.set('Cache-Control', 'public, max-age=31536000, immutable')
    res.send(Buffer.from(media.data))
  }
}
