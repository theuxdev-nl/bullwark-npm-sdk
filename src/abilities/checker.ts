import {AuthConfig, User} from "../../types/types";
import {AuthState} from "../state/auth-state";

export class AbilityChecker {
    constructor(private config: AuthConfig, private state: AuthState) {}
    userCan(uuid: string, user: User|null = null) {
        if (this.state?.user?.abilities?.length === 0 && !user?.abilities?.length) {
            console.warn('Auth Module: Could not check user permissions, no user in cache or provided.')
            return false;
        }
        if (user?.abilities?.some(ability => ability.key === '*')) return true;
        return (this.state?.user?.abilities?.some(ability => ability.uuid === uuid) || user?.abilities?.some(ability => ability.uuid === uuid)) ?? false;
    }

    userCanKey(key: string, user: User|null = null) {
        if (this.state?.user?.abilities?.length === 0 && !user?.abilities?.length) {
            console.warn('Auth Module: Could not check user permissions, no user in cache or provided.')
            return false;
        }
        if (user?.abilities?.some(ability => ability.key === '*')) return true;
        return (this.state?.user?.abilities?.some(ability => ability.key === key) || user?.abilities?.some(ability => ability.key === key)) ?? false;
    }

    userHasRole(uuid: string, user: User|null = null) {
        if (this.state?.user?.roles?.length === 0 && !user?.roles?.length) {
            console.warn('Auth module: Could not check user roles, no user in cache or provided');
            return false;
        }
        return (this.state?.user?.roles?.some(ability => ability.uuid === uuid) || user?.roles?.some(ability => ability.uuid === uuid)) ?? false;
    }

    userHasRoleKey(key: string, user: User|null = null) {
        if (this.state?.user?.roles?.length === 0 && !user?.roles?.length) {
            console.warn('Auth module: Could not check user roles, no user in cache or provided');
            return false;
        }
        return (this.state?.user?.roles?.some(ability => ability.key === key) || user?.roles?.some(ability => ability.key === key)) ?? false;
    }
}