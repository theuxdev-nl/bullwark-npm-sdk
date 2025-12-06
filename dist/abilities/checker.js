export class AbilityChecker {
    constructor(state) {
        this.state = state;
    }
    userCan(uuid, user = null) {
        if (this.state?.getUser()?.abilities?.length === 0 && !user?.abilities?.length) {
            console.warn('Auth Module: Could not check user permissions, no user in cache or provided.');
            return false;
        }
        if (user?.abilities?.some((ability) => ability == '*'))
            return true;
        return (this.state?.getUser()?.abilities?.some((ability) => ability == uuid) || user?.abilities?.some((ability) => ability == uuid)) ?? false;
    }
    userCanKey(key, user = null) {
        if (this.state?.getUser()?.abilities?.length === 0 && !user?.abilities?.length) {
            console.warn('Auth Module: Could not check user permissions, no user in cache or provided.');
            return false;
        }
        if (user?.abilities?.some((ability) => ability == '*'))
            return true;
        return (this.state?.getUser()?.abilities?.some((ability) => ability == key) || user?.abilities?.some((ability) => ability == key)) ?? false;
    }
    userHasRole(uuid, user = null) {
        if (this.state?.getUser()?.roles?.length === 0 && !user?.roles?.length) {
            console.warn('Auth module: Could not check user roles, no user in cache or provided');
            return false;
        }
        return (this.state?.getUser()?.roles?.some((ability) => ability == uuid) || user?.roles?.some((ability) => ability == uuid)) ?? false;
    }
    userHasRoleKey(key, user = null) {
        if (this.state?.getUser()?.roles?.length === 0 && !user?.roles?.length) {
            console.warn('Auth module: Could not check user roles, no user in cache or provided');
            return false;
        }
        return (this.state?.getUser()?.roles?.some((ability) => ability == key) || user?.roles?.some((ability) => ability == key)) ?? false;
    }
}
//# sourceMappingURL=checker.js.map