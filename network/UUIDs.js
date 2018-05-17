const UUIDs = {
  "temp": "2A1F",
  "humidity": "2A6F",
  "light": "2A77",
  "pir": "2AC5",
  "door": "0000",
  "carbon": "0001"
};

function UUIDToProperty(uuid) {

}

function propertyToUUID(property) {

}

///////// TODO: è solo una bozza da rivedere, da usare per cnvertire gli oggetti della rete in oggetti db e vice versa
function UUIDsToProperties(obj) {
  const dbObj = {};
  for (const key in obj)
    dbObj[UUIDToProperty(key)] = obj[key];
  return dbObj;
}

function propertiesToUUIDs(obj) {
  const dbObj = {};
  for (const key in obj)
    if (key in UUIDs)
      dbObj[propertyToUUID(key)] = obj[key];
    else dbObj[key] = obj[key];
  return dbObj;
}
//////////////////////////////////////////////////

module.exports = {
  UUIDs : UUIDs,
  UUIDToProperty: UUIDToProperty,
  propertyToUUID: propertyToUUID
};
