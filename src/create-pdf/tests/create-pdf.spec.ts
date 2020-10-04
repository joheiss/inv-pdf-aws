import {InvoiceData, ReceiverData, DateUtility} from 'jovisco-domain';
import {InvoicePdfInputData} from 'jovisco-pdf';
import axios from 'axios';
import * as AWS from 'aws-sdk';
import aws4 from 'aws4';

describe('PDF tests', () => {
    it('should log the __dirname', () => {
        console.log('__dirname: ', __dirname);
    });
    it('should save a invoice PDF in an S3 bucket', async() => {
        const invoice = mockInvoice('5118');
        const receiver = mockReceiver('1901');
        const pdfInput: InvoicePdfInputData = {
            invoice,
            receiver
        };
        const request = {
            host: 'jxraw0zza3.execute-api.eu-central-1.amazonaws.com',
            method: 'POST',
            url: `https://jxraw0zza3.execute-api.eu-central-1.amazonaws.com/Prod/create-pdf`,
            data: pdfInput,
            path: `/Prod/create-pdf`,
            headers: {
                'content-type': 'application/json'
            }
        };

        const signedRequest = aws4.sign(request, {
            secretAccessKey: AWS.config.credentials.secretAccessKey,
            accessKeyId: AWS.config.credentials.accessKeyId,
            sessionToken: AWS.config.credentials.sessionToken
        });

        delete signedRequest.headers['Host'];
        delete signedRequest.headers['Content-Length'];

        await axios(signedRequest)
            .then(res => {
                expect(res.status).toEqual(200);
            })
            .catch(err => {
                console.error(err);
                expect(err).not.toBeDefined();
            });
    });
});

function mockInvoice(id: string): InvoiceData {
    const issuedAt = DateUtility.getCurrentDate();
    const billingPeriod = `September 2020`;
    const data: InvoiceData = {
        id: id,
        organization: 'GHQ',
        billingPeriod: billingPeriod,
        cashDiscountDays: 30,
        cashDiscountPercentage: 3,
        contractId: '4901',
        currency: 'EUR',
        dueInDays: 60,
        internalText: 'Das ist eine Testrechnung.',
        invoiceText: 'nach Aufwand',
        issuedAt: issuedAt,
        paymentTerms: '30 Tage: 3% Skonto; 60 Tage: netto',
        receiverId: '1901',
        vatPercentage: 19.0,
        items: [
            {
                id: 1,
                contractItemId: 1,
                cashDiscountAllowed: true,
                description: 'Arbeitszeit',
                quantity: 10,
                pricePerUnit: 100.00,
                quantityUnit: 'Std.',
                vatPercentage: 19.0
            }
        ]
    };
    return data;
}

function mockReceiver(id: string): ReceiverData {
    const data: ReceiverData = {
        id: id,
        organization: 'GHQ',
        name: 'Test Receiver 1901',
        address: {
            postalCode: '77777',
            city: 'Testingen',
            street: 'Test Allee 7',
            email: 'test@test.example.de',
            phone: '+49 777 7654321',
            fax: '+49 777 7654329',
            webSite: 'http://www.test.example.de'
        }
    };
    return data;
}
