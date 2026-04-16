export const canAccess = (role, page) => {
  const permissions = {
    dashboard:       ['Cashier', 'Supervisor', 'Admin'],
    inventory:       ['Cashier', 'Supervisor', 'Admin'],
    'sales-record':  ['Cashier', 'Supervisor', 'Admin'],
    transact:        ['Cashier', 'Supervisor', 'Admin'],
    'generate-report': ['Supervisor', 'Admin'],
    'user-access':   ['Admin'],
    suppliers:       ['Admin'],
    clients:         ['Admin'],
  };
  return permissions[page]?.includes(role) ?? false;
};