import {vector as kvector} from "@khanacademy/kmath";
import {
    components,
    InteractiveGraphWidget,
    interactiveSizes,
    SizingUtils,
    Util,
} from "@khanacademy/perseus";
import {View} from "@khanacademy/wonder-blocks-core";
import {OptionItem, SingleSelect} from "@khanacademy/wonder-blocks-dropdown";
import {Checkbox} from "@khanacademy/wonder-blocks-form";
import {spacing} from "@khanacademy/wonder-blocks-tokens";
import {LabelSmall} from "@khanacademy/wonder-blocks-typography";
import {UnreachableCaseError} from "@khanacademy/wonder-stuff-core";
import {StyleSheet} from "aphrodite";
import * as React from "react";
import invariant from "tiny-invariant";
import _ from "underscore";

import LabeledRow from "../../components/graph-locked-figures/labeled-row";
import LockedFiguresSection from "../../components/graph-locked-figures/locked-figures-section";
import GraphPointsCountSelector from "../../components/graph-points-count-selector";
import GraphTypeSelector from "../../components/graph-type-selector";
import {InteractiveGraphCorrectAnswer} from "../../components/interactive-graph-correct-answer";
import InteractiveGraphDescription from "../../components/interactive-graph-description";
import InteractiveGraphSettings from "../../components/interactive-graph-settings";
import SegmentCountSelector from "../../components/segment-count-selector";
import StartCoordsSettings from "../../components/start-coords-settings";
import {shouldShowStartCoordsUI} from "../../components/util";
import {parsePointCount} from "../../util/points";

import type {
    APIOptionsWithDefaults,
    LockedFigure,
    PerseusImageBackground,
    PerseusInteractiveGraphWidgetOptions,
    PerseusGraphType,
} from "@khanacademy/perseus";
import type {PropsFor} from "@khanacademy/wonder-blocks-core";

const {InfoTip} = components;
const {containerSizeClass, getInteractiveBoxFromSizeClass} = SizingUtils;
const InteractiveGraph = InteractiveGraphWidget.widget;

type InteractiveGraphProps = PropsFor<typeof InteractiveGraph>;

const defaultBackgroundImage = {
    url: null,
} as const;

const POLYGON_SIDES = _.map(_.range(3, 13), function (value) {
    return (
        <OptionItem
            key={`polygon-sides-${value}`}
            value={`${value}`}
            label={`${value} sides`}
        />
    );
});

type Range = [min: number, max: number];
type PerseusGraphTypePolygon = Extract<PerseusGraphType, {type: "polygon"}>;
type PerseusGraphTypeAngle = Extract<PerseusGraphType, {type: "angle"}>;

export type Props = {
    apiOptions: APIOptionsWithDefaults;

    /**
     * The labels for the x and y axes.
     */
    labels: ReadonlyArray<string>;
    /**
     * The range of the graph in the x and y directions.
     */
    range: [x: Range, y: Range];
    /**
     * How far apart the tick marks on the axes are in the x and y
     * directions.
     */
    step: [x: number, y: number];
    /**
     * How far apart the grid lines are in the x and y directions.
     */
    gridStep: [x: number, y: number];
    /**
     * How far apart the snap-to points are in the x and y directions.
     */
    snapStep: [x: number, y: number];
    /**
     * The size of the graph in pixels.
     */
    box: [x: number, y: number];

    /**
     * An error message to display in the graph area, or true if the
     * graph is valid.
     */
    valid: string | boolean;
    /**
     * The background image to display in the graph area and its properties.
     */
    backgroundImage: PerseusImageBackground;
    /**
     * The type of markings to display on the graph.
     * - graph: shows the axes and the grid lines
     * - grid: shows only the grid lines
     * - none: shows no markings
     */
    markings: "graph" | "grid" | "none";
    /**
     * Whether to show the protractor on the graph.
     */
    showProtractor: boolean;
    /**
     * Whether to show tooltips on the graph.
     * (Currently not used, but will be in the future.)
     */
    showTooltips: boolean;
    /**
     * The current correct answer for the graph. Updated by this component
     * when the graph is changed.
     *
     * Note that the "Correct answer:" textbox is not an interactive
     * element. Instead, it is a representation of the correct answer based
     * on the state of the interactive graph previewed at the bottom of the
     * editor page.
     */
    // TODO(LEMS-2344): make the type of `correct` more specific
    correct: PerseusGraphType;
    /**
     * The locked figures to display in the graph area.
     * Locked figures are graph elements (points, lines, line segmeents,
     * etc.) that are locked in place and not interactive.
     */
    lockedFigures?: Array<LockedFigure>;
    // Aria-label for the full graph area. Short title for the graph.
    fullGraphAriaLabel?: string;
    // Aria-description for the graph area. Longer description of the graph.
    // Note that the `aria-description` property is not supported well,
    // so this description will be hidden in a DOM element whose ID will
    // then be referenced by the graph's `aria-describedby` property.
    fullGraphAriaDescription?: string;

    /**
     * The graph to display in the graph area.
     */
    graph: InteractiveGraphProps["graph"];
    onChange: (props: Partial<Props>) => void;
};

type DefaultProps = {
    labels: Props["labels"];
    range: Props["range"];
    step: Props["step"];
    valid: Props["valid"];
    backgroundImage: Props["backgroundImage"];
    markings: Props["markings"];
    showProtractor: Props["showProtractor"];
    showTooltips: Props["showTooltips"];
    correct: Props["correct"];
};

/**
 * An editor for the InteractiveGraph widget, which allows the user to
 * specify the graph's properties and the correct answer.
 *
 * Used in the exercise editor.
 */
class InteractiveGraphEditor extends React.Component<Props> {
    static widgetName = "interactive-graph";
    displayName = "InteractiveGraphEditor";
    className = "perseus-widget-interactive-graph";

    static defaultProps: DefaultProps = {
        ...InteractiveGraph.defaultProps,
        valid: true,
        backgroundImage: defaultBackgroundImage,
        showTooltips: false,
        correct: {
            type: InteractiveGraph.defaultProps.graph.type,
            coords: null,
        },
    };

    changeStartCoords = (coords) => {
        if (!this.props.graph?.type) {
            return;
        }

        const graph = {
            ...this.props.graph,
            startCoords: coords,
        };
        this.props.onChange({graph: graph});
    };

    // serialize() is what makes copy/paste work. All the properties included
    // in the serialization json are included when, for example, a graph
    // is copied from the question editor and pasted into the hint editor
    // (double brackets in the markdown).
    serialize(): PerseusInteractiveGraphWidgetOptions {
        const json = _.pick(
            this.props,
            "step",
            "backgroundImage",
            "markings",
            "labels",
            "showProtractor",
            "showTooltips",
            "range",
            "gridStep",
            "snapStep",
            "lockedFigures",
            "fullGraphAriaLabel",
            "fullGraphAriaDescription",
        );

        // eslint-disable-next-line react/no-string-refs
        const graph = this.refs.graph;
        if (graph) {
            // @ts-expect-error TS2339 Property 'getUserInput' does not exist on type 'ReactInstance'. Property 'getUserInput' does not exist on type 'Component<any, {}, any>'.
            const correct = graph && graph.getUserInput();
            _.extend(json, {
                graph: {
                    type: correct.type,
                    startCoords: this.props.graph?.startCoords,
                },
                correct: correct,
            });

            _.each(
                [
                    "allowReflexAngles",
                    "angleOffsetDeg",
                    "numPoints",
                    "numSides",
                    "numSegments",
                    "showAngles",
                    "showSides",
                    "snapTo",
                    "snapDegrees",
                ],
                function (key) {
                    if (_.has(correct, key)) {
                        // @ts-expect-error - TS2339 - Property 'graph' does not exist on type 'Pick<any, "step" | "range" | "backgroundImage" | "snapStep" | "labels" | "showTooltips" | "markings" | "gridStep" | "showProtractor">'.
                        json.graph[key] = correct[key];
                    }
                },
            );
        }
        // @ts-expect-error TS2739 Type 'Pick<Readonly<Props> & Readonly<{ children?: ReactNode; }>, "step" | "gridStep" | "snapStep" | "backgroundImage" | "markings" | "labels" | ... 5 more ... | "range">' is missing the following properties from type 'PerseusInteractiveGraphWidgetOptions': graph, correct
        return json;
    }

    getSaveWarnings = () => {
        const issues: Array<any | string> = [];

        // A locked line on the graph cannot have length 0.
        for (const figure of this.props.lockedFigures ?? []) {
            if (
                figure.type === "line" &&
                kvector.equal(figure.points[0].coord, figure.points[1].coord)
            ) {
                issues.push("The line cannot have length 0.");
            }
        }

        return issues;
    };

    render() {
        let graph;
        let equationString;

        const gridStep =
            this.props.gridStep ||
            Util.getGridStep(
                this.props.range,
                this.props.step,
                interactiveSizes.defaultBoxSize,
            );
        const snapStep =
            this.props.snapStep || Util.snapStepFromGridStep(gridStep);

        const sizeClass = containerSizeClass.SMALL;
        if (this.props.valid === true) {
            const correct = this.props.correct;

            // TODO(aria): send these down all at once
            const graphProps = {
                ref: "graph",
                box: this.props.box,
                range: this.props.range,
                labels: this.props.labels,
                step: this.props.step,
                gridStep: gridStep,
                snapStep: snapStep,
                graph: correct,
                backgroundImage: this.props.backgroundImage,
                markings: this.props.markings,
                showProtractor: this.props.showProtractor,
                showTooltips: this.props.showTooltips,
                lockedFigures: this.props.lockedFigures,
                fullGraphAriaLabel: this.props.fullGraphAriaLabel,
                fullGraphAriaDescription: this.props.fullGraphAriaDescription,
                trackInteraction: function () {},
                onChange: ({graph: newGraph}: InteractiveGraphProps) => {
                    let correct = this.props.correct;
                    // TODO(benchristel): can we improve the type of onChange
                    // so this invariant isn't necessary?
                    invariant(newGraph != null);
                    if (correct.type === newGraph.type) {
                        correct = mergeGraphs(correct, newGraph);
                    } else {
                        // Clear options from previous graph
                        correct = newGraph;
                    }
                    this.props.onChange({
                        correct: correct,
                        graph: this.props.graph,
                    });
                },
            } as const;

            graph = (
                // There are a bunch of props that renderer.jsx passes to widgets via
                // getWidgetProps() and widget-container.jsx that the editors don't
                // bother passing.
                // @ts-expect-error - TS2769 - No overload matches this call.
                <InteractiveGraph
                    {...graphProps}
                    containerSizeClass={sizeClass}
                    apiOptions={{
                        ...this.props.apiOptions,
                        isMobile: false,
                    }}
                />
            );
            // TODO(kevinb): Update getEquationString to only accept the data it actually
            // needs to compute the equation string.
            // @ts-expect-error - TS2345 - Argument of type '{ readonly ref: "graph"; readonly box: any; readonly range: any; readonly labels: any; readonly step: any; readonly gridStep: any; readonly snapStep: any; readonly graph: any; readonly backgroundImage: any; ... 6 more ...; readonly onChange: (newProps: Pick<...> & ... 1 more ... & InexactPartial<...>) => void; }' is not assignable to parameter of type 'Props'.
            equationString = InteractiveGraph.getEquationString(graphProps);
        } else {
            graph = <div className="perseus-error">{this.props.valid}</div>;
        }

        return (
            <View>
                <LabeledRow label="Type of Graph:">
                    <GraphTypeSelector
                        graphType={
                            this.props.graph?.type ??
                            InteractiveGraph.defaultProps.graph.type
                        }
                        onChange={(
                            type: Required<InteractiveGraphProps>["graph"]["type"],
                        ) => {
                            this.props.onChange({
                                graph: {type},
                                correct: {type},
                            });
                        }}
                    />
                </LabeledRow>
                {this.props.graph &&
                    this.props.apiOptions?.flags?.mafs?.[
                        this.props.graph.type
                    ] && (
                        <InteractiveGraphDescription
                            ariaLabelValue={this.props.fullGraphAriaLabel ?? ""}
                            ariaDescriptionValue={
                                this.props.fullGraphAriaDescription ?? ""
                            }
                            onChange={this.props.onChange}
                        />
                    )}
                <InteractiveGraphCorrectAnswer equationString={equationString}>
                    {graph}
                </InteractiveGraphCorrectAnswer>
                {this.props.correct?.type === "point" && (
                    <LabeledRow label="Number of Points:">
                        <GraphPointsCountSelector
                            numPoints={this.props.correct?.numPoints}
                            onChange={(points) => {
                                this.props.onChange({
                                    correct: {
                                        type: "point",
                                        numPoints: points,
                                    },
                                    graph: {
                                        type: "point",
                                        numPoints: points,
                                    },
                                });
                            }}
                        />
                    </LabeledRow>
                )}
                {this.props.correct?.type === "polygon" && (
                    <>
                        <LabeledRow label="Number of sides:">
                            <SingleSelect
                                key="polygon-select"
                                selectedValue={
                                    this.props.correct?.numSides
                                        ? `${this.props.correct.numSides}`
                                        : "3"
                                }
                                placeholder=""
                                onChange={(newValue) => {
                                    invariant(
                                        this.props.graph?.type === "polygon",
                                    );
                                    const updates = {
                                        numSides: parsePointCount(newValue),
                                        coords: null,
                                        // reset the snap for UNLIMITED, which
                                        // only supports "grid"
                                        // From: D6578
                                        snapTo: "grid",
                                    } as const;

                                    this.props.onChange({
                                        correct: {
                                            ...this.props.correct,
                                            ...updates,
                                        },
                                        graph: {
                                            ...this.props.graph,
                                            ...updates,
                                        },
                                    });
                                }}
                                style={styles.singleSelectShort}
                            >
                                {[
                                    ...POLYGON_SIDES,
                                    <OptionItem
                                        key="unlimited"
                                        value="unlimited"
                                        label="unlimited sides"
                                    />,
                                ]}
                            </SingleSelect>
                        </LabeledRow>
                        <LabeledRow label="Snap to:">
                            <SingleSelect
                                selectedValue={
                                    this.props.correct?.snapTo || "grid"
                                }
                                // Never uses placeholder, always has value
                                placeholder=""
                                onChange={(newValue) => {
                                    invariant(
                                        this.props.correct.type === "polygon",
                                        `Expected correct answer type to be polygon, but got ${this.props.correct.type}`,
                                    );
                                    invariant(
                                        this.props.graph?.type === "polygon",
                                        `Expected graph type to be polygon, but got ${this.props.graph?.type}`,
                                    );

                                    const updates = {
                                        snapTo: newValue as PerseusGraphTypePolygon["snapTo"],
                                        coords: null,
                                    } as const;

                                    this.props.onChange({
                                        correct: {
                                            ...this.props.correct,
                                            ...updates,
                                        },
                                        graph: {
                                            ...this.props.graph,
                                            ...updates,
                                        },
                                    });
                                }}
                                style={styles.singleSelectShort}
                            >
                                <OptionItem value="grid" label="grid" />
                                {this.props.correct?.numSides !==
                                    "unlimited" && (
                                    <OptionItem
                                        value="angles"
                                        label="interior angles"
                                    />
                                )}
                                {this.props.correct?.numSides !==
                                    "unlimited" && (
                                    <OptionItem
                                        value="sides"
                                        label="side measures"
                                    />
                                )}
                            </SingleSelect>
                            <InfoTip>
                                <p>
                                    These options affect the movement of the
                                    vertex points. The grid option will guide
                                    the points to the nearest half step along
                                    the grid.
                                </p>
                                <p>
                                    The interior angle and side measure options
                                    guide the points to the nearest whole angle
                                    or side measure respectively.
                                </p>
                            </InfoTip>
                        </LabeledRow>
                        <View style={styles.row}>
                            <Checkbox
                                label={
                                    <LabelSmall>Show angle measures</LabelSmall>
                                }
                                checked={
                                    // Don't show indeterminate checkbox state
                                    !!this.props.correct?.showAngles
                                }
                                onChange={() => {
                                    if (this.props.graph?.type === "polygon") {
                                        invariant(
                                            this.props.correct.type ===
                                                "polygon",
                                            `Expected graph type to be polygon, but got ${this.props.correct.type}`,
                                        );
                                        this.props.onChange({
                                            correct: {
                                                ...this.props.correct,
                                                showAngles:
                                                    !this.props.correct
                                                        .showAngles,
                                            },
                                            graph: {
                                                ...this.props.graph,
                                                showAngles:
                                                    !this.props.graph
                                                        .showAngles,
                                            },
                                        });
                                    }
                                }}
                            />
                            <InfoTip>
                                <p>Displays the interior angle measures.</p>
                            </InfoTip>
                        </View>
                        <View style={styles.row}>
                            <Checkbox
                                label={
                                    <LabelSmall>Show side measures</LabelSmall>
                                }
                                checked={
                                    // Don't show indeterminate checkbox state
                                    !!this.props.correct?.showSides
                                }
                                onChange={() => {
                                    if (
                                        this.props.graph?.type === "polygon" &&
                                        this.props.correct.type === "polygon"
                                    ) {
                                        this.props.onChange({
                                            correct: {
                                                ...this.props.correct,
                                                showSides:
                                                    !this.props.correct
                                                        .showSides,
                                            },
                                            graph: {
                                                ...this.props.graph,
                                                showSides:
                                                    !this.props.graph.showSides,
                                            },
                                        });
                                    }
                                }}
                            />
                            <InfoTip>
                                <p>Displays the side lengths.</p>
                            </InfoTip>
                        </View>
                    </>
                )}
                {this.props.correct?.type === "segment" && (
                    <LabeledRow label="Number of segments:">
                        <SegmentCountSelector
                            numSegments={this.props.correct?.numSegments}
                            onChange={(sides) => {
                                this.props.onChange({
                                    correct: {
                                        type: "segment",
                                        numSegments: sides,
                                        coords: null,
                                    },
                                    graph: {
                                        type: "segment",
                                        numSegments: sides,
                                    },
                                });
                            }}
                        />
                    </LabeledRow>
                )}
                {this.props.graph?.type &&
                    // TODO(LEMS-2228): Remove flags once this is fully released
                    shouldShowStartCoordsUI(
                        this.props.apiOptions.flags,
                        this.props.graph,
                    ) && (
                        <StartCoordsSettings
                            {...this.props.graph}
                            range={this.props.range}
                            step={this.props.step}
                            onChange={this.changeStartCoords}
                        />
                    )}
                <InteractiveGraphSettings
                    box={getInteractiveBoxFromSizeClass(sizeClass)}
                    range={this.props.range}
                    labels={this.props.labels}
                    step={this.props.step}
                    gridStep={gridStep}
                    snapStep={snapStep}
                    valid={this.props.valid}
                    backgroundImage={this.props.backgroundImage}
                    markings={this.props.markings}
                    showProtractor={this.props.showProtractor}
                    showTooltips={this.props.showTooltips}
                    onChange={this.props.onChange}
                />
                {this.props.correct.type === "polygon" && (
                    <LabeledRow label="Student answer must">
                        <SingleSelect
                            selectedValue={this.props.correct.match || "exact"}
                            onChange={(newValue) => {
                                invariant(
                                    this.props.correct.type === "polygon",
                                    `Expected graph type to be polygon, but got ${this.props.correct.type}`,
                                );
                                const correct = {
                                    ...this.props.correct,
                                    // TODO(benchristel): this cast is necessary
                                    // because "exact" is not actually a valid
                                    // value for `match`; a value of undefined
                                    // means exact matching. The code happens
                                    // to work because "exact" falls through
                                    // to the correct else branch in
                                    // InteractiveGraph.validate()
                                    match: newValue as PerseusGraphTypePolygon["match"],
                                };
                                this.props.onChange({correct});
                            }}
                            // Never uses placeholder, always has value
                            placeholder=""
                            style={styles.singleSelectShort}
                        >
                            <OptionItem value="exact" label="match exactly" />
                            <OptionItem
                                value="congruent"
                                label="be congruent"
                            />
                            <OptionItem
                                value="approx"
                                label="be approximately congruent"
                            />
                            <OptionItem value="similar" label="be similar" />
                        </SingleSelect>

                        <InfoTip>
                            <ul>
                                <li>
                                    <p>
                                        <b>Match Exactly:</b> Match exactly in
                                        size, orientation, and location on the
                                        grid even if it is not shown in the
                                        background.
                                    </p>
                                </li>
                                <li>
                                    <p>
                                        <b>Be Congruent:</b> Be congruent in
                                        size and shape, but can be located
                                        anywhere on the grid.
                                    </p>
                                </li>
                                <li>
                                    <p>
                                        <b>Be Approximately Congruent:</b> Be
                                        exactly similar, and congruent in size
                                        and shape to within 0.1 units, but can
                                        be located anywhere on the grid.{" "}
                                        <em>
                                            Use this with snapping to angle
                                            measure.
                                        </em>
                                    </p>
                                </li>
                                <li>
                                    <p>
                                        <b>Be Similar:</b> Be similar with
                                        matching interior angles, and side
                                        measures that are matching or a multiple
                                        of the correct side measures. The figure
                                        can be located anywhere on the grid.
                                    </p>
                                </li>
                            </ul>
                        </InfoTip>
                    </LabeledRow>
                )}
                {this.props.correct.type === "angle" && (
                    <LabeledRow label="Student answer must">
                        <SingleSelect
                            selectedValue={this.props.correct.match || "exact"}
                            onChange={(newValue) => {
                                this.props.onChange({
                                    correct: {
                                        ...this.props.correct,
                                        // TODO(benchristel): this cast is necessary
                                        // because "exact" is not actually a valid
                                        // value for `match`; a value of undefined
                                        // means exact matching. The code happens
                                        // to work because "exact" falls through
                                        // to the correct else branch in
                                        // InteractiveGraph.validate()
                                        match: newValue as PerseusGraphTypeAngle["match"],
                                    },
                                });
                            }}
                            // Never uses placeholder, always has value
                            placeholder=""
                            style={styles.singleSelectShort}
                        >
                            <OptionItem value="exact" label="match exactly" />
                            <OptionItem
                                value="congruent"
                                label="be congruent"
                            />
                        </SingleSelect>
                        <InfoTip>
                            <p>
                                Congruency requires only that the angle measures
                                are the same. An exact match implies congruency,
                                but also requires that the angles have the same
                                orientation and that the vertices are in the
                                same position.
                            </p>
                        </InfoTip>
                    </LabeledRow>
                )}
                {
                    // Only show the "Add locked figure" dropdown if the graph
                    // is using Mafs.
                    this.props.graph &&
                        this.props.apiOptions?.flags?.mafs?.[
                            this.props.graph.type
                        ] && (
                            <LockedFiguresSection
                                showM2bFeatures={
                                    this.props.apiOptions?.flags?.mafs?.[
                                        "interactive-graph-locked-features-m2b"
                                    ]
                                }
                                showLabelsFlag={
                                    this.props.apiOptions?.flags?.mafs?.[
                                        "interactive-graph-locked-features-labels"
                                    ]
                                }
                                figures={this.props.lockedFigures}
                                onChange={this.props.onChange}
                            />
                        )
                }
            </View>
        );
    }
}

// Merges two graphs that have the same `type`. Properties defined in `b`
// overwrite properties of the same name in `a`. Throws an exception if the
// types are different or not recognized.
function mergeGraphs(
    a: PerseusGraphType,
    b: PerseusGraphType,
): PerseusGraphType {
    if (a.type !== b.type) {
        throw new Error(
            `Cannot merge graphs with different types (${a.type} and ${b.type})`,
        );
    }
    switch (a.type) {
        case "angle":
            invariant(b.type === "angle");
            return {...a, ...b};
        case "circle":
            invariant(b.type === "circle");
            return {...a, ...b};
        case "linear":
            invariant(b.type === "linear");
            return {...a, ...b};
        case "linear-system":
            invariant(b.type === "linear-system");
            return {...a, ...b};
        case "point":
            invariant(b.type === "point");
            return {...a, ...b};
        case "polygon":
            invariant(b.type === "polygon");
            return {...a, ...b};
        case "quadratic":
            invariant(b.type === "quadratic");
            return {...a, ...b};
        case "ray":
            invariant(b.type === "ray");
            return {...a, ...b};
        case "segment":
            invariant(b.type === "segment");
            return {...a, ...b};
        case "sinusoid":
            invariant(b.type === "sinusoid");
            return {...a, ...b};
        default:
            throw new UnreachableCaseError(a);
    }
}

const styles = StyleSheet.create({
    singleSelectShort: {
        // Non-standard spacing, but it's the smallest we can go
        // without running into styling issues with the dropdown.
        height: 26,
    },
    row: {
        flexDirection: "row",
        marginTop: spacing.xSmall_8,
        alignItems: "center",
    },
});

export default InteractiveGraphEditor;
