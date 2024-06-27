import fs from 'fs';
import PDFMerger from 'pdf-merger-js'

export type studentType = {
  seatNo: string;
  name: string;
};

export type statObjType = {
  "seatNo": String,
  "success": Boolean
}

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

export async function mergeAllPDFs(statsData:statObjType[]) {
  try{
    const sortedStatsData = statsData.sort((a,b)=>{
      return a.seatNo.localeCompare(b.seatNo as any)
    })
    const pdfMerger = new PDFMerger()
    for(let i=0;i<sortedStatsData.length;i++){
      if(sortedStatsData[i].success){
        await pdfMerger.add(`./results/${sortedStatsData[i].seatNo}.pdf`)
      }
    }
    await pdfMerger.save('merged.pdf')
    console.log('pdfs merged successfully')
  } catch(e){
    console.error('error while merging pdfs',e)
  }
}