import {APIGatewayEvent, Context} from 'aws-lambda';
import {FormOptions, InvoicePdfInputData, InvoiceForm, InvoiceFormDataMapper} from 'jovisco-pdf';
import {S3} from 'aws-sdk';
import {PutObjectRequest} from 'aws-sdk/clients/s3';
import * as fs from 'fs';
import {ReadStream} from 'fs';

let response;

export const handler = async (event: APIGatewayEvent, _: Context) => {
    try {
        const id = event.pathParameters?.id;
        const body: InvoicePdfInputData = JSON.parse(event.body);
        const form = createPdf(body);
        const result = await storePdf(form, id);
        console.log('Result: ', result);
        response = {
            headers: {
                'Access-Control-Allow-Headers' : 'Content-Type',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'OPTIONS,POST,GET',
                'Content-Type': 'application/json'
            },
            statusCode: 200,
            body: JSON.stringify({
                message: `Hi Josef, invoice R${id} has been created.`,
            })
        }
    } catch (err) {
        console.log(err);
        return err;
    }
    return response
};

const createPdf = (body: InvoicePdfInputData): InvoiceForm =>  {
    // prepare invoice PDF
    const formData = new InvoiceFormDataMapper(body.invoice, body.receiver).map();
    const options: FormOptions = {
        headerImagePath: './assets/img/jovisco-letter-head.png',
        footerImagePath:  './assets/img/jovisco-letter-foot.png',
        addressLineImagePath: './assets/img/adresse_mini.jpg'
    };
    const invoiceForm = new InvoiceForm(options, formData);
    invoiceForm.print();
    return invoiceForm;
}


async function storePdf(form: InvoiceForm, id: string): Promise<any> {
    try {
        const tmpPath = `/tmp/R${id}.pdf`;
        const documentPath = `docs/invoices/${id}/R${id}.pdf`;
        await form.saveAsWithPromise(tmpPath);
        if (fs.existsSync(tmpPath)) {
            console.log('File exists: ', tmpPath);
            const data = fs.createReadStream(tmpPath);
            return await createS3Object(documentPath, data);
        } else {
            console.error('File does not exist: ', tmpPath);
            return undefined;
        }
    } catch (err) {
        console.error(err);
        throw new Error(err);
    }
}

async function createS3Object(documentPath: string, data: ReadStream) {
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
        .catch((err => console.log(err)));
}
