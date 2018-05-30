#!/usr/bin/python3
import pymongo
import datetime
import signal
import time
import os

# Configuration parameters
# interval between service loop iterations
MAIN_LOOP_INTERVAL = datetime.timedelta(seconds=15)
# measures older than that aren't taken into account for room status computation
STALE_MEASURE_DELTA = datetime.timedelta(minutes=5)
# if motion is deteclted in the last interval, a room is occupied
OCCUPANCY_DELTA = datetime.timedelta(minutes=10)

# Database connection
client = pymongo.MongoClient(os.environ['MONGO']) if 'MONGO' in os.environ else pymongo.MongoClient()
db = client['ewee']


def get_room_list():
    """Returns the list of room IDs.
    """
    return [room['_id'] for room in db.rooms.find({})]


def get_room_device(room_id, field):
    """Gets the ID of a device with the requested field in the room.
     - room_id: room identifier
     - field: request field name
    Returns:
       a device identifier, or None if no such device exists
    """
    # gets the list of devices currently bound to this room
    room = db.rooms.find_one({'_id': room_id})
    if room is not None:
        # look up for a measure with the requested field coming from a device bound to our room
        measure = db.measures.find_one({'room': room_id, 'id': {'$in': room['things']}, field: {'$exists': True}})
        if measure is not None:
            # we've found a matching device
            return measure['id']
    return None


def post_new_action(room_id, actuator_type, value):
    """Adds a new action if there is an actuator in the room.
     - room_id: room identifier
     - actuator_type: a field name
     - value: the field value
    """
    # look up for an actuator of this kind in the room
    actuator = get_room_device(room_id, actuator_type)
    # boolean fields are on/off literals in the attribute
    if type(value) is bool:
        value = "on" if value else "off"
    if actuator:
        # add new action if there's an actuator for that
        db.actions.insert_one(
            {'room': room_id, 'timestamp': datetime.datetime.utcnow(), 'agent': 'auto', 'id': actuator,
             actuator_type: value})


def detect_room_occupancy(room_id, since):
    """Checks if the room has been occupied since a certain moment.
     - room_id: room identifier
     - since: a timestamp, occupancy is checked since this moment
    Returns:
       True if motion has been detected in any moment after (since - OCCUPANCY_DELTA),
       False if no motion has been detected, None if no data is available
    """
    # get recent PIR measures for this room
    pir_measures = list(
        db.measures.find({'room': room_id, 'timestamp': {'$gte': since - OCCUPANCY_DELTA}, 'pir': {'$exists': True}}))
    if not pir_measures:
        # we don't have data
        return None
    for pir_measure in pir_measures:
        # if there has been motion, the room is occupied
        if pir_measure['pir']:
            return True
    # no motion, room is empty
    return False


def update_room_status(room_id):
    """Updates the status of the room into the database and returns it.
     - room_id: room identifier
    Returns:
       the room status, as put into the database
    """
    # the moment is now
    timestamp = datetime.datetime.utcnow()
    # constructing the new room status
    status = {'room': room_id, 'timestamp': timestamp}
    # update each field
    for field in ['temp', 'humidity', 'light', 'carbon']:
        # get latest measures from sensors
        latest_measurement = db.measures.find_one(
            {'$query': {'room': room_id, field: {'$exists': True}}, '$orderby': {'timestamp': -1}})
        if latest_measurement is None or latest_measurement['timestamp'] < (timestamp - STALE_MEASURE_DELTA):
            # no recent data or no sensors for this field
            status[field] = None
        else:
            status[field] = latest_measurement[field]
    # detect occupancy
    status['occupied'] = detect_room_occupancy(room_id, timestamp)
    # update room status in db and return it, for later use
    db.status.update_one({'room': room_id}, {'$set': status}, upsert=True)
    return status


def check_and_enforce_policy(room_id, status):
    """Checks if the room status conforms to the policy and takes the necessary actions.
     - room_id: room identifier
     - status: current room status
    """
    # get the current policy
    policy = db.policy.find_one({'room': room_id})
    if policy is None or status['occupied'] is None:
        # no policy, nothing to do
        return
    # occupation-dependent policies
    policy_to_enforce = policy['occupied'] if status['occupied'] else policy['empty']
    # constructing new policy status (i.e., if fields conform to policy requirements)
    policy_status = {'temp': None, 'light': None, 'carbon': None}
    # control room temperature
    if status['temp'] is not None:
        if status['temp'] < policy_to_enforce['temp']['min']:
            # too cold
            post_new_action(room_id, 'cooling', False)
            post_new_action(room_id, 'heating', True)
            policy_status['temp'] = False
        elif status['temp'] > policy_to_enforce['temp']['max']:
            # too hot
            post_new_action(room_id, 'cooling', True)
            post_new_action(room_id, 'heating', False)
            policy_status['temp'] = False
        else:
            # temperature is fine
            post_new_action(room_id, 'cooling', False)
            post_new_action(room_id, 'heating', False)
            policy_status['temp'] = True
    # occupation-dependent controls
    if status['occupied']:
        if status['light'] is not None:
            # turn on lights if the room is occupied and the illumination is insufficient
            post_new_action(room_id, 'illumination', status['light'] < policy_to_enforce['light'])
            policy_status['light'] = (status['light'] > policy_to_enforce['light'])
        if status['carbon'] is not None:
            # clean up the air if the room is occupied and the CO2 concentration is above limits
            post_new_action(room_id, 'fan', status['carbon'] > policy_to_enforce['carbon'])
            policy_status['carbon'] = (status['carbon'] < policy_to_enforce['carbon'])
    elif not status['occupied']:
        # no illumination nor air conditioning for empty rooms
        post_new_action(room_id, 'illumination', False)
        post_new_action(room_id, 'fan', False)
        policy_status['light'] = True
        policy_status['carbon'] = True
    # update policy status in room status
    db.status.update_one({'room': room_id}, {'$set': {'policy': policy_status}})


def smart_loop():
    """Performs the check status-enforce policy loop actions.
    """
    rooms = get_room_list()
    # update the status and enforce the policy for each room
    for room in rooms:
        status = update_room_status(room)
        check_and_enforce_policy(room, status)


def sigusr1_handler(signum, frame):
    """Handles USR1 signal to force loop iteration.
     - signum: signal code (unused)
     - frame: stack frame (unused)
    """
    # actually do nothing, already woken up from the sleep
    pass


if __name__ == '__main__':
    # set handler for USR1 signal
    signal.signal(signal.SIGUSR1, sigusr1_handler)
    # service infinite loop
    while True:
        smart_loop()
        time.sleep(MAIN_LOOP_INTERVAL.total_seconds())
