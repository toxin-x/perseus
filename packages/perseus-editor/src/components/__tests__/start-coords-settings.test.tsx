import {Dependencies} from "@khanacademy/perseus";
import {RenderStateRoot} from "@khanacademy/wonder-blocks-core";
import {render, screen} from "@testing-library/react";
import {userEvent as userEventLib} from "@testing-library/user-event";
import * as React from "react";

import {testDependencies} from "../../../../../testing/test-dependencies";
import {clone} from "../../util/object-utils";
import StartCoordsSettings from "../start-coords-settings";

import type {CollinearTuple, Range} from "@khanacademy/perseus";
import type {UserEvent} from "@testing-library/user-event";

const defaultProps = {
    range: [
        [-10, 10],
        [-10, 10],
    ] satisfies [Range, Range],
    step: [1, 1] satisfies [number, number],
};
describe("StartCoordSettings", () => {
    let userEvent: UserEvent;
    beforeEach(() => {
        userEvent = userEventLib.setup({
            advanceTimers: jest.advanceTimersByTime,
        });

        jest.spyOn(Dependencies, "getDependencies").mockReturnValue(
            testDependencies,
        );
    });

    test("clicking the heading toggles the settings", async () => {
        // Arrange

        // Act
        render(
            <StartCoordsSettings
                {...defaultProps}
                type="linear"
                onChange={() => {}}
            />,
        );

        const heading = screen.getByText("Start coordinates");

        // Assert
        expect(
            screen.getByRole("button", {name: "Use default start coordinates"}),
        ).toBeInTheDocument();

        await userEvent.click(heading);

        expect(
            screen.queryByRole("button", {
                name: "Use default start coordinates",
            }),
        ).not.toBeInTheDocument();

        await userEvent.click(heading);

        expect(
            screen.getByRole("button", {name: "Use default start coordinates"}),
        ).toBeInTheDocument();
    });

    test("clicking the reset button resets the start coordinates", async () => {
        // Arrange
        const onChangeMock = jest.fn();
        render(
            <StartCoordsSettings
                {...defaultProps}
                type="linear"
                onChange={onChangeMock}
            />,
        );

        // Act
        const resetButton = screen.getByRole("button", {
            name: "Use default start coordinates",
        });
        await userEvent.click(resetButton);

        // Assert
        expect(onChangeMock).toHaveBeenCalledWith([
            [-5, 5],
            [5, 5],
        ]);
    });

    describe.each`
        type
        ${"linear"}
        ${"ray"}
    `("graphs with CollinearTuple startCoords ($type graph)", ({type}) => {
        test(`shows the start coordinates UI for ${type}`, () => {
            // Arrange

            // Act
            render(
                <StartCoordsSettings
                    {...defaultProps}
                    type={type}
                    onChange={() => {}}
                />,
            );

            const resetButton = screen.getByRole("button", {
                name: "Use default start coordinates",
            });

            // Assert
            expect(screen.getByText("Start coordinates")).toBeInTheDocument();
            expect(screen.getByText("Point 1:")).toBeInTheDocument();
            expect(screen.getByText("Point 2:")).toBeInTheDocument();
            expect(resetButton).toBeInTheDocument();
        });

        test.each`
            lineIndex | coord
            ${0}      | ${"x"}
            ${0}      | ${"y"}
            ${1}      | ${"x"}
            ${1}      | ${"y"}
        `(
            `calls onChange when $coord coord is changed (line $lineIndex) for ${type} graph`,
            async ({lineIndex, coord}) => {
                // Arrange
                const onChangeMock = jest.fn();

                // Act
                render(
                    <StartCoordsSettings
                        {...defaultProps}
                        type={type}
                        onChange={onChangeMock}
                    />,
                );

                // Assert
                const input = screen.getAllByRole("spinbutton", {
                    name: `${coord}`,
                })[lineIndex];
                await userEvent.clear(input);
                await userEvent.type(input, "101");

                const expectedCoords = [
                    [-5, 5],
                    [5, 5],
                ];
                expectedCoords[lineIndex][coord === "x" ? 0 : 1] = 101;

                expect(onChangeMock).toHaveBeenLastCalledWith(expectedCoords);
            },
        );
    });

    // startCoords with type CollinearTuple[]
    describe("segment graph", () => {
        test("shows the start coordinates UI for a singular segment", () => {
            // Arrange

            // Act
            render(
                <StartCoordsSettings
                    {...defaultProps}
                    type="segment"
                    numSegments={1}
                    onChange={() => {}}
                />,
                {wrapper: RenderStateRoot},
            );

            // Assert
            expect(screen.getByText("Start coordinates")).toBeInTheDocument();
            expect(screen.getByText("Segment 1")).toBeInTheDocument();
            expect(screen.getByText("Point 1:")).toBeInTheDocument();
            expect(screen.getByText("Point 2:")).toBeInTheDocument();
        });

        test("shows the start coordinates UI for 2 segments", () => {
            // Arrange

            // Act
            render(
                <StartCoordsSettings
                    {...defaultProps}
                    type="segment"
                    numSegments={2}
                    onChange={() => {}}
                />,
                {wrapper: RenderStateRoot},
            );

            // Assert
            expect(screen.getByText("Start coordinates")).toBeInTheDocument();
            expect(screen.getByText("Segment 1")).toBeInTheDocument();
            expect(screen.getByText("Segment 2")).toBeInTheDocument();
            expect(screen.getAllByText("Point 1:")).toHaveLength(2);
            expect(screen.getAllByText("Point 2:")).toHaveLength(2);
        });

        test.each`
            segmentIndex | pointIndex | coordIndex | coord
            ${0}         | ${0}       | ${0}       | ${"x"}
            ${0}         | ${0}       | ${1}       | ${"y"}
            ${0}         | ${1}       | ${0}       | ${"x"}
            ${0}         | ${1}       | ${1}       | ${"y"}
            ${1}         | ${0}       | ${0}       | ${"x"}
            ${1}         | ${0}       | ${1}       | ${"y"}
            ${1}         | ${1}       | ${0}       | ${"x"}
            ${1}         | ${1}       | ${1}       | ${"y"}
        `(
            `calls onChange when $coord coord is changed (segment $segmentIndex)`,
            async ({segmentIndex, pointIndex, coordIndex, coord}) => {
                // Arrange
                const onChangeMock = jest.fn();

                const coords = [
                    [
                        [1, 1],
                        [2, 2],
                    ],
                    [
                        [3, 3],
                        [4, 4],
                    ],
                ] satisfies CollinearTuple[];

                // Act
                render(
                    <StartCoordsSettings
                        {...defaultProps}
                        type="segment"
                        numSegments={2}
                        startCoords={coords}
                        onChange={onChangeMock}
                    />,
                    {wrapper: RenderStateRoot},
                );

                // Assert
                const input = screen.getAllByRole("spinbutton", {
                    name: coord,
                })[segmentIndex * 2 + pointIndex];
                await userEvent.clear(input);
                await userEvent.type(input, "101");

                const expectedCoords = clone(coords);
                expectedCoords[segmentIndex][pointIndex][coordIndex] = 101;

                expect(onChangeMock).toHaveBeenLastCalledWith(expectedCoords);
            },
        );
    });

    // startCoords with type CollinearTuple[]
    describe("linear-system graph", () => {
        test("shows the start coordinates UI", () => {
            // Arrange

            // Act
            render(
                <StartCoordsSettings
                    {...defaultProps}
                    type="linear-system"
                    onChange={() => {}}
                />,
                {wrapper: RenderStateRoot},
            );

            // Assert
            expect(screen.getByText("Start coordinates")).toBeInTheDocument();
            expect(screen.getByText("Line 1")).toBeInTheDocument();
            expect(screen.getByText("Line 2")).toBeInTheDocument();
            expect(screen.getAllByText("Point 1:")).toHaveLength(2);
            expect(screen.getAllByText("Point 2:")).toHaveLength(2);
        });

        test.each`
            lineIndex | pointIndex | coordIndex | coord
            ${0}      | ${0}       | ${0}       | ${"x"}
            ${0}      | ${0}       | ${1}       | ${"y"}
            ${0}      | ${1}       | ${0}       | ${"x"}
            ${0}      | ${1}       | ${1}       | ${"y"}
            ${1}      | ${0}       | ${0}       | ${"x"}
            ${1}      | ${0}       | ${1}       | ${"y"}
            ${1}      | ${1}       | ${0}       | ${"x"}
            ${1}      | ${1}       | ${1}       | ${"y"}
        `(
            `calls onChange when $coord coord is changed (line $lineIndex)`,
            async ({lineIndex, pointIndex, coordIndex, coord}) => {
                // Arrange
                const onChangeMock = jest.fn();

                const coords = [
                    [
                        [1, 1],
                        [2, 2],
                    ],
                    [
                        [3, 3],
                        [4, 4],
                    ],
                ] satisfies CollinearTuple[];

                // Act
                render(
                    <StartCoordsSettings
                        {...defaultProps}
                        type="linear-system"
                        startCoords={coords}
                        onChange={onChangeMock}
                    />,
                    {wrapper: RenderStateRoot},
                );

                // Assert
                const input = screen.getAllByRole("spinbutton", {
                    name: coord,
                })[lineIndex * 2 + pointIndex];
                await userEvent.clear(input);
                await userEvent.type(input, "101");

                const expectedCoords = clone(coords);
                expectedCoords[lineIndex][pointIndex][coordIndex] = 101;

                expect(onChangeMock).toHaveBeenLastCalledWith(expectedCoords);
            },
        );
    });
});
