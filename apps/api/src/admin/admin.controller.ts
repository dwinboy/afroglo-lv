import { Controller, Get, Post, Patch, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger'
import { AdminService } from './admin.service'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { RolesGuard } from '../auth/guards/roles.guard'
import { Roles } from '../auth/decorators/roles.decorator'
import { CreateProfessionalDto, UpdateProfessionalPermissionsDto } from './dto/create-professional.dto'

@ApiTags('admin')
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@ApiBearerAuth()
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('stats')
  @ApiOperation({ summary: 'Get admin dashboard stats' })
  getStats() {
    return this.adminService.getDashboardStats()
  }

  @Get('health')
  @ApiOperation({ summary: 'Platform health check' })
  health() {
    return { status: 'ok', timestamp: new Date().toISOString() }
  }

  @Patch('users/:id/suspend')
  @ApiOperation({ summary: 'Suspend a user' })
  suspendUser(@Param('id') id: string, @Body('reason') reason?: string) {
    return this.adminService.suspendUser(id, reason)
  }

  @Post('broadcast')
  @ApiOperation({ summary: 'Send broadcast notification to all users' })
  broadcast(@Body() dto: { title: string; message: string; roles?: string[] }) {
    return this.adminService.broadcast(dto)
  }

  @Get('settings/branch')
  @ApiOperation({ summary: 'Get branch settings' })
  getBranchSettings() {
    return this.adminService.getBranchSettings()
  }

  @Put('settings/branch')
  @ApiOperation({ summary: 'Update branch settings' })
  updateBranchSettings(@Body() dto: any) {
    return this.adminService.updateBranchSettings(dto)
  }

  @Post('seed-services')
  @ApiOperation({ summary: 'Seed default services (Dev only)' })
  seedServices() {
    return this.adminService.seedServices()
  }

  /* ── Gallery management ─────────────────────── */

  @Get('gallery')
  @ApiOperation({ summary: 'List gallery items' })
  listGallery(
    @Query('status') status?: string,
    @Query('page')   page = 1,
    @Query('limit')  limit = 50,
  ) {
    return this.adminService.listGallery({ status, page: +page, limit: +limit })
  }

  @Post('gallery')
  @ApiOperation({ summary: 'Create a gallery item' })
  createGalleryItem(@Body() dto: any) {
    return this.adminService.createGalleryItem(dto)
  }

  @Put('gallery/:id')
  @ApiOperation({ summary: 'Update a gallery item' })
  updateGalleryItem(@Param('id') id: string, @Body() dto: any) {
    return this.adminService.updateGalleryItem(id, dto)
  }

  @Delete('gallery/:id')
  @ApiOperation({ summary: 'Delete a gallery item' })
  deleteGalleryItem(@Param('id') id: string) {
    return this.adminService.deleteGalleryItem(id)
  }

  /* ── Professional management ─────────────────── */

  @Post('professionals')
  @ApiOperation({ summary: 'Create a professional account (admin-issued credentials)' })
  createProfessional(@Body() dto: CreateProfessionalDto) {
    return this.adminService.createProfessional(dto)
  }

  @Get('professionals')
  @ApiOperation({ summary: 'List all professionals' })
  listProfessionals(
    @Query('search')       search?: string,
    @Query('rentalStatus') rentalStatus?: string,
    @Query('page')         page  = 1,
    @Query('limit')        limit = 20,
  ) {
    return this.adminService.listProfessionals({ search, rentalStatus, page: +page, limit: +limit })
  }

  @Get('professionals/:id')
  @ApiOperation({ summary: 'Get professional details' })
  getProfessional(@Param('id') id: string) {
    return this.adminService.getProfessional(id)
  }

  @Patch('professionals/:id/permissions')
  @ApiOperation({ summary: 'Update professional permissions' })
  updatePermissions(@Param('id') id: string, @Body() dto: UpdateProfessionalPermissionsDto) {
    return this.adminService.updateProfessionalPermissions(id, dto)
  }

  @Put('professionals/:id')
  @ApiOperation({ summary: 'Update professional profile (spot, plan, specialization, etc.)' })
  updateProfessional(@Param('id') id: string, @Body() dto: any) {
    return this.adminService.updateProfessional(id, dto)
  }

  @Patch('professionals/:id/suspend')
  @ApiOperation({ summary: 'Suspend a professional' })
  suspendProfessional(@Param('id') id: string, @Body('reason') reason?: string) {
    return this.adminService.suspendProfessional(id, reason)
  }

  @Patch('professionals/:id/reactivate')
  @ApiOperation({ summary: 'Reactivate a suspended professional' })
  reactivateProfessional(@Param('id') id: string) {
    return this.adminService.reactivateProfessional(id)
  }

  @Post('professionals/:id/reset-password')
  @ApiOperation({ summary: 'Reset professional password and email new credentials' })
  resetProfessionalPassword(@Param('id') id: string) {
    return this.adminService.resetProfessionalPassword(id)
  }
}
