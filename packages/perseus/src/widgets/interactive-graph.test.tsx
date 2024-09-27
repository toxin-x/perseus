import invariant from "tiny-invariant";

import {clone} from "../../../../testing/object-utils";

import InteractiveGraph, {shouldUseMafs} from "./interactive-graph";

import type {
    PerseusGraphTypeLinear,
    PerseusGraphTypePoint,
    PerseusGraphTypePolygon,
    PerseusGraphType,
    PerseusGraphTypeNone,
} from "../perseus-types";
import type {PerseusInteractiveGraphRubric} from "../validation.types";

function createRubric(graph: PerseusGraphType): PerseusInteractiveGraphRubric {
    return {graph, correct: graph};
}

describe("InteractiveGraph.validate on a segment question", () => {
    it("marks the answer invalid if guess.coords is missing", () => {
        const guess: PerseusGraphType = {type: "segment"};
        const rubric: PerseusInteractiveGraphRubric = createRubric({
            type: "segment",
            coords: [
                [
                    [0, 0],
                    [1, 1],
                ],
            ],
        });

        const result = InteractiveGraph.widget.validate(guess, rubric);

        expect(result).toHaveInvalidInput();
    });

    it("does not award points if guess.coords is wrong", () => {
        const guess: PerseusGraphType = {
            type: "segment",
            coords: [
                [
                    [99, 0],
                    [1, 1],
                ],
            ],
        };
        const rubric: PerseusInteractiveGraphRubric = createRubric({
            type: "segment",
            coords: [
                [
                    [0, 0],
                    [1, 1],
                ],
            ],
        });

        const result = InteractiveGraph.widget.validate(guess, rubric);

        expect(result).toHaveBeenAnsweredIncorrectly();
    });

    it("awards points if guess.coords is right", () => {
        const guess: PerseusGraphType = {
            type: "segment",
            coords: [
                [
                    [0, 0],
                    [1, 1],
                ],
            ],
        };
        const rubric: PerseusInteractiveGraphRubric = createRubric({
            type: "segment",
            coords: [
                [
                    [0, 0],
                    [1, 1],
                ],
            ],
        });

        const result = InteractiveGraph.widget.validate(guess, rubric);

        expect(result).toHaveBeenAnsweredCorrectly();
    });

    it("allows points of a segment to be specified in reverse order", () => {
        const guess: PerseusGraphType = {
            type: "segment",
            coords: [
                [
                    [1, 1],
                    [0, 0],
                ],
            ],
        };
        const rubric: PerseusInteractiveGraphRubric = createRubric({
            type: "segment",
            coords: [
                [
                    [0, 0],
                    [1, 1],
                ],
            ],
        });

        const result = InteractiveGraph.widget.validate(guess, rubric);

        expect(result).toHaveBeenAnsweredCorrectly();
    });

    it("does not modify the `guess` data", () => {
        const guess: PerseusGraphType = {
            type: "segment",
            coords: [
                [
                    [1, 1],
                    [0, 0],
                ],
            ],
        };
        const rubric: PerseusInteractiveGraphRubric = createRubric({
            type: "segment",
            coords: [
                [
                    [0, 0],
                    [1, 1],
                ],
            ],
        });

        InteractiveGraph.widget.validate(guess, rubric);

        expect(guess.coords).toEqual([
            [
                [1, 1],
                [0, 0],
            ],
        ]);
    });

    it("does not modify the `rubric` data", () => {
        const guess: PerseusGraphType = {
            type: "segment",
            coords: [
                [
                    [1, 1],
                    [0, 0],
                ],
            ],
        };
        const rubric: PerseusInteractiveGraphRubric = createRubric({
            type: "segment",
            coords: [
                [
                    [1, 1],
                    [0, 0],
                ],
            ],
        });

        InteractiveGraph.widget.validate(guess, rubric);

        // Narrow the type of `rubric.correct` to segment graph; otherwise TS
        // thinks it might not have a `coords` property.
        invariant(rubric.correct.type === "segment");
        expect(rubric.correct.coords).toEqual([
            [
                [1, 1],
                [0, 0],
            ],
        ]);
    });
});

describe("InteractiveGraph.validate on a point question", () => {
    it("marks the answer invalid if guess.coords is missing", () => {
        const guess: PerseusGraphType = {type: "point"};
        const rubric: PerseusInteractiveGraphRubric = createRubric({
            type: "point",
            coords: [[0, 0]],
        });

        const result = InteractiveGraph.widget.validate(guess, rubric);

        expect(result).toHaveInvalidInput();
    });

    it("throws an exception if correct.coords is missing", () => {
        // Characterization test: this might not be desirable behavior, but
        // it's the current behavior as of 2024-09-25.
        const guess: PerseusGraphType = {
            type: "point",
            coords: [[0, 0]],
        };
        const rubric: PerseusInteractiveGraphRubric = createRubric({
            type: "point",
        });

        expect(() =>
            InteractiveGraph.widget.validate(guess, rubric),
        ).toThrowError();
    });

    it("does not award points if guess.coords is wrong", () => {
        const guess: PerseusGraphType = {
            type: "point",
            coords: [[9, 9]],
        };
        const rubric: PerseusInteractiveGraphRubric = createRubric({
            type: "point",
            coords: [[0, 0]],
        });

        const result = InteractiveGraph.widget.validate(guess, rubric);

        expect(result).toHaveBeenAnsweredIncorrectly();
    });

    it("awards points if guess.coords is right", () => {
        const guess: PerseusGraphType = {
            type: "point",
            coords: [[7, 8]],
        };
        const rubric: PerseusInteractiveGraphRubric = createRubric({
            type: "point",
            coords: [[7, 8]],
        });

        const result = InteractiveGraph.widget.validate(guess, rubric);

        expect(result).toEqual({
            type: "points",
            earned: 1,
            total: 1,
            message: null,
        });
    });

    it("allows points to be specified in any order", () => {
        const guess: PerseusGraphType = {
            type: "point",
            coords: [
                [7, 8],
                [5, 6],
            ],
        };
        const rubric: PerseusInteractiveGraphRubric = createRubric({
            type: "point",
            coords: [
                [5, 6],
                [7, 8],
            ],
        });

        const result = InteractiveGraph.widget.validate(guess, rubric);

        expect(result).toHaveBeenAnsweredCorrectly();
    });

    it("does not modify the `guess` data", () => {
        const guess: PerseusGraphType = {
            type: "point",
            coords: [
                [7, 8],
                [5, 6],
            ],
        };
        const rubric: PerseusInteractiveGraphRubric = createRubric({
            type: "point",
            coords: [
                [5, 6],
                [7, 8],
            ],
        });

        const guessClone = clone(guess);

        InteractiveGraph.widget.validate(guess, rubric);

        expect(guess).toEqual(guessClone);
    });

    it("does not modify the `rubric` data", () => {
        const guess: PerseusGraphType = {
            type: "point",
            coords: [
                [7, 8],
                [5, 6],
            ],
        };
        const rubric: PerseusInteractiveGraphRubric = createRubric({
            type: "point",
            coords: [
                [5, 6],
                [7, 8],
            ],
        });

        const rubricClone = clone(rubric);

        InteractiveGraph.widget.validate(guess, rubric);

        expect(rubric).toEqual(rubricClone);
    });
});

describe("shouldUseMafs", () => {
    it("is false given no mafs flags", () => {
        const graph: PerseusGraphTypeLinear = {
            type: "linear",
        };
        const mafsFlags = undefined;

        expect(shouldUseMafs(mafsFlags, graph)).toBe(false);
    });

    it("is false when mafs flags is a boolean", () => {
        // boolean values aren't valid; we expect the mafs flags to be an
        // object.
        const graph: PerseusGraphTypeLinear = {
            type: "linear",
        };
        const mafsFlags = true;

        expect(shouldUseMafs(mafsFlags, graph)).toBe(false);
    });

    it("is false for a point graph when the feature flag is off", () => {
        const graph: PerseusGraphTypePoint = {
            type: "point",
            numPoints: 42,
        };
        const mafsFlags = {};

        expect(shouldUseMafs(mafsFlags, graph)).toBe(false);
    });

    it("is true for a point graph when the `point` feature flag is on", () => {
        const graph: PerseusGraphTypePoint = {
            type: "point",
            numPoints: 42,
        };
        const mafsFlags = {
            point: true,
        };

        expect(shouldUseMafs(mafsFlags, graph)).toBe(true);
    });

    it("is false for a point graph with numPoints = 'unlimited'", () => {
        const graph: PerseusGraphTypePoint = {
            type: "point",
            numPoints: "unlimited",
        };
        const mafsFlags = {
            point: true,
        };

        expect(shouldUseMafs(mafsFlags, graph)).toBe(false);
    });

    it("is true for a point graph without numPoints set when the feature flag is on", () => {
        // numPoints defaults to 1
        const graph: PerseusGraphTypePoint = {
            type: "point",
        };
        const mafsFlags = {
            point: true,
        };

        expect(shouldUseMafs(mafsFlags, graph)).toBe(true);
    });

    it("is false for a polygon graph when the feature flag is off", () => {
        const graph: PerseusGraphTypePolygon = {
            type: "polygon",
            numSides: 3,
        };
        const mafsFlags = {};

        expect(shouldUseMafs(mafsFlags, graph)).toBe(false);
    });

    it("is true for a polygon graph when the feature flag is on", () => {
        const graph: PerseusGraphTypePolygon = {
            type: "polygon",
            numSides: 3,
        };
        const mafsFlags = {
            polygon: true,
        };

        expect(shouldUseMafs(mafsFlags, graph)).toBe(true);
    });

    it("is false for a polygon graph when numSides is 'unlimited'", () => {
        const graph: PerseusGraphTypePolygon = {
            type: "polygon",
            numSides: "unlimited",
        };
        const mafsFlags = {
            polygon: true,
        };

        expect(shouldUseMafs(mafsFlags, graph)).toBe(false);
    });

    it("is true for a polygon graph when numSides is not set", () => {
        // numSides defaults to 3
        const graph: PerseusGraphTypePolygon = {
            type: "polygon",
        };
        const mafsFlags = {
            polygon: true,
        };

        expect(shouldUseMafs(mafsFlags, graph)).toBe(true);
    });

    it("is false for a linear graph when the feature flag is off", () => {
        const graph: PerseusGraphTypeLinear = {
            type: "linear",
        };
        const mafsFlags = {};

        expect(shouldUseMafs(mafsFlags, graph)).toBe(false);
    });

    it("is true for a linear graph when the feature flag is on", () => {
        const graph: PerseusGraphTypeLinear = {
            type: "linear",
        };
        const mafsFlags = {
            linear: true,
        };

        expect(shouldUseMafs(mafsFlags, graph)).toBe(true);
    });

    it("is always true for a 'none' graph (no interactive element)", () => {
        const graph: PerseusGraphTypeNone = {
            type: "none",
        };
        const mafsFlags = {};

        expect(shouldUseMafs(mafsFlags, graph)).toBe(true);
    });
});
