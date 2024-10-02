import {linterContextDefault} from "@khanacademy/perseus-linter";
import * as React from "react";

import Sortable from "../../components/sortable";
import Util from "../../util";

import sorterValidator from "./sorter-validator";

import type {SortableOption} from "../../components/sortable";
import type {PerseusSorterWidgetOptions} from "../../perseus-types";
import type {
    PerseusScore,
    Widget,
    WidgetExports,
    WidgetProps,
} from "../../types";
import type {
    PerseusSorterRubric,
    PerseusSorterUserInput,
} from "../../validation.types";

const {shuffle} = Util;

type RenderProps = PerseusSorterWidgetOptions;

type Props = WidgetProps<RenderProps, PerseusSorterRubric>;

type DefaultProps = {
    correct: Props["correct"];
    layout: Props["layout"];
    padding: Props["padding"];
    problemNum: Props["problemNum"];
    onChange: Props["onChange"];
    linterContext: Props["linterContext"];
};

type State = {
    changed: boolean;
};

class Sorter extends React.Component<Props, State> implements Widget {
    _isMounted: boolean = false;

    static defaultProps: DefaultProps = {
        correct: [],
        layout: "horizontal",
        padding: true,
        problemNum: 0,
        onChange: function () {},
        linterContext: linterContextDefault,
    };

    static validate(
        userInput: PerseusSorterUserInput,
        rubric: PerseusSorterRubric,
    ): PerseusScore {
        return sorterValidator(userInput, rubric);
    }

    state: State = {
        changed: false,
    };

    componentDidMount() {
        this._isMounted = true;
    }

    componentWillUnmount() {
        this._isMounted = false;
    }

    handleChange: (arg1: React.ChangeEvent<HTMLInputElement>) => void = (e) => {
        if (!this._isMounted) {
            return;
        }

        this.setState({changed: true}, () => {
            // Wait until all components have rendered. In React 16, the
            // setState callback fires immediately after componentDidUpdate,
            // and there is no guarantee that parent/siblings components have
            // finished rendering.
            // TODO(jeff, CP-3128): Use Wonder Blocks Timing API
            // eslint-disable-next-line no-restricted-syntax
            setTimeout(() => {
                this.props.onChange(e as any);
                this.props.trackInteraction();
            }, 0);
        });
    };

    getUserInput(): PerseusSorterUserInput {
        // eslint-disable-next-line react/no-string-refs
        // @ts-expect-error - TS2339 - Property 'getOptions' does not exist on type 'ReactInstance'.
        const options = this.refs.sortable.getOptions();
        return {
            options,
            changed: this.state.changed,
        };
    }

    moveOptionToIndex: (option: SortableOption, index: number) => void = (
        option,
        index,
    ) => {
        // eslint-disable-next-line react/no-string-refs
        // @ts-expect-error - TS2339 - Property 'moveOptionToIndex' does not exist on type 'ReactInstance'.
        this.refs.sortable.moveOptionToIndex(option, index);
    };

    simpleValidate(rubric: PerseusSorterRubric): PerseusScore {
        return sorterValidator(this.getUserInput(), rubric);
    }

    render(): React.ReactNode {
        const options = shuffle(
            this.props.correct,
            this.props.problemNum as number,
            /* ensurePermuted */ true,
        );

        const {apiOptions} = this.props;
        const marginPx = apiOptions.isMobile ? 8 : 5;

        return (
            <div className="perseus-widget-sorter perseus-clearfix">
                <Sortable
                    options={options}
                    layout={this.props.layout}
                    margin={marginPx}
                    padding={this.props.padding}
                    onChange={this.handleChange}
                    linterContext={this.props.linterContext}
                    // eslint-disable-next-line react/no-string-refs
                    ref="sortable"
                />
            </div>
        );
    }
}

export default {
    name: "sorter",
    displayName: "Sorter",
    widget: Sorter,
    isLintable: true,
} as WidgetExports<typeof Sorter>;
