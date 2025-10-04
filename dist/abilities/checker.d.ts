import { UserData } from "../types/types";
import { AuthState } from "../state/auth-state";
export declare class AbilityChecker {
    private state;
    constructor(state: AuthState);
    userCan(uuid: string, userData?: UserData | null): boolean;
    userCanKey(key: string, userData?: UserData | null): boolean;
    userHasRole(uuid: string, userData?: UserData | null): boolean;
    userHasRoleKey(key: string, userData?: UserData | null): boolean;
}
//# sourceMappingURL=checker.d.ts.map