import localeAntd from 'ant-design-vue/lib/locale-provider/en_US'

const messages = {
  topBar: {
    issuesHistory: 'Issues History',
    typeToSearch: 'Start typing to search...',
    actions: 'Actions',
    status: 'Status',
    panesInvoice: 'Invoices',
    panesStatement: 'Bank Statements',
    profileMenu: {
      hello: 'Hello',
      company: 'Company',
      role: 'Role',
      email: 'Email',
      phone: 'Phone',
      editProfile: 'Edit Profile',
      logout: 'Logout',
    },
  },
  dashboard: {
    document: {
      invoiceTitle: 'Invoices',
      vendor: 'Vendor',
      bank: 'Bank',
      bankTitle: 'Bank Statements',
      extractions: 'Your extractions',
      upload: 'Upload Documents',
      validate: 'Validate Smelted',
      loading: 'Loading...',
      bulkDownload: 'Bulk Download',
      resetSettings: 'Reset Settings',
      view: 'View',
      remove: 'Remove',
      filterSettings: 'Filter Settings',
      name: 'Name',
      template: 'Template',
      client: 'Client',
      status: 'Status',
      dateAdded: 'Date Added',
      action: 'Action',
      placeholder: {
        name: `Type the Document's name`,
        template: 'Select a Template',
        status: 'Select a Status',
      },
      states: {
        pending: 'Pending',
        smelted: 'Smelted',
        validated: 'Validated',
      },
      modal: {
        askSingleDelete: 'Are you sure to delete: ',
        singleDeleteLoading: 'Deleting... ',
        askBulkDelete: 'Are you sure you want to delete the selected documents?\n Total selected: ',
        irreversibleAction: 'This action cannot be reverted.',
        askBulkArchive: 'Are you sure you want to archive these documents?\n Total selected: ',
        askBulkDearchive: 'Are you sure you want to dearchive these documents?\n Total selected: ',
        archiveLoading: 'Archiving...',
        askBulkValidate: 'Are you sure you want to validate these documents?\n Total selected: ',
        validateLoading: 'Updating... ',
        deleteSingleTitle: 'Delete Document',
        deleteBulkTitle: 'Delete Documents',
        archiveBulk: 'Archive Documents',
        validateBulk: 'Validate Documents',
      },
    },
  },
  subbar: {
    return: 'Return',
    select: 'Select',
    previous: 'Previous',
    next: 'Next',
    shortcutsView: 'View Shortcuts',
    shortcutsTitle: 'Keyboard Shortcuts',
    exportCSV: 'Export CSV',
    splitH: 'Split screen horizontally',
    splitV: 'Split screen vertically',
    validate: 'Validate',
    invalidate: 'Invalidate',
    archive: 'Archive',
    unarchive: 'Unarchive',
    keys: {
      tab: 'Tab',
      tabAction: 'Go to next entry',
      shift: 'Shift + Tab',
      shiftAction: 'Go to previous entry',
      ctrl: 'Keep Ctrl pressed',
      ctrlAction: 'Concatenate in same entry',
      enter: 'Enter',
      enterAction: 'Go to next file',
    },
  },
  windows: {
    downloadImg: 'Download Image',
    downloadPdf: 'Download PDF',
    of: 'of',
  },
  upload: {
    title: 'Upload Documents',
    credits: 'Monthly Credit Limit',
    searchClient: 'Search Client',
  },
  template: {
    addButton: 'Add New Template',
    addTitle: 'Add New Template',
    view: 'View Template',
    delete: 'Delete Template',
    constructCopy: 'Create Copy',
    copy: 'Copy',
    typeSelect: 'Select a type: Expense or Sale',
    addField: 'Add field',
    submit: 'Submit',
    actions: 'Actions',
    insertLine: 'Insert line',
    insertBelow: 'Insert empty line below',
    insertAbove: 'Insert empty line above',
    deleteAction: 'Delete',
  },
  accounting: {
    expense: 'Expense',
    sale: 'Sale',
  },
  client: {
    dashboardTitle: 'Your clients',
    add: 'Add New Client',
    cancel: 'Cancel',
    searchClient: `Type the Client's name`,
    fullName: 'Full Name',
    ref: 'Reference',
    clientref: 'Client Reference',
    email: 'Email Address',
    company: 'Company Name',
    number: 'Phone Number',
  },
  util: {
    submit: 'Submit',
    view: 'View',
    remove: 'Remove',
  },
}

export default {
  locale: 'en-US',
  localeAntd,
  messages,
}
