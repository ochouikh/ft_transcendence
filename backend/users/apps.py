from django.apps import AppConfig

class UsersConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'users'

    def ready(self):
        
        try:
            print("UsersConfig is ready")
            from django.db.models.signals import pre_save
            from users.models import Conversation , User,Level 
            from users.signals import check_update_conversation  # Lazy import
            pre_save.connect(check_update_conversation, sender=Conversation)
            print("Signal connected")
            User.objects.update(is_online=False)
            print("[info][alphaben] set all User Offline is Dane")







            print("set Level if dos'nt exist")
            levels = [
                Level(id=0, level_no=0, name="Starter",          image="media/levels/starter.svg"),
                Level(id=1, level_no=1, name="Beginner",         image="media/levels/beginner.svg"),
                Level(id=2, level_no=2, name="Intermediate",     image="media/levels/intermediate.svg"),
                Level(id=3, level_no=3, name="Elite",         image="media/levels/elite.svg"),
                Level(id=4, level_no=4, name="Legend",           image="media/levels/legend.svg"),
                Level(id=5, level_no=5, name="Asendant",            image="media/levels/asendant.svg"),
            ]

            for item in levels:
                item.save()
        except Exception as ex:
            print(f'UserConfig::ready {ex}')
