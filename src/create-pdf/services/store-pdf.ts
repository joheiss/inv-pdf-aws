import {InvoiceForm} from 'jovisco-pdf';
import fs, {ReadStream} from "fs";
import {PutObjectRequest} from 'aws-sdk/clients/s3';
import {S3} from 'aws-sdk';

export async function storePdf(form: InvoiceForm): Promise<any> {
    const id = form.getId();
    const tmpPath = `/tmp/R${id}.pdf`;
    const documentPath = `docs/invoices/${id}/R${id}.pdf`;
    return await form.saveAsWithPromise(tmpPath)
        .then(async () => {
            if (fs.existsSync(tmpPath)) {
                const data = fs.createReadStream(tmpPath);
                return await createS3Object(documentPath, data);
            } else {
                throw new Error(`File ${tmpPath} not found`);
            }
        })
        .catch(err => {
            console.log(err);
            throw err;
        });
}

async function createS3Object(documentPath: string, data: ReadStream):Promise<any> {
    const params: PutObjectRequest = {
        Key: documentPath,
        Body: data,
        Bucket: `com.jovisco.sandbox.test.invoicing`,
        ContentType: `application/pdf`
    };
    const s3 = new S3();
    return await s3.putObject(params).promise()
        .then(res => {
            console.log('*** Invoice stored in S3 bucket: ', params.Bucket + '/' + documentPath);
            return res;
        })
        .catch(err => {
            console.log(err);
            throw err;
        });
}

