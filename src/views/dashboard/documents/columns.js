let invoiceColumns = [
  {
    title: 'dashboard.document.name',
    dataIndex: 'name',
    customRender: 'customRender',
  },
  {
    title: 'dashboard.document.vendor',
    dataIndex: 'vendor',
    customRender: 'customRender',
  },
  {
    title: 'dashboard.document.invoiceDate',
    dataIndex: 'invoiceDate',
    customRender: 'invoiceDate',
  },
  {
    title: 'Journal',
    dataIndex: 'journal.name',
  },
  {
    title: 'dashboard.document.client',
    dataIndex: 'client',
    customRender: 'customRenderComposed',
  },
  {
    title: 'dashboard.document.status',
    dataIndex: 'status',
    customRender: 'status',
  },
  {
    title: 'dashboard.document.dateAdded',
    dataIndex: 'date',
    customRender: 'date',
  },
  {
    title: 'dashboard.document.action',
    customRender: 'action',
  },
]

let bankColumns = [
  {
    title: 'dashboard.document.name',
    dataIndex: 'name',
    customRender: 'customRender',
  },
  {
    title: 'dashboard.document.bank',
    dataIndex: 'bankEntity',
    customRender: 'customRender',
  },
  {
    title: 'dashboard.document.dateFrom',
    dataIndex: 'dateBeg',
    customRender: 'dateBeg',
  },
  {
    title: 'dashboard.document.dateTo',
    dataIndex: 'dateEnd',
    customRender: 'dateEnd',
  },
  {
    title: 'dashboard.document.client',
    dataIndex: 'client',
    customRender: 'customRenderComposed',
  },
  {
    title: 'dashboard.document.status',
    dataIndex: 'status',
    customRender: 'status',
  },
  {
    title: 'dashboard.document.dateAdded',
    dataIndex: 'date',
    customRender: 'date',
  },
  {
    title: 'dashboard.document.action',
    customRender: 'action',
  },
]

module.exports = {
  invoiceColumns,
  bankColumns,
}
