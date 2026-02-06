"""
    teodeloso@gmail.com

    accepts requests coming from the To-do List Manager (front-end side)
"""
from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import os
from pathlib import Path
import logging
from filelock import FileLock, Timeout 

# api url name
API_NAME = "tlmanager"

API_DIR = Path(__file__).resolve().parent

# data storage implemented as json file
DB_FILENAME = f"{API_NAME}-d.json"
DB_FILE = f"{API_DIR}/{DB_FILENAME}"

# file used for atomic writes
DB_FILENAME_TMP = f"{DB_FILENAME}.tmp"

# file used to coordinate access between processes
DB_FILENAME_LOCK = f"{DB_FILENAME}.lock"

# create file lock object with a timeout (in seconds)
# prevents deadlocks
lock = FileLock(DB_FILENAME_LOCK, timeout=5)

# create flask obj
app = Flask(__name__)

# handle cors issue
CORS(app)

# config logging (cross-platform)
LOG_FILE = f"{API_DIR}/{API_NAME}.log"

logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)
handler = logging.FileHandler(LOG_FILE, mode="a")
handler.setLevel(logging.INFO)
formatter = logging.Formatter("%(asctime)s [%(levelname)s] %(name)s: %(message)s")
handler.setFormatter(formatter)
logger.addHandler(handler)
logger.propagate = False

# create / initialize our database (if none exists)
try:
    # acquire the file lock (blocks until acquired or timeout)
    with lock:
        try:
            # open a temp file for writing
            # we never write directly to DB_FILE
            with open(DB_FILENAME_TMP, "w") as file:
                json.dump([], file)
                # flush python's internal buffer to the OS buffer
                file.flush()
                # force OS to flush buffers to disk
                # prevents data loss on sudden crashes
                os.fsync(file.fileno())
            # replace the old data file with the new one
            # this is atomic on modern OS
            os.replace(DB_FILENAME_TMP, DB_FILE)

            logger.info("DB created / initialized: [%s]", DB_FILE)

        except (OSError, IOError, json.JSONDecodeError) as e:
            logger.exception("failed during atomic write: DB File: [%s]", DB_FILE)
            # raise a clean, application-level error
            raise RuntimeError("failed to create/initialize DB atomically") from e

except Timeout as e:
    # lock not be acquired within timeout
    logging.error("Could not acquire DB lock")
    # fail fast instead of blocking forever
    raise RuntimeError("DB is currently locked by another ops") from e

finally:
    # remove temp file if it still exists
    # can happen if an exception occurred mid-write
    if os.path.exists(DB_FILENAME_TMP):
        try:
            os.remove(DB_FILENAME_TMP)
        except OSError:
            # failure is non-fatal but should be logged
            logging.warning("failed to cleanup DB ops")


# handles get request 
def handle_get():
    logger.info("handle_get() : receives GET request")

    try:
        # acquire the same lock
        # ensures we don't read while a write is happening
        with lock:
            with open(DB_FILE, "r") as file:
                logger.info("handle_get() : sending data from database")
                return jsonify(json.load(file)), 200

    except FileNotFoundError:
        logger.warning("handle_get() : DB missing")
        return {"status": "DB missing"}, 404

    except json.JSONDecodeError as e:
        logger.exception("handle_get() : DB corrupted")
        raise RuntimeError("handle_get() : DB corrupted") from e
    
    except Timeout as e:
        logger.error("handle_get() : could not acquire DB lock")
        raise RuntimeError("handle_get() : DB busy, try again") from e

# handles post request
def handle_post(new_data):
    logger.info("handle_post() : receives POST request")

    try:
        with lock:
            try:
                with open(DB_FILE, "r") as file:
                    db_data = json.load(file)
                    
            except FileNotFoundError:
                logger.error("handle_post() : DB file missing")
                return {"status": "DB file missing"}, 404

            except json.JSONDecodeError:
                logger.error("handle_post() : DB file corrupted")
                return {"status": "DB file corrupted"}, 500
            
            # append new_data to the in-memory db_data
            db_data.append(new_data)

            try:
                with open(DB_FILENAME_TMP, "w") as file:
                    json.dump(db_data, file)
                    file.flush()
                    os.fsync(file.fileno())

                os.replace(DB_FILENAME_TMP, DB_FILE)
                logger.info("handle_post() : new_data saved")
                return {"status": "ok"}, 200

            except (OSError, IOError, json.JSONDecodeError) as _:
                logging.exception("handle_post() : DB write failed")
                return {"status": "OSError, IOError, JSONEncodeError"}, 500
            
    except Timeout as e:
        logging.error("handle_post() : could not acquire DB lock")
        raise RuntimeError("handle_post() : DB currently locked by another ops") from e

    finally:
        if os.path.exists(DB_FILENAME_TMP):
            try:
                os.remove(DB_FILENAME_TMP)
            except OSError:
                logging.warning("handle_post() : failed to cleanup DB ops")

# handles patch request
def handle_patch(updated_data):
    logger.info("handle_patch() : receives PATCH request")
    
    updated_data_id = updated_data.get("id")
    if updated_data_id is None:
        logger.warning("handle_patch() : updated_data_id missing")
        return {"status": "updated_data_id missing"}, 404
    
    try:
        with lock:
            try:
                with open(DB_FILE, "r") as file:
                    db_data = json.load(file)
                    
            except FileNotFoundError:
                logger.error("handle_patch() : DB file missing")
                return {"status": "DB file missing"}, 404

            except json.JSONDecodeError:
                logger.error("handle_patch() : DB file corrupted")
                return {"status": "DB file corrupted"}, 500
            
            #process
            for data in db_data:
                if data.get("id") == updated_data_id:

                    # dynamically update the fields except the "id".
                    # this creates a dict of updates
                    updates = {key: value for key, value in updated_data.items() if key != "id"}

                    if not updates:
                        logger.warning("handle_patch() : updated_data does not matched database")
                        return {"status": "updated_data does not matched database"}, 404

                    # apply updates to the matched updated_data_id
                    data.update(updates)
                    break
            else:
                # if for loop completes without finding a match
                logger.error("handle_patch() : updated_data_id not found in database")

            # save the updated data back to the database
            try:
                with open(DB_FILENAME_TMP, "w") as file:
                    json.dump(db_data, file, indent=2)
                    file.flush()
                    os.fsync(file.fileno())

                os.replace(DB_FILENAME_TMP, DB_FILE)
                logger.info("handle_patch() : updated_data saved to database")
                return {"status": "ok"}, 200

            except (OSError, IOError, json.JSONDecodeError) as _:
                logging.exception("handle_patch() : DB write failed")
                return {"status": "OSError, IOError, JSONEncodeError"}, 500

    except Timeout as e:
        logging.error("handle_patch() : could not acquire DB lock")
        raise RuntimeError("handle_patch() : DB currently locked by another ops") from e

    finally:
        if os.path.exists(DB_FILENAME_TMP):
            try:
                os.remove(DB_FILENAME_TMP)
            except OSError:
                logging.warning("handle_patch() : failed to cleanup DB ops")

# handles delete request
@app.route(f"/{API_NAME}/<int:data_id>", methods=["DELETE"])
def handle_delete(data_id):
    logger.info("handle_delete() : receives DELETE request")

    try:
        with lock:
            try:
                with open(DB_FILE, "r") as file:
                    # get all tasks from db and put into a python list
                    db_data = json.load(file)
                    
            except FileNotFoundError:
                logger.error("handle_delete() : DB file missing")
                return {"status": "DB file missing"}, 404

            except json.JSONDecodeError:
                logger.error("handle_delete() : DB file corrupted")
                return {"status": "DB file corrupted"}, 500
            
            # create another list that excludes the task to be deleted using the data_id
            # this way, the task is deleted
            data_id = str(data_id)
            updated_data = [data for data in db_data if data.get("id") != data_id]

            # if db_data length did not change then data_id not found
            if len(updated_data) == len(db_data):
                logger.warning("handle_delete() : task not found")
                return {"status": "task not found"}, 404
            
            # save updated_data to db
            try:
                with open(DB_FILE, "w") as file:
                    json.dump(updated_data, file, indent=2)
                    file.flush()
                    os.fsync(file.fileno())

                os.replace(DB_FILENAME_TMP, DB_FILE)
                logger.info("handle_delete() : task deleted")
                return {"status": "ok"}, 200

            except (OSError, IOError, json.JSONDecodeError) as _:
                logging.exception("handle_delete() : DB write failed")
                return {"status": "OSError, IOError, JSONEncodeError"}, 500

    except Timeout as e:
        logging.error("handle_delete() : could not acquire DB lock")
        raise RuntimeError("handle_delete() : DB currently locked by another ops") from e

    finally:
        if os.path.exists(DB_FILENAME_TMP):
            try:
                os.remove(DB_FILENAME_TMP)
            except OSError:
                logging.warning("handle_delete() : failed to cleanup DB ops")

# handle endpoints
@app.route(f"/{API_NAME}", methods=["GET", "POST", "PATCH"])
def todo_list_manager_server():
    logger.info("todo_list_manager_server() : receives request")

    if request.method == "GET":
        return handle_get()

    elif request.method == "POST":
        # limiting the number of tasks saved is done via front-end.
        # for the back-end side, it will be in the coming versions
        return handle_post(request.json)

    elif request.method == "PATCH":
        return handle_patch(request.get_json())
    
    else:
        logger.info("todo_list_manager_server() : request not processed")
        return {"status": "request not processed"}, 404 

# handle health check
@app.route("/health", methods=["GET"])
def health_check():
    try:
        # lightweight database check
        open(DB_FILE).close()
        
        return {"status": "ok"}, 200
    
    except Exception:
        return {"status": "unhealthy"}, 500


"""
    comment below code before deployment 
"""
# if __name__ == "__main__":
#      app.run(debug=True)
