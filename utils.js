const matchIds = (id) => (obj) => obj.id === id;

const getObjectById = (array, id) => array.find(matchIds(id));

const getObjectIndexById = (array, id) => array.findIndex(matchIds(id));

export { matchIds, getObjectById, getObjectIndexById };
