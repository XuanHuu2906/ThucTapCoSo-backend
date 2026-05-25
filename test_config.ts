import { configService } from './src/services/config.service.js';
import { prisma } from './src/config/prisma.js';

async function main() {
  try {
    const payload = [
      { key: "DEPARTMENTS", value: ["IT", "HR", "Marketing", "Sales", "Finance"], description: "Danh sách phòng ban" },
      { key: "DIRECTOR_SALARY_THRESHOLD", value: "20000000", description: "Ngưỡng lương cần Director phê duyệt Offer" },
      { key: "HIGH_LEVEL_POSITIONS", value: ["Trưởng phòng", "Giám đốc", "Manager"], description: "Danh sách vị trí cấp cao" }
    ];
    console.log("Calling updateConfigs...");
    const result = await configService.updateConfigs(payload, 1);
    console.log("Success:", result);
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}
main();
