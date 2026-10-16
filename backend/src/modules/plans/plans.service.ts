import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { plansRepository, MembershipPlanRow } from './plans.repository';
import { CreatePlanInput, UpdatePlanInput } from './plans.validation';
import { NotFoundError, ConflictError, BadRequestError } from '../../shared/errors/AppError';

export interface PlanResponse {
  id: string;
  name: string;
  description: string | null;
  durationMonths: number;
  price: number;
  imageUrl: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const formatPlanResponse = (row: MembershipPlanRow): PlanResponse => ({
  id: row.id,
  name: row.name,
  description: row.description,
  durationMonths: row.duration_months,
  price: parseFloat(row.price),
  imageUrl: row.image_url,
  isActive: row.is_active,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

export class PlansService {
  /**
   * Saves a base64 image payload from admin local storage into the backend uploads folder
   */
  saveBase64Image(imageBase64: string, imageName: string): string {
    const uploadDir = path.join(process.cwd(), 'uploads', 'plans');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    let mimeType = 'image/jpeg';
    let base64Data = imageBase64;

    const matches = imageBase64.match(/^data:(image\/[a-zA-Z+]+);base64,(.+)$/);
    if (matches) {
      mimeType = matches[1];
      base64Data = matches[2];
    }

    let extension = 'jpg';
    if (mimeType.includes('png')) extension = 'png';
    else if (mimeType.includes('webp')) extension = 'webp';
    else if (mimeType.includes('gif')) extension = 'gif';
    else if (mimeType.includes('jpeg') || mimeType.includes('jpg')) extension = 'jpg';
    else {
      throw new BadRequestError('Invalid image format. Allowed formats: PNG, JPEG, WEBP, GIF.');
    }

    const buffer = Buffer.from(base64Data, 'base64');
    // Check 5MB size limit
    if (buffer.length > 5 * 1024 * 1024) {
      throw new BadRequestError('Image size exceeds 5MB limit.');
    }

    const uniqueId = crypto.randomBytes(8).toString('hex');
    const safeBaseName = path
      .basename(imageName, path.extname(imageName))
      .replace(/[^a-zA-Z0-9_-]/g, '_')
      .slice(0, 30);
    const filename = `${Date.now()}_${safeBaseName}_${uniqueId}.${extension}`;
    const targetPath = path.join(uploadDir, filename);

    fs.writeFileSync(targetPath, buffer);
    return `/uploads/plans/${filename}`;
  }

  async getPublicPlans(): Promise<PlanResponse[]> {
    const rows = await plansRepository.findAll(true);
    return rows.map(formatPlanResponse);
  }

  async getAllPlansForAdmin(): Promise<PlanResponse[]> {
    const rows = await plansRepository.findAll(false);
    return rows.map(formatPlanResponse);
  }

  async getPlanById(id: string): Promise<PlanResponse> {
    const row = await plansRepository.findById(id);
    if (!row) {
      throw new NotFoundError('Membership plan not found');
    }
    return formatPlanResponse(row);
  }

  async createPlan(
    input: CreatePlanInput,
    adminId: string,
    ipAddress?: string
  ): Promise<PlanResponse> {
    const existing = await plansRepository.findByName(input.name);
    if (existing) {
      throw new ConflictError(`A membership plan named "${input.name}" already exists`);
    }

    let finalImageUrl = input.imageUrl || null;
    if (input.imageBase64) {
      finalImageUrl = this.saveBase64Image(input.imageBase64, input.imageName || 'plan_image.jpg');
    }

    const created = await plansRepository.createPlan({
      name: input.name,
      description: input.description,
      durationMonths: input.durationMonths,
      price: input.price,
      imageUrl: finalImageUrl,
      isActive: input.isActive,
      createdByAdminId: adminId,
    });

    // Record audit log (Business rule: Audit log for price changes and plan creations)
    await plansRepository.recordAuditLog({
      userId: adminId,
      action: 'create_plan',
      entityType: 'membership_plan',
      entityId: created.id,
      newValues: {
        name: created.name,
        price: created.price,
        durationMonths: created.duration_months,
        imageUrl: created.image_url,
      },
      ipAddress,
    });

    return formatPlanResponse(created);
  }

  async updatePlan(
    id: string,
    input: UpdatePlanInput,
    adminId: string,
    ipAddress?: string
  ): Promise<PlanResponse> {
    const current = await plansRepository.findById(id);
    if (!current) {
      throw new NotFoundError('Membership plan not found');
    }

    if (input.name && input.name.toLowerCase() !== current.name.toLowerCase()) {
      const conflict = await plansRepository.findByName(input.name);
      if (conflict && conflict.id !== id) {
        throw new ConflictError(`A membership plan named "${input.name}" already exists`);
      }
    }

    let finalImageUrl = input.imageUrl !== undefined ? input.imageUrl : current.image_url;
    if (input.imageBase64) {
      finalImageUrl = this.saveBase64Image(input.imageBase64, input.imageName || 'plan_image.jpg');
    }

    const oldPrice = parseFloat(current.price);
    const newPrice = input.price !== undefined ? input.price : oldPrice;
    const isPriceChanged = input.price !== undefined && oldPrice !== newPrice;

    const updated = await plansRepository.updatePlan(id, {
      name: input.name,
      description: input.description,
      durationMonths: input.durationMonths,
      price: input.price,
      imageUrl: finalImageUrl,
      isActive: input.isActive,
    });

    if (!updated) {
      throw new NotFoundError('Membership plan not found');
    }

    // Business Rule: Audit log for plan changes and price adjustments
    await plansRepository.recordAuditLog({
      userId: adminId,
      action: isPriceChanged ? 'update_plan_price' : 'update_plan',
      entityType: 'membership_plan',
      entityId: updated.id,
      oldValues: {
        name: current.name,
        price: oldPrice,
        durationMonths: current.duration_months,
        imageUrl: current.image_url,
        isActive: current.is_active,
      },
      newValues: {
        name: updated.name,
        price: newPrice,
        durationMonths: updated.duration_months,
        imageUrl: updated.image_url,
        isActive: updated.is_active,
      },
      ipAddress,
    });

    return formatPlanResponse(updated);
  }

  async uploadImage(imageBase64: string, imageName: string): Promise<{ imageUrl: string }> {
    const imageUrl = this.saveBase64Image(imageBase64, imageName);
    return { imageUrl };
  }
}

export const plansService = new PlansService();
