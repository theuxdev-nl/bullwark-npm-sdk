import {Ability, User} from "../types/types";
import {AuthState} from "../state/auth-state";

export class AbilityChecker {

    constructor(private state: AuthState) {}

    userCan(uuid: string, user: User|null = null) {
        if (this.state?.getUser()?.abilities?.length === 0 && !user?.abilities?.length) {
            console.warn('Auth Module: Could not check user permissions, no user in cache or provided.')
            return false;
        }
        if (user?.abilities?.some((ability: string) => ability == '*')) return true;
        return (this.state?.getUser()?.abilities?.some((ability: string) => ability == uuid) || user?.abilities?.some((ability: string) => ability == uuid)) ?? false;
    }

    userCanKey(key: string, user: User|null = null) {
        if (this.state?.getUser()?.abilities?.length === 0 && !user?.abilities?.length) {
            console.warn('Auth Module: Could not check user permissions, no user in cache or provided.')
            return false;
        }
        if (user?.abilities?.some((ability: string) => ability == '*')) return true;
        return (this.state?.getUser()?.abilities?.some((ability: string) => ability == key) || user?.abilities?.some((ability: string) => ability == key)) ?? false;
    }

    userHasRole(uuid: string, user: User|null = null) {
        if (this.state?.getUser()?.roles?.length === 0 && !user?.roles?.length) {
            console.warn('Auth module: Could not check user roles, no user in cache or provided');
            return false;
        }
        return (this.state?.getUser()?.roles?.some((ability: string) => ability == uuid) || user?.roles?.some((ability: string) => ability == uuid)) ?? false;
    }

    userHasRoleKey(key: string, user: User|null = null) {
        if (this.state?.getUser()?.roles?.length === 0 && !user?.roles?.length) {
            console.warn('Auth module: Could not check user roles, no user in cache or provided');
            return false;
        }
        return (this.state?.getUser()?.roles?.some((ability: string) => ability == key) || user?.roles?.some((ability: string) => ability == key)) ?? false;
    }
}