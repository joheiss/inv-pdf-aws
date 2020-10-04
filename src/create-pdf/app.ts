import {APIGatewayEvent, Context} from 'aws-lambda';
import {InvoicePdfInputData} from 'jovisco-pdf';
import {createPdf, storePdf} from './services';

let response;

export const handler = async (event: APIGatewayEvent, _: Context) => {
    try {
        const body: InvoicePdfInputData = JSON.parse(event.body);
        const form = createPdf(body);
        await storePdf(form);
        response = {
            headers: {
                'Access-Control-Allow-Headers' : 'Content-Type',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'OPTIONS,POST,GET',
                'Content-Type': 'application/json'
            },
            statusCode: 200,
            body: JSON.stringify({
                message: `Hi Josef, invoice R${body.invoice.id} has been created.`,
            })
        }
    } catch (err) {
        console.log(err);
        throw err;
    }
    return response
};


