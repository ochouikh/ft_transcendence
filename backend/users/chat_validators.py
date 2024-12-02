import json


def validate_messages_request(data):
    expected_keys = {'user_id', 'conversation_id'}

    if not expected_keys.issubset(data.keys()):
        return False

    if not isinstance(data['user_id'], int) or data['user_id'] < 1:
        return False
    if not isinstance(data['conversation_id'], int) or data['conversation_id'] < 1:
        return False
    if 'message_id' in data and data['message_id']:
        if not isinstance(data['message_id'], int) or data['message_id'] < 1:
            return False
    return True

def validate_send_message_request(data):
    expected_keys = {'id', 'message', 'sender', 'receiver'}

    if not expected_keys.issubset(data.keys()):
        return False

    if not isinstance(data['id'], int) or data['id'] < 1:
        return False
    if data['message'] is None or not isinstance(data['message'], str) :
        return False
    if not isinstance(data['sender'], str):
        return False
    if not isinstance(data['receiver'], str):
        return False
    if data['sender'] == data['receiver']:
        return False
    return True

def validate_online_users_request(data):

    expected_keys = {'user_id'}

    if not expected_keys.issubset(data.keys()):
        return False

    if not isinstance(data['user_id'], int) or data['user_id'] < 1:
        return False    
    return True

def validate_friends_users_request(data):

    expected_keys = {'user_id', 'offset', 'limit'}

    if not expected_keys.issubset(data.keys()):
        return False
        
    if not isinstance(data['user_id'], int) or data['user_id'] < 1:
        return False
    if not isinstance(data['offset'], int) or data['offset'] < 0:
        return False
    if not isinstance(data['limit'], int) or data['limit'] < 1:
        return False
    return True

def validate_search_friend_request(data):
    expected_keys = {'user_id', 'search', 'offset', 'limit'}

    if not expected_keys.issubset(data.keys()):
        return False
    
    if not isinstance(data['user_id'], int) or data['user_id'] < 1:
        return False
    if not isinstance(data['search'], str):
        return False
    if not isinstance(data['offset'], int) or data['offset'] < 0:
        return False
    if not isinstance(data['limit'], int) or data['limit'] < 1:
        return False
    return True

def validate_get_conversations_request(data):

    expected_keys = {'user1', 'user2'}

    if not expected_keys.issubset(data.keys()):
        print(f'HREREREE : 1')
        return False

    if not isinstance(data['user1'], str):
        print(f'HREREREE : 2')
        return False
    if not isinstance(data['user2'], str):
        print(f'HREREREE : 3')
        return False
    print(f'HREREREE : 4')
    return True
