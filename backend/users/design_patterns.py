
class ErrorBuilder():
    def __init__(self):
        self.error =  {"error" : {
            "type" : "",
            "message" : ""
        } }

    def set_type(self, exact_type):
        self.error["error"]["type"] = exact_type
        return (self)

    def set_message(self, to_send):
        self.error["error"]["message"] = to_send
        return (self)
    
    def build(self):
        return self.error

class TwoFA_Builder():
    def __init__(self):
        self.tfa = {
            "TFA": {
                "is_enabled": "",
                "token": ""
            },
            "redirection": ""
        }

    def set_is_enabled(self, bool):
        self.tfa["TFA"]["is_enabled"] = bool
        return self

    def set_token(self, token):
        self.tfa["TFA"]["token"] = token
        return self
    
    def set_redirection(self, redirect):
        self.tfa["redirection"] = redirect
        return self

    def build(self):
        return self.tfa
    
class Message_Builder():
    def __init__(self):
        self.message = {
            "message": "",
            "redirection": ""
        }
        
    def set_message(self, msg):
        self.message["message"] = msg
        return self

    def set_redirection(self, redirect):
        self.message["redirection"] = redirect
        return self

    def build(self):
        return self.message
