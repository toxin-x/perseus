import {Coordinates} from "mafs";
import * as React from "react";

import AxisArrows from "./axis-arrows";

import type {GraphRange} from "../../perseus-types";
import type {SizeClass} from "../../util/sizing-utils";
import type {vec} from "mafs";

interface GridProps {
    tickStep: vec.Vector2;
    gridStep: vec.Vector2;
    range: GraphRange;
    containerSizeClass: SizeClass;
    markings: "graph" | "grid" | "none";
}

/**
 * lineLabelText get the text that should
 * be displayed for a specific tick place
 *
 * @param {number} n the tick number
 * @param {number} tickStep how frequently a label should appear
 * @param {vec.Vector2} range the min/max range on the axis
 */
export const lineLabelText = (
    n: number,
    tickStep: number,
    range: vec.Vector2,
): string => {
    const [min, max] = range;
    const isOnStep = n % tickStep === 0;
    const isNegativeOne = n === -1;
    const isMin = n === min;
    const isMax = n === max;
    const shouldRender = isOnStep && !isNegativeOne && !isMin && !isMax;
    return shouldRender ? `${n}` : "";
};

/**
 * axisOptions determine axis options for Mafs
 *
 * axisIndex is for grabbing data in an array that contains
 * data for multiple axes. For example range: [[-10, 10], [-10, 10]]
 * range[0] is data for the x axis and range[1] is data for the y axis
 *
 * @param {GridProps} props
 * @param {number} axisIndex which axis we're getting options for
 */
const axisOptions = (
    props: Omit<GridProps, "containerSizeClass">,
    axisIndex: number,
) => {
    const axisStep = props.tickStep[axisIndex];
    const axisRange = props.range[axisIndex];
    return {
        axis: props.markings === "graph",
        lines: props.gridStep[axisIndex],
        labels: (n: number) => lineLabelText(n, axisStep, axisRange),
    };
};

export const Grid = (props: GridProps) => {
    return props.markings === "none" ? null : (
        <>
            <Coordinates.Cartesian
                xAxis={axisOptions(props, 0)}
                yAxis={axisOptions(props, 1)}
            />
            {props.markings === "graph" && <AxisArrows />}
        </>
    );
};
