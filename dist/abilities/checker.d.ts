import { User } from "../types/types";
import { AuthState } from "../state/auth-state";
export declare class AbilityChecker {
    private state;
    constructor(state: AuthState);
    userCan(uuid: string, user?: User | null): boolean;
    userCanKey(key: string, user?: User | null): boolean;
    userHasRole(uuid: string, user?: User | null): boolean;
    userHasRoleKey(key: string, user?: User | null): boolean;
}
//# sourceMappingURL=checker.d.ts.map