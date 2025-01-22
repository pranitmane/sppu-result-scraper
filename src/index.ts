process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'; //this is needed to bypass the SSL certificate verification, as the server is using a self-signed certificate and not a trusted one.

import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';
import { studentData,mergeAllPDFs,analytics, studentType, statObjType} from './data'

async function getResultPDF(SeatNo: String, MotherName: String): Promise<statObjType> {

  let statsObj: statObjType = { seatNo: SeatNo, success: false };
  const url = "https://onlineresults.unipune.ac.in/Result/Dashboard/ViewResult1";
  const filePath = `./results/${SeatNo}.pdf`;
  const form = new FormData();
  form.append('SeatNo', `${SeatNo}`);
  form.append('MotherName', `${MotherName}`);
  form.append('PatternID', 'm1BNQI1K4Neq+T7ZlFSbDA==');
  form.append('PatternName', 'yahYElezAOBYysbVmdmCzFpvsbYjuNVYBNDJjg1oBqE=');

  try {
    console.log(`Getting result for ${SeatNo}`)
    const response = await axios.post(url, form,{responseType: 'arraybuffer'})
    const contentType = response.headers['content-type']
    if (contentType == 'application/pdf') {
      await fs.promises.writeFile(filePath,response.data)
      console.log(SeatNo, 'success')
      statsObj.success = true;
      return statsObj;
    } else {
      console.log(SeatNo, 'failed')
      statsObj.success = false;
      return statsObj;
    }
  } catch (e) {
    console.error(`error occurred for ${SeatNo}`, e)
    return statsObj;
  }
}

async function getResultPDFs(students: studentType[]) {
  const batchSize = 20;
  const delay = 2000;
  try {
    const allPromises = [];
    for (let i = 0; i < students.length; i += batchSize) {
      const batch = students.slice(i, Math.min(i + batchSize, students.length));
      const promises = batch.map(student =>
        getResultPDF(student.seatNo, student.name)
      );
      allPromises.push(...promises);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
    const statsArr = await Promise.all(allPromises);
    await mergeAllPDFs(statsArr)
    await fs.promises.writeFile('./stats.json', JSON.stringify(statsArr))
    console.log(await analytics('./stats.json'))
  } catch (e) {
    console.error("error when resolving promises", e)
  }
}

getResultPDFs(studentData)



