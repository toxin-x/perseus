import * as React from "react";

import {Flipbook} from "../../../../../dev/flipbook";
import {RendererWithDebugUI} from "../../../../../testing/renderer-with-debug-ui";
import {
    angleQuestion,
    circleQuestion,
    linearQuestion,
    linearSystemQuestion,
    pointQuestion,
    polygonQuestion,
    rayQuestion,
    segmentQuestion,
    segmentWithLockedPointsQuestion,
    segmentWithLockedLineQuestion,
    segmentWithAllLockedLineSegmentVariations,
    segmentWithAllLockedLineVariations,
    segmentWithAllLockedRayVariations,
    sinusoidQuestion,
    segmentWithLockedEllipses,
    segmentWithLockedVectors,
    segmentWithLockedPolygons,
} from "../__testdata__/interactive-graph.testdata";

export default {
    title: "Perseus/Widgets/Interactive Graph",
};

const mafsOptions = {
    apiOptions: {
        flags: {
            mafs: {
                segment: true,
                polygon: true,
            },
        },
    },
};

type StoryArgs = Record<any, any>;

export const SideBySideFlipbook = (args: StoryArgs): React.ReactElement => (
    <Flipbook />
);

export const Angle = (args: StoryArgs): React.ReactElement => (
    <RendererWithDebugUI question={angleQuestion} />
);

export const Circle = (args: StoryArgs): React.ReactElement => (
    <RendererWithDebugUI question={circleQuestion} />
);

export const Linear = (args: StoryArgs): React.ReactElement => (
    <RendererWithDebugUI question={linearQuestion} />
);

export const LinearSystem = (args: StoryArgs): React.ReactElement => (
    <RendererWithDebugUI question={linearSystemQuestion} />
);

export const Point = (args: StoryArgs): React.ReactElement => (
    <RendererWithDebugUI question={pointQuestion} />
);

export const Polygon = (args: StoryArgs): React.ReactElement => (
    <RendererWithDebugUI question={polygonQuestion} />
);

export const PolygonWithMafs = (args: StoryArgs): React.ReactElement => (
    <RendererWithDebugUI {...mafsOptions} question={polygonQuestion} />
);

export const Ray = (args: StoryArgs): React.ReactElement => (
    <RendererWithDebugUI question={rayQuestion} />
);

export const Segment = (args: StoryArgs): React.ReactElement => (
    <RendererWithDebugUI question={segmentQuestion} />
);

export const SegmentWithMafsAndLockedPoints = (
    args: StoryArgs,
): React.ReactElement => (
    <RendererWithDebugUI
        {...mafsOptions}
        question={segmentWithLockedPointsQuestion}
    />
);

export const SegmentWithMafsAndLockedLines = (
    args: StoryArgs,
): React.ReactElement => (
    <RendererWithDebugUI
        {...mafsOptions}
        question={segmentWithLockedLineQuestion}
    />
);

export const AllLockedLineSegments = (args: StoryArgs): React.ReactElement => (
    <RendererWithDebugUI
        {...mafsOptions}
        question={segmentWithAllLockedLineSegmentVariations}
    />
);

export const AllLockedLines = (args: StoryArgs): React.ReactElement => (
    <RendererWithDebugUI
        {...mafsOptions}
        question={segmentWithAllLockedLineVariations}
    />
);

export const AllLockedRays = (args: StoryArgs): React.ReactElement => (
    <RendererWithDebugUI
        {...mafsOptions}
        question={segmentWithAllLockedRayVariations}
    />
);

export const LockedVector = (args: StoryArgs): React.ReactElement => (
    <RendererWithDebugUI {...mafsOptions} question={segmentWithLockedVectors} />
);

export const LockedEllipse = (args: StoryArgs): React.ReactElement => (
    <RendererWithDebugUI
        {...mafsOptions}
        question={segmentWithLockedEllipses}
    />
);

export const LockedPolygon = (args: StoryArgs): React.ReactElement => (
    <RendererWithDebugUI
        {...mafsOptions}
        question={segmentWithLockedPolygons}
    />
);

export const Sinusoid = (args: StoryArgs): React.ReactElement => (
    <RendererWithDebugUI question={sinusoidQuestion} />
);

// TODO(jeremy): As of Jan 2022 there are no peresus items in production that
// use the "quadratic" graph type.
// "quadratic"
