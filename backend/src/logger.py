import datetime


def protected(func):
    def wrapper(*args, **kwargs):
        try:
            return func(*args,**kwargs)
        except :
            pass
    return wrapper

class Logger:
    def __init__(self, file_path):
        try:
            self.file_path = file_path
            self.file = open(file_path, "w")
        except Exception as e:
            pass
    @protected

    def info(self, msg='test'):
        time = datetime.datetime.now().strftime('%H:%M')
        self.file.write(f'[INFO] {time} {msg}\n')
        self.file.flush()
    @protected
    def error(self, msg='test'):
        time = datetime.datetime.now().strftime('%H:%M')
        self.file.write(f'[ERROR] {time} {msg}\n')
        self.file.flush()
    @protected
    def warning(self, msg='test'):
        time = datetime.datetime.now().strftime('%H:%M')
        self.file.write(f'[WARNING] {time} {msg}\n')
        self.file.flush()
    @protected    
    def close(self):
        self.file.close()

log = Logger('./data.log')
