let invoiceColumns = [
  {
    title: 'dashboard.document.name',
    dataIndex: 'name',
    customRender: 'customRender',
  },
  {
    title: 'dashboard.document.template',
    dataIndex: 'filter',
    customRender: 'customRenderComposed',
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
