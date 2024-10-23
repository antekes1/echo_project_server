class Perms:
    def __init__(self):
        self.infinity_creating_dirs = "infinity_creating_dirs"
        self.deleting_storages = "deleting_storages"
        self.full_perm = "full_perm"
        self.edit_storages = 'edit_storages'
        self.manage_users = "manage_users"
        self.del_calendar_event = "del_calendar_event"
        self.sent_notifications = "sent_notifications"

class Permissions:
    def __init__(self):
        self.users_perms = []
        self.admin_perms = [Perms().infinity_creating_dirs, Perms().deleting_storages, Perms().edit_storages, Perms().manage_users, Perms().del_calendar_event]  # Użyj obiektu Perms do uzyskania dostępu do uprawnień
        self.owner_perms = [Perms().full_perm]

    def get_permissions(self, role):
        if role == "user":
            return self.users_perms
        elif role == "admin":
            return self.users_perms + self.admin_perms
        elif role == "owner":
            return self.owner_perms + self.admin_perms + self.users_perms
        else:
            raise ValueError("Invalid role")

class InheritedPermissions(Permissions):
    def __init__(self):
        super().__init__()

    def get_permissions(self, role):
        if role == "admin":
            return super().get_permissions("admin")
        elif role == "owner":
            return super().get_permissions("owner")
        else:
            return super().get_permissions(role)
