import { configRepository } from '../repositories/config.repository.js';
import { AppError } from '../utils/appError.js';
import { HTTP_STATUS } from '../constants/httpStatus.js';
import { notificationEmitter } from '../events/notification.events.js';

const ALLOWED_CONFIG_KEYS = [
  'DIRECTOR_SALARY_THRESHOLD',
  'HIGH_LEVEL_POSITIONS',
  'DEPARTMENTS',
  'JOB_TITLES',
];

export class ConfigService {
  async getConfigs() {
    return configRepository.findAll();
  }

  async getConfig(key: string) {
    const config = await configRepository.findByKey(key);
    if (!config) return null;
    try {
      return JSON.parse(config.value);
    } catch {
      return config.value;
    }
  }

  async updateConfigs(configs: { key: string; value: any; description?: string }[], requestUserId: number) {
    const results = [];
    for (const config of configs) {
      if (!ALLOWED_CONFIG_KEYS.includes(config.key)) {
        throw new AppError(`Invalid config key: ${config.key}. Allowed keys: ${ALLOWED_CONFIG_KEYS.join(', ')}`, HTTP_STATUS.BAD_REQUEST);
      }

      let valueToStore = config.value;
      if (typeof config.value !== 'string') {
        valueToStore = JSON.stringify(config.value);
      } else {
        // if it's string, verify if it should be valid JSON array for list configs
        if (config.key === 'HIGH_LEVEL_POSITIONS' || config.key === 'DEPARTMENTS' || config.key === 'JOB_TITLES') {
          try {
            const parsed = JSON.parse(config.value);
            if (!Array.isArray(parsed)) throw new Error('Must be an array');
          } catch {
             // force it to be an array string if they sent comma separated or raw text
            valueToStore = JSON.stringify(config.value.split(',').map((s: string) => s.trim()).filter((s: string) => s));
          }
        }
      }

      const updated = await configRepository.upsert(config.key, valueToStore, config.description, requestUserId);
      results.push(updated);
      notificationEmitter.emit('config.updated', { key: config.key, config: updated });
    }
    return results;
  }

  async initializeDefaults() {
    const defaults = [
      { key: 'DIRECTOR_SALARY_THRESHOLD', value: '20000000', description: 'Ngưỡng lương cần Director phê duyệt Offer' },
      { key: 'HIGH_LEVEL_POSITIONS', value: JSON.stringify(['Trưởng phòng', 'Giám đốc', 'Manager']), description: 'Danh sách vị trí cấp cao' },
      { key: 'DEPARTMENTS', value: JSON.stringify(['IT', 'HR', 'Marketing', 'Sales', 'Finance']), description: 'Danh sách phòng ban' },
      { key: 'JOB_TITLES', value: JSON.stringify(['Software Engineer', 'Data Scientist', 'HR Specialist', 'Marketing Executive']), description: 'Danh sách chức danh' },
    ];

    for (const def of defaults) {
      const existing = await configRepository.findByKey(def.key);
      if (!existing) {
        await configRepository.upsert(def.key, def.value, def.description);
      }
    }
  }
}

export const configService = new ConfigService();
