import {FormOptions, InvoiceForm, InvoiceFormDataMapper, InvoicePdfInputData} from 'jovisco-pdf';

export const createPdf = (body: InvoicePdfInputData): InvoiceForm =>  {

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
