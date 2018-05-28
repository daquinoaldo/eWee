const UUIDs = {
  "temp": "2A1F",
  "humidity": "2A6F",
  "light": "2A77",
  "pir": "2AC5",
  "door": "0000",
  "carbon": "0001",
  "blink": "0003",
  "illumination": "0002"
};

/**
 * Given a UUID return the property corresponding to that UUID
 * @param uuid
 * @return string, the property, or null if the UUID is not in the list
 */
function UUIDToProperty(uuid) {
  for (const key in UUIDs)
    if(UUIDs[key].toLowerCase() === uuid.toLowerCase()) return key;
  return null;
}

/**
 * Given a property return the UUID corresponding to that property
 * @param property
 * @returns string, the UUID, or null if the property is not in the list
 */
function propertyToUUID(property) {
  return UUIDs[property] ? UUIDs[property].toLowerCase() : null;
}

module.exports = {
  UUIDs : UUIDs,
  UUIDToProperty: UUIDToProperty,
  propertyToUUID: propertyToUUID
};
