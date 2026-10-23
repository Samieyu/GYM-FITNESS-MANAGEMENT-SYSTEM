import { ProgressRepository, ProgressMetricRecord, AssignedMemberSummary } from './progress.repository';
import { LogProgressMetricInput } from './progress.validation';
import { NotFoundError, ForbiddenError } from '../../shared/errors/AppError';
import { sendTrainerFeedbackEmail } from '../../shared/services/emailService';
import { formatEthiopianDate } from '../../shared/utils/ethiopianCalendar';

export class ProgressService {
  private repo = new ProgressRepository();

  private calculateBmi(weightKg: number, heightCm?: number | null): { bmi: number | null; category: string | null } {
    if (!heightCm || heightCm <= 0) return { bmi: null, category: null };
    const heightM = heightCm / 100;
    const bmiVal = parseFloat((weightKg / (heightM * heightM)).toFixed(1));
    let cat = 'Normal weight';
    if (bmiVal < 18.5) cat = 'Underweight';
    else if (bmiVal < 25) cat = 'Normal weight';
    else if (bmiVal < 30) cat = 'Overweight';
    else cat = 'Obese';
    return { bmi: bmiVal, category: cat };
  }

  async logMetric(memberId: string, input: LogProgressMetricInput): Promise<ProgressMetricRecord> {
    const record = await this.repo.logMetric(memberId, input);
    const { bmi, category } = this.calculateBmi(Number(record.weight_kg), record.height_cm ? Number(record.height_cm) : null);
    return {
      ...record,
      weight_kg: Number(record.weight_kg),
      height_cm: record.height_cm ? Number(record.height_cm) : null,
      bmi,
      bmi_category: category,
    };
  }

  async getMemberMetrics(memberId: string): Promise<{
    metrics: (ProgressMetricRecord & { delta_kg: number | null })[];
    summary: {
      initial_weight: number | null;
      current_weight: number | null;
      total_change_kg: number | null;
      current_bmi: number | null;
      current_bmi_category: string | null;
      latest_fat_percentage: number | null;
    };
  }> {
    const rawMetrics = await this.repo.getMemberMetrics(memberId);

    // Find the latest recorded height to backfill if a member only enters weight in subsequent logs
    const latestHeightRecord = rawMetrics.find((m) => m.height_cm && Number(m.height_cm) > 0);
    const defaultHeight = latestHeightRecord ? Number(latestHeightRecord.height_cm) : null;

    const enriched = rawMetrics.map((m, index) => {
      const weight = Number(m.weight_kg);
      const height = m.height_cm ? Number(m.height_cm) : defaultHeight;
      const { bmi, category } = this.calculateBmi(weight, height);

      // Delta compared to the preceding chronological log (next in array since array is desc)
      let delta: number | null = null;
      if (index < rawMetrics.length - 1) {
        const prevWeight = Number(rawMetrics[index + 1].weight_kg);
        delta = parseFloat((weight - prevWeight).toFixed(2));
      }

      return {
        ...m,
        weight_kg: weight,
        height_cm: height,
        body_fat_percentage: m.body_fat_percentage ? Number(m.body_fat_percentage) : null,
        chest_cm: m.chest_cm ? Number(m.chest_cm) : null,
        waist_cm: m.waist_cm ? Number(m.waist_cm) : null,
        hips_cm: m.hips_cm ? Number(m.hips_cm) : null,
        arms_cm: m.arms_cm ? Number(m.arms_cm) : null,
        thighs_cm: m.thighs_cm ? Number(m.thighs_cm) : null,
        bmi,
        bmi_category: category,
        delta_kg: delta,
      };
    });

    const currentWeight = enriched.length > 0 ? enriched[0].weight_kg : null;
    const initialWeight = enriched.length > 0 ? enriched[enriched.length - 1].weight_kg : null;
    const totalChange = (currentWeight !== null && initialWeight !== null)
      ? parseFloat((currentWeight - initialWeight).toFixed(2))
      : null;

    const currentBmi = enriched.length > 0 ? enriched[0].bmi || null : null;
    const currentBmiCat = enriched.length > 0 ? enriched[0].bmi_category || null : null;
    const latestFat = enriched.length > 0 ? enriched[0].body_fat_percentage || null : null;

    return {
      metrics: enriched,
      summary: {
        initial_weight: initialWeight,
        current_weight: currentWeight,
        total_change_kg: totalChange,
        current_bmi: currentBmi,
        current_bmi_category: currentBmiCat,
        latest_fat_percentage: latestFat,
      },
    };
  }

  async addTrainerFeedback(
    metricId: string,
    trainerUserId: string,
    userRole: string,
    comment: string
  ): Promise<ProgressMetricRecord> {
    const metric = await this.repo.getMetricById(metricId);
    if (!metric) {
      throw new NotFoundError('Progress metric record not found');
    }

    let trainerId: string | null = null;
    const trainerProfile = await this.repo.getTrainerProfileByUserId(trainerUserId);
    if (trainerProfile) {
      trainerId = trainerProfile.id;
    } else if (userRole === 'admin') {
      // If admin without trainer profile, check if there is a trainer profile or allow admin feedback
      trainerId = null;
    } else {
      throw new ForbiddenError('Only recognized personal trainers can leave coaching feedback');
    }

    const updated = await this.repo.addTrainerComment(metricId, trainerId || '00000000-0000-0000-0000-000000000000', comment);

    // Send email to member in Ethiopian Calendar
    if (metric.member_email) {
      const recordedDateEc = `${formatEthiopianDate(metric.recorded_date)} E.C.`;
      const trainerDisplayName = userRole === 'admin' ? 'Head Coach / Admin' : 'Your Personal Trainer';
      sendTrainerFeedbackEmail(metric.member_email, metric.member_first_name || 'Athlete', {
        trainerName: trainerDisplayName,
        comment,
        weightKg: Number(metric.weight_kg),
        recordedDateEc,
      }).catch((err) => console.error('[Progress] Failed to send feedback email:', err));
    }

    return updated;
  }

  async getAssignedMembers(trainerUserId: string, role: string): Promise<AssignedMemberSummary[]> {
    if (role === 'admin') {
      return this.repo.getAssignedMembersForTrainer(undefined);
    }
    const profile = await this.repo.getTrainerProfileByUserId(trainerUserId);
    if (!profile) {
      return this.repo.getAssignedMembersForTrainer(undefined);
    }
    return this.repo.getAssignedMembersForTrainer(profile.id);
  }
}
