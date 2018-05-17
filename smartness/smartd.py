#!/usr/bin/python3
import pymongo
import datetime
import signal
import time

# configuration and parameters
MAIN_LOOP_INTERVAL = 30 #seconds
STALE_MEASURE_DELTA = datetime.timedelta(minutes=5)
OCCUPANCY_DELTA = datetime.timedelta(minutes=10)

# database connection
client = pymongo.MongoClient()
db = client['mcps']

def get_room_list():
    # returns the list of room IDs
    return [room['_id'] for room in db.rooms.find({})]

def get_room_device(room_id, field):
    # returns the ID of room device for field, or None
    room = db.rooms.find_one({'_id': room_id})
    if room is not None:
        measure = db.measures.find_one({'room': room_id, 'id': {'$in': room['things']}, field: {'$exists': True}})
        if measure is not None:
            return measure['id']
    return None

def post_new_action(room_id, actuator_type, value):
    # adds a new action if there is an actuator in the room
    actuator = get_room_device(room_id, actuator_type)
    if actuator:
        db.actions.insert_one({'room': room_id, 'timestamp': datetime.datetime.utcnow(), 'agent': 'auto', 'id': actuator, actuator_type: value})

def detect_room_occupancy(room_id, since):
    # returns true if PIR has detected motion lately, None if no recent data
    pir_measures = list(db.measures.find({'room': room_id, 'timestamp': {'$gte': since - OCCUPANCY_DELTA}, 'pir': {'$exists': True}}))
    if not pir_measures:
        return None
    for pir_measure in pir_measures:
        if pir_measure['pir'] == True:
            return True
    return False

def update_room_status(room_id):
    # updates the status of the room into the db and returns it
    timestamp = datetime.datetime.utcnow()
    status = {'room': room_id, 'timestamp': timestamp}
    for field in ['temp', 'humidity', 'light', 'carbon']:
        latest_measurement = db.measures.find_one({'$query': {'room': room_id, field: {'$exists': True}}, '$orderby': {'timestamp': -1}})
        if latest_measurement is None or latest_measurement['timestamp'] < (timestamp - STALE_MEASURE_DELTA):
            status[field] = None
        else:
            status[field] = latest_measurement[field]
    status['occupied'] = detect_room_occupancy(room_id, timestamp)
    db.status.update_one({'room': room_id}, {'$set': status}, upsert=True)
    return status

def check_and_enforce_policy(room_id, status):
    # keep the user comfortable by keeping the developer uncomfortable
    policy = db.policy.find_one({'room': room_id})
    if policy is None or status['occupied'] is None:
        return
    policy_to_enforce = policy['occupied'] if status['occupied'] else policy['empty']
    if status['temp'] is not None:
        if status['temp'] < policy_to_enforce['temp']['min']:
            post_new_action(room_id, 'cooling', False)
            post_new_action(room_id, 'heating', True)
        elif status['temp'] > policy_to_enforce['temp']['max']:
            post_new_action(room_id, 'cooling', True)
            post_new_action(room_id, 'heating', False)
        else:
            post_new_action(room_id, 'cooling', False)
            post_new_action(room_id, 'heating', False)
    if status['occupied'] == True:
        if status['light'] is not None:
            post_new_action(room_id, 'illumination', status['light'] < policy_to_enforce['light'])
        if status['carbon'] is not None:
            post_new_action(room_id, 'fan', status['carbon'] > policy_to_enforce['carbon'])
    elif status['occupied'] == False:
        post_new_action(room_id, 'illumination', False)
        post_new_action(room_id, 'fan', False)

def smart_loop():
    # business logic here
    while True:
        rooms = get_room_list()
        for room in rooms:
            status = update_room_status(room)
            check_and_enforce_policy(room, status)

def sigusr1_handler():
    # handle SIGUSR1 signal for forced loop iteration
    pass

if __name__ == '__main__':
    signal.signal(signal.SIGUSR1, sigusr1_handler)
    while True:
        smart_loop()
        time.sleep(MAIN_LOOP_INTERVAL)
