import { Module } from '@nestjs/common'
import { MulterModule } from '@nestjs/platform-express'
import { UploadController } from './upload.controller'
import { UploadService } from './upload.service'
import { diskStorage } from 'multer'
import { extname } from 'path'
import { v4 as uuid } from 'uuid'

@Module({
  imports: [
    MulterModule.register({
      storage: diskStorage({
        destination: './uploads',
        filename: (_, file, cb) => {
          cb(null, `${uuid()}${extname(file.originalname)}`)
        },
      }),
      fileFilter: (_, file, cb) => {
        const allowed = /jpeg|jpg|png|gif|webp|pdf/
        const ok = allowed.test(extname(file.originalname).toLowerCase()) &&
                   allowed.test(file.mimetype)
        cb(ok ? null : new Error('Only image and PDF files are allowed'), ok)
      },
      limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
    }),
  ],
  controllers: [UploadController],
  providers:   [UploadService],
  exports:     [UploadService],
})
export class UploadModule {}
