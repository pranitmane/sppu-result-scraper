import fs from 'fs';

export type studentType = {
  seatNo: string;
  name: string;
};

export const studentData: studentType[] = JSON.parse(fs.readFileSync('./students.json', { encoding: 'utf-8' }))

export async function analytics(statsPath: string) {
  const statsData: [{ seatNo: String, success: Boolean }] = JSON.parse(await fs.promises.readFile(statsPath, { encoding: 'utf-8' }))
  let success = 0
  let failed = 0
  statsData.forEach(student => {
    if (student.success === true) {
      success++
    }
    else {
      failed++
    }
  });
  return {
    success,
    failed
  }
}
