export class AbilityChecker {
    constructor(state) {
        this.state = state;
    }
    userCan(uuid, userData = null) {
        if (this.state?.getUser()?.abilities?.length === 0 && !userData?.abilities?.length) {
            console.warn('Auth Module: Could not check user permissions, no user in cache or provided.');
            return false;
        }
        if (userData?.abilities?.some((ability) => ability.key == '*'))
            return true;
        return (this.state?.getUser()?.abilities?.some((ability) => ability.uuid == uuid) || userData?.abilities?.some((ability) => ability.uuid == uuid)) ?? false;
    }
    userCanKey(key, userData = null) {
        if (this.state?.getUser()?.abilities?.length === 0 && !userData?.abilities?.length) {
            console.warn('Auth Module: Could not check user permissions, no user in cache or provided.');
            return false;
        }
        if (userData?.abilities?.some((ability) => ability.key == '*'))
            return true;
        return (this.state?.getUser()?.abilities?.some((ability) => ability.key == key) || userData?.abilities?.some((ability) => ability.key == key)) ?? false;
    }
    userHasRole(uuid, userData = null) {
        if (this.state?.getUser()?.roles?.length === 0 && !userData?.roles?.length) {
            console.warn('Auth module: Could not check user roles, no user in cache or provided');
            return false;
        }
        return (this.state?.getUser()?.roles?.some((ability) => ability.uuid == uuid) || userData?.roles?.some((ability) => ability.uuid == uuid)) ?? false;
    }
    userHasRoleKey(key, userData = null) {
        if (this.state?.getUser()?.roles?.length === 0 && !userData?.roles?.length) {
            console.warn('Auth module: Could not check user roles, no user in cache or provided');
            return false;
        }
        return (this.state?.getUser()?.roles?.some(ability => ability.key == key) || userData?.roles?.some((ability) => ability.key == key)) ?? false;
    }
}
//# sourceMappingURL=checker.js.map