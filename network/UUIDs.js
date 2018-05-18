const UUIDs = {
  "temp": "0x2A1F",
  "humidity": "0x2A1F",
  "light": "0x2A77",
  "pir": "0x2AC5",
  "door": "0x0000",
  "carbon": "0x0001",
  "gas": "0x0002"
};

/**
 * Given a UUID return the property corresponding to that UUID
 * @param uuid
 * @return string, the property, or null if the UUID is not in the list
 */
function UUIDToProperty(uuid) {
  for (const key in UUIDs)
    if(UUIDs[key] === uuid) return key;
  return null;
}

/**
 * Given a property return the UUID corresponding to that property
 * @param property
 * @returns string, the UUID, or null if the property is not in the list
 */
function propertyToUUID(property) {
  return UUIDs[property] ? UUIDs[property] : null;
}

module.exports = {
  UUIDs : UUIDs,
  UUIDToProperty: UUIDToProperty,
  propertyToUUID: propertyToUUID
};
