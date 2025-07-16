import { ReactElement, createElement } from "react";
import { ReactPlannerPreviewProps } from "../typings/ReactPlannerProps";

export function preview({ }: ReactPlannerPreviewProps): ReactElement {
    return <div/>;
}

export function getPreviewCss(): string {
    return require("./ui/ReactPlanner.css");
}
