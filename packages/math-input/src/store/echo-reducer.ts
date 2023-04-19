import {EchoAnimationTypes, KeyTypes} from "../consts";
import KeyConfigs from "../data/key-configs";

import type {EchoState} from "./types";

// Used to generate unique animation IDs for the echo animations. The actual
// values are irrelevant as long as they are unique.
let _lastAnimationId = 0;

const initialEchoState = {
    echoes: [],
} as const;

const echoReducer = function (state = initialEchoState, action): EchoState {
    switch (action.type) {
        case "PressKey":
            const keyConfig = KeyConfigs[action.key];

            // Add in the echo animation if the user performs a math
            // operation.
            if (
                keyConfig.type === KeyTypes.VALUE ||
                keyConfig.type === KeyTypes.OPERATOR
            ) {
                return {
                    ...state,
                    echoes: [
                        ...state.echoes,
                        {
                            animationId: "" + _lastAnimationId++,
                            animationType: action.inPopover
                                ? EchoAnimationTypes.LONG_FADE_ONLY
                                : EchoAnimationTypes.FADE_ONLY,
                            borders: action.borders,
                            id: keyConfig.id,
                            initialBounds: action.initialBounds,
                        },
                    ],
                };
            }
            return state;

        case "RemoveEcho":
            const remainingEchoes = state.echoes.filter((echo) => {
                // @ts-expect-error [FEI-5003] - TS2339 - Property 'animationId' does not exist on type 'never'.
                return echo.animationId !== action.animationId;
            });
            return {
                ...state,
                echoes: remainingEchoes,
            };

        default:
            return state;
    }
};

export default echoReducer;