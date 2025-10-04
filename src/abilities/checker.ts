import {Ability, UserData} from "../types/types";
import {AuthState} from "../state/auth-state";

export class AbilityChecker {

    constructor(private state: AuthState) {}

    userCan(uuid: string, userData: UserData|null = null) {
        if (this.state?.getUser()?.abilities?.length === 0 && !userData?.abilities?.length) {
            console.warn('Auth Module: Could not check user permissions, no user in cache or provided.')
            return false;
        }
        if (userData?.abilities?.some((ability: Ability) => ability.key == '*')) return true;
        return (this.state?.getUser()?.abilities?.some((ability: Ability) => ability.uuid == uuid) || userData?.abilities?.some((ability: Ability) => ability.uuid == uuid)) ?? false;
    }

    userCanKey(key: string, userData: UserData|null = null) {
        if (this.state?.getUser()?.abilities?.length === 0 && !userData?.abilities?.length) {
            console.warn('Auth Module: Could not check user permissions, no user in cache or provided.')
            return false;
        }
        if (userData?.abilities?.some((ability: Ability) => ability.key == '*')) return true;
        return (this.state?.getUser()?.abilities?.some((ability: Ability) => ability.key == key) || userData?.abilities?.some((ability: Ability) => ability.key == key)) ?? false;
    }

    userHasRole(uuid: string, userData: UserData|null = null) {
        if (this.state?.getUser()?.roles?.length === 0 && !userData?.roles?.length) {
            console.warn('Auth module: Could not check user roles, no user in cache or provided');
            return false;
        }
        return (this.state?.getUser()?.roles?.some((ability: Ability) => ability.uuid == uuid) || userData?.roles?.some((ability: Ability) => ability.uuid == uuid)) ?? false;
    }

    userHasRoleKey(key: string, userData: UserData|null = null) {
        if (this.state?.getUser()?.roles?.length === 0 && !userData?.roles?.length) {
            console.warn('Auth module: Could not check user roles, no user in cache or provided');
            return false;
        }
        return (this.state?.getUser()?.roles?.some(ability => ability.key == key) || userData?.roles?.some((ability: Ability) => ability.key == key)) ?? false;
    }
}